import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import {
  registrosRepository,
  type NewFotoInput,
  type RegistroEntity,
  type TipoRegistro,
} from '../../../core/shared/repositories/registros';
import { useAppStateStore } from '../../../core/shared/services';
import { logger } from '../../../core/utils/logger';
import { useSyncEngine } from '../../sync';
import type { PickerFotoItem } from '../presentation/components';

export interface RegistroFormState {
  tipo: TipoRegistro;
  dataHora: number;
  descricao: string;
}

export interface RegistroFormViewModel {
  isEditMode: boolean;
  title: string;
  loading: boolean;
  saving: boolean;
  removing: boolean;
  loadError: string | null;
  formError: string | null;
  state: RegistroFormState;
  pickerFotos: PickerFotoItem[];
  setTipo: (tipo: TipoRegistro) => void;
  setDataHora: (dataHora: number) => void;
  setDescricao: (descricao: string) => void;
  addFotos: (fotos: NewFotoInput[]) => void;
  removeFoto: (id: string) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  onDelete: () => Promise<void>;
}

const MIN_DESCRICAO = 10;

const buildDefaultState = (): RegistroFormState => ({
  tipo: 'COMPRA',
  dataHora: Date.now(),
  descricao: '',
});

const toPickerItem = (
  foto: RegistroEntity['fotos'][number],
): PickerFotoItem => ({
  id: foto.id,
  uri: foto.localUri ?? foto.caminho,
  isLocalOnly: foto.isLocalOnly,
});

/**
 * Cobre Novo e Editar com o mesmo form.
 *
 *  - `Routes.RegistroForm` sem param → modo novo, dataHora = agora.
 *  - `Routes.RegistroForm` com `{ id }` → carrega registro do banco local,
 *    pré-popula estado e habilita "Excluir".
 *
 * Edições em fotos são acumuladas em duas listas auxiliares (novas a
 * adicionar e ids a remover), aplicadas atomicamente no submit.
 */
export const useRegistroFormViewModel = (): RegistroFormViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegistroForm'>>();
  const editingId = route.params?.id;
  const isEditMode = Boolean(editingId);
  const sync = useSyncEngine({ autoOnMount: false });

  const [state, setState] = useState<RegistroFormState>(buildDefaultState);
  const [existingFotos, setExistingFotos] = useState<PickerFotoItem[]>([]);
  const [newFotos, setNewFotos] = useState<
    Array<NewFotoInput & { tempId: string }>
  >([]);
  const [removedFotoIds, setRemovedFotoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const existing = await registrosRepository.findById(editingId);
        if (cancelled) return;
        if (!existing) {
          setLoadError('Registro não encontrado neste dispositivo.');
          return;
        }
        setState({
          tipo: existing.tipo,
          dataHora: existing.dataHora,
          descricao: existing.descricao,
        });
        setExistingFotos(existing.fotos.map(toPickerItem));
        setLoadError(null);
      } catch (error) {
        logger.error('Falha ao carregar registro para edição', error);
        if (!cancelled) setLoadError('Falha ao carregar registro.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editingId]);

  const pickerFotos = useMemo<PickerFotoItem[]>(() => {
    const visibleExisting = existingFotos.filter(
      f => !removedFotoIds.includes(f.id),
    );
    const newOnes: PickerFotoItem[] = newFotos.map(f => ({
      id: f.tempId,
      uri: f.localUri,
      isLocalOnly: true,
    }));
    return [...visibleExisting, ...newOnes];
  }, [existingFotos, removedFotoIds, newFotos]);

  const setTipo = useCallback((tipo: TipoRegistro) => {
    setState(prev => ({ ...prev, tipo }));
  }, []);

  const setDataHora = useCallback((dataHora: number) => {
    setState(prev => ({ ...prev, dataHora }));
  }, []);

  const setDescricao = useCallback((descricao: string) => {
    setState(prev => ({ ...prev, descricao }));
  }, []);

  const addFotos = useCallback((fotos: NewFotoInput[]) => {
    setNewFotos(prev => [
      ...prev,
      ...fotos.map(f => ({
        ...f,
        tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      })),
    ]);
  }, []);

  const removeFoto = useCallback(
    (id: string) => {
      if (id.startsWith('new-')) {
        setNewFotos(prev => prev.filter(f => f.tempId !== id));
        return;
      }
      setRemovedFotoIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    },
    [],
  );

  const validate = (): string | null => {
    if (!state.descricao || state.descricao.trim().length < MIN_DESCRICAO) {
      return `Descrição deve ter no mínimo ${MIN_DESCRICAO} caracteres.`;
    }
    if (!state.dataHora || Number.isNaN(state.dataHora)) {
      return 'Selecione uma data e hora válidas.';
    }
    return null;
  };

  const onSubmit = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      if (isEditMode && editingId) {
        await registrosRepository.update({
          id: editingId,
          tipo: state.tipo,
          dataHora: state.dataHora,
          descricao: state.descricao.trim(),
          fotosToAdd: newFotos.map(({ tempId: _t, ...rest }) => rest),
          fotosToRemove: removedFotoIds,
        });
        useAppStateStore
          .getState()
          .showToast('Alterações salvas localmente', 'success');
      } else {
        await registrosRepository.create({
          tipo: state.tipo,
          dataHora: state.dataHora,
          descricao: state.descricao.trim(),
          fotos: newFotos.map(({ tempId: _t, ...rest }) => rest),
        });
        useAppStateStore
          .getState()
          .showToast('Salvo localmente', 'success');
      }
      void sync.syncNow();
      navigation.goBack();
    } catch (error) {
      logger.error('Falha ao salvar registro', error);
      setFormError(
        error instanceof Error ? error.message : 'Falha ao salvar registro.',
      );
    } finally {
      setSaving(false);
    }
  }, [
    isEditMode,
    editingId,
    state,
    newFotos,
    removedFotoIds,
    navigation,
    sync,
  ]);

  const onDelete = useCallback(async () => {
    if (!editingId) return;
    setRemoving(true);
    try {
      await registrosRepository.remove(editingId);
      useAppStateStore
        .getState()
        .showToast('Registro removido', 'info');
      void sync.syncNow();
      navigation.goBack();
    } catch (error) {
      logger.error('Falha ao remover registro', error);
      setFormError(
        error instanceof Error ? error.message : 'Falha ao remover registro.',
      );
    } finally {
      setRemoving(false);
    }
  }, [editingId, navigation, sync]);

  const onCancel = useCallback(() => navigation.goBack(), [navigation]);

  return {
    isEditMode,
    title: isEditMode ? 'Editar Registro' : 'Novo Registro',
    loading,
    saving,
    removing,
    loadError,
    formError,
    state,
    pickerFotos,
    setTipo,
    setDataHora,
    setDescricao,
    addFotos,
    removeFoto,
    onCancel,
    onSubmit,
    onDelete,
  };
};
