import { create } from 'zustand';

import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { asyncStorageManager } from './storage';

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}

export const LANGUAGE_OPTIONS: ReadonlyArray<LanguageOption> = [
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Español (ES)' },
];

interface PersistedPreferences {
  autoSync: boolean;
  language: LanguageCode;
}

interface PreferencesState extends PersistedPreferences {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setAutoSync: (enabled: boolean) => Promise<void>;
  setLanguage: (code: LanguageCode) => Promise<void>;
}

const DEFAULTS: PersistedPreferences = {
  autoSync: true,
  language: 'pt-BR',
};

const persist = async (state: PersistedPreferences): Promise<void> => {
  try {
    await asyncStorageManager.setObject(env.storageKeys.preferences, state);
  } catch (error) {
    logger.warn('PreferencesStore.persist falhou', error);
  }
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const stored = await asyncStorageManager.getObject<PersistedPreferences>(
        env.storageKeys.preferences,
      );
      if (stored) {
        set({ ...stored, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch (error) {
      logger.warn('PreferencesStore.hydrate falhou', error);
      set({ hydrated: true });
    }
  },

  setAutoSync: async enabled => {
    set({ autoSync: enabled });
    const { language } = get();
    await persist({ autoSync: enabled, language });
  },

  setLanguage: async code => {
    set({ language: code });
    const { autoSync } = get();
    await persist({ autoSync, language: code });
  },
}));

export const labelForLanguage = (code: LanguageCode): string =>
  LANGUAGE_OPTIONS.find(o => o.code === code)?.label ?? code;
