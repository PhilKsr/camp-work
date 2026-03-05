import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  // Search
  searchQuery: string;

  // Coverage levels
  coverageLevels: string[]; // ['5g', '4g', '3g', 'none']

  // Work-friendly filter
  workFriendlyOnly: boolean;

  // Campground types
  types: string[]; // ['camp_site', 'caravan_site']

  // Features
  features: string[]; // ['wifi', 'power', 'dogs', ...]

  // Favorites only
  favoritesOnly: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  toggleCoverageLevel: (level: string) => void;
  setWorkFriendlyOnly: (value: boolean) => void;
  toggleType: (type: string) => void;
  toggleFeature: (feature: string) => void;
  setFavoritesOnly: (value: boolean) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;
}

const defaultState = {
  searchQuery: '',
  coverageLevels: ['5g', '4g', '3g', 'none'], // Show all campgrounds initially
  workFriendlyOnly: false,
  types: ['camp_site', 'caravan_site'], // Both types by default
  features: [],
  favoritesOnly: false,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      toggleCoverageLevel: (level: string) =>
        set((state) => ({
          coverageLevels: state.coverageLevels.includes(level)
            ? state.coverageLevels.filter((l) => l !== level)
            : [...state.coverageLevels, level],
        })),

      setWorkFriendlyOnly: (value: boolean) =>
        set({
          workFriendlyOnly: value,
          // Auto-adjust coverage levels when work-friendly is enabled
          coverageLevels: value ? ['5g', '4g'] : get().coverageLevels,
        }),

      toggleType: (type: string) =>
        set((state) => ({
          types: state.types.includes(type)
            ? state.types.filter((t) => t !== type)
            : [...state.types, type],
        })),

      toggleFeature: (feature: string) =>
        set((state) => ({
          features: state.features.includes(feature)
            ? state.features.filter((f) => f !== feature)
            : [...state.features, feature],
        })),

      setFavoritesOnly: (value: boolean) => set({ favoritesOnly: value }),

      resetFilters: () => set(defaultState),

      activeFilterCount: () => {
        const state = get();
        let count = 0;

        // Search query
        if (state.searchQuery.length > 0) count++;

        // Coverage levels (not default)
        if (
          JSON.stringify(state.coverageLevels.sort()) !==
          JSON.stringify(['3g', '4g', '5g', 'none'])
        )
          count++;

        // Work-friendly only
        if (state.workFriendlyOnly) count++;

        // Types (not default)
        if (
          JSON.stringify(state.types.sort()) !==
          JSON.stringify(['camp_site', 'caravan_site'])
        )
          count++;

        // Features
        if (state.features.length > 0) count++;

        // Favorites only
        if (state.favoritesOnly) count++;

        return count;
      },
    }),
    {
      name: 'campwork-filters',
      // Don't persist search query (session-based)
      partialize: (state) => ({
        ...state,
        searchQuery: '',
      }),
    },
  ),
);
