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

      // Workaround for Supabase type generation issue
      const { data, error } = await supabase.rpc(
        'campgrounds_in_viewport' as never,
        {
          min_lng: bounds.min_lng,
          min_lat: bounds.min_lat,
          max_lng: bounds.max_lng,
          max_lat: bounds.max_lat,
        } as never,
      );

      if (error) throw error;

      const campgroundsData = data as
        | Database['public']['Tables']['campgrounds']['Row'][]
        | null;

      const features = (campgroundsData || []).map((row) => {
        // Parse WKB hex format: 0101000020E610000033260EEA6CC622401B8B5C2679544A40
        // WKB structure: 2 chars byte order + 8 chars type + 2 chars SRID flag + 8 chars SRID + 32 chars coordinates
        let lng = 0;
        let lat = 0;

        if (
          row.location &&
          typeof row.location === 'string' &&
          row.location.length >= 50
        ) {
          try {
            // Skip WKB headers (20 hex chars) and extract coordinates (32 hex chars)
            const coordsHex = row.location.substring(18); // Start after headers
            const lngHex = coordsHex.substring(0, 16); // First 8 bytes (16 hex chars)
            const latHex = coordsHex.substring(16, 32); // Next 8 bytes (16 hex chars)

            // Convert hex to double (little-endian)
            const lngBuffer = Buffer.from(lngHex, 'hex');
            const latBuffer = Buffer.from(latHex, 'hex');
            lng = lngBuffer.readDoubleLE(0);
            lat = latBuffer.readDoubleLE(0);
          } catch (error) {
            console.warn('Failed to parse WKB location:', row.location, error);
            // Fallback to POINT text format attempt
            const match = row.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            lng = match ? parseFloat(match[1]) : 0;
            lat = match ? parseFloat(match[2]) : 0;
          }
        }

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
