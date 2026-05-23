export const Routes = {
  Splash: 'Splash',
  Auth: 'Auth',
  Home: 'Home',
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
