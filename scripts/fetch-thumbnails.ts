#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { createWriteStream } from 'fs';
import sharp from 'sharp';
import type { CampgroundGeoJSON } from '@/types/campground';

interface ThumbnailMapping {
  [campgroundId: string]: string; // path or URL
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const timeout = 5000;

    const request = protocol.get(url, { timeout }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const file = createWriteStream(outputPath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (error) => {
        fs.unlink(outputPath).catch(() => {}); // Clean up on error
        reject(error);
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function extractOgImage(html: string): Promise<string | null> {
  // Simple regex to extract og:image meta tag
  const ogImageRegex =
    /<meta[^>]*property\s*=\s*["\']og:image["\'][^>]*content\s*=\s*["\']([^"']+)["\'][^>]*>/i;
  const match = html.match(ogImageRegex);
  return match ? match[1] : null;
}

async function fetchWebsiteOgImage(url: string): Promise<string | null> {
  try {
    const protocol = url.startsWith('https:') ? https : http;

    return new Promise((resolve) => {
      const request = protocol.get(
        url,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'CampWork Bot (https://campwork.app)',
          },
        },
        (response) => {
          if (response.statusCode !== 200) {
            resolve(null);
            return;
          }

          let html = '';
          response.on('data', (chunk) => {
            html += chunk.toString();
            // Stop reading after we have enough data to find og:image
            if (html.length > 50000) {
              response.destroy();
            }
          });

          response.on('end', () => {
            resolve(extractOgImage(html));
          });

          response.on('error', () => resolve(null));
        },
      );

      request.on('error', () => resolve(null));
      request.on('timeout', () => {
        request.destroy();
        resolve(null);
      });
    });
  } catch (error) {
    console.warn(`⚠️  Error fetching ${url}:`, error);
    return null;
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

    for (const feature of geoJson.features) {
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
          const tempImagePath = path.join(tempDir, `temp_${campground.id}.jpg`);
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
          console.log(`  ✅ Thumbnail saved`);
        } else {
          skippedCount++;
          console.log(`  ⏭️  No image source found`);
        }
      } catch (error) {
        errorCount++;
        console.log(`  ❌ Failed: ${error}`);
      }

      // Rate limit: 500ms pause between requests
      await sleep(500);
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
    await fs.rmdir(tempDir, { recursive: true }).catch(() => {});

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

if (require.main === module) {
  main();
}
