import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { DEFAULT_SUBJECT, TABLE_NAMES, LOCAL_STORAGE_KEYS } from '../constants/app';
import { calculateNextReview } from '../utils/spacedRepetition';
import { useAuth } from './AuthContext';

const DataSyncContext = createContext();

export const DataSyncProvider = ({ children }) => {
  const { session, workspaceId, isConfigured } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const cards = useLiveQuery(() => db.cards.toArray(), []);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []);
  const courses = useLiveQuery(() => db.courses.toArray(), []);

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

    return () => {
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(subjectsChannel);
      supabase.removeChannel(coursesChannel);
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
      const { data: cloudProgress, error: progressError } = await supabase.from(TABLE_NAMES.USER_CARD_PROGRESS).select('*').eq('user_id', session.user.id).gte('updated_at', lastSyncTime);

      if (cardsError || subjectsError || coursesError || progressError) {
        throw cardsError || subjectsError || coursesError || progressError;
      }

      await db.transaction('rw', db.cards, db.subjects, db.courses, db.user_card_progress, async () => {
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
  ...card,
  updatedAt: card.updated_at
});

const formatCardForSupabase = (card) => ({
  ...card,
  updated_at: card.updatedAt,
  user_id: session.user.id,
  workspace_id: card.workspace_id,
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
    const newCards = lines.map((line, idx) => {
      const parts = line.split('/');
      if (parts.length >= 3) {
        return {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idx}`,
          question: parts[0].trim(),
          answer: parts[1].trim(),
          subject: normalizeSubjectName(parts[2].trim()),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          workspace_id: workspaceId,
          isSynced: false,
          nextReview: new Date().toISOString(),
          reviewCount: 0,
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

  const handleDeleteCardsOfSubject = async (subjectName) => {
    const cardsToDelete = await db.cards.where('subject').equalsIgnoreCase(subjectName).toArray();
    const subjectToDelete = await db.subjects.where('name').equalsIgnoreCase(subjectName).first();

    if (subjectToDelete) {
      // CORRECTION ICI
      await db.deletionsPending.add({ id: subjectToDelete.id, tableName: TABLE_NAMES.SUBJECTS });
      await db.subjects.delete(subjectToDelete.id);
    }

    if (cardsToDelete.length > 0) {
      // CORRECTION ICI
      const deletions = cardsToDelete.map(c => ({ id: c.id, tableName: TABLE_NAMES.CARDS }));
      await db.deletionsPending.bulkAdd(deletions);
      await db.cards.bulkDelete(cardsToDelete.map(c => c.id));
    }

    toast.success(`Matière "${subjectName}" et toutes ses cartes supprimées.`);

    if (isOnline) {
      syncToCloud();
    }
  };

  const handleReassignCardsOfSubject = async (subjectName) => {
    const subjectToDelete = await db.subjects.where('name').equalsIgnoreCase(subjectName).first();

    await db.cards.where('subject').equalsIgnoreCase(subjectName).modify({ subject: DEFAULT_SUBJECT, isSynced: false });

    if (subjectToDelete) {
      // CORRECTION ICI
      await db.deletionsPending.add({ id: subjectToDelete.id, tableName: TABLE_NAMES.SUBJECTS });
      await db.subjects.delete(subjectToDelete.id);
    }

    toast.success(`Cartes réassignées à "${DEFAULT_SUBJECT}".`);

    if (isOnline) {
      syncToCloud();
    }
  };

  const reviewCard = async (currentCard, quality) => {
    const userId = session?.user?.id;
    if (!userId) return;

    let progress = await db.user_card_progress
      .where({ card_id: currentCard.id, user_id: userId })
      .first();

    const { nextReview, interval, easiness } = calculateNextReview(
      quality,
      progress?.interval || 1,
      progress?.easiness || 2.5
    );

    const updatedProgress = {
      card_id: currentCard.id,
      user_id: userId,
      nextReview: nextReview.toISOString(),
      interval,
      easiness,
      reviewCount: (progress?.reviewCount || 0) + 1,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    };

    if (progress) {
      await db.user_card_progress.update(progress.id, updatedProgress);
    } else {
      await db.user_card_progress.add({
        ...updatedProgress,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  const getCardsToReview = async (subjectsArray = ['all'], options = {}) => {
    const { includeFuture = false } = options;
    const userId = session?.user?.id;
    if (!userId || !cards) return [];

    const now = new Date();
    const allUserProgress = await db.user_card_progress.where('user_id').equals(userId).toArray();
    const progressMap = new Map(allUserProgress.map(p => [p.card_id, p]));

    let cardsToReviewQuery = db.cards.toCollection();
    if (!subjectsArray.includes('all')) {
      cardsToReviewQuery = cardsToReviewQuery.filter(c => subjectsArray.includes(c.subject));
    }
    const allCardsInFilter = await cardsToReviewQuery.toArray();

    const dueCards = allCardsInFilter.filter(card => {
      const progress = progressMap.get(card.id);
      if (!progress) return true; // C'est une nouvelle carte, elle est due
      if (includeFuture) return true; // En mode "Révision Libre", on prend tout
      return new Date(progress.nextReview) <= now; // Sinon, on vérifie la date
    });

    if (dueCards.length === 0) return [];

    const mergedCards = dueCards.map(card => ({
      ...progressMap.get(card.id),
      ...card,
    }));

    if (includeFuture) {
      return mergedCards.sort((a, b) => {
        const dateA = a.nextReview ? new Date(a.nextReview) : 0;
        const dateB = b.nextReview ? new Date(b.nextReview) : 0;
        return dateA - dateB;
      });
    }

    return mergedCards.sort(() => Math.random() - 0.5);
  };

  const startReview = async (subjects = ['all'], options = {}) => {
    const toReview = await getCardsToReview(subjects, options);
    if (toReview.length > 0) {
      //
    } else {
      toast.error("Aucune carte à réviser !");
    }
  };

  const value = {
    cards, subjects, courses, isOnline, isSyncing, lastSync, syncToCloud,
    addCard, updateCardWithSync, deleteCardWithSync, handleBulkAdd, addSubject,
    handleDeleteCardsOfSubject, handleReassignCardsOfSubject, reviewCard, addCourse,
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