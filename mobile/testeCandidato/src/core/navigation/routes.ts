export const Routes = {
  Splash: 'Splash',
  Auth: 'Auth',
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
