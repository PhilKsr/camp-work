import { Serwist } from 'serwist';
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from 'serwist';

declare const self: {
  __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Map Tiles: Cache aggressively (they change rarely)
    {
      urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: { 
          maxEntries: 500, 
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        },
      },
    },
    // BNetzA WMS Tiles: Cache for 24h
    {
      urlPattern: /^https:\/\/sgx\.geodatenzentrum\.de\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'coverage-tiles',
        expiration: { 
          maxEntries: 300, 
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        },
      },
    },
    // Campground GeoJSON: Network first with cache fallback
    {
      urlPattern: /\/data\/campgrounds\.geojson$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'campground-data',
        expiration: { 
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
      },
    },
    // Default caching for other assets
    ...defaultCache,
  ],
});

serwist.addEventListeners();
