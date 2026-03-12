import Image from 'next/image';
import { Tent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import type { Campground } from '@/types/campground';
import type { CampgroundImage } from '@/hooks/useBatchCampgroundImages';

interface CampingCardCompactProps {
  campground: Campground;
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
      return '5G';
    case '4g':
      return 'LTE';
    case '3g':
      return '3G';
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
  return (
    <div
      className={cn(
        'w-[180px] h-[140px] flex-shrink-0 rounded-xl overflow-hidden shadow-brand-card cursor-pointer',
        'transition-all duration-200 hover:shadow-brand-card-hover hover:-translate-y-1',
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative h-[80px] bg-gradient-to-br from-[#E19B53] to-[#ABD8EF]">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={campground.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Tent className="w-6 h-6 text-white/80" />
          </div>
        )}

        {/* Coverage Badge - nur für 5g/4g/3g anzeigen, 'none' überspringen */}
        {campground.coverageLevel !== 'none' && (
          <div
            className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{
              backgroundColor: getCoverageColor(campground.coverageLevel),
            }}
          >
            {getCoverageLabel(campground.coverageLevel)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 bg-white">
        <h4 className="font-medium text-xs line-clamp-2 text-foreground leading-tight">
          {campground.name}
        </h4>
      </div>
    </div>
  );
}
