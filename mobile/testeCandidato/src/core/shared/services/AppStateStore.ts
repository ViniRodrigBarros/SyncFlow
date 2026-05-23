import { create } from 'zustand';

/**
 * Global, app-wide UI state. Anything that needs to be observed across
 * unrelated screens lives here. Feature-specific state (e.g. a draft form)
 * stays inside the feature, not in this global store.
 *
 * Why Zustand:
 *  - Tiny, no boilerplate, no Provider tree, no reducers.
 *  - Selectors keep components from re-rendering on unrelated changes.
 *  - Easy to grow: split into multiple slices when this gets too big.
 */
interface AppState {
  isReady: boolean;
  setReady: (ready: boolean) => void;
  toast: { message: string; kind: 'info' | 'success' | 'error' } | null;
  showToast: (message: string, kind?: 'info' | 'success' | 'error') => void;
  dismissToast: () => void;
}

export const useAppStateStore = create<AppState>(set => ({
  isReady: false,
  setReady: ready => set({ isReady: ready }),
  toast: null,
  showToast: (message, kind = 'info') => set({ toast: { message, kind } }),
  dismissToast: () => set({ toast: null }),
}));
