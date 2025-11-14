
// src/db.js
import Dexie from 'dexie';
import { TABLE_NAMES } from './constants/app';

export const db = new Dexie('flashcardsDB');
db.version(5).stores({
  [TABLE_NAMES.CARDS]: 'id, workspace_id, subject, updatedAt, isSynced',
  [TABLE_NAMES.SUBJECTS]: 'id, workspace_id, name, isSynced',
  [TABLE_NAMES.COURSES]: 'id, workspace_id, subject, title, content, updatedAt, isSynced',
  [TABLE_NAMES.MEMOS]: 'id, workspace_id, course_id, is_pinned, updatedAt, isSynced',
  [TABLE_NAMES.USER_CARD_PROGRESS]: 'id, [card_id+user_id], card_id, user_id, nextReview',
  [TABLE_NAMES.DELETIONS_PENDING]: 'id, tableName',
});
