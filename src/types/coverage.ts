import { z } from 'zod';

// Network coverage types
export const NetworkProviderSchema = z.enum([
  'telekom',
  'vodafone',
  'o2',
  'plus',
  'other',
]);

export const CoverageTypeSchema = z.enum(['2g', '3g', '4g', '5g', 'wifi']);

export const SignalStrengthSchema = z.enum([
  'none',
  'weak',
  'fair',
  'good',
  'excellent',
]);

export const CoverageDataSchema = z.object({
  id: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  provider: NetworkProviderSchema,
  coverageType: CoverageTypeSchema,
  signalStrength: SignalStrengthSchema,
  speedTest: z
    .object({
      download: z.number().positive(), // Mbps
      upload: z.number().positive(), // Mbps
      ping: z.number().positive(), // ms
      timestamp: z.string().datetime(),
    })
    .optional(),
  lastUpdated: z.string().datetime(),
});

export type NetworkProvider = z.infer<typeof NetworkProviderSchema>;
export type CoverageType = z.infer<typeof CoverageTypeSchema>;
export type SignalStrength = z.infer<typeof SignalStrengthSchema>;
export type CoverageData = z.infer<typeof CoverageDataSchema>;

// Coverage filter types
export const CoverageFilterSchema = z.object({
  providers: z.array(NetworkProviderSchema).optional(),
  coverageTypes: z.array(CoverageTypeSchema).optional(),
  minSignalStrength: SignalStrengthSchema.optional(),
  minDownloadSpeed: z.number().positive().optional(), // Mbps
});

export type CoverageFilter = z.infer<typeof CoverageFilterSchema>;
