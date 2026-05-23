import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../../core/theme';
import type { SyncStatus } from '../../../sync';

interface SyncBadgeProps {
  status: SyncStatus;
  isOnline: boolean;
}

interface BadgeConfig {
  label: string;
  bg: string;
  fg: string;
}

export const SyncBadge = ({ status, isOnline }: SyncBadgeProps) => {
  const theme = useTheme();

  const cfg = ((): BadgeConfig => {
    if (!isOnline)
      return {
        label: 'Offline',
        bg: theme.colors.textSecondary + '22',
        fg: theme.colors.textSecondary,
      };
    switch (status) {
      case 'syncing':
        return {
          label: 'Sincronizando…',
          bg: theme.colors.primary + '1F',
          fg: theme.colors.primary,
        };
      case 'success':
        return {
          label: 'Tudo sincronizado',
          bg: theme.colors.success + '1F',
          fg: theme.colors.success,
        };
      case 'error':
        return {
          label: 'Erro de sync',
          bg: theme.colors.danger + '1F',
          fg: theme.colors.danger,
        };
      case 'offline':
        return {
          label: 'Sem conexão',
          bg: theme.colors.warning + '1F',
          fg: theme.colors.warning,
        };
      case 'unauthorized':
        return {
          label: 'Sessão expirada',
          bg: theme.colors.danger + '1F',
          fg: theme.colors.danger,
        };
      default:
        return {
          label: 'Pronto',
          bg: theme.colors.border,
          fg: theme.colors.textSecondary,
        };
    }
  })();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: cfg.bg,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: cfg.fg, marginRight: theme.spacing.xs },
        ]}
      />
      <Text
        style={[
          styles.label,
          { color: cfg.fg, fontSize: theme.typography.size.xs },
        ]}
      >
        {cfg.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontWeight: '600', letterSpacing: 0.3 },
});
