import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/core/navigation';
import { Toast } from './src/core/shared/components';
import { QueryProvider } from './src/core/shared/services';
import { useTheme } from './src/core/theme';

const AppShell = () => {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.colors.background === '#0F172A' ? 'light' : 'dark'} />
      <RootNavigator />
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AppShell />
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
