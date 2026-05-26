import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SectionRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
}

const COLORS = {
  outline: '#76777D',
  textPrimary: '#0F172A',
  textSecondary: '#76777D',
  divider: '#E0E3E5',
};

export const SectionRow = ({
  icon,
  title,
  subtitle,
  right,
  onPress,
  showDivider,
}: SectionRowProps) => {
  const content = (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={22} color={COLORS.outline} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );

  return (
    <View>
      {showDivider ? <View style={styles.divider} /> : null}
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  text: { flex: 1, gap: 2 },
  title: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  right: { marginLeft: 8 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
  },
});
