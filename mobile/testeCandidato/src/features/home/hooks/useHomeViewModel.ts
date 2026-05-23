import { useAuthTokenStore } from '../../../core/shared/services/AuthTokenStore';

export interface HomeViewModel {
  userName: string | null;
  empresaName: string | null;
}

export const useHomeViewModel = (): HomeViewModel => {
  const user = useAuthTokenStore(s => s.user);
  return {
    userName: user?.name ?? null,
    empresaName: user?.empresa?.name ?? null,
  };
};
