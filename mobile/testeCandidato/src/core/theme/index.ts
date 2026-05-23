import { darkPalette, lightPalette, type Palette } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';
import { useThemeStore } from '../shared/services/ThemeStore';

/**
 * Aggregated theme objects. Components consume these via `useTheme()` so
 * a flip of `useThemeStore.toggle()` re-renders the whole tree with the
 * other palette. Spacing, radius and typography are theme-agnostic for now —
 * if that ever changes, just thread them into `buildTheme` the same way.
 */
export interface Theme {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

const buildTheme = (colors: Palette): Theme => ({
  colors,
  spacing,
  radius,
  typography,
});

export const lightTheme: Theme = buildTheme(lightPalette);
export const darkTheme: Theme = buildTheme(darkPalette);

/**
 * Default static theme — useful for non-reactive code (constants, utilities,
 * tests). Components should prefer `useTheme()` so they react to mode flips.
 */
export const theme: Theme = lightTheme;

export * from './colors';
export * from './spacing';
export * from './typography';

export const useTheme = (): Theme => {
  const mode = useThemeStore(s => s.mode);
  return mode === 'dark' ? darkTheme : lightTheme;
};
