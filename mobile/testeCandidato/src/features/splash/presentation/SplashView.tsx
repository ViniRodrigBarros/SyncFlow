import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useSplashViewModel } from '../hooks/useSplashViewModel';
import { SplashBrand, SplashSpinner } from './components';

// Splash é sempre dark (momento de marca) — não usa o tema do app.
const BACKGROUND = '#131b2e';
const GLOW_PRIMARY = '#7C3AED';
const GLOW_SECONDARY = '#EADDFF';
const TEXT_MUTED = '#BEC6E0';

export const SplashView = () => {
  const { appName, isLoading, preparingMessage, versionLabel } =
    useSplashViewModel();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Glows ambientes simulando o gradiente do design (sem blur nativo
          em RN, usamos círculos translúcidos sobrepostos). */}
      <View
        pointerEvents="none"
        style={[styles.glow, styles.glowTop, { backgroundColor: GLOW_PRIMARY }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowBottom,
          { backgroundColor: GLOW_SECONDARY },
        ]}
      />

      {/* Cluster centralizado: ícone → título → spinner → subtítulo */}
      <View style={styles.cluster}>
        <SplashBrand appName={appName} />
        {isLoading && (
          <>
            <View style={styles.spinnerWrap}>
              <SplashSpinner />
            </View>
            <Text style={styles.subtitle}>{preparingMessage}</Text>
          </>
        )}
      </View>

      {/* Footer fixo na parte inferior */}
      <View style={styles.footer}>
        <Text style={styles.version}>{versionLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  glowTop: {
    top: -240,
    opacity: 0.18,
  },
  glowBottom: {
    bottom: -260,
    right: -120,
    opacity: 0.08,
  },
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWrap: {
    marginTop: 32,
  },
  subtitle: {
    marginTop: 16,
    color: TEXT_MUTED,
    opacity: 0.8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
    color: TEXT_MUTED,
    opacity: 0.5,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
