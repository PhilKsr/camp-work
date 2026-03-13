import { useState } from 'react';
import { Heart, Phone, Globe, Mail } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import { FEATURES } from '@/lib/features';
import type { Campground } from '@/types/campground';
import type { CampgroundImage } from '@/hooks/useBatchCampgroundImages';

interface CampingCardProps {
  campground: Campground;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  images?: CampgroundImage[];
}

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
      return 'O2 5G';
    case '4g':
      return 'O2 LTE';
    case '3g':
      return 'O2 2G';
    default:
      return 'Kein O2-Netz';
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
    <div
      className={cn(
        'bg-white rounded-xl overflow-hidden cursor-pointer',
        'shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5',
      )}
      onClick={onClick}
    >
      {/* Bild – NUR wenn vorhanden */}
      {imageUrls.length > 0 && (
        <div className="relative">
          <ImageCarousel
            images={imageUrls}
            alt={campground.name}
            height="h-[160px]"
            showArrows={true}
            onImageClick={(index) => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
          />

          {/* Favorite Heart */}
          <button
            className={cn(
              'absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm transition-colors z-10',
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/30',
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
          </button>
        </div>
      )}

      <div className="p-4 space-y-2.5">
        {/* Header: Name + Favorit (wenn kein Bild) */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
              {campground.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {campground.type === 'camp_site'
                ? 'Campingplatz'
                : 'Wohnmobilstellplatz'}
            </p>
          </div>
          {imageUrls.length === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart
                className={cn(
                  'w-5 h-5',
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300',
                )}
              />
            </button>
          )}
        </div>

        {/* Feature Pills */}
        {campground.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {campground.features.slice(0, 4).map((feature) => {
              const config = FEATURES[feature];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <span
                  key={feature}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-xs"
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              );
            })}
            {campground.features.length > 4 && (
              <span className="text-xs text-gray-400">
                +{campground.features.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Coverage Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width:
                  campground.coverageLevel === '5g'
                    ? '100%'
                    : campground.coverageLevel === '4g'
                      ? '75%'
                      : campground.coverageLevel === '3g'
                        ? '50%'
                        : '0%',
                backgroundColor: getCoverageColor(campground.coverageLevel),
              }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {getCoverageLabel(campground.coverageLevel)}
          </span>
        </div>

        {/* Kontakt Icons */}
        <div className="flex items-center gap-3 text-gray-400">
          {campground.website && <Globe className="w-3.5 h-3.5" />}
          {campground.phone && <Phone className="w-3.5 h-3.5" />}
          {campground.email && <Mail className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Lightbox */}
      {imageUrls.length > 0 && (
        <ImageLightbox
          images={imageUrls}
          initialIndex={lightboxIndex}
          alt={campground.name}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
