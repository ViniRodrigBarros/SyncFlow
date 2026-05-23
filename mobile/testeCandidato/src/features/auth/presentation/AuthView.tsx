import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../core/theme';
import { useAuthViewModel } from '../hooks/useAuthViewModel';

export const AuthView = () => {
  const theme = useTheme();
  const { title, subtitle } = useAuthViewModel();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.primary,
            fontSize: theme.typography.size.display,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.size.md,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
