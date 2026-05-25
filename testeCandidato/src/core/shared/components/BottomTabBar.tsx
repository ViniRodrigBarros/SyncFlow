import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Routes } from '../../navigation/routes';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStateStore } from '../services';

export type BottomTab = 'home' | 'search' | 'profile';

interface BottomTabBarProps {
  active: BottomTab;
}

interface TabConfig {
  key: BottomTab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const TABS: ReadonlyArray<TabConfig> = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'search', label: 'Search', icon: 'search' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

const COLORS = {
  surface: '#FFFFFF',
  border: '#E2E8F0',
  inactive: '#45464D',
  active: '#712AE2',
};

/**
 * Bottom navigation com 3 abas (Home, Search, Profile).
 *
 *  - Cada aba navega via Stack `navigate()`. Por ser native-stack, voltar para
 *    uma tela já no stack faz pop; abrir nova empilha. Bom o bastante para um
 *    fluxo de 2 abas reais (Home/Profile).
 *  - "Search" ainda não existe — exibimos um toast informativo.
 *  - Respeita o safe-area inset inferior (Android com gesture bar / iPhone).
 */
export const BottomTabBar = ({ active }: BottomTabBarProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const onPressTab = useCallback(
    (tab: BottomTab) => {
      if (tab === active) return;
      if (tab === 'home') {
        navigation.navigate(Routes.Home);
        return;
      }
      if (tab === 'profile') {
        navigation.navigate(Routes.Profile);
        return;
      }
      useAppStateStore
        .getState()
        .showToast('Em breve: busca de registros.', 'info');
    },
    [active, navigation],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {TABS.map(tab => {
        const isActive = tab.key === active;
        const tint = isActive ? COLORS.active : COLORS.inactive;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onPressTab(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={8}
          >
            <MaterialIcons name={tab.icon} size={24} color={tint} />
            <Text
              style={[
                styles.label,
                { color: tint, fontWeight: isActive ? '700' : '500' },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});
