import { MaterialIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../../../core/shared/components';
import { useHomeViewModel } from '../hooks/useHomeViewModel';
import {
  OfflineState,
  RegistroRow,
  StatCard,
  SyncBadge,
} from './components';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  iconMuted: '#94A3B8',
  brand: '#712AE2',
  brandDark: '#5B21B6',
  danger: '#BA1A1A',
  success: '#009668',
};

const FIRST_NAME = (full: string | null): string => {
  if (!full) return 'usuário';
  return full.trim().split(' ')[0] ?? full;
};

const initial = (name: string | null): string => {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase() || 'U';
};

export const HomeView = () => {
  const vm = useHomeViewModel();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top app bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <MaterialIcons
            name={vm.isOnline ? 'cloud-done' : 'cloud-off'}
            size={22}
            color={COLORS.brand}
          />
          <Text style={styles.appBarBrandText}>SyncFlow</Text>
        </View>
        <View style={styles.appBarRight}>
          {!vm.showOffline ? (
            <SyncBadge status={vm.syncStatus} isOnline={vm.isOnline} />
          ) : null}
          <Pressable
            onPress={vm.onProfilePress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            style={({ pressed }) => [
              styles.avatar,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.avatarText}>{initial(vm.userName)}</Text>
          </Pressable>
        </View>
      </View>

      {vm.showOffline ? (
        <>
          {/* Banner discreto offline */}
          <View style={styles.offlineStripe}>
            <MaterialIcons name="wifi-off" size={16} color={COLORS.textSecondary} />
            <Text style={styles.offlineStripeText}>
              Você está offline. Seus dados serão enviados automaticamente.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.offlineScroll}
            showsVerticalScrollIndicator={false}
          >
            <OfflineState
              pendingCount={vm.stats.pendentes}
              onRetry={vm.onRetryConnection}
              onViewLocal={vm.onViewLocal}
              isRetrying={vm.isRetrying}
            />
          </ScrollView>
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.hello} numberOfLines={1}>
              Olá, {FIRST_NAME(vm.userName)}!
            </Text>
            <Text style={styles.greetingSubtitle}>{vm.greetingSubtitle}</Text>
            {vm.empresaName ? (
              <Text style={styles.empresa}>{vm.empresaName}</Text>
            ) : null}
          </View>

          {!vm.isOnline ? (
            <View style={styles.offlineBanner}>
              <MaterialIcons name="cloud-off" size={16} color="#F1F5F9" />
              <Text style={styles.offlineText}>
                Você está offline. Os dados serão enviados automaticamente.
              </Text>
            </View>
          ) : null}

          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <StatCard
                label="Compras"
                value={vm.stats.compras}
                icon="shopping-cart"
              />
              <View style={styles.gridGap} />
              <StatCard
                label="Vendas"
                value={vm.stats.vendas}
                icon="point-of-sale"
              />
            </View>
            <View style={styles.gridRowGap} />
            <View style={styles.gridRow}>
              <StatCard
                label="Pendentes"
                value={vm.stats.pendentes}
                icon="pending-actions"
                iconTint={vm.stats.pendentes > 0 ? COLORS.danger : COLORS.textPrimary}
                accent={
                  vm.stats.pendentes > 0 ? (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 218, 214, 0.4)',
                      }}
                    />
                  ) : undefined
                }
              />
              <View style={styles.gridGap} />
              <StatCard
                label="Sincronizados"
                value={vm.stats.sincronizados}
                icon="cloud-done"
                iconTint={COLORS.success}
                accent={
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(111, 251, 190, 0.18)',
                    }}
                  />
                }
              />
            </View>
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Registros Recentes</Text>
            <Pressable
              onPress={vm.onSeeAllPress}
              hitSlop={6}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <View style={styles.seeAll}>
                <Text style={styles.seeAllText}>Ver todos</Text>
                <MaterialIcons name="arrow-forward" size={16} color={COLORS.brand} />
              </View>
            </Pressable>
          </View>

          {vm.registros.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconBg}>
                <MaterialIcons
                  name="folder-open"
                  size={24}
                  color={COLORS.iconMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
              <Text style={styles.emptySubtitle}>
                {vm.isOnline
                  ? 'A próxima sincronização puxará os dados da sua empresa.'
                  : 'Conecte-se à internet para receber os registros da empresa.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {vm.registros.slice(0, 8).map((item, idx, arr) => (
                <RegistroRow
                  key={item.id}
                  item={item}
                  isLast={idx === arr.length - 1}
                  onPress={vm.onRegistroPress}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {!vm.showOffline ? (
        <Pressable
          onPress={vm.onAddPress}
          style={({ pressed }) => [
            styles.fab,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      ) : null}

      <BottomTabBar active="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appBarBrandText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brand,
    borderWidth: 1,
    borderColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  offlineStripe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F2F4F6',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  offlineStripeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  offlineScroll: {
    paddingTop: 16,
    paddingBottom: 140,
  },
  greeting: { marginBottom: 24 },
  hello: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  greetingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  empresa: {
    fontSize: 12,
    color: COLORS.iconMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  offlineText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  grid: { marginBottom: 28 },
  gridRow: { flexDirection: 'row' },
  gridGap: { width: 12 },
  gridRowGap: { height: 12 },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand,
  },
  list: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  empty: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
