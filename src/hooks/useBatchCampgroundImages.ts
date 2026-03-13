import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CampgroundImage {
  id: string;
  campground_id: string;
  url: string;
  source: 'og_image' | 'wikimedia' | 'osm' | 'google_places';
  sort_order: number;
  width?: number | null;
  height?: number | null;
}

/**
 * Lädt Bilder für mehrere Campingplätze in einem Request.
 * Gibt eine Map zurück: campground_id → images[]
 */
export function useBatchCampgroundImages(campgroundIds: string[]) {
  return useQuery({
    queryKey: ['campground-images-batch', [...campgroundIds].sort().join(',')],
    queryFn: async (): Promise<Map<string, CampgroundImage[]>> => {
      if (campgroundIds.length === 0) return new Map();

      const { data, error } = await supabase
        .from('campground_images')
        .select('*')
        .in('campground_id', campgroundIds)
        .order('sort_order');

      if (error) throw error;

      // Debug logging
      console.log(
        `Batch images loaded: ${data?.length} for ${campgroundIds.length} campgrounds`,
      );

      // Gruppiere nach campground_id
      const map = new Map<string, CampgroundImage[]>();
      for (const img of (data as CampgroundImage[]) || []) {
        const existing = map.get(img.campground_id) || [];
        existing.push(img);
        map.set(img.campground_id, existing);
      }

      return map;
    },
    enabled: campgroundIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 Minuten Cache
  });
}
