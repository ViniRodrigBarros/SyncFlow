import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useForm, type Control, type FieldErrors, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';
import { AppError } from '../../../core/api';
import { authRepository } from '../../../core/shared/repositories/auth';
import { useAppStateStore } from '../../../core/shared/services';
import { logger } from '../../../core/utils/logger';

const loginSchema = z.object({
  login: z
    .string({ required_error: 'Informe seu login' })
    .min(1, 'Informe seu login')
    .max(120, 'Login muito longo'),
  password: z
    .string({ required_error: 'Informe sua senha' })
    .min(4, 'Senha deve ter no mínimo 4 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface AuthViewModel {
  subtitle: string;
  isSubmitting: boolean;
  submissionError: string | null;
  control: Control<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSubmit: () => void;
}

export const useAuthViewModel = (): AuthViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', password: '' },
    mode: 'onSubmit',
  });

  const submit: SubmitHandler<LoginFormValues> = async values => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      await authRepository.signIn({
        login: values.login.trim(),
        password: values.password,
      });
      navigation.reset({ index: 0, routes: [{ name: Routes.Home }] });
    } catch (error) {
      const appError = AppError.from(error);
      logger.warn('Login falhou', appError.message);
      if (appError.kind === 'unauthorized') {
        // Erro inline no campo de senha (igual ao design Stitch)
        setSubmissionError('A senha inserida está incorreta. Tente novamente.');
      } else if (appError.kind === 'network' || appError.kind === 'timeout') {
        // Sem conexão → toast discreto, mantém o card limpo
        useAppStateStore
          .getState()
          .showToast('Sem conexão — verifique sua internet.', 'error');
      } else {
        useAppStateStore
          .getState()
          .showToast(appError.message || 'Falha ao entrar.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    subtitle: 'Acesso seguro ao portal corporativo',
    isSubmitting,
    submissionError,
    control,
    errors,
    onSubmit: handleSubmit(submit),
  };
};
