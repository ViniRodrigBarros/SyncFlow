import { MaterialIcons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconTint?: string;
  accent?: ReactNode;
}

const TINT_DEFAULT = '#0F172A';

export const StatCard = ({
  label,
  value,
  icon,
  iconTint = TINT_DEFAULT,
  accent,
}: StatCardProps) => (
  <View style={styles.card}>
    {accent ? <View style={styles.accentSlot}>{accent}</View> : null}
    <View style={styles.iconCircle}>
      <MaterialIcons name={icon} size={20} color={iconTint} />
    </View>
    <View style={styles.bottom}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    minHeight: 132,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  accentSlot: {
    position: 'absolute',
    top: -28,
    right: -28,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { marginTop: 12 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#45464D',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  value: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
});
