import { create } from 'zustand';

import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { AuthenticatedUser } from '../data/entities/authEntities';
import { asyncStorageManager } from './storage';

/**
 * Sessão do usuário logado. Mantida em memória (Zustand) para acesso síncrono
 * (por exemplo, pelo httpClient interceptor) e replicada em AsyncStorage para
 * sobreviver ao reload do app.
 *
 * Use `hydrate()` no boot (Splash) para popular o store a partir do storage.
 */
interface AuthTokenState {
  token: string | null;
  user: AuthenticatedUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthenticatedUser) => Promise<void>;
  clear: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthTokenStore = create<AuthTokenState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,

  setSession: async (token, user) => {
    set({ token, user });
    await Promise.all([
      asyncStorageManager.setString(env.storageKeys.authToken, token),
      asyncStorageManager.setObject(env.storageKeys.authUser, user),
    ]);
  },

  clear: async () => {
    set({ token: null, user: null });
    await Promise.all([
      asyncStorageManager.remove(env.storageKeys.authToken),
      asyncStorageManager.remove(env.storageKeys.authUser),
    ]);
  },

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const [token, user] = await Promise.all([
        asyncStorageManager.getString(env.storageKeys.authToken),
        asyncStorageManager.getObject<AuthenticatedUser>(env.storageKeys.authUser),
      ]);
      set({ token, user, hydrated: true });
    } catch (error) {
      logger.warn('AuthTokenStore.hydrate falhou', error);
      set({ hydrated: true });
    }
  },
}));

export const getAuthToken = (): string | null =>
  useAuthTokenStore.getState().token;

export const setAuthSession = (token: string, user: AuthenticatedUser): Promise<void> =>
  useAuthTokenStore.getState().setSession(token, user);

export const clearAuthSession = (): Promise<void> =>
  useAuthTokenStore.getState().clear();
