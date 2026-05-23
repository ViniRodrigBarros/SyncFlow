import { create } from 'zustand';

/**
 * Global theme mode. Kept in its own store (separate from AppStateStore)
 * because theme has its own concerns: it can be persisted, synced with the
 * OS appearance, and read by the design system at render time.
 *
 * Currently exposes mode + actions only — wiring the active palette into
 * StyleSheets is a follow-up that requires refactoring core/theme.
 */
export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>(set => ({
  mode: 'light',
  setMode: mode => set({ mode }),
  toggle: () =>
    set(state => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
}));
