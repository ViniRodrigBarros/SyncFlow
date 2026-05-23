import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../../core/theme';

interface SplashBrandProps {
  appName: string;
}

export const SplashBrand = ({ appName }: SplashBrandProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.primary,
            fontSize: theme.typography.size.display,
          },
        ]}
      >
        {appName}
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
        Conectando o São João
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
