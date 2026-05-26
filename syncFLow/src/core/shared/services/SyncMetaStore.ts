import { create } from 'zustand';

import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { asyncStorageManager } from './storage';

interface SyncMetaState {
  lastSyncedAt: number | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  recordSyncSuccess: (finishedAt: number) => Promise<void>;
}

export const useSyncMetaStore = create<SyncMetaState>((set, get) => ({
  lastSyncedAt: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const stored = await asyncStorageManager.getString(
        env.storageKeys.lastSyncedAt,
      );
      const ts = stored ? Number(stored) : null;
      set({ lastSyncedAt: Number.isFinite(ts) ? ts : null, hydrated: true });
    } catch (error) {
      logger.warn('SyncMetaStore.hydrate falhou', error);
      set({ hydrated: true });
    }
  },

  recordSyncSuccess: async finishedAt => {
    set({ lastSyncedAt: finishedAt });
    try {
      await asyncStorageManager.setString(
        env.storageKeys.lastSyncedAt,
        String(finishedAt),
      );
    } catch (error) {
      logger.warn('SyncMetaStore.recordSyncSuccess falhou', error);
    }
  },
}));

/**
 * Texto humanizado tipo "agora", "2 min atrás", "3 h atrás", "ontem", "12/05".
 * Mantemos local — não vale puxar uma lib de datas só para isso.
 */
export const formatRelativeTime = (
  timestamp: number | null,
  now: number = Date.now(),
): string => {
  if (!timestamp || !Number.isFinite(timestamp)) return 'Nunca';
  const diff = Math.max(0, now - timestamp);
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min atrás`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h atrás`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'ontem';
  if (day < 7) return `${day} dias atrás`;
  const d = new Date(timestamp);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
};
