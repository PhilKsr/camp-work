import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CampgroundImage } from './useBatchCampgroundImages';

export function useCampgroundImages(campgroundId: string | null) {
  return useQuery({
    queryKey: ['campground-images', campgroundId],
    queryFn: async (): Promise<CampgroundImage[]> => {
      if (!campgroundId) return [];
      const { data, error } = await supabase
        .from('campground_images')
        .select('*')
        .eq('campground_id', campgroundId)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as CampgroundImage[];
    },
    enabled: !!campgroundId,
    staleTime: 10 * 60 * 1000, // 10 Minuten Cache
  });
}
