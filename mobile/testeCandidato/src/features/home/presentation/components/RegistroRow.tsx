import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RegistroListItem } from '../../hooks/useHomeViewModel';

interface RegistroRowProps {
  item: RegistroListItem;
  isLast?: boolean;
  onPress?: (id: string) => void;
}

const formatDateRelative = (ms: number): string => {
  if (!ms) return '—';
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  if (sameDay) return `Hoje, ${hh}:${mm}`;
  if (isYesterday) return `Ontem, ${hh}:${mm}`;

  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  return `${d.getDate()} ${months[d.getMonth()]}, ${hh}:${mm}`;
};

interface StatusBadge {
  label: string;
  fg: string;
  bg: string;
  border: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const statusOf = (item: RegistroListItem): StatusBadge => {
  if (item.hasError)
    return {
      label: 'Erro',
      fg: '#BA1A1A',
      bg: 'rgba(186, 26, 26, 0.08)',
      border: 'rgba(186, 26, 26, 0.20)',
      icon: 'error-outline',
    };
  if (item.isPending)
    return {
      label: 'Pendente',
      fg: '#93000A',
      bg: 'rgba(255, 218, 214, 0.5)',
      border: 'rgba(186, 26, 26, 0.15)',
      icon: 'schedule',
    };
  return {
    label: 'Sincronizado',
    fg: '#009668',
    bg: 'rgba(111, 251, 190, 0.10)',
    border: 'rgba(0, 150, 104, 0.20)',
    icon: 'check-circle',
  };
};

export const RegistroRow = ({ item, isLast, onPress }: RegistroRowProps) => {
  const tipoIcon: keyof typeof MaterialIcons.glyphMap =
    item.tipo === 'COMPRA' ? 'shopping-bag' : 'receipt-long';
  const badge = statusOf(item);

  return (
    <Pressable
      onPress={onPress ? () => onPress(item.id) : undefined}
      style={({ pressed }) => [
        styles.row,
        isLast ? styles.rowLast : null,
        pressed && onPress ? styles.rowPressed : null,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={styles.iconCircle}>
        <MaterialIcons name={tipoIcon} size={16} color="#0F172A" />
      </View>
      <View style={styles.body}>
        <Text style={styles.date}>{formatDateRelative(item.dataHora)}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {item.descricao || (item.tipo === 'COMPRA' ? 'Compra' : 'Venda')}
        </Text>
      </View>
      <View
        style={[
          styles.badge,
          { backgroundColor: badge.bg, borderColor: badge.border },
        ]}
      >
        <MaterialIcons name={badge.icon} size={12} color={badge.fg} />
        <Text style={[styles.badgeLabel, { color: badge.fg }]}>
          {badge.label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rowPressed: { backgroundColor: 'rgba(15, 23, 42, 0.03)' },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF1F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  date: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#0F172A',
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    color: '#45464D',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
});
