import { Platform } from 'react-native';

/**
 * Backend resolução por plataforma:
 *  - Android emulator: 10.0.2.2 mapeia para o host
 *  - iOS simulator e web: localhost
 *  - Dispositivo físico: definir EXPO_PUBLIC_API_BASE_URL com o IP da máquina
 */
const resolveApiBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  apiTimeoutMs: 15_000,
  storageKeys: {
    authToken: '@teste-candidato/auth/token',
    authUser: '@teste-candidato/auth/user',
    preferences: '@teste-candidato/prefs/v1',
    lastSyncedAt: '@teste-candidato/sync/last-at',
  },
} as const;

export type Env = typeof env;
