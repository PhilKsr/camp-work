import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteState {
  favorites: string[]; // Array von Campground IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),
      clearFavorites: () => set({ favorites: [] }),
    }),
    { name: 'campwork-favorites' },
  ),
);
