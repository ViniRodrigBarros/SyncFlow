import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { create } from 'zustand';

import { logger } from '../../utils/logger';

/**
 * Observa o estado de rede do dispositivo. Mantemos como Zustand store para
 * que qualquer hook ou serviço (incluindo o engine de sync) consiga ler de
 * forma síncrona via `useNetworkStore.getState().isOnline`.
 *
 * O subscriber do NetInfo é registrado uma única vez, na primeira chamada
 * de `initNetworkObserver()` — feita no boot (Splash). Chamar duas vezes é
 * idempotente.
 */
interface NetworkState {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  lastChangedAt: number;
  setSnapshot: (state: NetInfoState) => void;
}

export const useNetworkStore = create<NetworkState>(set => ({
  isOnline: true,
  isInternetReachable: null,
  lastChangedAt: 0,
  setSnapshot: state =>
    set({
      isOnline: Boolean(state.isConnected),
      isInternetReachable: state.isInternetReachable,
      lastChangedAt: Date.now(),
    }),
}));

let unsubscribe: (() => void) | null = null;

export const initNetworkObserver = (): (() => void) => {
  if (unsubscribe) return unsubscribe;
  logger.debug('NetworkStore: registrando subscriber do NetInfo');
  unsubscribe = NetInfo.addEventListener(state => {
    useNetworkStore.getState().setSnapshot(state);
  });
  // Snapshot inicial síncrono.
  NetInfo.fetch()
    .then(s => useNetworkStore.getState().setSnapshot(s))
    .catch(err => logger.warn('NetInfo.fetch falhou', err));
  return unsubscribe;
};

export const isOnlineNow = (): boolean =>
  useNetworkStore.getState().isOnline &&
  useNetworkStore.getState().isInternetReachable !== false;
