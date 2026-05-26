import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { SyncStatus } from '../../../sync';

interface SyncStatusChipProps {
  status: SyncStatus;
  isOnline: boolean;
}

interface ChipConfig {
  label: string;
  dot: string;
  fg: string;
  bg: string;
  spinner?: boolean;
}

const CONFIGS: Record<string, ChipConfig> = {
  syncing: {
    label: 'Sincronizando',
    dot: '#712AE2',
    fg: '#5B21B6',
    bg: 'rgba(124, 58, 237, 0.08)',
    spinner: true,
  },
  success: {
    label: 'Synced',
    dot: '#4EDEA3',
    fg: '#009668',
    bg: 'rgba(78, 222, 163, 0.12)',
  },
  idle: {
    label: 'Pronto',
    dot: '#94A3B8',
    fg: '#45464D',
    bg: '#E6E8EA',
  },
  offline: {
    label: 'Offline',
    dot: '#94A3B8',
    fg: '#45464D',
    bg: '#E6E8EA',
  },
  error: {
    label: 'Erro',
    dot: '#BA1A1A',
    fg: '#BA1A1A',
    bg: 'rgba(186, 26, 26, 0.10)',
  },
  unauthorized: {
    label: 'Sessão expirada',
    dot: '#BA1A1A',
    fg: '#BA1A1A',
    bg: 'rgba(186, 26, 26, 0.10)',
  },
};

export const SyncStatusChip = ({ status, isOnline }: SyncStatusChipProps) => {
  const cfg = !isOnline ? CONFIGS.offline : CONFIGS[status] ?? CONFIGS.idle;
  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      {cfg.spinner ? (
        <ActivityIndicator size="small" color={cfg.fg} />
      ) : (
        <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      )}
      <Text style={[styles.label, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
