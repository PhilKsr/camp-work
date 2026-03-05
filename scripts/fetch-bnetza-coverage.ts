#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

// BNetzA Mobile network monitoring data endpoints
// These URLs might need to be updated based on actual BNetzA API
// const BNETZA_API_BASE = 'https://www.breitband-monitor.de/api/v1';
// const COVERAGE_DATA_URL = `${BNETZA_API_BASE}/coverage/telefonica`;

interface CoverageDataPoint {
  lat: number;
  lng: number;
  technology: '2g' | '3g' | '4g' | '5g';
  operator: 'telefonica' | 'telekom' | 'vodafone';
  signal_strength: number; // 0-100
}

interface CoverageGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
    properties: {
      technology: string;
      operator: string;
      signal_strength: number;
      coverage_level: 'excellent' | 'good' | 'limited' | 'none';
    };
  }>;
}

function mapSignalStrengthToCoverage(
  strength: number,
  tech: string,
): 'excellent' | 'good' | 'limited' | 'none' {
  if (strength >= 80 && (tech === '5g' || tech === '4g')) return 'excellent';
  if (strength >= 60) return 'good';
  if (strength >= 30) return 'limited';
  return 'none';
}

async function fetchBNetzACoverage(): Promise<CoverageDataPoint[]> {
  try {
    console.log('Fetching BNetzA coverage data...');

    // For now, generate synthetic data since we can't access the actual API
    // TODO: Replace with actual BNetzA API calls
    console.warn('Using synthetic data - replace with actual BNetzA API');

    const syntheticData: CoverageDataPoint[] = [];

    // Generate sample coverage points for major German cities
    const cities = [
      { name: 'Berlin', lat: 52.52, lng: 13.405 },
      { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
      { name: 'Munich', lat: 48.1351, lng: 11.582 },
      { name: 'Cologne', lat: 50.9375, lng: 6.9603 },
      { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
    ];

    for (const city of cities) {
      // Generate coverage points in a grid around each city
      for (let latOffset = -0.1; latOffset <= 0.1; latOffset += 0.02) {
        for (let lngOffset = -0.1; lngOffset <= 0.1; lngOffset += 0.02) {
          const distance = Math.sqrt(
            latOffset * latOffset + lngOffset * lngOffset,
          );

          // Better coverage closer to city center
          const baseSignal = Math.max(20, 100 - distance * 500);

          // Different technologies with different coverage
          const technologies: Array<'2g' | '3g' | '4g' | '5g'> = [
            '2g',
            '3g',
            '4g',
            '5g',
          ];

          for (const tech of technologies) {
            let signal = baseSignal;

            // Adjust signal based on technology (newer tech has less coverage in rural areas)
            if (tech === '5g') signal *= 0.7;
            else if (tech === '4g') signal *= 0.9;

            // Add some randomness
            signal += (Math.random() - 0.5) * 20;
            signal = Math.max(0, Math.min(100, signal));

            syntheticData.push({
              lat: city.lat + latOffset,
              lng: city.lng + lngOffset,
              technology: tech,
              operator: 'telefonica',
              signal_strength: Math.round(signal),
            });
          }
        }
      }
    }

    console.log(`Generated ${syntheticData.length} synthetic coverage points`);
    return syntheticData;
  } catch (error) {
    console.error('Error fetching BNetzA data:', error);
    return [];
  }
}

function convertToGeoJSON(data: CoverageDataPoint[]): CoverageGeoJSON {
  return {
    type: 'FeatureCollection',
    features: data.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat],
      },
      properties: {
        technology: point.technology,
        operator: point.operator,
        signal_strength: point.signal_strength,
        coverage_level: mapSignalStrengthToCoverage(
          point.signal_strength,
          point.technology,
        ),
      },
    })),
  };
}

async function main() {
  try {
    console.log('🔄 Fetching coverage data from BNetzA...');

    // Fetch the data
    const coverageData = await fetchBNetzACoverage();

    if (coverageData.length === 0) {
      console.error('❌ No coverage data received');
      process.exit(1);
    }

    // Convert to GeoJSON
    const geoJson = convertToGeoJSON(coverageData);

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'src/data');
    await fs.mkdir(dataDir, { recursive: true });

    // Write GeoJSON file
    const outputPath = path.join(dataDir, 'coverage-bnetza.geojson');
    await fs.writeFile(outputPath, JSON.stringify(geoJson, null, 2), 'utf-8');

    console.log(`✅ Coverage data saved to ${outputPath}`);
    console.log(`📊 Generated ${geoJson.features.length} coverage points`);

    // Generate summary statistics
    const techCounts = geoJson.features.reduce(
      (acc, feature) => {
        const tech = feature.properties.technology;
        acc[tech] = (acc[tech] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('📈 Technology distribution:');
    Object.entries(techCounts).forEach(([tech, count]) => {
      console.log(`   ${tech.toUpperCase()}: ${count} points`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
