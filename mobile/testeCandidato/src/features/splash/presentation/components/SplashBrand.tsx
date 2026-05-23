import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../../core/theme';

interface SplashBrandProps {
  appName: string;
}

export const SplashBrand = ({ appName }: SplashBrandProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoMark,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <Text
          style={[
            styles.logoLetter,
            { color: theme.colors.textInverse },
          ]}
        >
          T
        </Text>
      </View>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.size.xxl,
            marginTop: theme.spacing.lg,
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
            fontSize: theme.typography.size.sm,
            marginTop: theme.spacing.xs,
          },
        ]}
      >
        Sync · Offline-first
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  logoMark: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: '800',
  },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', letterSpacing: 0.5 },
});
