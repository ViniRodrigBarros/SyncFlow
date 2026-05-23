import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../core/theme';
import { PrimaryButton } from '../../../core/shared/components';
import { useHomeViewModel, type RegistroListItem } from '../hooks/useHomeViewModel';
import { RegistroRow, SyncBadge } from './components';

export const HomeView = () => {
  const theme = useTheme();
  const vm = useHomeViewModel();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
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
                  fontSize: theme.typography.size.sm,
                  marginTop: 2,
                },
              ]}
            >
              {vm.empresaName ?? 'Sem empresa vinculada'}
            </Text>
          </View>
          <Pressable
            onPress={vm.signOut}
            hitSlop={8}
            style={({ pressed }) => [
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text
              style={[
                styles.linkButton,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.size.sm,
                },
              ]}
            >
              Sair
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: theme.spacing.md }}>
          <Pressable onPress={vm.syncNow} hitSlop={6}>
            <SyncBadge status={vm.syncStatus} isOnline={vm.isOnline} />
          </Pressable>
        </View>

        {!vm.isOnline && (
          <View
            style={[
              styles.offlineBanner,
              {
                backgroundColor: theme.colors.textPrimary,
                borderRadius: theme.radius.sm,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.background,
                fontSize: theme.typography.size.xs,
                fontWeight: '500',
              }}
            >
              Você está offline. Os dados serão enviados automaticamente quando
              a conexão voltar.
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={vm.registros}
        keyExtractor={(item: RegistroListItem) => item.id}
        renderItem={({ item }) => <RegistroRow item={item} />}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl,
        }}
        ListEmptyComponent={
          <View style={[styles.empty, { marginTop: theme.spacing.xxxl }]}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.size.lg,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Nenhum registro ainda
            </Text>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.size.sm,
                textAlign: 'center',
                marginTop: theme.spacing.xs,
              }}
            >
              A próxima sincronização puxará os dados da sua empresa.
            </Text>
          </View>
        }
      />

      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
        }}
      >
        <PrimaryButton
          label="Sincronizar agora"
          onPress={vm.syncNow}
          loading={vm.syncStatus === 'syncing'}
          disabled={!vm.isOnline}
        />
        {vm.syncErrorMessage ? (
          <Text
            style={{
              color: theme.colors.danger,
              fontSize: theme.typography.size.xs,
              marginTop: theme.spacing.xs,
              textAlign: 'center',
            }}
          >
            {vm.syncErrorMessage}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {},
  headerTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  greeting: { fontWeight: '700' },
  empresa: { fontWeight: '500' },
  linkButton: { fontWeight: '600' },
  offlineBanner: {},
  empty: { alignItems: 'center', paddingHorizontal: 32 },
});
