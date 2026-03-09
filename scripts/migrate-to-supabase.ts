#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

// Lade Supabase-Credentials aus .env.local
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role für Writes!
);

async function main() {
  // 1. GeoJSON laden
  const geojsonPath = path.join(process.cwd(), 'public/data/campgrounds.geojson');
  const geojson = JSON.parse(await fs.readFile(geojsonPath, 'utf-8'));
  
  // 2. Thumbnails laden
  const thumbnailsPath = path.join(process.cwd(), 'public/data/thumbnails.json');
  let thumbnails: Record<string, string> = {};
  try {
    thumbnails = JSON.parse(await fs.readFile(thumbnailsPath, 'utf-8'));
  } catch { /* keine Thumbnails vorhanden */ }
  
  console.log(`📦 ${geojson.features.length} Campingplätze laden...`);
  console.log(`🖼️  ${Object.keys(thumbnails).length} Thumbnails vorhanden`);
  
  // 3. Campingplätze in Batches importieren
  const BATCH_SIZE = 100;
  const campgrounds = geojson.features.map((f: { geometry: { coordinates: [number, number] }, properties: Record<string, unknown> }) => ({
    id: f.properties.id,
    name: f.properties.name,
    type: f.properties.type,
    location: `POINT(${f.geometry.coordinates[0]} ${f.geometry.coordinates[1]})`,
    address: f.properties.address || null,
    website: f.properties.website || null,
    phone: f.properties.phone || null,
    email: f.properties.email || null,
    rating: f.properties.rating || null,
    features: f.properties.features || [],
    coverage_level: f.properties.coverageLevel || 'none',
    opening_hours: f.properties.openingHours || null,
    fee: f.properties.fee || null,
    capacity: f.properties.capacity || null,
    source: f.properties.source || 'osm',
    osm_id: f.properties.osmId || null,
  }));
  
  let inserted = 0;
  for (let i = 0; i < campgrounds.length; i += BATCH_SIZE) {
    const batch = campgrounds.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('campgrounds').upsert(batch);
    if (error) {
      console.error(`❌ Batch ${i}-${i + batch.length}: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`✅ ${inserted}/${campgrounds.length} importiert`);
    }
  }
  
  // 4. Thumbnails als Images importieren
  const images = Object.entries(thumbnails).map(([campgroundId, thumbPath]) => ({
    campground_id: campgroundId,
    url: thumbPath, // Lokaler Pfad, wird später durch externe URL ersetzt
    source: 'og_image' as const,
    sort_order: 0,
  }));
  
  if (images.length > 0) {
    const { error } = await supabase.from('campground_images').upsert(images, {
      onConflict: 'campground_id,sort_order',
    });
    if (error) {
      console.error(`❌ Image-Import: ${error.message}`);
    } else {
      console.log(`🖼️  ${images.length} Bilder importiert`);
    }
  }
  
  console.log(`\n🎉 Migration abgeschlossen: ${inserted} Campingplätze`);
}

main().catch(console.error);