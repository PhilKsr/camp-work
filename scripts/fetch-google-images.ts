#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BATCH_SIZE = 5;
const BATCH_DELAY = 200; // 5 requests/sec = ~$0.16/sec
const MAX_PHOTOS_PER_PLACE = 5;

interface PlaceSearchResult {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    photos?: Array<{
      name: string;
      widthPx: number;
      heightPx: number;
    }>;
  }>;
}

async function searchPlace(
  name: string,
  lat: number,
  lng: number,
): Promise<string | null> {
  // Places API (New): Text Search
  const res = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
      },
      body: JSON.stringify({
        textQuery: name,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 5000,
          },
        },
        maxResultCount: 1,
      }),
    },
  );

  if (!res.ok) {
    console.warn(`⚠️  Places Search Error: ${res.status}`);
    return null;
  }

  const data: PlaceSearchResult = await res.json();
  return data.places?.[0]?.id || null;
}

function getPhotoUrl(photoName: string, maxWidth = 600): string {
  // Places API (New): Photo URL
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;
}

async function main() {
  // Lade Campingplätze die NOCH KEINE Bilder haben (oder weniger als MAX)
  const { data: existingImages } = await supabase
    .from('campground_images')
    .select('campground_id');

  const existingSet = new Set(
    existingImages?.map((r) => r.campground_id) || [],
  );

  const { data: campgrounds, error } = await supabase
    .from('campgrounds')
    .select('id, name, location')
    .order('name');

  if (error || !campgrounds) {
    console.error('Fehler:', error);
    return;
  }

  const toProcess = campgrounds.filter((c) => !existingSet.has(c.id));
  console.log(`🔍 ${toProcess.length} Campingplätze ohne Bilder...`);

  let found = 0;
  let cost = 0;

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);

    for (const c of batch) {
      // Parse location
      const match = c.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (!match) continue;
      const lng = parseFloat(match[1]);
      const lat = parseFloat(match[2]);

      // Text Search ($0.032)
      cost += 0.032;
      const placeId = await searchPlace(c.name, lat, lng);
      if (!placeId) continue;

      // Get Place Details with photos ($0.017)
      cost += 0.017;
      const detailRes = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?languageCode=de`,
        {
          headers: {
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'photos',
          },
        },
      );
      if (!detailRes.ok) continue;
      const detailData = await detailRes.json();

      const photos = (detailData.photos || []).slice(0, MAX_PHOTOS_PER_PLACE);
      if (photos.length === 0) continue;

      // Speichere Photo URLs
      const images = photos.map(
        (
          photo: { name: string; widthPx: number; heightPx: number },
          idx: number,
        ) => ({
          campground_id: c.id,
          url: getPhotoUrl(photo.name),
          source: 'google_places' as const,
          sort_order: idx,
          width: photo.widthPx,
          height: photo.heightPx,
        }),
      );

      cost += photos.length * 0.007;

      const { error } = await supabase.from('campground_images').insert(images);
      if (!error) found += images.length;
    }

    console.log(
      `📸 ${found} Bilder (${i + batch.length}/${toProcess.length}) | Kosten: ${cost.toFixed(2)}`,
    );

    // Budget-Check: Stoppe bei $190 (Sicherheitsmarge)
    if (cost > 190) {
      console.warn('⚠️  Budget-Limit erreicht ($190)! Stoppe.');
      break;
    }

    await new Promise((r) => setTimeout(r, BATCH_DELAY));
  }

  console.log(
    `\n🎉 Google Places abgeschlossen: ${found} Bilder, Kosten: ${cost.toFixed(2)}`,
  );
}

main().catch(console.error);
