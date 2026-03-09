#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import type { CampgroundGeoJSON } from '../src/types/campground';

interface ThumbnailMapping {
  [campgroundId: string]: string; // path or URL
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // Erhöht auf 8 Sekunden
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow', // Redirect-Following hinzugefügt
      headers: { 'User-Agent': 'CampWork Bot (https://campwork.app)' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
  } catch (error) {
    await fs.unlink(outputPath).catch(() => {}); // Clean up on error
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function extractOgImage(html: string): Promise<string | null> {
  // Erweiterte Bildersuche mit mehreren Fallback-Strategien

  // 1. og:image
  const ogImageRegex =
    /<meta[^>]*property\s*=\s*["\']og:image["\'][^>]*content\s*=\s*["\']([^"']+)["\'][^>]*>/i;
  let match = html.match(ogImageRegex);
  if (match && match[1]) return match[1];

  // 2. twitter:image
  const twitterImageRegex =
    /<meta[^>]*name\s*=\s*["\']twitter:image["\'][^>]*content\s*=\s*["\']([^"']+)["\'][^>]*>/i;
  match = html.match(twitterImageRegex);
  if (match && match[1]) return match[1];

  // 3. image_src link
  const imageSrcRegex =
    /<link[^>]*rel\s*=\s*["\']image_src["\'][^>]*href\s*=\s*["\']([^"']+)["\'][^>]*>/i;
  match = html.match(imageSrcRegex);
  if (match && match[1]) return match[1];

  // 4. Erstes img im header oder mit hero/banner/header-image class
  const heroImageRegex =
    /<img[^>]*(?:class\s*=\s*["\'][^"']*(?:hero|banner|header-image)[^"']*["\']|(?:(?:in|within)\s+)?header)[^>]*src\s*=\s*["\']([^"']+)["\'][^>]*>/i;
  match = html.match(heroImageRegex);
  if (match && match[1]) return match[1];

  return null;
}

async function fetchWebsiteOgImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // Erhöht auf 8 Sekunden
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow', // Redirect-Following hinzugefügt
      headers: { 'User-Agent': 'CampWork Bot (https://campwork.app)' },
    });

    if (!response.ok || !response.body) return null;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        if (html.length > 50000) {
          await reader.cancel();
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }

    return extractOgImage(html);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.warn(`⚠️  Error fetching ${url}:`, error);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function processImage(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  try {
    await sharp(inputPath)
      .resize(400, 300, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Image processing failed: ${error}`);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    console.log('🔄 Fetching thumbnails for campgrounds...');

    // Load campgrounds data
    const campgroundsPath = path.join(
      process.cwd(),
      'public/data/campgrounds.geojson',
    );
    const campgroundsData = await fs.readFile(campgroundsPath, 'utf-8');
    const geoJson: CampgroundGeoJSON = JSON.parse(campgroundsData);

    console.log(`📥 Processing ${geoJson.features.length} campgrounds`);

    // Ensure directories exist
    const thumbnailsDir = path.join(process.cwd(), 'public/campgrounds');
    const tempDir = path.join(process.cwd(), '.temp');
    await fs.mkdir(thumbnailsDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });

    const thumbnailMapping: ThumbnailMapping = {};
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Verarbeite in Batches von 50 mit Pause dazwischen
    const batchSize = 50;
    const features = geoJson.features;

    for (
      let batchStart = 0;
      batchStart < features.length;
      batchStart += batchSize
    ) {
      const batch = features.slice(batchStart, batchStart + batchSize);
      console.log(
        `📦 Processing batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(features.length / batchSize)} (${batch.length} items)`,
      );

      for (const feature of batch) {
        const campground = feature.properties;
        console.log(`🔍 Processing: ${campground.name}`);

        try {
          let imageUrl: string | null = null;

          // First, check if campground has direct image from OSM
          if (campground.thumbnail) {
            imageUrl = campground.thumbnail;
            console.log(`  📷 Using OSM image: ${imageUrl}`);
          }
          // Then, try to extract og:image from website
          else if (campground.website) {
            console.log(`  🌐 Fetching og:image from: ${campground.website}`);
            imageUrl = await fetchWebsiteOgImage(campground.website);
          }

          if (imageUrl) {
            const tempImagePath = path.join(
              tempDir,
              `temp_${campground.id}.jpg`,
            );
            const outputImagePath = path.join(
              thumbnailsDir,
              `${campground.id}.webp`,
            );

            // Download image
            await downloadImage(imageUrl, tempImagePath);

            // Process and convert to WebP
            await processImage(tempImagePath, outputImagePath);

            // Clean up temp file
            await fs.unlink(tempImagePath).catch(() => {});

            thumbnailMapping[campground.id] =
              `/campgrounds/${campground.id}.webp`;
            successCount++;
            console.log(
              `  ✅ Thumbnail saved (${successCount}/${successCount + errorCount + skippedCount})`,
            );
          } else {
            skippedCount++;
            console.log(`  ⏭️  No image source found`);
          }
        } catch (error) {
          errorCount++;
          console.log(`  ❌ Failed: ${error}`);
        }

        // Rate limit: 1s pause between requests
        await sleep(1000);
      }

      // Pause zwischen Batches
      if (batchStart + batchSize < features.length) {
        console.log('⏸️  Pausing 5 seconds between batches...');
        await sleep(5000);
      }
    }

    // Save thumbnail mapping
    const thumbnailsPath = path.join(
      process.cwd(),
      'public/data/thumbnails.json',
    );
    await fs.writeFile(
      thumbnailsPath,
      JSON.stringify(thumbnailMapping, null, 2),
      'utf-8',
    );

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    console.log('\n📊 Thumbnail Processing Complete:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`\n💾 Thumbnail mapping saved to: ${thumbnailsPath}`);
    console.log(`🖼️  Images saved to: ${thumbnailsDir}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
