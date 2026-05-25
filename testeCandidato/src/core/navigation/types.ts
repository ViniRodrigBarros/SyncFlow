import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  /** Lista completa de registros com busca e filtro por status. */
  RegistroList: undefined;
  /** Sem `id` = criar novo registro. Com `id` = editar existente. */
  RegistroForm: { id?: string } | undefined;
  RegistroDetail: { id: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
