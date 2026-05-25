export const Routes = {
  Splash: 'Splash',
  Auth: 'Auth',
  Home: 'Home',
  Profile: 'Profile',
  RegistroList: 'RegistroList',
  RegistroForm: 'RegistroForm',
  RegistroDetail: 'RegistroDetail',
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
