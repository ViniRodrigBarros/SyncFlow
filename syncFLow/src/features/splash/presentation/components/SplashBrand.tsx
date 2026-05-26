import { StyleSheet, Text, View } from 'react-native';

interface SplashBrandProps {
  appName: string;
}

// Tokens vindos direto do design no Stitch (não dependem do tema — splash é
// um momento de marca, fundo sempre escuro).
const ACCENT = '#7C3AED';
const ICON_BG = '#0F172A';
const ICON_BORDER = 'rgba(255,255,255,0.04)';
const TITLE = '#FFFFFF';

const ICON_SIZE = 140;
const RING_SIZE = 84;
const RING_BORDER = 8;
const DOT_SIZE = 26;
const TICK_LONG = 14;
const TICK_SHORT = 5;

export const SplashBrand = ({ appName }: SplashBrandProps) => (
  <View style={styles.container}>
    <View style={styles.iconCard}>
      <View style={styles.ringWrap}>
        <View style={styles.ring} />
        <View style={[styles.tick, styles.tickTop]} />
        <View style={[styles.tick, styles.tickRight]} />
        <View style={[styles.tick, styles.tickBottom]} />
        <View style={[styles.tick, styles.tickLeft]} />
        <View style={styles.dot} />
      </View>
    </View>
    <Text style={styles.title}>{appName}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconCard: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 32,
    backgroundColor: ICON_BG,
    borderWidth: 1,
    borderColor: ICON_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_BORDER,
    borderColor: ACCENT,
  },
  tick: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  tickTop: {
    width: TICK_SHORT,
    height: TICK_LONG,
    top: -2,
    left: RING_SIZE / 2 - TICK_SHORT / 2,
  },
  tickBottom: {
    width: TICK_SHORT,
    height: TICK_LONG,
    bottom: -2,
    left: RING_SIZE / 2 - TICK_SHORT / 2,
  },
  tickLeft: {
    width: TICK_LONG,
    height: TICK_SHORT,
    left: -2,
    top: RING_SIZE / 2 - TICK_SHORT / 2,
  },
  tickRight: {
    width: TICK_LONG,
    height: TICK_SHORT,
    right: -2,
    top: RING_SIZE / 2 - TICK_SHORT / 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: ACCENT,
  },
  title: {
    marginTop: 32,
    color: TITLE,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
});
