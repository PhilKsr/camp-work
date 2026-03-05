import { create } from 'zustand';

interface CoverageState {
  isVisible: boolean;
  opacity: number; // 0.2 - 0.8
  toggleVisibility: () => void;
  setOpacity: (opacity: number) => void;
}

export const useCoverageStore = create<CoverageState>((set) => ({
  isVisible: true,
  opacity: 0.5,

  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),

  setOpacity: (opacity) =>
    set({ opacity: Math.max(0.2, Math.min(0.8, opacity)) }),
}));
