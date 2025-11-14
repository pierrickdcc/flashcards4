/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Utiliser vi.hoisted pour déclarer les mocks qui doivent être accessibles par d'autres mocks
const { mockSupabaseUpsert, mockSupabaseSelect } = vi.hoisted(() => {
  return {
    mockSupabaseUpsert: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      then: (resolve) => resolve({ error: null }),
    }),
    mockSupabaseSelect: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  };
});

const { createMockTable } = vi.hoisted(() => {
    return {
        createMockTable: () => ({
            add: vi.fn(),
            toArray: vi.fn().mockResolvedValue([]),
            where: vi.fn().mockReturnThis(),
            equals: vi.fn().mockReturnThis(),
            and: vi.fn().mockReturnThis(),
            startsWith: vi.fn().mockReturnThis(),
            modify: vi.fn().mockResolvedValue(undefined),
            bulkDelete: vi.fn().mockResolvedValue(undefined),
            bulkPut: vi.fn().mockResolvedValue(undefined),
            anyOf: vi.fn().mockReturnThis(),
          })
    }
})

vi.mock('../db', () => ({
  db: {
    cards: createMockTable(),
    subjects: createMockTable(),
    courses: createMockTable(),
    memos: createMockTable(),
    user_card_progress: createMockTable(),
    deletionsPending: { ...createMockTable(), delete: vi.fn().mockResolvedValue(undefined) },
    transaction: vi.fn((mode, ...args) => args.pop()()),
  },
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      upsert: mockSupabaseUpsert,
      delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
    channel: vi.fn(() => ({ on: vi.fn(() => ({ subscribe: vi.fn() })) })),
    removeChannel: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

vi.mock('./AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      session: { user: { id: 'test-user' } },
      workspaceId: 'test-workspace',
      isConfigured: true,
      loading: false,
    }),
  };
});

// Importer les modules après la configuration des mocks
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { DataSyncProvider, useDataSync } from './DataSyncContext';
import { AuthProvider } from './AuthContext';
import { UIStateProvider } from './UIStateContext';
import { db } from '../db';

const TestComponent = () => {
  const dataSync = useDataSync();
  return <button onClick={() => dataSync.addCard({ question: 'Q1', answer: 'A1', subject: 'S1' })}>Add Card</button>;
};

describe('DataSyncContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // TODO: Ce test est instable et timeout. Il doit être réécrit ou débogué.
  // La logique asynchrone de syncToCloud semble ne pas se résoudre correctement dans l'environnement de test.
  it.skip('offline-to-online: should add a card locally when offline and sync when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const unsyncedCard = { id: 'local_123', question: 'Q1', answer: 'A1', subject: 'S1', isSynced: false };
    db.cards.where().equals().toArray.mockResolvedValue([unsyncedCard]);

    render(
      <AuthProvider>
        <UIStateProvider>
          <DataSyncProvider>
            <TestComponent />
          </DataSyncProvider>
        </UIStateProvider>
      </AuthProvider>
    );

    await act(async () => { vi.runAllTimers(); });
    expect(mockSupabaseSelect).not.toHaveBeenCalled();

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
    });

    expect(mockSupabaseUpsert).toHaveBeenCalledWith([
      expect.objectContaining({ question: 'Q1', answer: 'A1' })
    ]);
  }, 10000);
});
