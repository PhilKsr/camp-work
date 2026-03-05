import { z } from 'zod';

export const CampgroundFeatureSchema = z.enum([
  'power',
  'wifi',
  'dogs',
  'shower',
  'toilet',
  'swimming',
  'shop',
  'restaurant',
  'playground',
  'laundry',
  'bbq',
  'campfire',
]);

export const CampgroundSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['camp_site', 'caravan_site']),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat] GeoJSON
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  features: z.array(CampgroundFeatureSchema).default([]),
  coverageLevel: z.enum(['5g', '4g', '3g', 'none']).default('none'),
  thumbnail: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  fee: z.boolean().optional().nullable(),
  capacity: z.number().positive().optional().nullable(),
  source: z.literal('osm').default('osm'),
  osmId: z.string().optional(),
  lastUpdated: z.string(),
});

export type Campground = z.infer<typeof CampgroundSchema>;
export type CampgroundFeature = z.infer<typeof CampgroundFeatureSchema>;

export interface CampgroundGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: Campground;
  }>;
}
