import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../../../core/shared/components';
import { useProfileViewModel } from '../hooks/useProfileViewModel';
import {
  LanguagePickerSheet,
  SectionCard,
  SectionRow,
  SyncStatusChip,
  Toggle,
} from './components';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  outline: '#76777D',
  brand: '#712AE2',
  brandHover: '#5B21B6',
  danger: '#BA1A1A',
  dangerSoft: '#FFDAD6',
};

export const ProfileView = () => {
  const vm = useProfileViewModel();
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top app bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <MaterialIcons name="cloud-done" size={22} color={COLORS.brand} />
          <Text style={styles.appBarBrandText}>SyncFlow</Text>
        </View>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{vm.userInitial}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <SectionCard style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{vm.userInitial}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                {vm.userName}
              </Text>
              <Text style={styles.headerRole}>{vm.role}</Text>
              <View style={styles.headerEmpresa}>
                <MaterialIcons name="domain" size={14} color={COLORS.outline} />
                <Text style={styles.headerEmpresaText} numberOfLines={1}>
                  {vm.empresaName}
                </Text>
              </View>
              {vm.loginEmail ? (
                <Text style={styles.headerLogin} numberOfLines={1}>
                  @{vm.loginEmail}
                </Text>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={vm.onEditProfile}
            style={({ pressed }) => [
              styles.editButton,
              { backgroundColor: pressed ? '#F2F4F6' : COLORS.surface },
            ]}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </SectionCard>

        {/* Preferences */}
       

        {/* Data Synchronization */}
        <SectionCard style={styles.sectionGap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Data Synchronization</Text>
            <SyncStatusChip status={vm.syncStatus} isOnline={vm.isOnline} />
          </View>
          <View style={styles.sectionDivider} />
          <SectionRow
            icon="autorenew"
            title="Auto-Sync"
            subtitle="Keep offline data updated"
            right={
              <Toggle
                value={vm.autoSync}
                onValueChange={vm.onToggleAutoSync}
                accessibilityLabel="Alternar auto-sync"
              />
            }
          />
          <View style={styles.sectionDivider} />
          <View style={styles.lastSyncRow}>
            <Text style={styles.lastSyncLabel}>Last synced</Text>
            <Text style={styles.lastSyncValue}>{vm.lastSyncedLabel}</Text>
          </View>
          <Pressable
            onPress={vm.isSyncing ? undefined : vm.onSyncNow}
            style={({ pressed }) => [
              styles.syncButton,
              {
                opacity: vm.isSyncing ? 0.6 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed && !vm.isSyncing ? 0.98 : 1 }],
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ busy: vm.isSyncing }}
          >
            {vm.isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="sync" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.syncButtonText}>
              {vm.isSyncing ? 'Sincronizando…' : 'Sincronizar agora'}
            </Text>
          </Pressable>
        </SectionCard>

        {/* Account Actions */}
        <SectionCard style={[styles.sectionGap, styles.dangerCard]}>
          <View style={styles.dangerRow}>
            <View style={styles.dangerText}>
              <Text style={styles.dangerTitle}>Account Actions</Text>
              <Text style={styles.dangerSubtitle}>Sign out of this device</Text>
            </View>
            <Pressable
              onPress={vm.onLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                { backgroundColor: pressed ? COLORS.dangerSoft : COLORS.surface },
              ]}
              accessibilityRole="button"
            >
              <MaterialIcons name="logout" size={18} color={COLORS.danger} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
        </SectionCard>
      </ScrollView>

      <BottomTabBar active="profile" />
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
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 140,
  },
  headerCard: {
    padding: 20,
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.brand,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerInfo: { flex: 1, gap: 4 },
  headerName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  headerEmpresa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  headerEmpresaText: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
    flexShrink: 1,
  },
  headerLogin: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
  },
  editButton: {
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  sectionGap: { marginTop: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  languagePillText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  lastSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 12,
  },
  lastSyncLabel: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  lastSyncValue: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: COLORS.brand,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dangerCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    paddingLeft: 16,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dangerText: { flex: 1, gap: 4 },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
