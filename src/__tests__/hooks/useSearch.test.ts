import { renderHook } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';
import { mockCampgrounds, createMockCampground } from '../helpers';

describe('useSearch', () => {
  it('should return empty array for empty query', () => {
    const { result } = renderHook(() => useSearch('', mockCampgrounds));
    expect(result.current).toEqual([]);
  });

  it('should return empty array for query less than 2 characters', () => {
    const { result } = renderHook(() => useSearch('a', mockCampgrounds));
    expect(result.current).toEqual([]);
  });

  it('should find campgrounds by name', () => {
    const { result } = renderHook(() => useSearch('Camping', mockCampgrounds));
    expect(result.current).toHaveLength(2); // "Camping am See" + "Naturcamping Hamburg"
  });

  it('should find campgrounds by address', () => {
    const { result } = renderHook(() => useSearch('München', mockCampgrounds));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Stellplatz München');
  });

  it('should be case insensitive', () => {
    const { result } = renderHook(() => useSearch('camping', mockCampgrounds));
    expect(result.current).toHaveLength(2); // "Camping am See" + "Naturcamping Hamburg"
  });

  it('should return maximum 5 results', () => {
    const largeCampgroundList = Array.from({ length: 10 }, (_, i) =>
      createMockCampground({
        id: `${i}`,
        name: `Test Camping ${i}`,
      }),
    );

    const { result } = renderHook(() => useSearch('Test', largeCampgroundList));
    expect(result.current).toHaveLength(5);
  });

  it('should handle partial matches', () => {
    const { result } = renderHook(() => useSearch('Ber', mockCampgrounds));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].address).toContain('Berlin');
  });
});
