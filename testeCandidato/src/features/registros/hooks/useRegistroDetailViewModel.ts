import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import {
  registrosRepository,
  type RegistroEntity,
} from '../../../core/shared/repositories/registros';
import { useAppStateStore } from '../../../core/shared/services';
import { logger } from '../../../core/utils/logger';
import { useSyncEngine } from '../../sync';

export interface RegistroDetailViewModel {
  loading: boolean;
  removing: boolean;
  registro: RegistroEntity | null;
  loadError: string | null;
  onBack: () => void;
  onEdit: () => void;
  onDeleteRequested: () => void;
  onDeleteConfirmed: () => Promise<void>;
}

/**
 * Carrega o registro localmente; observa mudanças? Por simplicidade,
 * fazemos refetch quando a tela ganha foco — assim, sair do form de
 * edição e voltar para o detalhe traz os dados atualizados.
 */
export const useRegistroDetailViewModel = (): RegistroDetailViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegistroDetail'>>();
  const id = route.params?.id;
  const sync = useSyncEngine({ autoOnMount: false });

  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [registro, setRegistro] = useState<RegistroEntity | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoadError('Registro inválido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const found = await registrosRepository.findById(id);
      if (!found) {
        setLoadError('Registro não encontrado neste dispositivo.');
      } else {
        setRegistro(found);
        setLoadError(null);
      }
    } catch (error) {
      logger.error('Falha ao carregar detalhe do registro', error);
      setLoadError('Falha ao carregar registro.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    const unsub = navigation.addListener('focus', () => {
      void load();
    });
    return unsub;
  }, [navigation, load]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onEdit = useCallback(() => {
    if (!id) return;
    navigation.navigate(Routes.RegistroForm, { id });
  }, [navigation, id]);

  const onDeleteRequested = useCallback(() => {
    // intencionalmente vazio: o View dispara o Alert; o ViewModel só decide
    // o que acontece no `onDeleteConfirmed` quando o usuário confirma.
  }, []);

  const onDeleteConfirmed = useCallback(async () => {
    if (!id) return;
    setRemoving(true);
    try {
      await registrosRepository.remove(id);
      useAppStateStore
        .getState()
        .showToast('Registro removido', 'info');
      void sync.syncNow();
      navigation.goBack();
    } catch (error) {
      logger.error('Falha ao remover registro', error);
      setLoadError(
        error instanceof Error ? error.message : 'Falha ao remover registro.',
      );
    } finally {
      setRemoving(false);
    }
  }, [id, navigation, sync]);

  return {
    loading,
    removing,
    registro,
    loadError,
    onBack,
    onEdit,
    onDeleteRequested,
    onDeleteConfirmed,
  };
};
