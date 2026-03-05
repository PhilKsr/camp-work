import { create } from 'zustand';

interface CoverageState {
  isVisible: boolean;
  opacity: number; // 0.2 - 0.8
  source: 'o2' | 'bnetza';
  toggleVisibility: () => void;
  setOpacity: (opacity: number) => void;
  setSource: (source: 'o2' | 'bnetza') => void;
}

export const useCoverageStore = create<CoverageState>((set) => ({
  isVisible: true,
  opacity: 0.5,
  source: 'bnetza', // Default to BNetzA as it's more reliable

  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),

  setOpacity: (opacity) =>
    set({ opacity: Math.max(0.2, Math.min(0.8, opacity)) }),

  setSource: (source) => set({ source }),
}));
