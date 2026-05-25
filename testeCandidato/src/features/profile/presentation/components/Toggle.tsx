import { Pressable, StyleSheet, View } from 'react-native';

interface ToggleProps {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const TRACK_ON = '#712AE2';
const TRACK_OFF = '#E2E8F0';

/**
 * Switch custom para casar com o design (track 40×24, knob 20×20, raio 999).
 * Usamos um Pressable em vez do RN `Switch` para padronizar a aparência entre
 * iOS e Android — o nativo tem visuais bem diferentes.
 */
export const Toggle = ({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: ToggleProps) => (
  <Pressable
    onPress={disabled ? undefined : onValueChange}
    accessibilityRole="switch"
    accessibilityState={{ checked: value, disabled }}
    accessibilityLabel={accessibilityLabel}
    hitSlop={8}
    style={({ pressed }) => [
      styles.track,
      {
        backgroundColor: value ? TRACK_ON : TRACK_OFF,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
      },
    ]}
  >
    <View
      style={[
        styles.knob,
        {
          transform: [{ translateX: value ? 18 : 0 }],
        },
      ]}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  track: {
    width: 40,
    height: 24,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
