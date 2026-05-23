import { useState } from 'react';

export interface AuthViewModel {
  title: string;
  subtitle: string;
  isSubmitting: boolean;
}

export const useAuthViewModel = (): AuthViewModel => {
  const [isSubmitting] = useState(false);

  return {
    title: 'Entrar',
    subtitle: 'Acesse sua conta para continuar',
    isSubmitting,
  };
};
