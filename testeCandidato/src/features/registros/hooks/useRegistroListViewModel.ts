import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Q } from '@nozbe/watermelondb';

import { database, type Registro } from '../../../core/database';
import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { useAuthTokenStore } from '../../../core/shared/services';
import type { RegistroListItem } from '../../home/hooks/useHomeViewModel';

export type StatusFilter = 'all' | 'pending' | 'synced';
export type TipoFilter = 'all' | 'COMPRA' | 'VENDA';

export interface RegistroListCounts {
  all: number;
  pending: number;
  synced: number;
}

export interface RegistroListViewModel {
  registros: RegistroListItem[];
  filtered: RegistroListItem[];
  counts: RegistroListCounts;
  searchTerm: string;
  statusFilter: StatusFilter;
  tipoFilter: TipoFilter;
  isLoading: boolean;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setTipoFilter: (tipo: TipoFilter) => void;
  clearFilters: () => void;
  onRegistroPress: (id: string) => void;
  onAddPress: () => void;
  onBackPress: () => void;
}

interface RawRecord {
  _status?: 'created' | 'updated' | 'deleted' | 'synced';
}

const recordStatus = (registro: Registro): 'synced' | 'pending' => {
  const raw = (registro as unknown as { _raw?: RawRecord })._raw;
  const status = raw?._status ?? 'synced';
  return status === 'synced' ? 'synced' : 'pending';
};

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * ViewModel da lista completa de registros.
 *
 *  - Observa de forma reativa todos os registros da empresa via WatermelonDB.
 *  - Aplica busca textual (sobre `descricao` + label do tipo) e filtros por
 *    status (pendente/sincronizado) e tipo (compra/venda) no client. Como o
 *    dataset cabe em memória (registros de uma única empresa), filtrar com
 *    `useMemo` é mais simples e responsivo que recriar a query do Watermelon
 *    a cada keystroke.
 *  - Mantém contadores por status para alimentar os chips de filtro com
 *    badges ("Pendentes (3)").
 */
export const useRegistroListViewModel = (): RegistroListViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthTokenStore(s => s.user);

  const [registros, setRegistros] = useState<RegistroListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('all');

  useEffect(() => {
    if (!user) {
      setRegistros([]);
      setIsLoading(false);
      return;
    }
    const collection = database.get<Registro>('registros');
    const subscription = collection
      .query(Q.where('empresa_id', String(user.empresaId)))
      .observe()
      .subscribe((items: Registro[]) => {
        const mapped: RegistroListItem[] = items
          .map((r: Registro) => ({
            id: r.id,
            tipo: r.tipo,
            dataHora: r.dataHora?.getTime?.() ?? 0,
            descricao: r.descricao,
            isPending: recordStatus(r) === 'pending',
            hasError: false,
          }))
          .sort((a, b) => b.dataHora - a.dataHora);
        setRegistros(mapped);
        setIsLoading(false);
      });
    return () => subscription.unsubscribe();
  }, [user]);

  const counts = useMemo<RegistroListCounts>(() => {
    const pending = registros.filter(r => r.isPending).length;
    return {
      all: registros.length,
      pending,
      synced: registros.length - pending,
    };
  }, [registros]);

  const filtered = useMemo<RegistroListItem[]>(() => {
    const term = normalize(searchTerm.trim());

    return registros.filter(r => {
      if (statusFilter === 'pending' && !r.isPending) return false;
      if (statusFilter === 'synced' && r.isPending) return false;
      if (tipoFilter !== 'all' && r.tipo !== tipoFilter) return false;

      if (term.length === 0) return true;
      const haystack = normalize(
        `${r.descricao} ${r.tipo === 'COMPRA' ? 'compra' : 'venda'}`,
      );
      return haystack.includes(term);
    });
  }, [registros, searchTerm, statusFilter, tipoFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setTipoFilter('all');
  }, []);

  const onRegistroPress = useCallback(
    (id: string) => {
      navigation.navigate(Routes.RegistroDetail, { id });
    },
    [navigation],
  );

  const onAddPress = useCallback(() => {
    navigation.navigate(Routes.RegistroForm);
  }, [navigation]);

  const onBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(Routes.Home);
  }, [navigation]);

  return {
    registros,
    filtered,
    counts,
    searchTerm,
    statusFilter,
    tipoFilter,
    isLoading,
    setSearchTerm,
    setStatusFilter,
    setTipoFilter,
    clearFilters,
    onRegistroPress,
    onAddPress,
    onBackPress,
  };
};
