import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthScreen } from '../../features/auth';
import { SplashScreen } from '../../features/splash';
import { useTheme, type Theme } from '../theme';
import { Routes } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack({ theme }: { theme: Theme }) {
  return (
    <Stack.Navigator
      initialRouteName={Routes.Splash}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name={Routes.Splash}
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.Auth}
        component={AuthScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export const RootNavigator = () => {
  const theme = useTheme();
  return (
    <NavigationContainer>
      <RootStack theme={theme} />
    </NavigationContainer>
  );
};
