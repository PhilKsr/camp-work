import { useState } from 'react';
import {
  Heart,
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
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import type { Campground } from '@/types/campground';
import type { CampgroundImage } from '@/hooks/useBatchCampgroundImages';

interface CampingCardProps {
  campground: Campground;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  images?: CampgroundImage[];
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
  images = [],
}: CampingCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageUrls = images.map((img) => img.url);
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-2xl cursor-pointer transition-all duration-200',
        'hover:shadow-brand-card-hover hover:-translate-y-1',
      )}
      onClick={onClick}
    >
      {/* Image Carousel */}
      <div className="relative">
        <ImageCarousel
          images={imageUrls}
          alt={campground.name}
          height="h-[180px]"
          showArrows={true}
          onImageClick={(index) => {
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
        />

        {/* Favorite Heart */}
        <button
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors z-10',
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
            className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold text-white z-10"
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

      {/* Lightbox */}
      <ImageLightbox
        images={imageUrls}
        initialIndex={lightboxIndex}
        alt={campground.name}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </Card>
  );
}
