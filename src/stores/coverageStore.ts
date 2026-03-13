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

export const useCoverageStore = create<CoverageState>((set, get) => ({
  visibleLayers: [],
  opacity: 0.35,

  toggleLayer: (layer) =>
    set((state) => ({
      visibleLayers: state.visibleLayers.includes(layer)
        ? state.visibleLayers.filter((l) => l !== layer)
        : [...state.visibleLayers, layer],
    })),

  setOpacity: (opacity) =>
    set({ opacity: Math.max(0.2, Math.min(0.8, opacity)) }),

  // Legacy support - return true if any layer is visible
  get isVisible() {
    return get().visibleLayers.length > 0;
  },

  toggleVisibility: () =>
    set((state) => ({
      visibleLayers: state.visibleLayers.length > 0 ? [] : ['5g', 'lte', 'gsm'],
    })),
}));
