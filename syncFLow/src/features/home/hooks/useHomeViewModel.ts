import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Q } from '@nozbe/watermelondb';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { database, type Registro } from '../../../core/database';
import { authRepository } from '../../../core/shared/repositories';
import {
  useAppStateStore,
  useAuthTokenStore,
  useNetworkStore,
  useSyncMetaStore,
} from '../../../core/shared/services';
import { useSyncEngine, type SyncStatus } from '../../sync';

export interface RegistroListItem {
  id: string;
  tipo: 'COMPRA' | 'VENDA';
  dataHora: number;
  descricao: string;
  isPending: boolean;
  hasError: boolean;
}

export interface HomeStats {
  compras: number;
  vendas: number;
  pendentes: number;
  sincronizados: number;
}

export interface HomeViewModel {
  userName: string | null;
  empresaName: string | null;
  greetingSubtitle: string;
  isOnline: boolean;
  syncStatus: SyncStatus;
  stats: HomeStats;
  registros: RegistroListItem[];
  showOffline: boolean;
  isRetrying: boolean;
  signOut: () => Promise<void>;
  onAddPress: () => void;
  onSeeAllPress: () => void;
  onRegistroPress: (id: string) => void;
  onProfilePress: () => void;
  onRetryConnection: () => Promise<void>;
  onViewLocal: () => void;
}

interface RawRecord {
  _status?: 'created' | 'updated' | 'deleted' | 'synced';
  _changed?: string;
}

const recordStatus = (registro: Registro): 'synced' | 'pending' | 'error' => {
  const raw = (registro as unknown as { _raw?: RawRecord })._raw;
  const status = raw?._status ?? 'synced';
  return status === 'synced' ? 'synced' : 'pending';
};

const buildGreetingSubtitle = (
  status: SyncStatus,
  isOnline: boolean,
  pendentes: number,
): string => {
  if (!isOnline)
    return 'Você está offline. Continuamos salvando seus registros localmente.';
  if (status === 'syncing') return 'Sincronizando seus registros…';
  if (status === 'unauthorized') return 'Sessão expirada. Refaça o login para continuar.';
  if (pendentes > 0)
    return `Você tem ${pendentes} ${pendentes === 1 ? 'registro pendente' : 'registros pendentes'} aguardando envio.`;
  return 'Sua conta está atualizada e pronta para novos registros.';
};

/**
 * ViewModel da Home (Dashboard).
 *
 *  - Lê o usuário logado e o estado de rede do Zustand.
 *  - `useSyncEngine` cuida do sync automático (montagem + reconexão). Aqui só
 *    observamos o `status` para mensagens.
 *  - Observa quatro queries reativas no SQLite local:
 *      * todos os registros da empresa (lista)
 *      * count por `tipo` (Compras, Vendas)
 *      * count por status (Pendentes, Sincronizados)
 *  - Quando o sync transiciona `syncing → success` com registros criados/
 *    atualizados, dispara um toast discreto via AppStateStore.
 *  - 401 do backend → signOut + reset para Auth.
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
  const [stats, setStats] = useState<HomeStats>({
    compras: 0,
    vendas: 0,
    pendentes: 0,
    sincronizados: 0,
  });
  const previousStatusRef = useRef<SyncStatus>(sync.status);
  const pendingAtSyncStartRef = useRef<number>(0);
  const [forceShowLocal, setForceShowLocal] = useState(false);

  // Observação reativa da tabela `registros` da empresa do usuário.
  //
  // Importante: `synchronize()` do WatermelonDB usa `markAsSynced` para flipar
  // `_status: 'created'|'updated' → 'synced'` ao final de um push. Essa mudança
  // NÃO dispara observables de query (é tratada como metadata interna). Por isso
  // dependemos de `lastSyncedAt` do store global (atualizado por qualquer sync
  // bem-sucedido, independente de quem chamou) — toda vez que um sync conclui o
  // effect resubscreve e reemite o snapshot atual com `_status` correto.
  const lastSyncedAt = useSyncMetaStore(s => s.lastSyncedAt);
  useEffect(() => {
    if (!user) return;
    const collection = database.get<Registro>('registros');
    const subscription = collection
      .query(Q.where('empresa_id', String(user.empresaId)))
      .observe()
      .subscribe((items: Registro[]) => {
        const mapped: RegistroListItem[] = items
          .map((r: Registro) => {
            const status = recordStatus(r);
            return {
              id: r.id,
              tipo: r.tipo,
              dataHora: r.dataHora?.getTime?.() ?? 0,
              descricao: r.descricao,
              isPending: status === 'pending',
              hasError: false,
            };
          })
          .sort((a, b) => b.dataHora - a.dataHora);

        const compras = mapped.filter(m => m.tipo === 'COMPRA').length;
        const vendas = mapped.filter(m => m.tipo === 'VENDA').length;
        const pendentes = mapped.filter(m => m.isPending).length;
        const sincronizados = mapped.length - pendentes;

        setRegistros(mapped);
        setStats({ compras, vendas, pendentes, sincronizados });
      });
    return () => subscription.unsubscribe();
  }, [user, lastSyncedAt]);

  // Toast quando o sync termina com sucesso após estar `syncing`.
  // O WatermelonDB não devolve a contagem de itens criados/atualizados em
  // `SyncStats`, então capturamos o número de `pendentes` no início do sync
  // e comparamos com o atual ao terminar — `delta` = quantos saíram da fila.
  useEffect(() => {
    const prev = previousStatusRef.current;
    if (sync.status === 'syncing' && prev !== 'syncing') {
      pendingAtSyncStartRef.current = stats.pendentes;
    }
    if (prev === 'syncing' && sync.status === 'success') {
      const delta = pendingAtSyncStartRef.current - stats.pendentes;
      if (delta > 0) {
        const message =
          delta === 1
            ? '1 registro sincronizado'
            : `${delta} registros sincronizados`;
        useAppStateStore.getState().showToast(message, 'success');
      }
      setForceShowLocal(false);
    }
    previousStatusRef.current = sync.status;
  }, [sync.status, stats.pendentes]);

  // Quando a rede volta, esconde o "ver local mesmo offline".
  useEffect(() => {
    if (isOnline) setForceShowLocal(false);
  }, [isOnline]);

  // 401 do backend → desloga.
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

  const onAddPress = useCallback(() => {
    navigation.navigate(Routes.RegistroForm);
  }, [navigation]);

  const onSeeAllPress = useCallback(() => {
    navigation.navigate(Routes.RegistroList);
  }, [navigation]);

  const onRegistroPress = useCallback(
    (id: string) => {
      navigation.navigate(Routes.RegistroDetail, { id });
    },
    [navigation],
  );

  const onProfilePress = useCallback(() => {
    navigation.navigate(Routes.Profile);
  }, [navigation]);

  const onRetryConnection = useCallback(async () => {
    await sync.syncNow();
  }, [sync]);

  const onViewLocal = useCallback(() => {
    setForceShowLocal(true);
  }, []);

  const showOffline = !isOnline && !forceShowLocal;

  return {
    userName: user?.name ?? null,
    empresaName: user?.empresa?.name ?? null,
    greetingSubtitle: buildGreetingSubtitle(
      sync.status,
      isOnline,
      stats.pendentes,
    ),
    isOnline,
    syncStatus: sync.status,
    stats,
    registros,
    showOffline,
    isRetrying: sync.status === 'syncing',
    signOut,
    onAddPress,
    onSeeAllPress,
    onRegistroPress,
    onProfilePress,
    onRetryConnection,
    onViewLocal,
  };
};
