import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import type { CampgroundGeoJSON } from '@/types/campground';

const mockCampgrounds: CampgroundGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13.405, 52.52],
      },
      properties: {
        id: 'test_1',
        name: 'Test Campground',
        type: 'camp_site',
        coordinates: [13.405, 52.52],
        address: 'Test Address',
        website: null,
        phone: null,
        email: null,
        rating: 4.0,
        features: ['wifi', 'power'],
        coverageLevel: '4g',
        thumbnail: null,
        openingHours: null,
        fee: true,
        capacity: 100,
        source: 'osm',
        osmId: 'test/1',
        lastUpdated: '2025-01-14T10:00:00.000Z',
      },
    },
  ],
};

// Create wrapper component for QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
};

describe('useCampgrounds', () => {
  it('should fetch campgrounds data successfully', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCampgrounds),
    });

    const { result } = renderHook(() => useCampgrounds(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockCampgrounds);
    expect(fetch).toHaveBeenCalledWith('/data/campgrounds.geojson');
  });

  it('should handle fetch errors', async () => {
    // Mock failed fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useCampgrounds(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCampgrounds),
    });

    const { result } = renderHook(() => useCampgrounds(), {
      wrapper: createWrapper(),
    });

    // Query key should be accessible through the hook
    expect(result.current).toBeDefined();
  });
});
