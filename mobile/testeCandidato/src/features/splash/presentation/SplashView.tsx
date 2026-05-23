import { ActivityIndicator, StyleSheet, View } from 'react-native';


import { useTheme } from '../../../core/theme';
import { useSplashViewModel } from '../hooks/useSplashViewModel';
import { SplashBrand } from './components';
import { SplashViewModel } from '../hooks/useSplashViewModel';

export const SplashView = () => {
  const theme = useTheme();
  const { appName, isLoading } = useSplashViewModel();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <SplashBrand appName={appName} />
      {isLoading && (
        <ActivityIndicator
          style={{ marginTop: theme.spacing.xl }}
          size="large"
          color={theme.colors.primary}
        />
      )}
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
});
