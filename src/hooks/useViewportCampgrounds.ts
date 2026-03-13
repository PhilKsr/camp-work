import { useMemo, useDeferredValue } from 'react';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useMapStore } from '@/stores/mapStore';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Calculate viewport bounds based on current map position and zoom level
 * Uses Web Mercator projection approximations for fast calculation
 */
function getViewportBounds(viewport: {
  latitude: number;
  longitude: number;
  zoom: number;
}): Bounds {
  const { latitude, longitude, zoom } = viewport;

  // Approximate degrees per pixel at this zoom level
  // More accurate calculation would use exact Web Mercator math
  const scale = Math.pow(2, zoom);
  const degreesPerPixel = 360 / (256 * scale);

  // Assume roughly 800x600 viewport (mobile/desktop average)
  const latOffset = degreesPerPixel * 300; // Half height
  const lngOffset =
    (degreesPerPixel * 400) / Math.cos((latitude * Math.PI) / 180); // Half width, adjusted for latitude

  return {
    north: latitude + latOffset,
    south: latitude - latOffset,
    east: longitude + lngOffset,
    west: longitude - lngOffset,
  };
}

/**
 * Check if a coordinate is within the given bounds
 */
function isInBounds(coordinates: [number, number], bounds: Bounds): boolean {
  const [lng, lat] = coordinates;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

/**
 * Hook that returns only campgrounds visible in the current map viewport
 * Dramatically reduces rendering load from ~1762 campgrounds to ~20-50
 */
export function useViewportCampgrounds() {
  const { data } = useCampgrounds();
  const { viewport } = useMapStore();
  const deferredViewport = useDeferredValue(viewport);

  return useMemo(() => {
    if (!data) return [];

    // Calculate visible bounds based on viewport + zoom
    const bounds = getViewportBounds(deferredViewport);

    // Filter campgrounds to only those within viewport bounds
    return data.features
      .filter(
        (feature) =>
          feature.geometry.type === 'Point' &&
          isInBounds(feature.geometry.coordinates as [number, number], bounds),
      )
      .map((feature) => feature.properties);
  }, [data, deferredViewport]);
}
