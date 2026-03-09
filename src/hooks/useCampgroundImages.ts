import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCampgroundImages(campgroundId: string | null) {
  return useQuery({
    queryKey: ['campground-images', campgroundId],
    queryFn: async () => {
      if (!campgroundId) return [];
      const { data, error } = await supabase
        .from('campground_images')
        .select('*')
        .eq('campground_id', campgroundId)
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!campgroundId,
  });
}