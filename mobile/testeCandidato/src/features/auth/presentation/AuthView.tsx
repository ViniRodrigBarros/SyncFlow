import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';

import {
  Gap,
  PrimaryButton,
  TextField,
} from '../../../core/shared/components';
import { useTheme } from '../../../core/theme';
import { useAuthViewModel } from '../hooks/useAuthViewModel';

export const AuthView = () => {
  const theme = useTheme();
  const vm = useAuthViewModel();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { padding: theme.spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.size.xxl,
                },
              ]}
            >
              {vm.title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.size.md,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              {vm.subtitle}
            </Text>
          </View>

          <Gap height={theme.spacing.xxl} />

          <Controller
            control={vm.control}
            name="login"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Login"
                placeholder="exemplo@empresa.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={vm.errors.login?.message}
              />
            )}
          />

          <Gap height={theme.spacing.lg} />

          <Controller
            control={vm.control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Senha"
                placeholder="••••••••"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={vm.errors.password?.message}
              />
            )}
          />

          {vm.submissionError ? (
            <>
              <Gap height={theme.spacing.md} />
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.colors.danger + '14',
                    borderColor: theme.colors.danger,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: theme.colors.danger,
                      fontSize: theme.typography.size.sm,
                    },
                  ]}
                >
                  {vm.submissionError}
                </Text>
              </View>
            </>
          ) : null}

          <Gap height={theme.spacing.xl} />

          <PrimaryButton
            label="Entrar"
            onPress={vm.onSubmit}
            loading={vm.isSubmitting}
          />

          <Gap height={theme.spacing.xl} />

          <Text
            style={[
              styles.hint,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.size.xs,
              },
            ]}
          >
            {vm.apiHint}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'flex-start' },
  title: { fontWeight: '700' },
  subtitle: { fontWeight: '400' },
  errorBanner: { borderWidth: 1 },
  errorText: { fontWeight: '500' },
  hint: { textAlign: 'center' },
});
