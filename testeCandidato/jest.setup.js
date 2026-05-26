// Setup global para os testes Jest.
// Mocks de módulos nativos que não rodam fora do simulador.

// AsyncStorage: usa o mock oficial in-memory.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// NetInfo: stub mínimo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => () => {}),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  configure: jest.fn(),
}));

// react-native-safe-area-context: provider/consumer no-op
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: View,
    SafeAreaInsetsContext: {
      Consumer: ({ children }) => children({ top: 0, bottom: 0, left: 0, right: 0 }),
    },
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 320, height: 640 }),
  };
});

// @expo/vector-icons → texto inerte. O testID usa o `name` recebido como prop
// (ex.: visibility-off) para que os testes possam consultar ícones específicos.
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const factory = () => props => {
    const React = require('react');
    return React.createElement(
      Text,
      { ...props, testID: props.testID ?? `icon-${props.name}` },
      props.name,
    );
  };
  return {
    MaterialIcons: factory(),
    Ionicons: factory(),
    MaterialCommunityIcons: factory(),
    Feather: factory(),
  };
});
