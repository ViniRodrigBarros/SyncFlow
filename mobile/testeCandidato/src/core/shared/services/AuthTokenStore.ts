import { create } from 'zustand';

type AuthTokenState = { // pode usar interface também, mas type é mais comum para tipos de estado
  token: string | null;
  UserName: string | null;
  setToken: (token: string | null) => void;
  setUserName: (UserName: string | null) => void;
  clearToken: () => void;
}

export const useAuthTokenStore = create<AuthTokenState>(set => ({
  token: null,
  UserName: null,
  setToken: token => set({ token }),
  setUserName: UserName => set({ UserName }),
  clearToken: () => set({ token: null, UserName: null }),
}));

export const getAuthToken = (): string | null =>
  useAuthTokenStore.getState().token;

export const setAuthToken = (token: string | null): void => {
  useAuthTokenStore.getState().setToken(token);
};
