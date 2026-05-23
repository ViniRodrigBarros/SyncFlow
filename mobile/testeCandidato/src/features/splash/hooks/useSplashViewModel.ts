import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { useAuthTokenStore } from '../../../core/shared/services/AuthTokenStore';
import { authRepository } from '../../../core/shared/repositories/auth';
import { logger } from '../../../core/utils/logger';

const MIN_SPLASH_MS = 600;

export interface SplashViewModel {
  isLoading: boolean;
  appName: string;
}

/**
 * Splash:
 *  1. Hidrata o AuthTokenStore a partir do AsyncStorage.
 *  2. Se houver token persistido, valida no backend via /auth/me.
 *  3. Roteia para Home (sessão válida) ou Auth (sem sessão ou token expirado).
 *  4. Garante exibição mínima de 600 ms para evitar flash.
 */
export const useSplashViewModel = (): SplashViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrate = useAuthTokenStore(s => s.hydrate);
  const clear = useAuthTokenStore(s => s.clear);

  useEffect(() => {
    const startedAt = Date.now();
    let cancelled = false;

    const decide = async () => {
      try {
        await hydrate();
        const token = useAuthTokenStore.getState().token;
        let destination: 'Home' | 'Auth' = 'Auth';

        if (token) {
          try {
            await authRepository.fetchMe();
            destination = 'Home';
          } catch (error) {
            logger.warn('Sessão inválida, limpando token', error);
            await clear();
          }
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
      } catch (error) {
        logger.error('Splash decision failed', error);
        if (cancelled) return;
        setIsLoading(false);
        navigation.reset({ index: 0, routes: [{ name: Routes.Auth }] });
      }
    };

    decide();
    return () => {
      cancelled = true;
    };
  }, [navigation, hydrate, clear]);

  return {
    isLoading,
    appName: 'Teste Candidato',
  };
};
