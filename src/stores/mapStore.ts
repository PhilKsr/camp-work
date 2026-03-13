import { create } from 'zustand';

interface FlyToTarget {
  latitude: number;
  longitude: number;
  zoom: number;
  id: number; // Unique ID damit useEffect triggert
}

interface MapState {
  viewport: { latitude: number; longitude: number; zoom: number };
  selectedCampground: string | null;
  flyToTarget: FlyToTarget | null;
  setViewport: (v: Partial<MapState['viewport']>) => void;
  setSelectedCampground: (id: string | null) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  initializeFromGeolocation: (lat: number, lng: number) => void;
}

let flyToCounter = 0;

export const useMapStore = create<MapState>((set) => ({
  viewport: {
    latitude: 51.1,
    longitude: 10.4,
    zoom: 10, // Changed from 6 to 10 for ~50km radius view
  },
  selectedCampground: null,
  flyToTarget: null,

  setViewport: (newViewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...newViewport },
    })),

  setSelectedCampground: (id) => set({ selectedCampground: id }),

  flyTo: (lat, lng, zoom = 12) => {
    flyToCounter++;
    set({
      flyToTarget: { latitude: lat, longitude: lng, zoom, id: flyToCounter },
      viewport: { latitude: lat, longitude: lng, zoom },
    });
  },

  initializeFromGeolocation: (lat, lng) =>
    set({
      viewport: { latitude: lat, longitude: lng, zoom: 10 },
      flyToTarget: {
        latitude: lat,
        longitude: lng,
        zoom: 10,
        id: ++flyToCounter,
      },
    }),
}));
