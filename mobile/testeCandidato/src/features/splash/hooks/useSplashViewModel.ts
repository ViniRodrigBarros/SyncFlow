import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { Routes } from '../../../core/navigation/routes';
import type { RootStackParamList } from '../../../core/navigation/types';

export interface SplashViewModel {
  isLoading: boolean;
  appName: string;
}

export const useSplashViewModel = (): SplashViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      navigation.replace(Routes.Auth);
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return {
    isLoading,
    appName: 'São João Connect',
  };
};
