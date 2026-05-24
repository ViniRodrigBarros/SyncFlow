export const Routes = {
  Splash: 'Splash',
  Auth: 'Auth',
  Home: 'Home',
  RegistroForm: 'RegistroForm',
  RegistroDetail: 'RegistroDetail',
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
