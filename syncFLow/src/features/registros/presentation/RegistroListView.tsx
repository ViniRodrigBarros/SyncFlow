import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegistroRow } from '../../home/presentation/components/RegistroRow';
import type { RegistroListItem } from '../../home/hooks/useHomeViewModel';
import { useRegistroListViewModel } from '../hooks/useRegistroListViewModel';
import { FilterChips, SearchBar } from './components';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  iconMuted: '#94A3B8',
  brand: '#712AE2',
};

const keyExtractor = (item: RegistroListItem): string => item.id;

const ItemSeparator = () => <View style={styles.separator} />;

export const RegistroListView = () => {
  const vm = useRegistroListViewModel();

  const renderItem: ListRenderItem<RegistroListItem> = ({ item, index }) => (
    <RegistroRow
      item={item}
      isLast={index === vm.filtered.length - 1}
      onPress={vm.onRegistroPress}
    />
  );

  const hasActiveFilter =
    vm.searchTerm.length > 0 ||
    vm.statusFilter !== 'all' ||
    vm.tipoFilter !== 'all';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={vm.onBackPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <MaterialIcons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Todos os Registros</Text>
          <Text style={styles.headerSubtitle}>
            {vm.filtered.length}{' '}
            {vm.filtered.length === 1 ? 'resultado' : 'resultados'}
          </Text>
        </View>
        {hasActiveFilter ? (
          <Pressable
            onPress={vm.clearFilters}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Limpar filtros"
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.clearButtonText}>Limpar</Text>
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={vm.searchTerm}
          onChangeText={vm.setSearchTerm}
          placeholder="Buscar por descrição, compra, venda…"
        />
      </View>

      {/* Filter chips */}
      <FilterChips
        status={vm.statusFilter}
        tipo={vm.tipoFilter}
        counts={vm.counts}
        onChangeStatus={vm.setStatusFilter}
        onChangeTipo={vm.setTipoFilter}
      />

      {/* List */}
      {vm.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.brand} />
        </View>
      ) : (
        <FlatList
          data={vm.filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            vm.filtered.length === 0 ? styles.listContentEmpty : null,
          ]}
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconBg}>
                <MaterialIcons
                  name={hasActiveFilter ? 'filter-list-off' : 'folder-open'}
                  size={24}
                  color={COLORS.iconMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {hasActiveFilter
                  ? 'Nenhum registro encontrado'
                  : 'Nenhum registro ainda'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {hasActiveFilter
                  ? 'Ajuste a busca ou os filtros para ver mais resultados.'
                  : 'Toque no botão + para criar o primeiro registro.'}
              </Text>
              {hasActiveFilter ? (
                <Pressable
                  onPress={vm.clearFilters}
                  style={({ pressed }) => [
                    styles.emptyAction,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.emptyActionText}>Limpar filtros</Text>
                </Pressable>
              ) : null}
            </View>
          }
          ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={vm.onAddPress}
        accessibilityRole="button"
        accessibilityLabel="Novo registro"
        style={({ pressed }) => [
          styles.fab,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listHeaderSpacer: { height: 4 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  empty: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 36,
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
    fontWeight: '700',
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
  emptyAction: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.brand,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
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
