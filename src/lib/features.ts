import {
  Wifi,
  Zap,
  Dog,
  Droplets,
  Bath,
  Waves,
  ShoppingBag,
  UtensilsCrossed,
  Baby,
  Shirt,
  Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CampgroundFeature } from '@/types/campground';

export interface FeatureConfig {
  icon: LucideIcon;
  label: string;
}

export const FEATURES: Record<CampgroundFeature, FeatureConfig> = {
  wifi: { icon: Wifi, label: 'WiFi' },
  power: { icon: Zap, label: 'Strom' },
  dogs: { icon: Dog, label: 'Hunde' },
  shower: { icon: Droplets, label: 'Dusche' },
  toilet: { icon: Bath, label: 'WC' },
  swimming: { icon: Waves, label: 'Schwimmen' },
  shop: { icon: ShoppingBag, label: 'Einkauf' },
  restaurant: { icon: UtensilsCrossed, label: 'Restaurant' },
  playground: { icon: Baby, label: 'Spielplatz' },
  laundry: { icon: Shirt, label: 'Wäscherei' },
  bbq: { icon: Flame, label: 'Grill' },
  campfire: { icon: Flame, label: 'Lagerfeuer' },
};
