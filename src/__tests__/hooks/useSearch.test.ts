import { renderHook } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';
import type { Campground } from '@/types/campground';

const mockCampgrounds: Campground[] = [
  {
    id: '1',
    name: 'Camping am See',
    address: 'Musterstraße 1, Berlin',
    coordinates: [13.4, 52.5],
    type: 'camp_site',
    coverageLevel: '4g',
    features: ['wifi', 'power'],
    rating: 4.5,
    website: 'https://example.com',
    phone: '+49 30 123456',
    email: 'info@camping-see.de',
    openingHours: '24/7',
  },
  {
    id: '2', 
    name: 'Stellplatz München',
    address: 'Bahnhofstraße 5, München',
    coordinates: [11.5, 48.1],
    type: 'caravan_site',
    coverageLevel: '5g',
    features: ['power', 'shower'],
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Naturcamping Hamburg',
    address: 'Waldweg 10, Hamburg', 
    coordinates: [10.0, 53.5],
    type: 'camp_site',
    coverageLevel: '3g',
    features: ['wifi'],
    rating: 4.2,
  },
];

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
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Camping am See');
  });

  it('should find campgrounds by address', () => {
    const { result } = renderHook(() => useSearch('München', mockCampgrounds));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Stellplatz München');
  });

  it('should be case insensitive', () => {
    const { result } = renderHook(() => useSearch('camping', mockCampgrounds));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Camping am See');
  });

  it('should return maximum 5 results', () => {
    const largeCampgroundList = Array.from({ length: 10 }, (_, i) => ({
      ...mockCampgrounds[0],
      id: `${i}`,
      name: `Test Camping ${i}`,
    }));

    const { result } = renderHook(() => useSearch('Test', largeCampgroundList));
    expect(result.current).toHaveLength(5);
  });

  it('should handle partial matches', () => {
    const { result } = renderHook(() => useSearch('Ber', mockCampgrounds));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].address).toContain('Berlin');
  });
});