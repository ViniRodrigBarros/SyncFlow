import { MaterialIcons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface HeaderBarProps {
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  /** Texto opcional ao lado do botão voltar (ex.: "Cancelar"). */
  backLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const COLORS = {
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
};

/**
 * Header contextual (sub-página). Botão "voltar" à esquerda, título centralizado
 * e slot livre à direita para badge/ações. Segue o padrão do design SyncFlow
 * para telas task-focused (form, detail) — sem TopAppBar de destinos.
 */
export const HeaderBar = ({
  title,
  onBack,
  rightSlot,
  backLabel,
  style,
}: HeaderBarProps) => {
  return (
    <View style={[styles.bar, style]}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={COLORS.textSecondary}
            />
            {backLabel ? (
              <Text style={styles.backLabel}>{backLabel}</Text>
            ) : null}
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>{rightSlot ?? null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flex: 1, alignItems: 'flex-start' },
  right: { flex: 1, alignItems: 'flex-end' },
  backPlaceholder: { width: 32, height: 32 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 6,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  title: {
    flex: 2,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
