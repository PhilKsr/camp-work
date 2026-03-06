import type { Campground, CampgroundGeoJSON } from '@/types/campground';

/**
 * Erstellt ein Mock-Campground-Objekt mit allen Required-Properties.
 * Übergebene Properties überschreiben die Defaults.
 */
export function createMockCampground(
  overrides: Partial<Campground> = {},
): Campground {
  return {
    id: 'test-1',
    name: 'Test Campingplatz',
    type: 'camp_site',
    coordinates: [10.0, 51.0] as [number, number],
    address: null,
    website: null,
    phone: null,
    email: null,
    rating: null,
    features: [],
    coverageLevel: 'none',
    thumbnail: null,
    openingHours: null,
    fee: null,
    capacity: null,
    source: 'osm',
    osmId: 'node/1',
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Erstellt eine Mock-GeoJSON FeatureCollection.
 */
export function createMockGeoJSON(
  campgrounds: Campground[],
): CampgroundGeoJSON {
  return {
    type: 'FeatureCollection',
    features: campgrounds.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: c.coordinates },
      properties: c,
    })),
  };
}

/**
 * Standard Mock-Campgrounds für Tests
 */
export const mockCampgrounds = [
  createMockCampground({
    id: '1',
    name: 'Camping am See',
    address: 'Musterstraße 1, Berlin',
    coordinates: [13.4, 52.5],
    type: 'camp_site',
    coverageLevel: '4g',
    features: ['wifi', 'power'],
    rating: 4.5,
  }),
  createMockCampground({
    id: '2',
    name: 'Stellplatz München',
    address: 'Bahnhofstraße 5, München',
    coordinates: [11.5, 48.1],
    type: 'caravan_site',
    coverageLevel: '5g',
    features: ['power', 'shower'],
    rating: 4.8,
  }),
  createMockCampground({
    id: '3',
    name: 'Naturcamping Hamburg',
    address: 'Waldweg 10, Hamburg',
    coordinates: [10.0, 53.5],
    type: 'camp_site',
    coverageLevel: '3g',
    features: ['wifi'],
    rating: 4.2,
  }),
];

export const mockGeoJSON = createMockGeoJSON(mockCampgrounds);

/**
 * Creates a mock UseQueryResult for TanStack Query tests
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockQueryResult<T>(data: T): any {
  return {
    data,
    isLoading: false,
    error: null,
    isError: false,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success' as const,
    refetch: vi.fn(),
    isFetching: false,
    isFetched: true,
    isPaused: false,
    isStale: false,
    isPlaceholderData: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle' as const,
    errorUpdateCount: 0,
    isFetchedAfterMount: true,
    isInitialLoading: false,
    isRefetching: false,
    isEnabled: true,
    promise: Promise.resolve(data),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}
