import { act, renderHook } from '@testing-library/react';
import { useFilterStore } from '@/stores/filterStore';

// Mock Zustand persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

describe('filterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.resetFilters();
    });
  });

  it('should have correct default state', () => {
    const { result } = renderHook(() => useFilterStore());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.coverageLevels).toEqual(['5g', '4g', '3g', 'none']);
    expect(result.current.workFriendlyOnly).toBe(false);
    expect(result.current.types).toEqual(['camp_site', 'caravan_site']);
    expect(result.current.features).toEqual([]);
    expect(result.current.favoritesOnly).toBe(false);
    expect(result.current.activeFilterCount()).toBe(0);
  });

  it('should set search query', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setSearchQuery('test query');
    });

    expect(result.current.searchQuery).toBe('test query');
    expect(result.current.activeFilterCount()).toBe(1);
  });

  it('should toggle coverage level', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.toggleCoverageLevel('5g');
    });

    expect(result.current.coverageLevels).toEqual(['3g', '4g', 'none']);
    expect(result.current.activeFilterCount()).toBe(1);

    act(() => {
      result.current.toggleCoverageLevel('5g');
    });

    expect(result.current.coverageLevels).toEqual(['3g', '4g', 'none', '5g']);
  });

  it('should set work-friendly mode and adjust coverage levels', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setWorkFriendlyOnly(true);
    });

    expect(result.current.workFriendlyOnly).toBe(true);
    expect(result.current.coverageLevels).toEqual(['5g', '4g']);
    expect(result.current.activeFilterCount()).toBe(2); // workFriendlyOnly + different coverage levels
  });

  it('should toggle campground type', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.toggleType('camp_site');
    });

    expect(result.current.types).toEqual(['caravan_site']);
    expect(result.current.activeFilterCount()).toBe(1);

    act(() => {
      result.current.toggleType('camp_site');
    });

    expect(result.current.types).toEqual(['caravan_site', 'camp_site']);
  });

  it('should toggle feature', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.toggleFeature('wifi');
    });

    expect(result.current.features).toEqual(['wifi']);
    expect(result.current.activeFilterCount()).toBe(1);

    act(() => {
      result.current.toggleFeature('power');
    });

    expect(result.current.features).toEqual(['wifi', 'power']);

    act(() => {
      result.current.toggleFeature('wifi');
    });

    expect(result.current.features).toEqual(['power']);
  });

  it('should set favorites only', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setFavoritesOnly(true);
    });

    expect(result.current.favoritesOnly).toBe(true);
    expect(result.current.activeFilterCount()).toBe(1);
  });

  it('should reset filters to default', () => {
    const { result } = renderHook(() => useFilterStore());

    // Set some non-default values
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setWorkFriendlyOnly(true);
      result.current.setFavoritesOnly(true);
    });

    expect(result.current.activeFilterCount()).toBeGreaterThan(0);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.coverageLevels).toEqual(['3g', '4g', '5g', 'none']);
    expect(result.current.workFriendlyOnly).toBe(false);
    expect(result.current.types).toEqual(['camp_site', 'caravan_site']);
    expect(result.current.features).toEqual([]);
    expect(result.current.favoritesOnly).toBe(false);
    expect(result.current.activeFilterCount()).toBe(0);
  });

  it('should calculate active filter count correctly', () => {
    const { result } = renderHook(() => useFilterStore());

    expect(result.current.activeFilterCount()).toBe(0);

    act(() => {
      result.current.setSearchQuery('test');
    });
    expect(result.current.activeFilterCount()).toBe(1);

    act(() => {
      result.current.setWorkFriendlyOnly(true);
    });
    expect(result.current.activeFilterCount()).toBe(3);

    act(() => {
      result.current.toggleFeature('wifi');
    });
    expect(result.current.activeFilterCount()).toBe(4);

    act(() => {
      result.current.setFavoritesOnly(true);
    });
    expect(result.current.activeFilterCount()).toBe(5);
  });
});
