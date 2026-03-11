#!/usr/bin/env tsx
import { execSync } from 'child_process';

console.log('=== BILDER-PIPELINE START ===\n');

console.log('1️⃣  OSM Bild-Tags...');
execSync('pnpm fetch:osm-images', { stdio: 'inherit' });

console.log('\n2️⃣  Website og:image Scraping...');
execSync('pnpm fetch:website-images', { stdio: 'inherit' });

console.log('\n3️⃣  Google Places Photos...');
execSync('pnpm fetch:google-images', { stdio: 'inherit' });

console.log('\n=== BILDER-PIPELINE ABGESCHLOSSEN ===');
