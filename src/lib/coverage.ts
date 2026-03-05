export type CoverageLevel = '5g' | '4g' | '3g' | 'none';

interface CoverageCache {
  [key: string]: CoverageLevel;
}

interface GeoJSONFeature {
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    technology: string;
    coverage_level: 'excellent' | 'good' | 'limited' | 'none';
    signal_strength: number;
  };
}

interface BNetzAGeoJSON {
  features: GeoJSONFeature[];
}

// In-memory cache for coverage lookups
const coverageCache: CoverageCache = {};

// Cache for GeoJSON data to avoid repeated fetches
let cachedGeoJson: BNetzAGeoJSON | null = null;

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 1000;

async function loadGeoJson(): Promise<BNetzAGeoJSON> {
  if (!cachedGeoJson) {
    const response = await fetch('/data/coverage-bnetza.geojson');

    if (!response.ok) {
      throw new Error(`Failed to load BNetzA data: ${response.status}`);
    }

    cachedGeoJson = await response.json();
  }

  return cachedGeoJson!;
}

function createCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Get network coverage level at a specific geographic point
 * Uses multiple fallback strategies:
 * 1. Check cache first
 * 2. Sample coverage tile pixel (TODO: implement when O2 tiles are available)
 * 3. Lookup in BNetzA GeoJSON data
 * 4. Fallback to 'none'
 */
export async function getCoverageAtPoint(
  lat: number,
  lng: number,
): Promise<CoverageLevel> {
  const cacheKey = createCacheKey(lat, lng);

  // Check cache first
  if (coverageCache[cacheKey]) {
    return coverageCache[cacheKey];
  }

  let coverage: CoverageLevel = 'none';

  try {
    // Strategy 1: Try BNetzA GeoJSON lookup
    coverage = await lookupBNetzACoverage(lat, lng);

    // Strategy 2: TODO - Canvas pixel sampling for O2 tiles
    // coverage = await sampleCoverageTilePixel(lat, lng);
  } catch (error) {
    console.warn('Coverage lookup failed:', error);
    coverage = 'none';
  }

  // Cache the result (with size limit)
  if (Object.keys(coverageCache).length >= MAX_CACHE_SIZE) {
    // Remove oldest entries (simple FIFO)
    const keys = Object.keys(coverageCache);
    keys.slice(0, 100).forEach((key) => delete coverageCache[key]);
  }

  coverageCache[cacheKey] = coverage;
  return coverage;
}

/**
 * Lookup coverage in BNetzA GeoJSON data
 */
async function lookupBNetzACoverage(
  lat: number,
  lng: number,
): Promise<CoverageLevel> {
  try {
    // Load cached GeoJSON data
    const geoJson = await loadGeoJson();

    // Find the closest coverage point within a reasonable distance
    let bestMatch: { distance: number; level: CoverageLevel } | null = null;
    const maxDistance = 0.05; // ~5km tolerance

    for (const feature of geoJson.features) {
      if (feature.geometry.type !== 'Point') continue;

      const [pointLng, pointLat] = feature.geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow(pointLat - lat, 2) + Math.pow(pointLng - lng, 2),
      );

      if (distance <= maxDistance) {
        const tech = feature.properties.technology;
        const signalStrength = feature.properties.signal_strength;

        // Map technology and signal strength to coverage level
        let level: CoverageLevel = 'none';

        if (signalStrength >= 60) {
          if (tech === '5g') level = '5g';
          else if (tech === '4g') level = '4g';
          else if (tech === '3g') level = '3g';
          else level = 'none';
        } else if (signalStrength >= 30) {
          // Weaker signal - downgrade one level
          if (tech === '5g') level = '4g';
          else if (tech === '4g') level = '3g';
          else level = 'none';
        }

        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = { distance, level };
        }
      }
    }

    return bestMatch?.level || 'none';
  } catch (error) {
    console.warn('BNetzA coverage lookup failed:', error);
    return 'none';
  }
}

/**
 * Clear the coverage cache
 */
export function clearCoverageCache(): void {
  Object.keys(coverageCache).forEach((key) => delete coverageCache[key]);
}

/**
 * Get cache statistics
 */
export function getCoverageStats(): {
  cacheSize: number;
  maxCacheSize: number;
} {
  return {
    cacheSize: Object.keys(coverageCache).length,
    maxCacheSize: MAX_CACHE_SIZE,
  };
}

/**
 * Batch coverage lookup for multiple points
 * More efficient than individual lookups
 */
export async function getCoverageForPoints(
  points: Array<{ lat: number; lng: number; id?: string }>,
): Promise<
  Array<{ lat: number; lng: number; id?: string; coverage: CoverageLevel }>
> {
  const results = [];

  for (const point of points) {
    const coverage = await getCoverageAtPoint(point.lat, point.lng);
    results.push({
      ...point,
      coverage,
    });
  }

  return results;
}

/**
 * Estimate coverage quality based on level
 * Returns a score from 0-100
 */
export function getCoverageScore(level: CoverageLevel): number {
  switch (level) {
    case '5g':
      return 100;
    case '4g':
      return 80;
    case '3g':
      return 40;
    case 'none':
      return 0;
    default:
      return 0;
  }
}

/**
 * Get user-friendly coverage description
 */
export function getCoverageDescription(level: CoverageLevel): string {
  switch (level) {
    case '5g':
      return 'Exzellente Geschwindigkeit';
    case '4g':
      return 'Gut zum Arbeiten';
    case '3g':
      return 'Eingeschränkt';
    case 'none':
      return 'Nicht empfohlen';
    default:
      return 'Unbekannt';
  }
}
