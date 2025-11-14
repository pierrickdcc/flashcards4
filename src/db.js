
// src/db.js
import Dexie from 'dexie';
import { TABLE_NAMES } from './constants/app';

export const db = new Dexie('flashcardsDB');

// Définition de la version 6 (inchangée) pour les utilisateurs existants
db.version(6).stores({
  [TABLE_NAMES.CARDS]: 'id, workspace_id, subject, updatedAt, isSynced',
  [TABLE_NAMES.SUBJECTS]: 'id, workspace_id, name, isSynced',
  [TABLE_NAMES.COURSES]: 'id, workspace_id, subject, title, content, updatedAt, isSynced',
  [TABLE_NAMES.MEMOS]: 'id, workspace_id, course_id, is_pinned, updatedAt, isSynced',
  [TABLE_NAMES.USER_CARD_PROGRESS]:
    'id, [card_id+user_id], card_id, user_id, interval, easeFactor, dueDate, status',
  [TABLE_NAMES.DELETIONS_PENDING]: 'id, tableName',
});

// Nouvelle version 7 avec le schéma mis à jour pour les cartes
db.version(7).stores({
  [TABLE_NAMES.CARDS]: 'id, workspace_id, subject_id, updatedAt, isSynced', // 'subject' devient 'subject_id'
  [TABLE_NAMES.SUBJECTS]: 'id, workspace_id, name, isSynced',
  [TABLE_NAMES.COURSES]: 'id, workspace_id, subject, title, content, updatedAt, isSynced',
  [TABLE_NAMES.MEMOS]: 'id, workspace_id, course_id, is_pinned, updatedAt, isSynced',
  [TABLE_NAMES.USER_CARD_PROGRESS]:
    'id, [card_id+user_id], card_id, user_id, interval, easeFactor, dueDate, status',
  [TABLE_NAMES.DELETIONS_PENDING]: 'id, tableName',
}).upgrade(async (tx) => {
  // Cette fonction s'exécute pour les utilisateurs qui ont une ancienne version de la BDD.
  console.log("Mise à jour du schéma Dexie vers la version 7...");

  // Récupérer toutes les matières pour mapper les noms aux IDs
  const subjects = await tx.table(TABLE_NAMES.SUBJECTS).toArray();
  const subjectNameMap = new Map(subjects.map(s => [s.name, s.id]));

  // Modifier chaque carte pour remplacer 'subject' (nom) par 'subject_id' (UUID)
  await tx.table(TABLE_NAMES.CARDS).toCollection().modify(card => {
    const subjectId = subjectNameMap.get(card.subject);
    if (subjectId) {
      card.subject_id = subjectId;
    }
    delete card.subject; // Supprimer l'ancienne propriété
  });

  console.log("Mise à jour du schéma Dexie vers la version 7 terminée.");
});
