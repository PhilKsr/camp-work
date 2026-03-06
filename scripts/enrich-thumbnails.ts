#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import type { CampgroundGeoJSON } from '../src/types/campground';

interface ThumbnailMapping {
  [campgroundId: string]: string; // path or URL
}

async function main() {
  try {
    console.log('🔄 Enriching campgrounds with thumbnail data...');

    // Load campgrounds data
    const campgroundsPath = path.join(
      process.cwd(),
      'public/data/campgrounds.geojson',
    );
    const campgroundsData = await fs.readFile(campgroundsPath, 'utf-8');
    const campgrounds: CampgroundGeoJSON = JSON.parse(campgroundsData);

    // Load thumbnail mapping
    const thumbnailsPath = path.join(
      process.cwd(),
      'public/data/thumbnails.json',
    );

    let thumbnailMapping: ThumbnailMapping = {};
    try {
      const thumbnailsData = await fs.readFile(thumbnailsPath, 'utf-8');
      thumbnailMapping = JSON.parse(thumbnailsData);
    } catch {
      console.log(`⚠️  No thumbnails.json found at ${thumbnailsPath}`);
      return;
    }

    console.log(`📥 Processing ${campgrounds.features.length} campgrounds`);
    console.log(
      `🖼️  Available thumbnails: ${Object.keys(thumbnailMapping).length}`,
    );

    let enrichedCount = 0;

    // Process each campground
    for (const feature of campgrounds.features) {
      const campground = feature.properties;

      if (thumbnailMapping[campground.id]) {
        campground.thumbnail = thumbnailMapping[campground.id];
        enrichedCount++;
        console.log(`  ✅ ${campground.name}: ${campground.thumbnail}`);
      }

      // Update lastUpdated timestamp if thumbnail was added
      if (campground.thumbnail) {
        campground.lastUpdated = new Date().toISOString();
      }
    }

    // Save enriched data back to file
    await fs.writeFile(
      campgroundsPath,
      JSON.stringify(campgrounds, null, 2),
      'utf-8',
    );

    console.log('\n📊 Thumbnail Enrichment Complete:');
    console.log(`   ✅ Enriched: ${enrichedCount} campgrounds`);
    console.log(
      `   📷 Success rate: ${((enrichedCount / campgrounds.features.length) * 100).toFixed(1)}%`,
    );

    console.log(`\n💾 Updated campgrounds saved to: ${campgroundsPath}`);
  } catch (error) {
    console.error('❌ Error enriching thumbnail data:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
