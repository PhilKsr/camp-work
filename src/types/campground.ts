import { z } from 'zod';

// Campground type definitions
export const CampgroundSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  amenities: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).optional(),
  priceRange: z.enum(['free', 'budget', 'moderate', 'premium']).optional(),
  capacity: z.number().positive().optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime(),
});

export type Campground = z.infer<typeof CampgroundSchema>;

// Search and filter types
export const FilterSchema = z.object({
  priceRange: z.array(CampgroundSchema.shape.priceRange).optional(),
  amenities: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  maxDistance: z.number().positive().optional(), // in km
});

export type Filter = z.infer<typeof FilterSchema>;

// Map bounds type
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
