import Image from 'next/image';
import {
  Heart,
  Tent,
  Wifi,
  Zap,
  Dog,
  Droplets,
  Phone,
  Globe,
  UtensilsCrossed,
  ShoppingBag,
  Flame,
  Baby,
  Shirt,
  Bath,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import type { Campground } from '@/types/campground';

interface CampingCardProps {
  campground: Campground;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

const FEATURE_ICONS = {
  wifi: Wifi,
  power: Zap,
  dogs: Dog,
  shower: Droplets,
  toilet: Bath,
  swimming: Droplets,
  shop: ShoppingBag,
  restaurant: UtensilsCrossed,
  playground: Baby,
  laundry: Shirt,
  bbq: Flame,
  campfire: Flame,
} as const;

const getCoverageColor = (level: string): string => {
  switch (level) {
    case '5g':
      return colors.coverage.excellent;
    case '4g':
      return colors.coverage.good;
    case '3g':
      return colors.coverage.limited;
    default:
      return colors.coverage.none;
  }
};

const getCoverageLabel = (level: string): string => {
  switch (level) {
    case '5g':
      return '5G';
    case '4g':
      return 'LTE';
    case '3g':
      return '3G';
    default:
      return 'Kein';
  }
};

export function CampingCard({
  campground,
  isFavorite,
  onToggleFavorite,
  onClick,
}: CampingCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-2xl cursor-pointer transition-all duration-200',
        'hover:shadow-brand-card-hover hover:-translate-y-1',
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative h-[180px] bg-gradient-to-br from-brand-warm-gold to-brand-sky-blue">
        {campground.thumbnail ? (
          <Image
            src={campground.thumbnail}
            alt={campground.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Tent className="w-12 h-12 text-white/80" />
          </div>
        )}

        {/* Favorite Heart */}
        <button
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors',
            isFavorite
              ? 'bg-[#E19B53]/90 text-white'
              : 'bg-white/20 text-white hover:bg-white/30',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
        </button>

        {/* Coverage Badge - nur für 5g/4g/3g anzeigen, 'none' überspringen */}
        {campground.coverageLevel !== 'none' && (
          <div
            className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{
              backgroundColor: getCoverageColor(campground.coverageLevel),
            }}
          >
            {getCoverageLabel(campground.coverageLevel)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name and Type */}
        <div className="space-y-1">
          <h3 className="font-semibold text-sm line-clamp-1">
            {campground.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {campground.type === 'camp_site'
              ? 'Campingplatz'
              : 'Wohnmobilstellplatz'}
          </p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-2 text-muted-foreground">
          {campground.features.slice(0, 4).map((feature) => {
            const Icon = FEATURE_ICONS[feature as keyof typeof FEATURE_ICONS];
            return Icon ? <Icon key={feature} className="w-3.5 h-3.5" /> : null;
          })}
          {campground.features.length > 4 && (
            <span className="text-xs">+{campground.features.length - 4}</span>
          )}
        </div>

        {/* Rating */}
        {campground.rating && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-xs',
                    i < Math.floor(campground.rating!)
                      ? 'text-[#E19B53]'
                      : 'text-gray-300',
                  )}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {campground.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center gap-3 text-muted-foreground">
          {campground.phone && <Phone className="w-3.5 h-3.5" />}
          {campground.website && <Globe className="w-3.5 h-3.5" />}
        </div>
      </div>
    </Card>
  );
}
