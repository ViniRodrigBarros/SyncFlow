import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const COLORS = {
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderActive: '#712AE2',
  iconMuted: '#76777D',
  textPrimary: '#0F172A',
  placeholder: '#94A3B8',
};

/**
 * Caixa de busca padrão SyncFlow.
 *  - Ícone de lupa à esquerda.
 *  - Botão de limpar à direita aparece apenas com texto digitado.
 *  - Sem halo customizado de foco aqui — o foco vem do `selectionColor`
 *    da plataforma; isso evita re-renderizar com `onFocus/onBlur`.
 */
export const SearchBar = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Buscar registros…',
  autoFocus,
}: SearchBarProps) => {
  const hasValue = value.length > 0;
  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color={COLORS.iconMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never"
        underlineColorAndroid="transparent"
        selectionColor={COLORS.borderActive}
      />
      {hasValue ? (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <MaterialIcons
            name="cancel"
            size={18}
            color={COLORS.iconMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
});
