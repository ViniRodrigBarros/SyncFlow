import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../core/theme';
import { useHomeViewModel } from '../hooks/useHomeViewModel';

/**
 * Stub temporário da tela pós-login. Será substituída pela lista de registros
 * (feature `registros`) na próxima etapa.
 */
export const HomeView = () => {
  const theme = useTheme();
  const vm = useHomeViewModel();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.greeting,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.size.xxl,
            },
          ]}
        >
          Olá, {vm.userName ?? 'visitante'}
        </Text>
        <Text
          style={[
            styles.empresa,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.size.md,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {vm.empresaName ?? 'Sem empresa vinculada'}
        </Text>
        <Text
          style={[
            styles.note,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.size.sm,
              marginTop: theme.spacing.xl,
            },
          ]}
        >
          A lista de registros e o fluxo de sincronização serão habilitados nas
          próximas etapas.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  greeting: { fontWeight: '700' },
  empresa: { fontWeight: '500' },
  note: { lineHeight: 20 },
});
