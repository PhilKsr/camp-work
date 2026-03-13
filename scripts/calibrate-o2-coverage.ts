#!/usr/bin/env tsx
import sharp from 'sharp';

const O2_TILES = {
  '5g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_5g/{z}/{x}/{y}.png',
  '4g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_4g/{z}/{x}/{y}.png',
  '3g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_3g/{z}/{x}/{y}.png',
};

const ZOOM = 12;

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

async function getPixel(
  tileUrl: string,
  lat: number,
  lng: number,
): Promise<string> {
  const { x, y } = latLngToTile(lat, lng, ZOOM);
  const { px, py } = latLngToPixelInTile(lat, lng, ZOOM);
  const url = tileUrl
    .replace('{z}', String(ZOOM))
    .replace('{x}', String(x))
    .replace('{y}', String(y));

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return `HTTP ${res.status}`;
    const buffer = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const idx = (py * info.width + px) * info.channels;
    const r = data[idx],
      g = data[idx + 1],
      b = data[idx + 2];
    const a = info.channels >= 4 ? data[idx + 3] : 255;
    return `RGBA(${r},${g},${b},${a})`;
  } catch (e) {
    return `ERROR: ${e}`;
  }
}

async function main() {
  const points = [
    { name: 'Berlin Alexanderplatz', lat: 52.5219, lng: 13.4132, expect: '5G' },
    { name: 'Hamburg HBF', lat: 53.553, lng: 10.0069, expect: '5G/4G' },
    {
      name: 'München Marienplatz',
      lat: 48.1374,
      lng: 11.5755,
      expect: '5G/4G',
    },
    { name: 'Frankfurt HBF', lat: 50.1072, lng: 8.6637, expect: '4G' },
    { name: 'Köln Dom', lat: 50.9413, lng: 6.9583, expect: '4G' },
    { name: 'Gifhorn (Kleinstadt)', lat: 52.4879, lng: 10.5463, expect: '4G' },
    { name: 'Ländlich Niedersachsen', lat: 52.7, lng: 9.5, expect: '4G/2G' },
    { name: 'Ländlich Brandenburg', lat: 52.8, lng: 13.8, expect: '4G/2G' },
    { name: 'Nordsee Küste', lat: 53.95, lng: 8.45, expect: '2G/none' },
    { name: 'Bayerischer Wald', lat: 48.85, lng: 13.35, expect: '4G/2G' },
  ];

  console.log('🎨 O2 Coverage Kalibrierung\n');
  console.log(
    'Standort'.padEnd(30),
    '5G-Layer'.padEnd(25),
    '4G-Layer'.padEnd(25),
    '3G-Layer'.padEnd(25),
    'Erwartet',
  );
  console.log('─'.repeat(130));

  for (const p of points) {
    const [c5g, c4g, c3g] = await Promise.all([
      getPixel(O2_TILES['5g'], p.lat, p.lng),
      getPixel(O2_TILES['4g'], p.lat, p.lng),
      getPixel(O2_TILES['3g'], p.lat, p.lng),
    ]);
    console.log(
      p.name.padEnd(30),
      c5g.padEnd(25),
      c4g.padEnd(25),
      c3g.padEnd(25),
      p.expect,
    );
  }

  console.log('\n📊 Interpretation:');
  console.log('- Farbiger Pixel (Alpha > 50) = Coverage vorhanden');
  console.log('- Transparenter Pixel (Alpha < 50) = Keine Coverage');
  console.log(
    '- Die genaue Farbe (R,G,B) ist weniger wichtig als ob Alpha > 0',
  );
}

main().catch(console.error);
