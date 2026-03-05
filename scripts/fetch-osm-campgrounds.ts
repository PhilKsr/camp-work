#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import {
  CampgroundSchema,
  type Campground,
  type CampgroundGeoJSON,
} from '@/types/campground';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const OVERPASS_QUERY = `
[out:json][timeout:300][maxsize:1000000000];
area["ISO3166-1"="DE"]->.searchArea;
(
  node["tourism"="camp_site"]["name"](area.searchArea);
  way["tourism"="camp_site"]["name"](area.searchArea);
  relation["tourism"="camp_site"]["name"](area.searchArea);
  node["tourism"="caravan_site"]["name"](area.searchArea);
  way["tourism"="caravan_site"]["name"](area.searchArea);
  relation["tourism"="caravan_site"]["name"](area.searchArea);
);
out center body;
`;

interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OSMResponse {
  elements: OSMElement[];
}

function mapOSMTags(element: OSMElement): Campground | null {
  const { tags, id } = element;
  if (!tags || !tags.name) return null;

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (!lat || !lon) return null;

  // Build address from OSM tags
  const address =
    [
      tags['addr:street'] && tags['addr:housenumber']
        ? `${tags['addr:street']} ${tags['addr:housenumber']}`
        : tags['addr:street'],
      tags['addr:postcode'],
      tags['addr:city'],
    ]
      .filter(Boolean)
      .join(', ') || null;

  // Map features from OSM tags
  const features: string[] = [];
  if (tags.internet_access === 'wlan' || tags.internet_access === 'yes')
    features.push('wifi');
  if (tags.power_supply === 'yes') features.push('power');
  if (tags.dogs === 'yes' || tags.dogs === 'leashed') features.push('dogs');
  if (tags.shower === 'yes') features.push('shower');
  if (tags.toilets === 'yes') features.push('toilet');
  if (tags.swimming_pool === 'yes') features.push('swimming');
  if (tags.shop === 'yes' || tags.shop === 'nearby') features.push('shop');
  if (tags.restaurant === 'yes') features.push('restaurant');
  if (tags.playground === 'yes') features.push('playground');
  if (tags.laundry === 'yes') features.push('laundry');
  if (tags.bbq === 'yes') features.push('bbq');
  if (tags.campfire === 'yes') features.push('campfire');

  const campground: Campground = {
    id: `osm_${element.type}_${id}`,
    name: tags.name,
    type: tags.tourism === 'caravan_site' ? 'caravan_site' : 'camp_site',
    coordinates: [lon, lat],
    address,
    website: tags.website || tags.url || tags['contact:website'] || null,
    phone: tags.phone || tags['contact:phone'] || null,
    email: tags.email || tags['contact:email'] || null,
    rating: tags.stars ? parseFloat(tags.stars) : null,
    features,
    coverageLevel: 'none', // Will be enriched later
    thumbnail: tags.image || tags.wikimedia_commons || null,
    openingHours: tags.opening_hours || null,
    fee: tags.fee === 'yes' ? true : tags.fee === 'no' ? false : null,
    capacity: tags.capacity ? parseInt(tags.capacity, 10) || null : null,
    source: 'osm',
    osmId: `${element.type}/${id}`,
    lastUpdated: new Date().toISOString(),
  };

  return campground;
}

async function fetchOSMCampgrounds(): Promise<Campground[]> {
  console.log('🔄 Fetching campgrounds from OpenStreetMap Overpass API...');

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: OSMResponse = await response.json();
    console.log(`📥 Received ${data.elements.length} raw OSM elements`);

    const campgrounds: Campground[] = [];
    let validationErrors = 0;

    for (const element of data.elements) {
      try {
        const campground = mapOSMTags(element);
        if (campground) {
          // Validate with Zod
          const validated = CampgroundSchema.parse(campground);
          campgrounds.push(validated);
        }
      } catch (error) {
        validationErrors++;
        console.warn(`⚠️  Skipping invalid campground ${element.id}:`, error);
      }
    }

    console.log(`✅ Processed ${campgrounds.length} valid campgrounds`);
    if (validationErrors > 0) {
      console.log(`⚠️  Skipped ${validationErrors} invalid entries`);
    }

    return campgrounds;
  } catch (error) {
    console.error('❌ Error fetching OSM data:', error);
    throw error;
  }
}

function createGeoJSON(campgrounds: Campground[]): CampgroundGeoJSON {
  return {
    type: 'FeatureCollection',
    features: campgrounds.map((campground) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: campground.coordinates,
      },
      properties: campground,
    })),
  };
}

async function main() {
  try {
    const campgrounds = await fetchOSMCampgrounds();

    if (campgrounds.length === 0) {
      console.error('❌ No campgrounds received');
      process.exit(1);
    }

    // Create GeoJSON
    const geoJson = createGeoJSON(campgrounds);

    // Ensure public/data directory exists
    const dataDir = path.join(process.cwd(), 'public/data');
    await fs.mkdir(dataDir, { recursive: true });

    // Write campgrounds.geojson
    const outputPath = path.join(dataDir, 'campgrounds.geojson');
    await fs.writeFile(outputPath, JSON.stringify(geoJson, null, 2), 'utf-8');

    console.log(`✅ Campgrounds saved to ${outputPath}`);

    // Generate statistics
    const typeStats = campgrounds.reduce(
      (acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const withWebsite = campgrounds.filter((c) => c.website).length;
    const withFeatures = campgrounds.filter(
      (c) => c.features.length > 0,
    ).length;

    console.log('\n📊 Statistics:');
    console.log(`   Total: ${campgrounds.length} campgrounds`);
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type.replace('_', ' ')}: ${count} campgrounds`);
    });
    console.log(`   With website: ${withWebsite} campgrounds`);
    console.log(`   With features: ${withFeatures} campgrounds`);
    console.log('\n🗺️  Data source: © OpenStreetMap contributors');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
