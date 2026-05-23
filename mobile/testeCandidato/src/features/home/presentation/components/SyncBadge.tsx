import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { SyncStatus } from '../../../sync';

interface SyncBadgeProps {
  status: SyncStatus;
  isOnline: boolean;
}

interface BadgeConfig {
  label: string;
  bg: string;
  fg: string;
  border: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  spin?: boolean;
}

const CONFIGS: Record<string, BadgeConfig> = {
  syncing: {
    label: 'Sincronizando',
    bg: 'rgba(124, 58, 237, 0.08)',
    fg: '#5B21B6',
    border: 'rgba(124, 58, 237, 0.20)',
    icon: 'sync',
    spin: true,
  },
  success: {
    label: 'Sincronizado',
    bg: 'rgba(0, 150, 104, 0.10)',
    fg: '#009668',
    border: 'rgba(0, 150, 104, 0.25)',
    icon: 'cloud-done',
  },
  error: {
    label: 'Erro de sync',
    bg: 'rgba(186, 26, 26, 0.08)',
    fg: '#BA1A1A',
    border: 'rgba(186, 26, 26, 0.25)',
    icon: 'cloud-off',
  },
  offline: {
    label: 'Offline',
    bg: 'rgba(100, 116, 139, 0.10)',
    fg: '#64748B',
    border: 'rgba(100, 116, 139, 0.25)',
    icon: 'cloud-off',
  },
  unauthorized: {
    label: 'Sessão expirada',
    bg: 'rgba(186, 26, 26, 0.08)',
    fg: '#BA1A1A',
    border: 'rgba(186, 26, 26, 0.25)',
    icon: 'error-outline',
  },
  idle: {
    label: 'Pronto',
    bg: 'rgba(100, 116, 139, 0.10)',
    fg: '#64748B',
    border: 'rgba(100, 116, 139, 0.25)',
    icon: 'cloud-queue',
  },
};

export const SyncBadge = ({ status, isOnline }: SyncBadgeProps) => {
  const cfg = !isOnline ? CONFIGS.offline : (CONFIGS[status] ?? CONFIGS.idle);

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
      ]}
    >
      <MaterialIcons name={cfg.icon} size={14} color={cfg.fg} />
      <Text style={[styles.label, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 0.2 },
});
