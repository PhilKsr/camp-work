#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Query: Alle camp_site/caravan_site MIT Bild-Tags
const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="DE"]->.a;
(
  node["tourism"="camp_site"]["image"](area.a);
  node["tourism"="caravan_site"]["image"](area.a);
  node["tourism"="camp_site"]["wikimedia_commons"](area.a);
  node["tourism"="caravan_site"]["wikimedia_commons"](area.a);
);
out tags;
`;

interface OSMElement {
  type: string;
  id: number;
  tags?: Record<string, string>;
}

async function wikimediaToDirectUrl(filename: string): Promise<string | null> {
  // Wikimedia Commons filename → direkte Bild-URL
  // Beispiel: "File:Campingplatz.jpg" → https://upload.wikimedia.org/...
  const clean = filename.replace(/^File:/, '').replace(/ /g, '_');
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(clean)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as {
      imageinfo?: Array<{ url: string }>;
    };
    return page?.imageinfo?.[0]?.url || null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🔍 Lade OSM-Einträge mit Bild-Tags...');

  const res = await fetch(OVERPASS_API, {
    method: 'POST',
    body: `data=${encodeURIComponent(QUERY)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const data = await res.json();
  const elements: OSMElement[] = data.elements;

  console.log(`📷 ${elements.length} Einträge mit Bild-Tags gefunden`);

  const images: Array<{
    campground_id: string;
    url: string;
    source: string;
    sort_order: number;
  }> = [];

  for (const el of elements) {
    const osmId = `osm_${el.type}_${el.id}`;

    // Direktes image-Tag
    if (el.tags?.image) {
      images.push({
        campground_id: osmId,
        url: el.tags.image,
        source: 'osm',
        sort_order: 0,
      });
    }

    // Wikimedia Commons
    if (el.tags?.wikimedia_commons) {
      const url = await wikimediaToDirectUrl(el.tags.wikimedia_commons);
      if (url) {
        images.push({
          campground_id: osmId,
          url,
          source: 'wikimedia',
          sort_order: images.some((i) => i.campground_id === osmId) ? 1 : 0,
        });
      }
    }
  }

  console.log(`💾 ${images.length} Bilder zum Importieren...`);

  // Batch-Import
  for (let i = 0; i < images.length; i += 100) {
    const batch = images.slice(i, i + 100);
    const { error } = await supabase.from('campground_images').upsert(batch, {
      onConflict: 'campground_id,sort_order',
      ignoreDuplicates: true,
    });
    if (error) console.error(`❌ Batch: ${error.message}`);
    else console.log(`✅ ${Math.min(i + 100, images.length)}/${images.length}`);
  }

  console.log('🎉 OSM-Bilder Import abgeschlossen');
}

main().catch(console.error);
