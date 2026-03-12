#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  console.log('📊 Datenbank-Statistiken\n');

  // Campingplätze
  const { data: campgrounds, error: campgroundsError } = await supabase
    .from('campgrounds')
    .select('id, coverage_level', { count: 'exact' });

  if (campgroundsError) {
    console.error('❌ Fehler beim Laden der Campingplätze:', campgroundsError);
    return;
  }

  console.log(`🏕️  Campingplätze: ${campgrounds.length}`);

  // Coverage-Level Verteilung
  const coverageStats = campgrounds.reduce(
    (acc, c) => {
      acc[c.coverage_level] = (acc[c.coverage_level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('\n📶 Coverage-Level Verteilung:');
  Object.entries(coverageStats).forEach(([level, count]) => {
    const percentage = ((count / campgrounds.length) * 100).toFixed(1);
    console.log(`   ${level}: ${count} (${percentage}%)`);
  });

  // Bilder
  const { data: images, error: imagesError } = await supabase
    .from('campground_images')
    .select('campground_id, source', { count: 'exact' });

  if (imagesError) {
    console.error('❌ Fehler beim Laden der Bilder:', imagesError);
    return;
  }

  console.log(`\n🖼️  Bilder gesamt: ${images.length}`);

  // Bilder-Quellen
  const sourceStats = images.reduce(
    (acc, img) => {
      acc[img.source] = (acc[img.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('\n📷 Bilder nach Quelle:');
  Object.entries(sourceStats).forEach(([source, count]) => {
    console.log(`   ${source}: ${count}`);
  });

  // Campingplätze mit Bildern
  const campgroundsWithImages = new Set(images.map((img) => img.campground_id));
  const coveragePercentage = (
    (campgroundsWithImages.size / campgrounds.length) *
    100
  ).toFixed(1);

  console.log(
    `\n✨ Campingplätze mit Bildern: ${campgroundsWithImages.size}/${campgrounds.length} (${coveragePercentage}%)`,
  );

  // Durchschnittliche Bilder pro Campingplatz (mit Bildern)
  const avgImagesPerCampground = (
    images.length / campgroundsWithImages.size
  ).toFixed(1);
  console.log(
    `📸 Ø Bilder pro Campingplatz (mit Bildern): ${avgImagesPerCampground}`,
  );

  console.log('\n🎉 Sprint 9.5 Daten-Pipeline abgeschlossen!');
}

main().catch(console.error);
