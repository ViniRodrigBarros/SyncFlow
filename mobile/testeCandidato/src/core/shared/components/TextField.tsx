import { ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '../../theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightAccessory?: ReactNode;
  labelAccessory?: ReactNode;
}

/**
 * Input outlined seguindo o design SyncFlow: borda neutra, destaque colorido
 * no foco, mensagem de erro abaixo do campo. Opcionalmente exibe um ícone à
 * esquerda dentro do campo e um botão acessório à direita (ex.: olho para
 * mostrar/ocultar senha).
 */
export const TextField = ({
  label,
  error,
  onFocus,
  onBlur,
  leftIcon,
  rightAccessory,
  labelAccessory,
  ...rest
}: TextFieldProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.secondary
      : theme.colors.border;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textPrimary,
              fontSize: 13,
            },
          ]}
        >
          {label}
        </Text>
        {labelAccessory ? labelAccessory : null}
      </View>
      <View
        style={[
          styles.fieldRow,
          {
            borderColor,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 14,
          },
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIcon}>{leftIcon}</View>
        ) : null}
        <TextInput
          {...rest}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: 15,
            },
          ]}
        />
        {rightAccessory ? (
          <View style={styles.rightAccessory}>{rightAccessory}</View>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <View
            style={[styles.errorDot, { borderColor: theme.colors.danger }]}
          >
            <View
              style={[styles.errorDotInner, { backgroundColor: theme.colors.danger }]}
            />
          </View>
          <Text
            style={[
              styles.error,
              {
                color: theme.colors.danger,
                fontSize: 12,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

interface IconButtonProps {
  onPress?: () => void;
  children: ReactNode;
}

export const FieldIconButton = ({ onPress, children }: IconButtonProps) => (
  <Pressable
    onPress={onPress}
    hitSlop={8}
    style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
  >
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { fontWeight: '500', letterSpacing: 0.1 },
  fieldRow: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightAccessory: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontWeight: '400',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorDotInner: {
    width: 2,
    height: 6,
    borderRadius: 1,
  },
  error: { fontWeight: '500' },
});
