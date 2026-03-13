import { useMemo } from 'react';
import { useViewportCampgroundsQuery } from '@/hooks/useViewportCampgroundsQuery';

/**
 * Hook that returns only campgrounds visible in the current map viewport
 * Now uses PostGIS RPC for optimized database queries instead of client-side filtering
 * Dramatically reduces initial payload from ~2000 to ~50 campgrounds
 */
export function useViewportCampgrounds() {
  const { data } = useViewportCampgroundsQuery();

  return useMemo(() => {
    if (!data) return [];
    return data.features.map((f) => f.properties);
  }, [data]);
}
