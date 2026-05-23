import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { useAppStateStore } from '../services/AppStateStore';

const DURATION_MS = 3000;

/**
 * Toast global e discreto, conforme spec do produto:
 *  - Aparece no rodapé com fade + slide-up
 *  - Some sozinho em ~3s
 *  - Lê do AppStateStore, então qualquer parte do app pode disparar
 *    `useAppStateStore.getState().showToast(...)`.
 */
export const Toast = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useAppStateStore(s => s.toast);
  const dismiss = useAppStateStore(s => s.dismissToast);

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 40,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => dismiss());
    }, DURATION_MS);

    return () => clearTimeout(timer);
  }, [toast, dismiss, translateY, opacity]);

  if (!toast) return null;

  const iconName: keyof typeof MaterialIcons.glyphMap =
    toast.kind === 'success'
      ? 'cloud-done'
      : toast.kind === 'error'
        ? 'error-outline'
        : 'info-outline';

  const iconColor =
    toast.kind === 'success'
      ? theme.colors.success
      : toast.kind === 'error'
        ? theme.colors.danger
        : '#BEC6E0';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + 24,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.bubble}>
        <MaterialIcons name={iconName} size={20} color={iconColor} />
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2D3133',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    maxWidth: '90%',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
