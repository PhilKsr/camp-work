import { useCallback, useEffect, useState } from 'react';

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
  type: string; // 'city', 'town', 'village', 'address'
  importance: number;
  state?: string; // Bundesland
}

interface UseGeocodingSearchResult {
  results: GeocodingResult[];
  isLoading: boolean;
  error: string | null;
}

// Rate limiting: Max 1 request per second for Nominatim policy compliance
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

/**
 * Hook for geocoding search using Nominatim API
 * Searches for places, cities, addresses in Germany
 */
export function useGeocodingSearch(query: string): UseGeocodingSearchResult {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Enforce rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest),
        );
      }
      lastRequestTime = Date.now();

      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        countrycodes: 'de', // Limit to Germany
        limit: '5',
        addressdetails: '1',
        extratags: '1',
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'User-Agent': 'CampWork/1.0',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      const processedResults: GeocodingResult[] = data
        .map((item: unknown) => {
          const nominatimItem = item as {
            display_name: string;
            lat: string;
            lon: string;
            type?: string;
            class?: string;
            importance?: number;
            address?: { state?: string };
          };
          // Determine place type for better UX
          let type = 'address';
          if (
            nominatimItem.type === 'city' ||
            nominatimItem.class === 'place'
          ) {
            if (nominatimItem.type === 'city') type = 'city';
            else if (nominatimItem.type === 'town') type = 'town';
            else if (nominatimItem.type === 'village') type = 'village';
          }

          return {
            displayName: nominatimItem.display_name,
            lat: parseFloat(nominatimItem.lat),
            lng: parseFloat(nominatimItem.lon),
            type,
            importance: nominatimItem.importance || 0,
            state: nominatimItem.address?.state,
          };
        })
        .filter((result: GeocodingResult) => {
          // Filter out very unimportant results
          return result.importance > 0.1;
        })
        .sort((a: GeocodingResult, b: GeocodingResult) => {
          // Sort by importance (higher is better)
          return b.importance - a.importance;
        });

      setResults(processedResults);
    } catch (err) {
      console.error('Geocoding search error:', err);
      setError(
        err instanceof Error ? err.message : 'Fehler bei der Orts-Suche',
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search with 500ms delay (respecting rate limits)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchPlaces(query.trim());
      } else {
        setResults([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchPlaces]);

  return {
    results,
    isLoading,
    error,
  };
}
