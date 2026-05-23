import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../../core/theme';
import type { RegistroListItem } from '../../hooks/useHomeViewModel';

interface RegistroRowProps {
  item: RegistroListItem;
}

const formatDate = (ms: number): string => {
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const RegistroRow = ({ item }: RegistroRowProps) => {
  const theme = useTheme();
  const tipoColor =
    item.tipo === 'COMPRA' ? theme.colors.primary : theme.colors.secondary;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.tipoBadge,
          {
            backgroundColor: tipoColor + '1A',
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
          },
        ]}
      >
        <Text
          style={[
            styles.tipoText,
            { color: tipoColor, fontSize: theme.typography.size.xs },
          ]}
        >
          {item.tipo}
        </Text>
      </View>
      <Text
        style={[
          styles.descricao,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.size.md,
          },
        ]}
        numberOfLines={2}
      >
        {item.descricao || 'Sem descrição'}
      </Text>
      <View style={[styles.meta, { marginTop: theme.spacing.xs }]}>
        <Text
          style={[
            styles.metaText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.size.xs,
            },
          ]}
        >
          {formatDate(item.dataHora)}
        </Text>
        {item.isPending && (
          <Text
            style={[
              styles.metaText,
              {
                color: theme.colors.warning,
                fontSize: theme.typography.size.xs,
              },
            ]}
          >
            • Pendente
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderColor: 'transparent' },
  tipoBadge: { alignSelf: 'flex-start' },
  tipoText: { fontWeight: '700', letterSpacing: 0.5 },
  descricao: { fontWeight: '500' },
  meta: { flexDirection: 'row', gap: 8 },
  metaText: { fontWeight: '500' },
});
