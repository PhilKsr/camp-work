import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Campground, CampgroundGeoJSON } from '@/types/campground';

export function useCampgrounds() {
  return useQuery<CampgroundGeoJSON>({
    queryKey: ['campgrounds'],
    queryFn: async () => {
      try {
        // Versuche Supabase
        const { data, error } = await supabase.from('campgrounds').select('*');

        if (error) throw error;

        // Transformiere Supabase-Rows in GeoJSON Format
        // (weil MapLibre GeoJSON erwartet)
        const features = (data || []).map(
          (row: {
            id: string;
            name: string;
            type: string;
            location: string;
            address: string | null;
            website: string | null;
            phone: string | null;
            email: string | null;
            rating: number | null;
            features: string[];
            coverage_level: string;
            opening_hours: string | null;
            fee: boolean | null;
            capacity: number | null;
            source: string;
            osm_id: string | null;
            updated_at: string;
          }) => {
            // Parse PostGIS POINT
            const match = row.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            const lng = match ? parseFloat(match[1]) : 0;
            const lat = match ? parseFloat(match[2]) : 0;

            return {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [lng, lat] as [number, number],
              },
              properties: {
                id: row.id,
                name:
                  row.name ||
                  `Stellplatz ${row.osm_id?.replace('osm_node_', '#') || ''}`.trim(),
                type: row.type as Campground['type'],
                coordinates: [lng, lat] as [number, number],
                address: row.address,
                website: row.website,
                phone: row.phone,
                email: row.email,
                rating: row.rating ? Number(row.rating) : null,
                features: row.features as Campground['features'],
                coverageLevel:
                  row.coverage_level as Campground['coverageLevel'],
                thumbnail: null, // Wird separat geladen
                openingHours: row.opening_hours,
                fee: row.fee,
                capacity: row.capacity,
                source: row.source as 'osm',
                osmId: row.osm_id ?? undefined,
                lastUpdated: row.updated_at,
              } satisfies Campground,
            };
          },
        );

        return { type: 'FeatureCollection', features } as CampgroundGeoJSON;
      } catch {
        // Fallback: Statische Datei
        const res = await fetch('/data/campgrounds.geojson');
        if (!res.ok) throw new Error('Failed to load campgrounds');
        const geojson = await res.json();

        // Fix undefined names in GeoJSON fallback
        geojson.features = geojson.features.map(
          (feature: {
            properties: {
              name?: string;
              osmId?: string;
              id?: string;
              [key: string]: unknown;
            };
          }) => {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                name:
                  feature.properties.name === 'Campingplatz undefined' ||
                  !feature.properties.name ||
                  feature.properties.name.includes('undefined')
                    ? `Stellplatz ${feature.properties.osmId?.replace('node/', '#') || feature.properties.id?.replace('osm_node_', '#') || ''}`.trim()
                    : feature.properties.name,
              },
            };
          },
        );

        return geojson;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache statt Infinity
  });
}
