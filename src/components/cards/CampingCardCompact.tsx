import Image from 'next/image';
import {
  Zap,
  Wifi,
  Dog,
  Droplets,
  ShoppingCart,
  Utensils,
  Baby,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import type { Campground, CampgroundFeature } from '@/types/campground';
import type { CampgroundImage } from '@/hooks/useBatchCampgroundImages';

interface CampingCardCompactProps {
  campground: Campground;
  onClick: () => void;
  images?: CampgroundImage[];
}

const FEATURES: Record<
  CampgroundFeature,
  { icon: React.ComponentType<{ className?: string }> }
> = {
  power: { icon: Zap },
  wifi: { icon: Wifi },
  dogs: { icon: Dog },
  shower: { icon: Droplets },
  toilet: { icon: Droplets },
  swimming: { icon: Droplets },
  shop: { icon: ShoppingCart },
  restaurant: { icon: Utensils },
  playground: { icon: Baby },
  laundry: { icon: Droplets },
  bbq: { icon: Flame },
  campfire: { icon: Flame },
};

const CoverageBadge = ({
  level,
  className,
}: {
  level: string;
  className?: string;
}) => (
  <div
    className={cn(
      'px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white',
      className,
    )}
    style={{
      backgroundColor: getCoverageColor(level),
    }}
  >
    {getCoverageLabel(level)}
  </div>
);

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
    case 'none':
      return 'Kein O2';
    default:
      return 'Kein';
  }
};

export function CampingCardCompact({
  campground,
  onClick,
  images = [],
}: CampingCardCompactProps) {
  const firstImage = images[0]?.url;
  const hasImage = !!firstImage;

  return (
    <div
      className="w-[160px] flex-shrink-0 rounded-xl overflow-hidden shadow-sm 
                 border border-gray-100 cursor-pointer hover:shadow-md 
                 transition-shadow active:scale-[0.98]"
      onClick={onClick}
    >
      {hasImage ? (
        /* Mit Bild: Bild oben, Name unten */
        <>
          <div className="relative h-[90px] bg-gray-100">
            <Image
              src={firstImage}
              alt={campground.name}
              fill
              className="object-cover"
            />
            {campground.coverageLevel !== 'none' && (
              <CoverageBadge
                level={campground.coverageLevel}
                className="absolute bottom-1.5 left-1.5"
              />
            )}
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-gray-900 line-clamp-1">
              {campground.name}
            </p>
          </div>
        </>
      ) : (
        /* Ohne Bild: Kompakte Text-Card */
        <div className="p-3 h-[110px] flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
              {campground.name}
            </p>
            <p className="text-[10px] text-gray-500">
              {campground.type === 'caravan_site'
                ? 'Stellplatz'
                : 'Campingplatz'}
            </p>
          </div>
          <div className="flex items-center justify-between">
            {campground.features.length > 0 && (
              <div className="flex gap-1">
                {campground.features.slice(0, 3).map((f) => {
                  const config = FEATURES[f as keyof typeof FEATURES];
                  if (!config) return null;
                  const Icon = config.icon;
                  return <Icon key={f} className="w-3 h-3 text-gray-400" />;
                })}
              </div>
            )}
            {campground.coverageLevel !== 'none' && (
              <CoverageBadge level={campground.coverageLevel} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
