import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      hitSlop={6}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.colors.secondary : theme.colors.border,
            backgroundColor: checked ? theme.colors.secondary : 'transparent',
          },
        ]}
      >
        {checked ? (
          <MaterialIcons name="check" size={14} color="#FFFFFF" />
        ) : null}
      </View>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
  },
});
