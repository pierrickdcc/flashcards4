/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, act } from '@testing-library/react';
import { DataSyncProvider, useDataSync } from './DataSyncContext';
import { AuthProvider, useAuth } from './AuthContext'; // Importer useAuth
import { db } from '../db';
import { supabase } from '../supabaseClient';
import { TABLE_NAMES } from '../constants/app';

// Mock Dexie
vi.mock('../db', () => ({
  db: {
    cards: {
      add: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]), // Simule aucune carte non synchronisée au début
        })),
      })),
    },
    subjects: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
    },
    courses: {
       where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
    },
    deletionsPending: {
      add: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock Supabase
const mockSupabaseUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSupabaseSelect = vi.fn().mockResolvedValue({ data: [], error: null });

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      upsert: mockSupabaseUpsert,
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
    auth: { // S'assurer que auth est mocké
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }
  },
}));

// Mock AuthContext pour fournir un workspaceId
vi.mock('./AuthContext', async () => {
  const actualAuth = await vi.importActual('./AuthContext');
  const mockAuthContext = {
    session: { user: { id: 'test-user' } },
    workspaceId: 'test-workspace',
    isConfigured: true,
    loading: false,
    setWorkspaceId: vi.fn(),
  };
  return {
    ...actualAuth,
    useAuth: () => mockAuthContext, // Fournir un mock de useAuth
    AuthProvider: ({ children }) => <actualAuth.AuthContext.Provider value={mockAuthContext}>{children}</actualAuth.AuthContext.Provider>,
  };
});

const TestComponent = () => {
  const dataSync = useDataSync();
  return <button onClick={() => dataSync.addCard({ question: 'Q1', answer: 'A1', subject: 'S1' })}>Add Card</button>;
};

describe('DataSyncContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Simuler une session
    const { useAuth: mockUseAuth } = vi.mocked(await import('./AuthContext'));
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'test-user' } },
      workspaceId: 'test-workspace',
      isConfigured: true,
      loading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('offline-to-online: should add a card locally when offline and sync when online', async () => {
    // 1. Démarrer hors ligne
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    // Simuler qu'une carte non synchronisée existe déjà
    const unsyncedCard = { id: 'local_123', question: 'Q1', answer: 'A1', subject: 'S1', isSynced: false };
    db.cards.where.mockReturnValue({
      equals: () => ({
        toArray: () => Promise.resolve([unsyncedCard])
      })
    });

    const { getByText } = render(
      <AuthProvider>
        <DataSyncProvider>
          <TestComponent />
        </DataSyncProvider>
      </AuthProvider>
    );

    // 2. Vérifier que la synchronisation n'est PAS appelée au démarrage (car hors ligne)
    await act(async () => {
      vi.runAllTimers();
    });
    expect(mockSupabaseSelect).not.toHaveBeenCalled();

    // 3. Ajouter une nouvelle carte (toujours hors ligne)
    await act(async () => {
      getByText('Add Card').click();
    });

    // 4. Vérifier l'ajout local
    expect(db.cards.add).toHaveBeenCalledWith(expect.objectContaining({
      question: 'Q1',
      answer: 'A1',
      isSynced: false,
    }));
    expect(mockSupabaseUpsert).not.toHaveBeenCalled(); // Toujours pas d'appel réseau

    // 5. Passer en ligne
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      vi.runAllTimers(); // Lancer les timers pour les useEffect
    });

    // 6. Vérifier que la synchronisation (select ET upsert) est appelée
    expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
    expect(mockSupabaseUpsert).toHaveBeenCalledWith([
      expect.objectContaining({ question: 'Q1', answer: 'A1' }) // Vérifie que la carte non synchro est envoyée
    ]);
  });
});