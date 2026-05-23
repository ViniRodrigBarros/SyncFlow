import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';

import { Q } from '@nozbe/watermelondb';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { database, type Registro } from '../../../core/database';
import { authRepository } from '../../../core/shared/repositories/auth';
import {
  useAuthTokenStore,
  useNetworkStore,
} from '../../../core/shared/services';
import { useSyncEngine, type SyncStatus } from '../../sync';

export interface RegistroListItem {
  id: string;
  tipo: 'COMPRA' | 'VENDA';
  dataHora: number;
  descricao: string;
  isPending: boolean;
}

export interface HomeViewModel {
  userName: string | null;
  empresaName: string | null;
  isOnline: boolean;
  syncStatus: SyncStatus;
  syncErrorMessage: string | null;
  lastSyncAt: number | null;
  registros: RegistroListItem[];
  syncNow: () => void;
  signOut: () => Promise<void>;
}

interface RawRecord {
  _status?: 'created' | 'updated' | 'deleted' | 'synced';
}

const isPendingRecord = (registro: Registro): boolean => {
  const raw = (registro as unknown as { _raw?: RawRecord })._raw;
  const status = raw?._status ?? 'synced';
  return status !== 'synced';
};

/**
 * ViewModel da Home (Dashboard).
 *
 *  - Lê o usuário logado e o estado de rede do Zustand.
 *  - Usa `useSyncEngine` para disparar o sync ao montar (regra do produto:
 *    primeira execução sem `lastPulledAt`, demais com — gerenciado pelo
 *    WatermelonDB automaticamente).
 *  - Observa a tabela `registros` do banco local para exibir a lista. Como
 *    a observação é reativa, qualquer pull/push completo re-renderiza a UI
 *    sem precisar de invalidação manual.
 *  - Se o backend devolver 401 (token expirado), faz signOut e empurra para
 *    a tela de Auth.
 */
export const useHomeViewModel = (): HomeViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthTokenStore(s => s.user);
  const isOnline = useNetworkStore(
    s => s.isOnline && s.isInternetReachable !== false,
  );
  const sync = useSyncEngine();
  const [registros, setRegistros] = useState<RegistroListItem[]>([]);

  // Observa registros da empresa do usuário em ordem decrescente de data.
  useEffect(() => {
    if (!user) return;
    const collection = database.get<Registro>('registros');
    const subscription = collection
      .query(Q.where('empresa_id', String(user.empresaId)))
      .observeWithColumns(['tipo', 'data_hora', 'descricao'])
      .subscribe((items: Registro[]) => {
        const mapped: RegistroListItem[] = items
          .map((r: Registro) => ({
            id: r.id,
            tipo: r.tipo,
            dataHora: r.dataHora?.getTime?.() ?? 0,
            descricao: r.descricao,
            isPending: isPendingRecord(r),
          }))
          .sort((a, b) => b.dataHora - a.dataHora);
        setRegistros(mapped);
      });
    return () => subscription.unsubscribe();
  }, [user]);

  // Se a sync devolveu 401, encerra a sessão e manda para Auth.
  useEffect(() => {
    if (sync.status !== 'unauthorized') return;
    void (async () => {
      await authRepository.signOut();
      navigation.reset({ index: 0, routes: [{ name: Routes.Auth }] });
    })();
  }, [sync.status, navigation]);

  const signOut = useCallback(async () => {
    await authRepository.signOut();
    navigation.reset({ index: 0, routes: [{ name: Routes.Auth }] });
  }, [navigation]);

  return {
    userName: user?.name ?? null,
    empresaName: user?.empresa?.name ?? null,
    isOnline,
    syncStatus: sync.status,
    syncErrorMessage: sync.errorMessage,
    lastSyncAt: sync.lastStats?.finishedAt ?? null,
    registros,
    syncNow: () => void sync.syncNow(),
    signOut,
  };
};
