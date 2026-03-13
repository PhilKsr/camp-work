import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useMapStore } from '@/stores/mapStore';
import { useDeferredValue, useMemo } from 'react';
import type { Campground, CampgroundGeoJSON } from '@/types/campground';
import type { Database } from '@/types/database';

// Berechne Viewport Bounds (gleiche Logik wie useViewportCampgrounds)
function getViewportBounds(viewport: {
  latitude: number;
  longitude: number;
  zoom: number;
}) {
  const scale = Math.pow(2, viewport.zoom);
  const degreesPerPixel = 360 / (256 * scale);
  const latOffset = degreesPerPixel * 400;
  const lngOffset =
    (degreesPerPixel * 600) / Math.cos((viewport.latitude * Math.PI) / 180);
  return {
    min_lat: viewport.latitude - latOffset,
    max_lat: viewport.latitude + latOffset,
    min_lng: viewport.longitude - lngOffset,
    max_lng: viewport.longitude + lngOffset,
  };
}

export function useViewportCampgroundsQuery() {
  const { viewport } = useMapStore();
  const deferredViewport = useDeferredValue(viewport);

  const bounds = useMemo(
    () => getViewportBounds(deferredViewport),
    [deferredViewport],
  );

  // Erstelle einen stabilen Query Key basierend auf gerundeten Bounds
  // Runde auf 0.01 Grad (~1km) um nicht bei jedem Pixel-Move neu zu fetchen
  const queryKey = useMemo(
    () => [
      'campgrounds-viewport',
      Math.round(bounds.min_lat * 100) / 100,
      Math.round(bounds.max_lat * 100) / 100,
      Math.round(bounds.min_lng * 100) / 100,
      Math.round(bounds.max_lng * 100) / 100,
    ],
    [bounds],
  );

  return useQuery<CampgroundGeoJSON>({
    queryKey,
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        // Fallback: Statische Datei + Client-Side Filter
        const res = await fetch('/data/campgrounds.geojson');
        return res.json();
      }

      const { data, error } = await supabase.rpc(
        'campgrounds_in_viewport',
        bounds as any,
      ); // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) throw error;

      const campgroundsData = data as
        | Database['public']['Tables']['campgrounds']['Row'][]
        | null;

      const features = (campgroundsData || []).map((row) => {
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
            name: row.name || `Stellplatz #${row.id}`,
            type: row.type as Campground['type'],
            coordinates: [lng, lat] as [number, number],
            address: row.address,
            website: row.website,
            phone: row.phone,
            email: row.email,
            rating: row.rating ? Number(row.rating) : null,
            features: row.features as Campground['features'],
            coverageLevel: row.coverage_level as Campground['coverageLevel'],
            thumbnail: null,
            openingHours: row.opening_hours,
            fee: row.fee,
            capacity: row.capacity,
            source: row.source as 'osm',
            osmId: row.osm_id ?? undefined,
            lastUpdated: row.updated_at,
          } satisfies Campground,
        };
      });

      return { type: 'FeatureCollection', features } as CampgroundGeoJSON;
    },
    staleTime: 30 * 1000, // 30 Sekunden Cache pro Viewport-Bereich
    placeholderData: (prev) => prev, // Behalte alte Daten während neue laden
  });
}
