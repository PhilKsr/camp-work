import { useQuery } from '@tanstack/react-query';
import type { CampgroundGeoJSON } from '@/types/campground';

export function useCampgrounds() {
  return useQuery<CampgroundGeoJSON>({
    queryKey: ['campgrounds'],
    queryFn: async () => {
      const res = await fetch('/data/campgrounds.geojson');
      if (!res.ok) throw new Error('Failed to load campgrounds');
      return res.json();
    },
    staleTime: Infinity, // Static data, never refetch
  });
}
