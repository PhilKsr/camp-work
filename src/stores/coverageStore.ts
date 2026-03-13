import { create } from 'zustand';

type CoverageSource = 'o2' | 'bnetza';

interface CoverageState {
  source: CoverageSource;
  visibleLayers: string[]; // O2: ['5g','4g','2g'], BNetzA: ['all']
  opacity: number;
  setSource: (source: CoverageSource) => void;
  toggleLayer: (layer: string) => void;
  setAllLayers: (layers: string[]) => void;
  setOpacity: (opacity: number) => void;
}

export const useCoverageStore = create<CoverageState>((set) => ({
  source: 'o2',
  visibleLayers: [], // Initial: kein Layer sichtbar
  opacity: 0.4,

  setSource: (source) => set({ source, visibleLayers: [] }),

  toggleLayer: (layer) =>
    set((state) => ({
      visibleLayers: state.visibleLayers.includes(layer)
        ? state.visibleLayers.filter((l) => l !== layer)
        : [...state.visibleLayers, layer],
    })),

  setAllLayers: (layers) => set({ visibleLayers: layers }),

  setOpacity: (opacity) =>
    set({ opacity: Math.max(0.1, Math.min(0.8, opacity)) }),
}));
