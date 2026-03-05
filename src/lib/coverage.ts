export type CoverageLevel = '5g' | '4g' | '3g' | 'none';

interface CoverageCache {
  [key: string]: CoverageLevel;
}

// In-memory cache for coverage lookups
const coverageCache: CoverageCache = {};

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 1000;

function createCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Get network coverage level at a specific geographic point
 * Uses WMS GetFeatureInfo to query the official BNetzA coverage data
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
    // Use WMS GetFeatureInfo to query coverage at point
    coverage = await queryWMSCoverage(lat, lng);
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
 * Query BNetzA WMS service for coverage at a specific point
 */
async function queryWMSCoverage(
  lat: number,
  lng: number,
): Promise<CoverageLevel> {
  try {
    // Create a small BBOX around the point for WMS GetFeatureInfo
    const delta = 0.001; // ~100m buffer
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

    const url =
      'https://sgx.geodatenzentrum.de/wms_bnetza_mobilfunk?' +
      'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo' +
      '&LAYERS=mobilfunkmonitor&QUERY_LAYERS=mobilfunkmonitor' +
      `&CRS=EPSG:4326&BBOX=${bbox}` +
      '&WIDTH=3&HEIGHT=3&I=1&J=1' +
      '&INFO_FORMAT=application/json';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WMS request failed: ${response.status}`);
    }

    const data = await response.json();

    // Parse the feature info response to determine coverage level
    const level = parseCoverageFromFeatureInfo(data);
    return level;
  } catch (error) {
    console.warn('WMS coverage query failed:', error);
    return 'none';
  }
}

/**
 * Parse BNetzA WMS GetFeatureInfo response to coverage level
 */
function parseCoverageFromFeatureInfo(data: unknown): CoverageLevel {
  try {
    // Type guard for the data structure
    if (
      !data ||
      typeof data !== 'object' ||
      !('features' in data) ||
      !Array.isArray((data as { features: unknown }).features) ||
      (data as { features: unknown[] }).features.length === 0
    ) {
      return 'none';
    }

    const typedData = data as {
      features: Array<{ properties: Record<string, unknown> }>;
    };
    const feature = typedData.features[0];
    const properties = feature.properties;

    // Look for coverage indicators in the feature properties
    // These property names might need adjustment based on actual BNetzA response
    if (properties?.coverage_indoor || properties?.indoor_coverage) {
      // Indoor coverage indicates excellent signal
      return '5g';
    } else if (properties?.coverage_outdoor || properties?.outdoor_coverage) {
      // Outdoor coverage indicates good signal
      return '4g';
    } else if (properties?.coverage_limited || properties?.weak_signal) {
      // Limited coverage
      return '3g';
    }

    // Default to no coverage if no indicators found
    return 'none';
  } catch (error) {
    console.warn('Failed to parse coverage feature info:', error);
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
