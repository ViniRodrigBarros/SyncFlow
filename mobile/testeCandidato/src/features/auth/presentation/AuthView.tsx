import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
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
  Checkbox,
  FieldIconButton,
  PrimaryButton,
  TextField,
} from '../../../core/shared/components';
import { useAuthViewModel } from '../hooks/useAuthViewModel';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  iconMuted: '#94A3B8',
  brand: '#712AE2',
  danger: '#BA1A1A',
  brandIconBg: '#131B2E',
};

export const AuthView = () => {
  const vm = useAuthViewModel();
  const [showPassword, setShowPassword] = useState(false);
  const [keepConnected, setKeepConnected] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Branding header */}
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <View style={styles.brandRing} />
              <View style={styles.brandDot} />
            </View>
            <Text style={styles.brandTitle}>SyncFlow</Text>
            <Text style={styles.brandSubtitle}>{vm.subtitle}</Text>
          </View>

          {/* Login card */}
          <View style={styles.card}>
            <Controller
              control={vm.control}
              name="login"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Email ou Nome de Usuário"
                  placeholder="nome@empresa.com.br"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={vm.errors.login?.message}
                  leftIcon={
                    <MaterialIcons
                      name="person-outline"
                      size={20}
                      color={COLORS.iconMuted}
                    />
                  }
                />
              )}
            />

            <View style={styles.fieldGap} />

            <Controller
              control={vm.control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Senha"
                  placeholder="••••••••••••"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={vm.errors.password?.message ?? vm.submissionError ?? undefined}
                  leftIcon={
                    <MaterialIcons
                      name="lock-outline"
                      size={20}
                      color={
                        vm.submissionError ? COLORS.danger : COLORS.iconMuted
                      }
                    />
                  }
                  rightAccessory={
                    <FieldIconButton onPress={() => setShowPassword(s => !s)}>
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color={COLORS.iconMuted}
                      />
                    </FieldIconButton>
                  }
                />
              )}
            />

            <View style={styles.keepConnected}>
              <Checkbox
                label="Manter conectado"
                checked={keepConnected}
                onChange={setKeepConnected}
              />
            </View>

            <PrimaryButton
              label="Entrar"
              onPress={vm.onSubmit}
              loading={vm.isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.brandIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.brand,
  },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.brand,
  },
  brandTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.textPrimary,
  },
  brandSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fieldGap: { height: 16 },
  keepConnected: {
    marginTop: 20,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 0,
  },
});
