import { create } from 'zustand';

interface MapState {
  viewport: { latitude: number; longitude: number; zoom: number };
  selectedCampground: string | null;
  setViewport: (v: Partial<MapState['viewport']>) => void;
  setSelectedCampground: (id: string | null) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  initializeFromGeolocation: (lat: number, lng: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewport: {
    latitude: 51.1,
    longitude: 10.4,
    zoom: 10, // Changed from 6 to 10 for ~50km radius view
  },
  selectedCampground: null,

  setViewport: (newViewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...newViewport },
    })),

  setSelectedCampground: (id) => set({ selectedCampground: id }),

  flyTo: (lat, lng, zoom = 12) =>
    set({ viewport: { latitude: lat, longitude: lng, zoom } }),

  initializeFromGeolocation: (lat, lng) =>
    set({ viewport: { latitude: lat, longitude: lng, zoom: 10 } }),
}));
