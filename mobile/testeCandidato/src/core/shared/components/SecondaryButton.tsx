import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ghost button: borda sutil `#0F172A @ 10%`, texto `#0F172A`. Usado para
 * ações secundárias como "Cancelar" e "Voltar", seguindo o design SyncFlow.
 */
export const SecondaryButton = ({
  label,
  onPress,
  loading,
  disabled,
  style,
}: SecondaryButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          opacity: isDisabled ? 0.4 : 1,
          backgroundColor: pressed ? 'rgba(15, 23, 42, 0.04)' : '#FFFFFF',
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#0F172A" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
