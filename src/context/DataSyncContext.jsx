import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { DEFAULT_SUBJECT, TABLE_NAMES, LOCAL_STORAGE_KEYS } from '../constants/app';
import { calculateSrsData } from '../utils/spacedRepetition';
import { useAuth } from './AuthContext';
import { useUIState } from './UIStateContext';

const DataSyncContext = createContext();

export const DataSyncProvider = ({ children }) => {
  const { session, workspaceId, isConfigured } = useAuth();
  const { setReviewMode, setIsCramMode, setReviewCards, isCramMode } = useUIState();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const cards = useLiveQuery(() => db.cards.toArray(), []);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []);
  const courses = useLiveQuery(() => db.courses.toArray(), []);
  const memos = useLiveQuery(() => db.memos.toArray(), []);

  useEffect(() => {
    const savedLastSync = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && isConfigured && session) {
      syncToCloud();
    }
  }, [isOnline, isConfigured, session]);

  // Realtime subscriptions
  useEffect(() => {
    if (!session || !workspaceId) return;

    const handleChanges = async (payload) => {
      const { eventType, new: newRecord, old: oldRecord, table } = payload;
      let dbTable;

      switch (table) {
        case TABLE_NAMES.CARDS:
          dbTable = db.cards;
          break;
        case TABLE_NAMES.SUBJECTS:
          dbTable = db.subjects;
          break;
        case TABLE_NAMES.COURSES:
          dbTable = db.courses;
          break;
        case TABLE_NAMES.MEMOS:
          dbTable = db.memos;
          break;
        default:
          return;
      }

      switch (eventType) {
        case 'INSERT':
          await dbTable.put(newRecord);
          break;
        case 'UPDATE':
          const localRecord = await dbTable.get(newRecord.id);
          if (localRecord) {
            const localDate = new Date(localRecord.updated_at || localRecord.created_at || 0);
            const remoteDate = new Date(newRecord.updated_at || newRecord.created_at);
            if (remoteDate > localDate) {
              await dbTable.put(newRecord);
            }
          } else {
            await dbTable.put(newRecord);
          }
          break;
        case 'DELETE':
          await dbTable.delete(oldRecord.id);
          break;
        default:
          break;
      }
    };

    const cardsChannel = supabase.channel(`public:flashcards:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flashcards' }, handleChanges)
      .subscribe();

    const subjectsChannel = supabase.channel(`public:subjects:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, handleChanges)
      .subscribe();

    const coursesChannel = supabase.channel(`public:courses:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, handleChanges)
      .subscribe();

    const memosChannel = supabase.channel(`public:memos:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memos' }, handleChanges)
      .subscribe();

    return () => {
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(subjectsChannel);
      supabase.removeChannel(coursesChannel);
      supabase.removeChannel(memosChannel);
    };
  }, [session, workspaceId]);

  const syncToCloud = async () => {
    if (!session || !isOnline || !workspaceId || isSyncing) return;

    setIsSyncing(true);
    toast.loading('Synchronisation en cours...');

    try {
      const lastSyncTime = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC) || new Date(0).toISOString();

      const { data: cloudCards, error: cardsError } = await supabase.from(TABLE_NAMES.CARDS).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudSubjects, error: subjectsError } = await supabase.from(TABLE_NAMES.SUBJECTS).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudCourses, error: coursesError } = await supabase.from(TABLE_NAMES.COURSES).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudMemos, error: memosError } = await supabase.from(TABLE_NAMES.MEMOS).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudProgress, error: progressError } = await supabase.from(TABLE_NAMES.USER_CARD_PROGRESS).select('*').eq('user_id', session.user.id).gte('updated_at', lastSyncTime);

      if (cardsError || subjectsError || coursesError || memosError || progressError) {
        throw cardsError || subjectsError || coursesError || memosError || progressError;
      }

      await db.transaction('rw', db.cards, db.subjects, db.courses, db.memos, db.user_card_progress, async () => {
        if (cloudCards.length > 0) {
            const formattedCards = cloudCards.map(formatCardFromSupabase);
            const cloudCardIds = formattedCards.map(c => c.id);
            const localCards = await db.cards.where('id').anyOf(cloudCardIds).toArray();
            const localCardMap = new Map(localCards.map(c => [c.id, c]));
            const cardsToUpdate = [];

            for (const cloudCard of formattedCards) {
                const localCard = localCardMap.get(cloudCard.id);
                if (!localCard || new Date(cloudCard.updatedAt) > new Date(localCard.updatedAt)) {
                    cardsToUpdate.push({ ...cloudCard, isSynced: true });
                }
            }
            if (cardsToUpdate.length > 0) await db.cards.bulkPut(cardsToUpdate);
        }

        if (cloudSubjects.length > 0) {
            const formattedSubjects = cloudSubjects.map(formatSubjectFromSupabase);
            const cloudSubjectIds = formattedSubjects.map(s => s.id);
            const localSubjects = await db.subjects.where('id').anyOf(cloudSubjectIds).toArray();
            const localSubjectMap = new Map(localSubjects.map(s => [s.id, s]));
            const subjectsToUpdate = [];

            for (const cloudSubject of formattedSubjects) {
                const localSubject = localSubjectMap.get(cloudSubject.id);
                if (!localSubject || new Date(cloudSubject.updatedAt) > new Date(localSubject.updatedAt)) {
                    subjectsToUpdate.push({ ...cloudSubject, isSynced: true });
                }
            }
            if (subjectsToUpdate.length > 0) await db.subjects.bulkPut(subjectsToUpdate);
        }

        if (cloudCourses.length > 0) {
            const formattedCourses = cloudCourses.map(formatCourseFromSupabase);
            const cloudCourseIds = formattedCourses.map(c => c.id);
            const localCourses = await db.courses.where('id').anyOf(cloudCourseIds).toArray();
            const localCourseMap = new Map(localCourses.map(c => [c.id, c]));
            const coursesToUpdate = [];

            for (const cloudCourse of formattedCourses) {
                const localCourse = localCourseMap.get(cloudCourse.id);
                if (!localCourse || new Date(cloudCourse.updatedAt) > new Date(localCourse.updatedAt)) {
                    coursesToUpdate.push({ ...cloudCourse, isSynced: true });
                }
            }
            if (coursesToUpdate.length > 0) await db.courses.bulkPut(coursesToUpdate);
        }

        if (cloudMemos.length > 0) {
            const formattedMemos = cloudMemos.map(formatMemoFromSupabase);
            const cloudMemoIds = formattedMemos.map(m => m.id);
            const localMemos = await db.memos.where('id').anyOf(cloudMemoIds).toArray();
            const localMemoMap = new Map(localMemos.map(m => [m.id, m]));
            const memosToUpdate = [];

            for (const cloudMemo of formattedMemos) {
                const localMemo = localMemoMap.get(cloudMemo.id);
                if (!localMemo || new Date(cloudMemo.updatedAt) > new Date(localMemo.updatedAt)) {
                    memosToUpdate.push({ ...cloudMemo, isSynced: true });
                }
            }
            if (memosToUpdate.length > 0) await db.memos.bulkPut(memosToUpdate);
        }

        if (cloudProgress.length > 0) {
            const formattedProgress = cloudProgress.map(formatUserCardProgressFromSupabase);
            const cloudProgressIds = formattedProgress.map(p => p.id);
            const localProgress = await db.user_card_progress.where('id').anyOf(cloudProgressIds).toArray();
            const localProgressMap = new Map(localProgress.map(p => [p.id, p]));
            const progressToUpdate = [];

            for (const remoteProgress of formattedProgress) {
                const localP = localProgressMap.get(remoteProgress.id);
                if (!localP || new Date(remoteProgress.updatedAt) > new Date(localP.updatedAt)) {
                    progressToUpdate.push({ ...remoteProgress, isSynced: true });
                }
            }
            if (progressToUpdate.length > 0) await db.user_card_progress.bulkPut(progressToUpdate);
        }
    });

      // 1. Gérer les éléments non synchronisés d'abord
      const localUnsyncedCards = await db.cards.where('isSynced').equals(false).toArray();
      const localUnsyncedSubjects = await db.subjects.where('isSynced').equals(false).toArray();
      const localUnsyncedCourses = await db.courses.where('isSynced').equals(false).toArray();
      const localUnsyncedMemos = await db.memos.where('isSynced').equals(false).toArray();
      const localUnsyncedProgress = await db.user_card_progress.where('isSynced').equals(false).toArray();

      // 2. Préparer les données pour Supabase
      // Pour les NOUVEAUX éléments (id 'local_...'), nous retirons l'ID
      // pour que Supabase en génère un.
      // Pour les éléments MIS A JOUR, nous gardons l'ID.
      const formatForSupabase = (item, formatter) => {
        const formatted = formatter(item);
        if (String(formatted.id).startsWith('local_')) {
          delete formatted.id; // Laisse Supabase générer le nouvel ID
        }
        return formatted;
      };

      const cardsToSync = localUnsyncedCards.map(c => formatForSupabase(c, formatCardForSupabase));
      const subjectsToSync = localUnsyncedSubjects.map(s => formatForSupabase(s, formatSubjectForSupabase));
      const coursesToSync = localUnsyncedCourses.map(c => formatForSupabase(c, formatCourseForSupabase));
      const memosToSync = localUnsyncedMemos.map(m => formatForSupabase(m, formatMemoForSupabase));
      const progressToSync = localUnsyncedProgress.map(p => formatForSupabase(p, formatUserCardProgressForSupabase));

      // 3. Envoyer les modifications à Supabase
      if (cardsToSync.length > 0) {
        const { data: syncedCards, error } = await supabase.from(TABLE_NAMES.CARDS).upsert(cardsToSync).select();
        if (error) throw error;

        const newLocalCards = localUnsyncedCards.filter(c => c.id.startsWith('local_'));
        if (newLocalCards.length > 0 && syncedCards?.length > 0) {
          const formattedSyncedCards = syncedCards.map(formatCardFromSupabase);
          const syncedCardMap = new Map(formattedSyncedCards.map(sc => [sc.question, sc]));

          const localIdsToDelete = [];
          const serverCardsToAdd = [];

          newLocalCards.forEach(localCard => {
            const correspondingServerCard = syncedCardMap.get(localCard.question);
            if (correspondingServerCard) {
              localIdsToDelete.push(localCard.id);
              serverCardsToAdd.push({ ...correspondingServerCard, isSynced: true });
            }
          });

          if (localIdsToDelete.length > 0) {
            await db.transaction('rw', db.cards, async () => {
              await db.cards.bulkDelete(localIdsToDelete);
              await db.cards.bulkPut(serverCardsToAdd);
            });
          }
        }

        // Marquer comme synchronisé (uniquement les mises à jour, pas les créations)
        await db.cards.where('isSynced').equals(false).and(card => !card.id.startsWith('local_')).modify({ isSynced: true });
      }
      if (subjectsToSync.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.SUBJECTS).upsert(subjectsToSync);
        if (error) throw error;
        await db.subjects.where('isSynced').equals(false).and(subject => !subject.id.startsWith('local_')).modify({ isSynced: true });
      }
      if (coursesToSync.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.COURSES).upsert(coursesToSync);
        if (error) throw error;
        await db.courses.where('isSynced').equals(false).and(course => !course.id.startsWith('local_')).modify({ isSynced: true });
      }
      if (memosToSync.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.MEMOS).upsert(memosToSync);
        if (error) throw error;
        await db.memos.where('isSynced').equals(false).and(memo => !memo.id.startsWith('local_')).modify({ isSynced: true });
      }
      if (progressToSync.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.USER_CARD_PROGRESS).upsert(progressToSync);
        if (error) throw error;
        await db.user_card_progress.where('isSynced').equals(false).and(p => !p.id.startsWith('local_')).modify({ isSynced: true });
      }

      // 4. Nettoyer les ID locaux TEMPORAIRES
      // Les cartes sont gérées via la transaction atomique ci-dessus
      const localSubjectsWithTempId = await db.subjects.where('id').startsWith('local_').toArray();
      if(localSubjectsWithTempId.length > 0) await db.subjects.bulkDelete(localSubjectsWithTempId.map(c => c.id));

      const localCoursesWithTempId = await db.courses.where('id').startsWith('local_').toArray();
      if(localCoursesWithTempId.length > 0) await db.courses.bulkDelete(localCoursesWithTempId.map(c => c.id));

      const localMemosWithTempId = await db.memos.where('id').startsWith('local_').toArray();
      if(localMemosWithTempId.length > 0) await db.memos.bulkDelete(localMemosWithTempId.map(m => m.id));

      const localProgressWithTempId = await db.user_card_progress.where('id').startsWith('local_').toArray();
      if(localProgressWithTempId.length > 0) await db.user_card_progress.bulkDelete(localProgressWithTempId.map(p => p.id));

      // 5. Gérer les suppressions en attente
      const pendingDeletions = await db.deletionsPending.toArray();
      if (pendingDeletions.length > 0) {
        await Promise.all(pendingDeletions.map(async (deletion) => {
          const { error } = await supabase.from(deletion.tableName).delete().eq('id', deletion.id);
          if (error && error.code !== 'PGRST204') {
            console.error(`Erreur lors de la suppression de ${deletion.id} de ${deletion.tableName}:`, error);
          } else {
            await db.deletionsPending.delete(deletion.id);
          }
        }));
      }

      const now = new Date();
      setLastSync(now);
      localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SYNC, now.toISOString());
      toast.dismiss();
      toast.success('Synchronisation terminée !');
      return true;

    } catch (err) {
      console.error('Erreur de synchronisation:', err);
      toast.dismiss();
      toast.error(`Erreur de synchronisation: ${err.message}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
const formatCardFromSupabase = (card) => ({
  id: card.id,
  question: card.question,
  answer: card.answer,
  subject_id: card.subject_id,
  workspace_id: card.workspace_id,
  updatedAt: card.updated_at,
  // isSynced is handled during the sync logic
});

const formatCardForSupabase = (card) => ({
  id: card.id,
  question: card.question,
  answer: card.answer,
  subject_id: card.subject_id,
  workspace_id: card.workspace_id,
  updated_at: card.updatedAt || new Date().toISOString(),
  user_id: session.user.id,
});

const formatSubjectFromSupabase = (subject) => ({
  ...subject,
  updatedAt: subject.updated_at,
  workspace_id: subject.workspace_id,
});

const formatSubjectForSupabase = (subject) => ({
  ...subject,
  updated_at: subject.updatedAt,
  workspace_id: subject.workspace_id,
  user_id: session.user.id,
});

const formatCourseFromSupabase = (course) => ({
  ...course,
  updatedAt: course.updated_at,
  workspace_id: course.workspace_id,
});

const formatCourseForSupabase = (course) => ({
  ...course,
  updated_at: course.updatedAt,
  workspace_id: course.workspace_id,
  user_id: session.user.id,
});

const formatMemoFromSupabase = (memo) => ({
  ...memo,
  updatedAt: memo.updated_at,
  workspace_id: memo.workspace_id,
  isPinned: memo.is_pinned,
  courseId: memo.course_id,
});

const formatMemoForSupabase = (memo) => ({
  ...memo,
  updated_at: memo.updatedAt,
  workspace_id: memo.workspace_id,
  user_id: session.user.id,
  is_pinned: memo.isPinned,
  course_id: memo.courseId,
});

const formatUserCardProgressFromSupabase = (progress) => ({
  ...progress,
  updatedAt: progress.updated_at,
  nextReview: progress.next_review,
  reviewCount: progress.review_count,
  cardId: progress.card_id,
  userId: progress.user_id,
});

const formatUserCardProgressForSupabase = (progress) => ({
  ...progress,
  updated_at: progress.updatedAt,
  next_review: progress.nextReview,
  review_count: progress.reviewCount,
  card_id: progress.cardId,
  user_id: progress.userId,
});

  const addCard = async (card) => {
    const newCard = {
      ...card,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspace_id: workspaceId,
      isSynced: false,
      nextReview: new Date().toISOString(),
      reviewCount: 0,
    };
    await db.cards.add(newCard);
    toast.success('Carte ajoutée !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const updateCardWithSync = async (id, updates) => {
    const updatedCard = { ...updates, updated_at: new Date().toISOString(), isSynced: false };
    await db.cards.update(id, updatedCard);
    toast.success('Carte mise à jour !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const deleteCardWithSync = async (id) => {
    await db.cards.delete(id);
    // CORRECTION ICI
    await db.deletionsPending.add({ id, tableName: TABLE_NAMES.CARDS });
    toast.success('Carte supprimée !');

    if (isOnline) {
      syncToCloud();
    }
  };

  const handleBulkAdd = async (bulkAdd) => {
    const lines = bulkAdd.trim().split('\n');
    const uniqueSubjectNames = [...new Set(
      lines.map(line => {
        const parts = line.split('/');
        return parts.length >= 3 ? normalizeSubjectName(parts[2].trim()) : null;
      }).filter(Boolean)
    )];

    const existingSubjects = await db.subjects.where('name').anyOf(uniqueSubjectNames).toArray();
    const existingSubjectMap = new Map(existingSubjects.map(s => [s.name, s.id]));

    const newSubjectsToCreate = uniqueSubjectNames
      .filter(name => !existingSubjectMap.has(name))
      .map(name => ({
        name,
        workspace_id: workspaceId,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isSynced: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    if (newSubjectsToCreate.length > 0) {
      await db.subjects.bulkAdd(newSubjectsToCreate);
      newSubjectsToCreate.forEach(s => existingSubjectMap.set(s.name, s.id));
    }

    const newCards = lines.map((line, idx) => {
      const parts = line.split('/');
      if (parts.length >= 3) {
        const subjectName = normalizeSubjectName(parts[2].trim());
        const subject_id = existingSubjectMap.get(subjectName);
        if (!subject_id) return null; // Should not happen

        return {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idx}`,
          question: parts[0].trim(),
          answer: parts[1].trim(),
          subject_id: subject_id,
          workspace_id: workspaceId,
          isSynced: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return null;
    }).filter(Boolean);

    if (newCards.length === 0) return;

    await db.cards.bulkAdd(newCards);
    toast.success(`${newCards.length} cartes ajoutées !`);

    if (isOnline) {
      syncToCloud();
    }
  };

  const normalizeSubjectName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const addSubject = async (newSubject) => {
    const normalizedName = normalizeSubjectName(newSubject);
    if (!normalizedName) return;

    const existing = await db.subjects.where('name').equalsIgnoreCase(normalizedName).first();
    if (existing) {
      toast.error('Cette matière existe déjà.');
      return;
    }

    const newSubjectOffline = {
      name: normalizedName,
      workspace_id: workspaceId,
      created_at: new Date().toISOString(),
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isSynced: false
    };

    await db.subjects.add(newSubjectOffline);
    toast.success('Matière ajoutée !');

    if (isOnline) {
      syncToCloud();
    }
  };

  const handleDeleteCardsOfSubject = async (subjectId) => {
    const subjectToDelete = await db.subjects.get(subjectId);
    if (!subjectToDelete) return;

    const cardsToDelete = await db.cards.where('subject_id').equals(subjectId).toArray();

    // Marquer la matière pour suppression dans Supabase
    await db.deletionsPending.add({ id: subjectId, tableName: TABLE_NAMES.SUBJECTS });
    // Supprimer la matière localement
    await db.subjects.delete(subjectId);

    if (cardsToDelete.length > 0) {
      const cardIdsToDelete = cardsToDelete.map(c => c.id);
      const deletions = cardIdsToDelete.map(id => ({ id, tableName: TABLE_NAMES.CARDS }));

      // Marquer les cartes pour suppression dans Supabase
      await db.deletionsPending.bulkAdd(deletions);
      // Supprimer les cartes localement
      await db.cards.bulkDelete(cardIdsToDelete);
    }

    toast.success(`Matière "${subjectToDelete.name}" et ses cartes supprimées.`);
    if (isOnline) syncToCloud();
  };

  const handleReassignCardsOfSubject = async (subjectId) => {
    const subjectToDelete = await db.subjects.get(subjectId);
    if (!subjectToDelete) return;

    // Trouver la matière "Non classé" pour obtenir son ID
    const defaultSubject = await db.subjects.where('name').equalsIgnoreCase(DEFAULT_SUBJECT).first();
    if (!defaultSubject) {
      toast.error(`La matière par défaut "${DEFAULT_SUBJECT}" n'a pas été trouvée.`);
      return;
    }

    // Mettre à jour les cartes pour pointer vers l'ID de la matière par défaut
    await db.cards.where('subject_id').equals(subjectId).modify({ subject_id: defaultSubject.id, isSynced: false });

    // Marquer l'ancienne matière pour suppression dans Supabase
    await db.deletionsPending.add({ id: subjectId, tableName: TABLE_NAMES.SUBJECTS });
    // Supprimer l'ancienne matière localement
    await db.subjects.delete(subjectId);

    toast.success(`Cartes réassignées à "${DEFAULT_SUBJECT}".`);
    if (isOnline) syncToCloud();
  };

  const reviewCard = async (cardId, rating) => {
    if (isCramMode) {
      // In cram mode, do not update progress.
      return;
    }

    const userId = session?.user?.id;
    if (!userId) return;

    const progress = await db.user_card_progress
      .where({ card_id: cardId, user_id: userId })
      .first();

    // The calculateSrsData function handles new vs existing progress internally
    const { interval, easeFactor, status, dueDate } = calculateSrsData(progress, rating);

    const updatedProgress = {
      card_id: cardId,
      user_id: userId,
      interval,
      easeFactor,
      status,
      dueDate,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    };

    if (progress) {
      await db.user_card_progress.update(progress.id, updatedProgress);
    } else {
      // Card has no progress record yet, create one.
      await db.user_card_progress.add({
        ...updatedProgress,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }

    // 🛠️ CORRECTIF: Mettre à jour la carte dans db.cards pour l'affichage.
    // C'est la solution au bug "Prochaine révision: Jamais".
    const cardToUpdate = await db.cards.get(cardId);
    if (cardToUpdate) {
      await db.cards.update(cardId, {
        nextReview: dueDate,
        reviewCount: (cardToUpdate.reviewCount || 0) + 1,
      });
    }

    if (isOnline) {
      syncToCloud();
    }
  };

  const addCourse = async (course) => {
    const newCourse = {
      ...course,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      workspace_id: workspaceId,
      isSynced: false
    };

    await db.courses.add(newCourse);
    toast.success('Cours ajouté !');

    if (isOnline) {
      syncToCloud();
    }
  };

  const addMemo = async (memo) => {
    const newMemo = {
      ...memo,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspace_id: workspaceId,
      isSynced: false,
    };
    await db.memos.add(newMemo);
    toast.success('Mémo ajouté !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const updateMemoWithSync = async (id, updates) => {
    const updatedMemo = { ...updates, updatedAt: new Date().toISOString(), isSynced: false };
    await db.memos.update(id, updatedMemo);
    toast.success('Mémo mis à jour !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const deleteMemoWithSync = async (id) => {
    await db.memos.delete(id);
    await db.deletionsPending.add({ id, tableName: TABLE_NAMES.MEMOS });
    toast.success('Mémo supprimé !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const signOut = async () => {
    const syncSuccessful = await syncToCloud();
    if (!syncSuccessful) {
      // Le toast d'erreur est déjà affiché par syncToCloud en cas d'échec.
      // On arrête simplement le processus de déconnexion ici.
      return;
    }
    await db.delete();
    await supabase.auth.signOut();
    localStorage.removeItem(LOCAL_STORAGE_KEYS.WORKSPACE_ID);
    window.location.reload();
  };

  const getCardsToReview = async (subjectIds = ['all'], options = {}) => {
    const { includeFuture = false } = options;
    const userId = session?.user?.id;
    if (!userId) return [];

    const now = new Date();
    const allUserProgress = await db.user_card_progress.where('user_id').equals(userId).toArray();
    const progressMap = new Map(allUserProgress.map(p => [p.card_id, p]));

    let cardsToReviewQuery = db.cards.toCollection();
    // 'all' est un ID spécial que l'UI envoie, on ne filtre pas dans ce cas
    if (subjectIds.length > 0 && !subjectIds.includes('all')) {
      cardsToReviewQuery = cardsToReviewQuery.where('subject_id').anyOf(subjectIds);
    }

    const allCardsInFilter = await cardsToReviewQuery.toArray();

    const dueCards = allCardsInFilter.filter(card => {
      const progress = progressMap.get(card.id);
      if (!progress) return true; // C'est une nouvelle carte, elle est due
      if (includeFuture) return true; // En mode "Révision Libre", on prend tout
      return new Date(progress.dueDate) <= now; // Sinon, on vérifie la date
    });

    if (dueCards.length === 0) return [];

    const mergedCards = dueCards.map(card => ({
      ...progressMap.get(card.id),
      ...card,
    }));

    if (includeFuture) {
      return mergedCards.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : 0;
        const dateB = b.dueDate ? new Date(b.dueDate) : 0;
        return dateA - dateB;
      });
    }

    return mergedCards.sort(() => Math.random() - 0.5);
  };

  const startReview = async (subjects = ['all'], isCramMode = false, includeFuture = false) => {
    const toReview = await getCardsToReview(subjects, { includeFuture });
    if (toReview.length > 0) {
      setReviewCards(toReview); // Pass cards to UI state
      setIsCramMode(isCramMode);
      setReviewMode(true);
      return true;
    } else {
      toast.error("Aucune carte à réviser !");
      return false;
    }
  };

  const value = {
    cards, subjects, courses, memos, isOnline, isSyncing, lastSync, syncToCloud,
    addCard, updateCardWithSync, deleteCardWithSync, handleBulkAdd, addSubject,
    handleDeleteCardsOfSubject, handleReassignCardsOfSubject, reviewCard, addCourse,
    addMemo, updateMemoWithSync, deleteMemoWithSync,
    signOut, getCardsToReview, startReview,
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (context === undefined) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
};