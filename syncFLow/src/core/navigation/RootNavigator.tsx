import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthScreen } from '../../features/auth';
import { HomeScreen } from '../../features/home';
import { ProfileScreen } from '../../features/profile';
import {
  RegistroDetailScreen,
  RegistroFormScreen,
  RegistroListScreen,
} from '../../features/registros';
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
      <Stack.Screen
        name={Routes.Home}
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.Profile}
        component={ProfileScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name={Routes.RegistroList}
        component={RegistroListScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name={Routes.RegistroForm}
        component={RegistroFormScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name={Routes.RegistroDetail}
        component={RegistroDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
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
