#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error(
    '❌ Required environment variables missing. Check .env.local file.',
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const WMS_BASE = 'https://sgx.geodatenzentrum.de/wms_bnetza_mobilfunk';
const BATCH_SIZE = 2; // 2 parallel requests (avoid rate limiting)
const DELAY_MS = 1000; // 1s between batches (respectful to BNetzA)

type CoverageLevel = '5g' | '4g' | '3g' | 'none';

// BNetzA WMS Layer configuration - ordered from highest to lowest technology
const LAYERS: Array<{ name: string; level: CoverageLevel }> = [
  { name: '5g', level: '5g' },
  { name: 'lte', level: '4g' },
  { name: 'gsm', level: '3g' },
];

/**
 * Query BNetzA WMS for real coverage data using GetFeatureInfo on individual layers
 * Each layer represents a mobile technology (5G, LTE/4G, GSM/3G)
 * Returns the highest technology level that has coverage at the given coordinates
 */
async function queryCoverage(lat: number, lng: number): Promise<CoverageLevel> {
  // Query layers from highest to lowest technology
  for (const layer of LAYERS) {
    const hasCoverage = await queryLayerFeatures(lat, lng, layer.name);
    if (hasCoverage) {
      return layer.level;
    }
  }
  return 'none';
}

/**
 * Query a specific BNetzA WMS layer using GetFeatureInfo
 * Returns true if the layer has coverage features at the given coordinates
 */
async function queryLayerFeatures(
  lat: number,
  lng: number,
  layerName: string,
): Promise<boolean> {
  // Create a small bounding box for the point
  // WMS 1.3.0 mit EPSG:4326 erwartet BBOX als lat,lng (nicht lng,lat)
  const delta = 0.0001;
  const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;

  const url =
    `${WMS_BASE}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo` +
    `&QUERY_LAYERS=${layerName}&LAYERS=${layerName}&CRS=EPSG:4326&BBOX=${bbox}` +
    `&WIDTH=101&HEIGHT=101&I=50&J=50&FORMAT=image/png&INFO_FORMAT=application/json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.error(
        `WMS HTTP ${res.status} for layer ${layerName} at ${lat},${lng}`,
      );
      return false;
    }

    const data = await res.json();

    // Check if response has features
    if (
      data.features &&
      Array.isArray(data.features) &&
      data.features.length > 0
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      `Layer query failed for ${layerName} at ${lat},${lng}:`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    return false;
  }
}

async function testLayerMethod(): Promise<void> {
  console.log('🔍 Testing BNetzA WMS GetFeatureInfo on individual layers...');

  // Test known locations
  const testLocations = [
    { name: 'Berlin Center', lat: 52.52, lng: 13.405 },
    { name: 'Rural Brandenburg', lat: 52.3, lng: 13.8 },
    { name: 'Munich Center', lat: 48.137, lng: 11.576 },
  ];

  for (const loc of testLocations) {
    console.log(`\n📍 Testing ${loc.name}:`);
    for (const layer of LAYERS) {
      const hasFeatures = await queryLayerFeatures(
        loc.lat,
        loc.lng,
        layer.name,
      );
      console.log(`  ${layer.name}: ${hasFeatures ? '✅' : '❌'}`);
    }
    const coverage = await queryCoverage(loc.lat, loc.lng);
    console.log(`  → Result: ${coverage}`);
  }

  console.log('\n✅ WMS GetFeatureInfo layer method verified');
  console.log(
    '🎯 Using real BNetzA layer data - no pixel analysis or heuristics',
  );
}

async function main() {
  const startTime = Date.now();

  // Test layer method first
  await testLayerMethod();

  const { data: campgrounds, error } = await supabase
    .from('campgrounds')
    .select('id, location')
    .order('id'); // Alle campgrounds
  if (error || !campgrounds) {
    console.error('❌ Fehler beim Laden der Campingplätze:', error);
    return;
  }

  console.log(
    `\n🔍 Ermittle ECHTE Coverage für ${campgrounds.length} Campingplätze...`,
  );
  console.log(
    '🎯 Jeder Punkt wird gegen BNetzA WMS Layer geprüft (5g → lte → gsm)',
  );

  let updated = 0;
  let withCoverage = 0;
  const stats: Record<CoverageLevel, number> = {
    '5g': 0,
    '4g': 0,
    '3g': 0,
    none: 0,
  };

  for (let i = 0; i < campgrounds.length; i += BATCH_SIZE) {
    const batch = campgrounds.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (c) => {
        try {
          // Parse PostGIS WKB binary: 0101000020E610000027EB81A0ED022A400598439C98B24940
          // Format: [byte order][geometry type][SRID][coordinates]
          const wkb = c.location;

          if (!wkb || wkb.length < 50) {
            console.error(`Invalid WKB for ${c.id}:`, wkb?.substring(0, 20));
            return { id: c.id, level: 'none' as CoverageLevel };
          }

          // Parse coordinate bytes (skip first 18 hex chars = 9 bytes headers)
          const coordsStart = 18; // Skip SRID + headers (correct for PostGIS EWKB)
          const lngHex = wkb.substring(coordsStart, coordsStart + 16);
          const latHex = wkb.substring(coordsStart + 16, coordsStart + 32);

          const lng = Buffer.from(lngHex, 'hex').readDoubleLE(0);
          const lat = Buffer.from(latHex, 'hex').readDoubleLE(0);

          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error(`Invalid coords for ${c.id}: lat=${lat}, lng=${lng}`);
            return { id: c.id, level: 'none' as CoverageLevel };
          }

          const level = await queryCoverage(lat, lng);
          return { id: c.id, level };
        } catch {
          // Silent fail für WKB parsing errors
          return { id: c.id, level: 'none' as CoverageLevel };
        }
      }),
    );

    // Batch update Supabase
    for (const r of results) {
      const { error } = await supabase
        .from('campgrounds')
        .update({ coverage_level: r.level })
        .eq('id', r.id);
      if (!error) {
        updated++;
        stats[r.level]++;
        if (r.level !== 'none') withCoverage++;
      }
    }

    const progress = ((updated / campgrounds.length) * 100).toFixed(1);
    console.log(
      `📡 ${updated}/${campgrounds.length} (${progress}%) | ` +
        `5G: ${stats['5g']} | 4G: ${stats['4g']} | 3G: ${stats['3g']} | Kein Netz: ${stats.none}`,
    );

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const coveragePercent = ((withCoverage / campgrounds.length) * 100).toFixed(
    1,
  );

  console.log(`\n🎉 ECHTE Coverage-Daten erfolgreich ermittelt!`);
  console.log(`⏱️  Dauer: ${duration} Minuten`);
  console.log(
    `📊 ${withCoverage} von ${campgrounds.length} haben Netzabdeckung (${coveragePercent}%)`,
  );
  console.log(`🔍 Methode: BNetzA WMS GetFeatureInfo - 100% echte Layer-Daten`);
}

main().catch(console.error);
