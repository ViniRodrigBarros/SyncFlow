/**
 * Single source of truth for colors. Two palettes share the same shape so
 * swapping themes only flips values, never keys. Components consume tokens
 * (e.g. `colors.primary`) — they never see hex codes directly.
 */

export const lightPalette = {
  white: '#FFFFFF',
  black: '#000000',
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#712AE2',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export type Palette = { [K in keyof typeof lightPalette]: string };

export const darkPalette: Palette = {
  white: '#FFFFFF',
  black: '#000000',
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  primaryLight: '#1E3A8A',
  secondary: '#A78BFA',
  background: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textInverse: '#0F172A',
  border: '#334155',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

// Default palette (= light) for non-reactive code paths.
export const palette = lightPalette;

export type ColorToken = keyof typeof lightPalette;
