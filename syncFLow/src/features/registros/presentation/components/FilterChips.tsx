import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type {
  StatusFilter,
  TipoFilter,
} from '../../hooks/useRegistroListViewModel';

interface FilterChipsProps {
  status: StatusFilter;
  tipo: TipoFilter;
  counts: { all: number; pending: number; synced: number };
  onChangeStatus: (status: StatusFilter) => void;
  onChangeTipo: (tipo: TipoFilter) => void;
}

const COLORS = {
  surface: '#FFFFFF',
  surfaceActive: '#712AE2',
  border: '#E2E8F0',
  borderActive: '#712AE2',
  textInactive: '#45464D',
  textActive: '#FFFFFF',
  countBg: '#F2F4F6',
  countBgActive: 'rgba(255, 255, 255, 0.22)',
  countText: '#45464D',
  countTextActive: '#FFFFFF',
};

interface ChipProps {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}

const Chip = ({ label, active, count, onPress }: ChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    style={({ pressed }) => [
      styles.chip,
      {
        backgroundColor: active ? COLORS.surfaceActive : COLORS.surface,
        borderColor: active ? COLORS.borderActive : COLORS.border,
        opacity: pressed ? 0.85 : 1,
      },
    ]}
  >
    <Text
      style={[
        styles.chipLabel,
        { color: active ? COLORS.textActive : COLORS.textInactive },
      ]}
    >
      {label}
    </Text>
    {typeof count === 'number' ? (
      <View
        style={[
          styles.countPill,
          { backgroundColor: active ? COLORS.countBgActive : COLORS.countBg },
        ]}
      >
        <Text
          style={[
            styles.countText,
            { color: active ? COLORS.countTextActive : COLORS.countText },
          ]}
        >
          {count}
        </Text>
      </View>
    ) : null}
  </Pressable>
);

/**
 * Faixa horizontal de chips com dois grupos: status (Todos/Pendentes/Sincronizados)
 * e tipo (Todos/Compras/Vendas). Os contadores aparecem só no grupo de status —
 * é onde o usuário mais quer ver "quanto falta sincronizar".
 */
export const FilterChips = ({
  status,
  tipo,
  counts,
  onChangeStatus,
  onChangeTipo,
}: FilterChipsProps) => (
  <View style={styles.wrapper}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip
        label="Todos"
        active={status === 'all'}
        count={counts.all}
        onPress={() => onChangeStatus('all')}
      />
      <Chip
        label="Pendentes"
        active={status === 'pending'}
        count={counts.pending}
        onPress={() => onChangeStatus('pending')}
      />
      <Chip
        label="Sincronizados"
        active={status === 'synced'}
        count={counts.synced}
        onPress={() => onChangeStatus('synced')}
      />
    </ScrollView>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, styles.rowSecond]}
    >
      <Chip
        label="Todos os tipos"
        active={tipo === 'all'}
        onPress={() => onChangeTipo('all')}
      />
      <Chip
        label="Compras"
        active={tipo === 'COMPRA'}
        onPress={() => onChangeTipo('COMPRA')}
      />
      <Chip
        label="Vendas"
        active={tipo === 'VENDA'}
        onPress={() => onChangeTipo('VENDA')}
      />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  rowSecond: { paddingTop: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  countPill: {
    minWidth: 22,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});
