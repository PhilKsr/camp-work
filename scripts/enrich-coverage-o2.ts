#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const O2_TILES = {
  '5g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_5g/{z}/{x}/{y}.png',
  '4g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_4g/{z}/{x}/{y}.png',
  '3g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_3g/{z}/{x}/{y}.png',
};

const ZOOM = 12;
const BATCH_SIZE = 10;
const DELAY_MS = 300;

type CoverageLevel = '5g' | '4g' | '3g' | 'none';

// Layer-Reihenfolge: Beste Technologie zuerst
const LAYER_ORDER: Array<{ key: keyof typeof O2_TILES; level: CoverageLevel }> =
  [
    { key: '5g', level: '5g' },
    { key: '4g', level: '4g' },
    { key: '3g', level: '3g' }, // 2G/GSM bei O2 (3G abgeschaltet)
  ];

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

function latLngToPixelInTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const xFloat = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yFloat =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    px: Math.floor((xFloat - Math.floor(xFloat)) * 256),
    py: Math.floor((yFloat - Math.floor(yFloat)) * 256),
  };
}

async function hasCoverage(
  tileUrlTemplate: string,
  lat: number,
  lng: number,
): Promise<boolean> {
  const { x, y } = latLngToTile(lat, lng, ZOOM);
  const { px, py } = latLngToPixelInTile(lat, lng, ZOOM);
  const url = tileUrlTemplate
    .replace('{z}', String(ZOOM))
    .replace('{x}', String(x))
    .replace('{y}', String(y));

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const idx = (py * info.width + px) * info.channels;
    const a = info.channels >= 4 ? data[idx + 3] : 255;
    return a > 50; // Nicht-transparent = Coverage vorhanden
  } catch {
    return false;
  }
}

async function queryCoverage(lat: number, lng: number): Promise<CoverageLevel> {
  for (const layer of LAYER_ORDER) {
    if (await hasCoverage(O2_TILES[layer.key], lat, lng)) {
      return layer.level;
    }
  }
  return 'none';
}

async function main() {
  const { data: campgrounds, error } = await supabase
    .from('campgrounds')
    .select('id, location')
    .order('id');

  if (error || !campgrounds) {
    console.error('❌ Supabase Fehler:', error?.message);
    return;
  }

  console.log(`📡 O2 Coverage für ${campgrounds.length} Campingplätze...\n`);

  let updated = 0;
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
        // Parse location – handle both WKT and WKB formats
        let lng = 0,
          lat = 0;

        // Try WKT format first
        const wktMatch = c.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (wktMatch) {
          lng = parseFloat(wktMatch[1]);
          lat = parseFloat(wktMatch[2]);
        } else if (typeof c.location === 'string' && c.location.length === 50) {
          // WKB format parsing - PostGIS binary with SRID
          try {
            // WKB structure: 01(endian) 20000001(type+SRID) E6100000(SRID=4326) + 2x 8-byte doubles
            const coordsStart = 18; // Skip headers (9 bytes * 2 hex chars)
            const xHex = c.location.substring(coordsStart, coordsStart + 16); // 8 bytes = 16 hex
            const yHex = c.location.substring(
              coordsStart + 16,
              coordsStart + 32,
            ); // 8 bytes = 16 hex

            // Convert hex to little-endian double
            const xBytes = Buffer.from(xHex, 'hex');
            const yBytes = Buffer.from(yHex, 'hex');
            lng = xBytes.readDoubleLE(0);
            lat = yBytes.readDoubleLE(0);

            // Validate coordinates
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              lng = 0;
              lat = 0;
            }
          } catch {
            // Parsing failed, keep lng=0, lat=0
          }
        }

        // Skip invalid coordinates
        if (lat === 0 && lng === 0)
          return { id: c.id, level: 'none' as CoverageLevel };

        return { id: c.id, level: await queryCoverage(lat, lng) };
      }),
    );

    for (const r of results) {
      const { error } = await supabase
        .from('campgrounds')
        .update({ coverage_level: r.level })
        .eq('id', r.id);
      if (!error) {
        updated++;
        stats[r.level]++;
      }
    }

    const pct = ((updated / campgrounds.length) * 100).toFixed(1);
    console.log(
      `📡 ${pct}% (${updated}/${campgrounds.length}) | ` +
        `5G: ${stats['5g']} | 4G: ${stats['4g']} | 3G: ${stats['3g']} | None: ${stats.none}`,
    );

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  const withCoverage = stats['5g'] + stats['4g'] + stats['3g'];
  console.log(`\n🎉 O2 Coverage Enrichment abgeschlossen`);
  console.log(
    `📊 ${withCoverage}/${campgrounds.length} mit O2-Netz (${((withCoverage / campgrounds.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `   5G: ${stats['5g']} | LTE: ${stats['4g']} | 2G: ${stats['3g']} | Kein O2: ${stats.none}`,
  );
}

main().catch(console.error);
