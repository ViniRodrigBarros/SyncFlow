import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TipoRegistro } from '../../../../core/shared/repositories';

interface TipoPickerProps {
  value: TipoRegistro;
  onChange: (value: TipoRegistro) => void;
}

const OPTIONS: Array<{
  value: TipoRegistro;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}> = [
  { value: 'COMPRA', label: 'Compra', icon: 'shopping-bag' },
  { value: 'VENDA', label: 'Venda', icon: 'receipt-long' },
];

/**
 * Segmented control para escolha do tipo do registro. Estado controlado
 * pelo ViewModel — o picker só notifica e renderiza.
 */
export const TipoPicker = ({ value, onChange }: TipoPickerProps) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.option,
              active && styles.optionActive,
              pressed && !active && styles.optionPressed,
            ]}
          >
            <MaterialIcons
              name={opt.icon}
              size={16}
              color={active ? '#FFFFFF' : '#45464D'}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F6',
    padding: 4,
    borderRadius: 10,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: '#712AE2',
  },
  optionPressed: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#45464D',
    letterSpacing: 0.1,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
