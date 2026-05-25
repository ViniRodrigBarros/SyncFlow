import { useCallback, useEffect, useRef, useState } from 'react';

import { AppError } from '../../../core/api';
import { syncRepository, type SyncStats } from '../../../core/shared/repositories/sync';
import {
  isOnlineNow,
  useNetworkStore,
  useSyncMetaStore,
} from '../../../core/shared/services';
import { logger } from '../../../core/utils/logger';

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'success'
  | 'error'
  | 'offline'
  | 'unauthorized';

export interface SyncEngineState {
  status: SyncStatus;
  errorMessage: string | null;
  lastStats: SyncStats | null;
}

export interface SyncEngine extends SyncEngineState {
  syncNow: () => Promise<void>;
}

interface UseSyncEngineOptions {
  /**
   * Dispara uma sincronização automaticamente quando o hook monta. Padrão `true`.
   * O hook respeita a regra: se houver internet roda; caso contrário marca offline.
   */
  autoOnMount?: boolean;
  /**
   * Dispara sincronização sempre que a conexão voltar (transição offline → online).
   * Padrão `true`.
   */
  autoOnReconnect?: boolean;
}

/**
 * Engine de sincronização exposto às telas.
 *
 * Regras de chamada (alinhadas com o pedido do produto):
 *  - Se o app abre e está online: dispara sync. O WatermelonDB usa o
 *    `lastPulledAt` que ele guarda internamente; se for a primeira vez,
 *    `lastPulledAt` é null e o `SyncRepository` simplesmente não envia a
 *    query string — o backend interpreta como "manda tudo".
 *  - Se o app abre offline: marca status `offline` e mantém os dados locais
 *    intactos. A próxima reconexão dispara o sync sozinha.
 *  - Em background, observamos transições offline → online via NetInfo.
 */
export const useSyncEngine = (options: UseSyncEngineOptions = {}): SyncEngine => {
  const { autoOnMount = true, autoOnReconnect = true } = options;
  const [state, setState] = useState<SyncEngineState>({
    status: 'idle',
    errorMessage: null,
    lastStats: null,
  });
  const inflightRef = useRef<Promise<void> | null>(null);
  const previousOnlineRef = useRef<boolean>(isOnlineNow());

  const syncNow = useCallback(async () => {
    if (inflightRef.current) return inflightRef.current;
    if (!isOnlineNow()) {
      setState(prev => ({ ...prev, status: 'offline', errorMessage: null }));
      return;
    }

    setState(prev => ({ ...prev, status: 'syncing', errorMessage: null }));
    const promise = (async () => {
      try {
        const stats = await syncRepository.run();
        setState({ status: 'success', errorMessage: null, lastStats: stats });
        // Atualiza o store global — qualquer consumidor (Home, Profile) pode
        // depender de `lastSyncedAt` para forçar refresh de dados que o sync
        // alterou via `markAsSynced` (que não dispara observables do Watermelon).
        void useSyncMetaStore.getState().recordSyncSuccess(stats.finishedAt);
      } catch (error) {
        const appError = AppError.from(error);
        if (appError.kind === 'unauthorized' || appError.kind === 'forbidden') {
          setState(prev => ({
            ...prev,
            status: 'unauthorized',
            errorMessage: appError.message,
          }));
        } else if (appError.kind === 'network' || appError.kind === 'timeout') {
          setState(prev => ({
            ...prev,
            status: 'offline',
            errorMessage: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            status: 'error',
            errorMessage: appError.message,
          }));
        }
      } finally {
        inflightRef.current = null;
      }
    })();
    inflightRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    if (autoOnMount) {
      void syncNow();
    }
  }, [autoOnMount, syncNow]);

  useEffect(() => {
    if (!autoOnReconnect) return;
    const unsub = useNetworkStore.subscribe(state => {
      const online = state.isOnline && state.isInternetReachable !== false;
      if (online && !previousOnlineRef.current) {
        logger.info('Rede voltou — disparando sync automático');
        void syncNow();
      }
      previousOnlineRef.current = online;
    });
    return unsub;
  }, [autoOnReconnect, syncNow]);

  return { ...state, syncNow };
};
