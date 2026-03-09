export interface Database {
  public: {
    Tables: {
      campgrounds: {
        Row: {
          id: string;
          name: string;
          type: 'camp_site' | 'caravan_site';
          location: string; // PostGIS geography (WKB)
          address: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          rating: number | null;
          features: string[];
          coverage_level: '5g' | '4g' | '3g' | 'none';
          opening_hours: string | null;
          fee: boolean | null;
          capacity: number | null;
          source: string;
          osm_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campgrounds']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['campgrounds']['Insert']>;
      };
      campground_images: {
        Row: {
          id: string;
          campground_id: string;
          url: string;
          source: 'og_image' | 'wikimedia' | 'osm' | 'google_places' | 'manual';
          alt_text: string | null;
          sort_order: number;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campground_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['campground_images']['Insert']>;
      };
    };
    Functions: {
      campgrounds_in_viewport: {
        Args: { min_lng: number; min_lat: number; max_lng: number; max_lat: number };
        Returns: Database['public']['Tables']['campgrounds']['Row'][];
      };
      campgrounds_nearby: {
        Args: { lng: number; lat: number; radius_km?: number };
        Returns: (Database['public']['Tables']['campgrounds']['Row'] & { distance_km: number })[];
      };
    };
  };
}