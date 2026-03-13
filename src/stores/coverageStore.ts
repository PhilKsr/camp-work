import { create } from 'zustand';

type CoverageLayer = '5g' | 'lte' | 'gsm';

interface CoverageState {
  visibleLayers: CoverageLayer[];
  opacity: number; // 0.2 - 0.8
  toggleLayer: (layer: CoverageLayer) => void;
  setOpacity: (opacity: number) => void;
  // Legacy support for existing components
  isVisible: boolean;
  toggleVisibility: () => void;
}

export const useCoverageStore = create<CoverageState>((set) => ({
  visibleLayers: [],
  opacity: 0.35,
  isVisible: false,

  toggleLayer: (layer) =>
    set((state) => {
      const newVisibleLayers = state.visibleLayers.includes(layer)
        ? state.visibleLayers.filter((l) => l !== layer)
        : [...state.visibleLayers, layer];

      return {
        visibleLayers: newVisibleLayers,
        isVisible: newVisibleLayers.length > 0,
      };
    }),

  setOpacity: (opacity) =>
    set({ opacity: Math.max(0.2, Math.min(0.8, opacity)) }),

  toggleVisibility: () =>
    set((state) => {
      const newVisibleLayers: CoverageLayer[] =
        state.visibleLayers.length > 0 ? [] : ['5g', 'lte', 'gsm'];
      return {
        visibleLayers: newVisibleLayers,
        isVisible: newVisibleLayers.length > 0,
      };
    }),
}));
