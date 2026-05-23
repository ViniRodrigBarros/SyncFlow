import { useState } from 'react';
import {
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
}

/**
 * Input outlined seguindo o design system SyncFlow: borda neutra,
 * destaque colorido no foco, mensagem de erro abaixo do campo.
 */
export const TextField = ({ label, error, onFocus, onBlur, ...rest }: TextFieldProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.size.sm,
            marginBottom: theme.spacing.xs,
          },
        ]}
      >
        {label}
      </Text>
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
            borderColor,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            fontSize: theme.typography.size.md,
          },
        ]}
      />
      {error ? (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.danger,
              fontSize: theme.typography.size.xs,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { fontWeight: '500' },
  input: { borderWidth: 1 },
  error: { fontWeight: '500' },
});
