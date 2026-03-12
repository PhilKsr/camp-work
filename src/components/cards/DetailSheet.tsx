import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Globe,
  Phone,
  Mail,
  Clock,
  Signal,
  Navigation,
  Share,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { useCampgroundImages } from '@/hooks/useCampgroundImages';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import { getCoverageDescription } from '@/lib/coverage';
import { useFavoriteStore } from '@/stores/favoriteStore';
import type { Campground } from '@/types/campground';

interface DetailSheetProps {
  campground: Campground;
  onClose: () => void;
}

const FEATURE_LABELS = {
  wifi: 'WLAN',
  power: 'Strom',
  dogs: 'Hunde erlaubt',
  shower: 'Duschen',
  toilet: 'Toiletten',
  swimming: 'Schwimmbad',
  shop: 'Einkaufen',
  restaurant: 'Restaurant',
  playground: 'Spielplatz',
  laundry: 'Wäscherei',
  bbq: 'Grillplatz',
  campfire: 'Lagerfeuer',
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

const getCoverageIcon = (level: string): string => {
  switch (level) {
    case '5g':
      return '📶 5G verfügbar';
    case '4g':
      return '📱 LTE verfügbar';
    case '3g':
      return '📡 3G verfügbar';
    default:
      return '❓ Netzabdeckung unbekannt';
  }
};

async function handleShare(campground: Campground) {
  const shareData = {
    title: campground.name,
    text: `${campground.name} - ${campground.type === 'camp_site' ? 'Campingplatz' : 'Wohnmobilstellplatz'}`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`,
      );
      // Could show a toast notification here
    }
  } catch (error) {
    console.log('Sharing failed:', error);
  }
}

function openRouteInGoogleMaps(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function DetailSheet({ campground, onClose }: DetailSheetProps) {
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { data: images } = useCampgroundImages(campground.id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lng, lat] = campground.coordinates;

  const imageUrls = images?.map((img) => img.url) || [];

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold text-lg line-clamp-1 flex-1">
              {campground.name}
            </h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(campground.id)}
            className={cn('p-2', isFavorite(campground.id) && 'text-[#E19B53]')}
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite(campground.id) && 'fill-current',
              )}
            />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Gallery */}
          <Card className="overflow-hidden">
            <div className="relative">
              <ImageCarousel
                images={imageUrls}
                alt={campground.name}
                height="h-[250px]"
                showArrows={true}
                onImageClick={(index) => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              />

              {/* Bildzähler oben rechts */}
              {imageUrls.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {imageUrls.length} Fotos
                </div>
              )}
            </div>
          </Card>

          {/* Coverage Section */}
          <Card className="p-4">
            {campground.coverageLevel === 'none' ? (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Signal className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Netzabdeckung unbekannt</p>
                  <p className="text-xs text-muted-foreground">
                    Prüfe den Coverage-Layer auf der Karte für diesen Standort
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor: `${getCoverageColor(campground.coverageLevel)}20`,
                  }}
                >
                  <Signal
                    className="w-5 h-5"
                    style={{
                      color: getCoverageColor(campground.coverageLevel),
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">
                    {getCoverageIcon(campground.coverageLevel)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getCoverageDescription(campground.coverageLevel)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Info Section */}
          <Card className="p-4 space-y-4">
            <h3 className="font-medium">Kontakt & Informationen</h3>

            {campground.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <p className="text-sm">{campground.address}</p>
              </div>
            )}

            {campground.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 mt-1 text-muted-foreground" />
                <a
                  href={campground.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#ABD8EF] hover:text-[#6AA3C9] hover:underline"
                >
                  Website besuchen
                </a>
              </div>
            )}

            {campground.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                <a
                  href={`tel:${campground.phone}`}
                  className="text-sm text-[#ABD8EF] hover:text-[#6AA3C9] hover:underline"
                >
                  {campground.phone}
                </a>
              </div>
            )}

            {campground.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                <a
                  href={`mailto:${campground.email}`}
                  className="text-sm text-[#ABD8EF] hover:text-[#6AA3C9] hover:underline"
                >
                  {campground.email}
                </a>
              </div>
            )}

            {campground.openingHours && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                <p className="text-sm">{campground.openingHours}</p>
              </div>
            )}
          </Card>

          {/* Features */}
          {campground.features.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Ausstattung</h3>
              <div className="flex flex-wrap gap-2">
                {campground.features.map((feature) => (
                  <div
                    key={feature}
                    className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium"
                  >
                    {FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS] ||
                      feature}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t -mx-4 px-4 py-4 space-y-3">
            <Button
              className="w-full bg-[#E19B53] hover:bg-[#C47F35] text-white"
              onClick={() => openRouteInGoogleMaps(lat, lng)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Route planen
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleShare(campground)}
            >
              <Share className="w-4 h-4 mr-2" />
              Teilen
            </Button>
          </div>

          {/* Lightbox */}
          <ImageLightbox
            images={imageUrls}
            initialIndex={lightboxIndex}
            alt={campground.name}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </div>
      </motion.div>
    </div>
  );
}
