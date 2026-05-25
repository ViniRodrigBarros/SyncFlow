import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { authRepository } from '../../../core/shared/repositories/auth';
import {
  initNetworkObserver,
  isOnlineNow,
  useAuthTokenStore,
  usePreferencesStore,
  useSyncMetaStore,
} from '../../../core/shared/services';
import { logger } from '../../../core/utils/logger';

const MIN_SPLASH_MS = 600;

export interface SplashViewModel {
  isLoading: boolean;
  appName: string;
  preparingMessage: string;
  versionLabel: string;
}

/**
 * Splash:
 *  1. Liga o observador de rede (NetInfo) — uma única vez no boot.
 *  2. Hidrata o AuthTokenStore a partir do AsyncStorage.
 *  3. Decide a rota:
 *      - Sem token → Auth.
 *      - Com token → Home, SEMPRE (online ou offline). O app é offline-first;
 *        o que existe em cache já basta para abrir a tela. Se houver internet,
 *        dispara um refresh do token em background (não bloqueia a navegação);
 *        se o backend devolver 401, o Home detecta via observer e devolve o
 *        usuário para Auth na próxima oportunidade.
 *  4. Mantém o splash visível por pelo menos 600ms para evitar flash visual.
 */
export const useSplashViewModel = (): SplashViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrate = useAuthTokenStore(s => s.hydrate);

  useEffect(() => {
    initNetworkObserver();
    const startedAt = Date.now();
    let cancelled = false;

    const decide = async () => {
      await Promise.all([
        hydrate(),
        usePreferencesStore.getState().hydrate(),
        useSyncMetaStore.getState().hydrate(),
      ]);
      const token = useAuthTokenStore.getState().token;
      const destination: 'Home' | 'Auth' = token ? 'Home' : 'Auth';

      if (token && isOnlineNow()) {
        // Refresh "fire-and-forget" — Promise não aguardada de propósito.
        authRepository
          .refreshSession()
          .then(outcome => logger.debug('refreshSession (bg)', outcome))
          .catch(err => logger.warn('refreshSession (bg) erro', err));
      }

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
      await new Promise(resolve => setTimeout(resolve, wait));
      if (cancelled) return;

      setIsLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: Routes[destination] }],
      });
    };

    decide().catch(err => {
      logger.error('Splash decision failed', err);
      if (cancelled) return;
      setIsLoading(false);
      navigation.reset({ index: 0, routes: [{ name: Routes.Auth }] });
    });

    return () => {
      cancelled = true;
    };
  }, [navigation, hydrate]);

  return {
    isLoading,
    appName: 'SyncFlow',
    preparingMessage: 'Preparando sua experiência…',
    versionLabel: 'v1.0.0',
  };
};
