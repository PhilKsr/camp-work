#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import type { CampgroundGeoJSON } from '@/types/campground';

// Interface for coverage data structure (not directly used but helpful for documentation)

interface CoverageData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      technology: string;
      operator: string;
      coverage_indoor: boolean;
      coverage_outdoor: boolean;
      grid_cell_id: string;
    };
  }>;
}

type CoverageLevel = '5g' | '4g' | '3g' | 'none';

/**
 * Calculate Haversine distance between two points in kilometers
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest coverage point to a campground
 */
function findNearestCoveragePoint(
  campgroundLat: number,
  campgroundLng: number,
  coveragePoints: CoverageData['features'],
): { coverage: CoverageLevel; distance: number } | null {
  let minDistance = Infinity;
  let bestCoverage: CoverageLevel = 'none';

  for (const point of coveragePoints) {
    const [pointLng, pointLat] = point.geometry.coordinates;
    const distance = haversineDistance(
      campgroundLat,
      campgroundLng,
      pointLat,
      pointLng,
    );

    // Only consider points within 2km radius
    if (distance <= 2 && distance < minDistance) {
      minDistance = distance;

      // Map coverage based on technology and location type
      const { technology, coverage_indoor, coverage_outdoor } =
        point.properties;

      if (technology === '5g' && coverage_indoor) {
        bestCoverage = '5g';
      } else if (technology === '5g' && coverage_outdoor) {
        bestCoverage = '4g'; // Outdoor 5G ≈ indoor 4G quality
      } else if (technology === '4g' && coverage_indoor) {
        bestCoverage = '4g';
      } else if (technology === '4g' && coverage_outdoor) {
        bestCoverage = '3g'; // Outdoor only = weaker signal
      } else if (coverage_outdoor) {
        bestCoverage = '3g'; // Any outdoor coverage
      } else {
        bestCoverage = 'none';
      }
    }
  }

  return minDistance < Infinity
    ? { coverage: bestCoverage, distance: minDistance }
    : null;
}

async function main() {
  try {
    console.log('🔄 Enriching campgrounds with coverage data...');

    // Load campgrounds data
    const campgroundsPath = path.join(
      process.cwd(),
      'public/data/campgrounds.geojson',
    );
    const campgroundsData = await fs.readFile(campgroundsPath, 'utf-8');
    const campgrounds: CampgroundGeoJSON = JSON.parse(campgroundsData);

    // Load coverage data
    const coveragePath = path.join(
      process.cwd(),
      'public/data/coverage-telefonica.json',
    );
    const coverageData = await fs.readFile(coveragePath, 'utf-8');
    const coverage: CoverageData = JSON.parse(coverageData);

    console.log(`📥 Processing ${campgrounds.features.length} campgrounds`);
    console.log(`📡 Using ${coverage.features.length} coverage points`);

    let enrichedCount = 0;
    let noMatchCount = 0;

    const coverageLevelStats: Record<CoverageLevel, number> = {
      '5g': 0,
      '4g': 0,
      '3g': 0,
      none: 0,
    };

    // Process each campground
    for (const feature of campgrounds.features) {
      const campground = feature.properties;
      const [lng, lat] = campground.coordinates;

      const result = findNearestCoveragePoint(lat, lng, coverage.features);

      if (result && result.distance <= 2) {
        campground.coverageLevel = result.coverage;
        enrichedCount++;
        coverageLevelStats[result.coverage]++;

        if (result.distance <= 0.5) {
          console.log(
            `  ✅ ${campground.name}: ${result.coverage.toUpperCase()} (${result.distance.toFixed(1)}km)`,
          );
        }
      } else {
        campground.coverageLevel = 'none';
        noMatchCount++;
        coverageLevelStats.none++;
      }

      // Update lastUpdated timestamp
      campground.lastUpdated = new Date().toISOString();
    }

    // Save enriched data back to file
    await fs.writeFile(
      campgroundsPath,
      JSON.stringify(campgrounds, null, 2),
      'utf-8',
    );

    console.log('\n📊 Coverage Enrichment Complete:');
    console.log(`   ✅ Enriched: ${enrichedCount} campgrounds`);
    console.log(`   ⚪ No match: ${noMatchCount} campgrounds`);
    console.log('\n📈 Coverage Distribution:');
    Object.entries(coverageLevelStats).forEach(([level, count]) => {
      const percentage = ((count / campgrounds.features.length) * 100).toFixed(
        1,
      );
      console.log(`   ${level.toUpperCase()}: ${count} (${percentage}%)`);
    });

    console.log(`\n💾 Updated campgrounds saved to: ${campgroundsPath}`);
    console.log('\n📡 Coverage based on Telefónica network data');
    console.log(
      '🗺️  Rural areas may show "none" - WMS map shows complete coverage',
    );
  } catch (error) {
    console.error('❌ Error enriching coverage data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
