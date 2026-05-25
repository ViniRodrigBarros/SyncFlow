import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef } from 'react';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { authRepository } from '../../../core/shared/repositories/auth';
import {
  formatRelativeTime,
  labelForLanguage,
  useAppStateStore,
  useAuthTokenStore,
  useNetworkStore,
  usePreferencesStore,
  useSyncMetaStore,
  useThemeStore,
  type LanguageCode,
} from '../../../core/shared/services';
import { useSyncEngine, type SyncStatus } from '../../sync';

export interface ProfileViewModel {
  userName: string;
  userInitial: string;
  role: string;
  empresaName: string;
  loginEmail: string;
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncedLabel: string;
  isSyncing: boolean;
  darkMode: boolean;
  autoSync: boolean;
  language: LanguageCode;
  languageLabel: string;
  onToggleDarkMode: () => void;
  onToggleAutoSync: () => Promise<void>;
  onPickLanguage: (code: LanguageCode) => Promise<void>;
  onEditProfile: () => void;
  onSyncNow: () => Promise<void>;
  onLogout: () => Promise<void>;
}

const initialOf = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return 'U';
  return trimmed.charAt(0).toUpperCase();
};

/**
 * ViewModel da tela de Perfil.
 *
 *  - Não monta sync automático: usa `useSyncEngine({ autoOnMount: false })`.
 *    A Home já dispara o sync inicial; a tela de Perfil só oferece o botão
 *    "Sincronizar agora" sob demanda e segue ouvindo mudanças de conexão.
 *  - O timestamp "Last synced" é lido do `SyncMetaStore`, que persiste o
 *    último sucesso para sobreviver a reloads.
 *  - Dark Mode é puramente o `useThemeStore` (instantâneo).
 *  - Auto-sync e idioma persistem em AsyncStorage via `PreferencesStore`.
 *  - Logout limpa a sessão e faz reset para Auth.
 */
export const useProfileViewModel = (): ProfileViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthTokenStore(s => s.user);
  const isOnline = useNetworkStore(
    s => s.isOnline && s.isInternetReachable !== false,
  );
  const sync = useSyncEngine({ autoOnMount: false });

  const themeMode = useThemeStore(s => s.mode);
  const toggleTheme = useThemeStore(s => s.toggle);

  const autoSync = usePreferencesStore(s => s.autoSync);
  const language = usePreferencesStore(s => s.language);
  const setAutoSync = usePreferencesStore(s => s.setAutoSync);
  const setLanguage = usePreferencesStore(s => s.setLanguage);

  const lastSyncedAt = useSyncMetaStore(s => s.lastSyncedAt);

  // Atualiza o "há X min" enquanto a tela está aberta. Reagendamos com base no
  // valor atual para evitar uma renderização por segundo desnecessária.
  const prevStatusRef = useRef<SyncStatus>(sync.status);
  useEffect(() => {
    if (prevStatusRef.current === 'syncing' && sync.status === 'success') {
      const ts = sync.lastStats?.finishedAt ?? Date.now();
      void useSyncMetaStore.getState().recordSyncSuccess(ts);
      useAppStateStore
        .getState()
        .showToast('Sincronização concluída.', 'success');
    }
    if (sync.status === 'error' && sync.errorMessage) {
      useAppStateStore
        .getState()
        .showToast(sync.errorMessage, 'error');
    }
    prevStatusRef.current = sync.status;
  }, [sync.status, sync.lastStats, sync.errorMessage]);

  const onToggleDarkMode = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const onToggleAutoSync = useCallback(async () => {
    await setAutoSync(!autoSync);
  }, [autoSync, setAutoSync]);

  const onPickLanguage = useCallback(
    async (code: LanguageCode) => {
      await setLanguage(code);
    },
    [setLanguage],
  );

  const onEditProfile = useCallback(() => {
    useAppStateStore
      .getState()
      .showToast('Em breve: edição de perfil.', 'info');
  }, []);

  const onSyncNow = useCallback(async () => {
    if (!isOnline) {
      useAppStateStore
        .getState()
        .showToast('Sem conexão. Conecte-se para sincronizar.', 'error');
      return;
    }
    await sync.syncNow();
  }, [isOnline, sync]);

  const onLogout = useCallback(async () => {
    await authRepository.signOut();
    navigation.reset({ index: 0, routes: [{ name: Routes.Auth }] });
  }, [navigation]);

  const userName = user?.name?.trim() || 'Usuário';
  const empresaName = user?.empresa?.name?.trim() || '—';
  const loginEmail = user?.login ?? '';

  return {
    userName,
    userInitial: initialOf(userName),
    role: 'Membro da equipe',
    empresaName,
    loginEmail,
    isOnline,
    syncStatus: sync.status,
    lastSyncedLabel: formatRelativeTime(lastSyncedAt),
    isSyncing: sync.status === 'syncing',
    darkMode: themeMode === 'dark',
    autoSync,
    language,
    languageLabel: labelForLanguage(language),
    onToggleDarkMode,
    onToggleAutoSync,
    onPickLanguage,
    onEditProfile,
    onSyncNow,
    onLogout,
  };
};
