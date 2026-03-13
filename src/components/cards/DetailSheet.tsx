import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Globe,
  Phone,
  Mail,
  Clock,
  Navigation,
  Share,
} from 'lucide-react';
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

async function handleShare(campground: Campground) {
  const shareData = {
    title: campground.name,
    text: `${campground.name} – Campingplatz mit ${campground.coverageLevel !== 'none' ? campground.coverageLevel.toUpperCase() + ' Netz' : 'Netzabdeckung auf der Karte prüfen'}`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // User cancelled or error - ignore
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.url}`,
      );
      // Quick visual feedback - you could replace this with a proper toast
      const button = document.querySelector(
        '[data-share-button]',
      ) as HTMLElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Link kopiert!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.log('Clipboard copy failed:', error);
    }
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
            className={cn('p-2', isFavorite(campground.id) && 'text-red-500')}
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
          {/* Gallery - nur wenn Bilder vorhanden */}
          {imageUrls.length > 0 && (
            <div className="overflow-hidden rounded-xl">
              <ImageCarousel
                images={imageUrls}
                alt={campground.name}
                height="h-[220px]"
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
          )}

          {/* Name & Type */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {campground.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {campground.type === 'camp_site'
                ? 'Campingplatz'
                : 'Wohnmobilstellplatz'}
              {campground.address && ` · ${campground.address.split(',')[0]}`}
            </p>
          </div>

          {/* Netzabdeckung - Prominent */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              ─── Netzabdeckung ───────────
            </h3>
            {campground.coverageLevel === 'none' ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-200"></div>
                <span className="text-sm text-gray-500">Netz prüfen</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:
                          campground.coverageLevel === '5g'
                            ? '100%'
                            : campground.coverageLevel === '4g'
                              ? '80%'
                              : campground.coverageLevel === '3g'
                                ? '60%'
                                : '0%',
                        backgroundColor: getCoverageColor(
                          campground.coverageLevel,
                        ),
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {campground.coverageLevel === '5g'
                      ? '5G'
                      : campground.coverageLevel === '4g'
                        ? 'LTE/4G'
                        : campground.coverageLevel === '3g'
                          ? '3G'
                          : 'Unbekannt'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {getCoverageDescription(campground.coverageLevel)}
                </p>
              </>
            )}
          </div>

          {/* Ausstattung */}
          {campground.features.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                ─── Ausstattung ────────────
              </h3>
              <div className="flex flex-wrap gap-2">
                {campground.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-[#D8F3DC] text-[#1B4332] rounded-full text-xs font-medium"
                  >
                    {FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS] ||
                      feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kontakt */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              ─── Kontakt ─────────────
            </h3>
            <div className="space-y-3">
              {campground.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={campground.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1B4332] hover:text-[#2D6A4F] hover:underline"
                  >
                    Website besuchen
                  </a>
                </div>
              )}

              {campground.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${campground.phone}`}
                    className="text-sm text-[#1B4332] hover:text-[#2D6A4F] hover:underline"
                  >
                    {campground.phone}
                  </a>
                </div>
              )}

              {campground.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${campground.email}`}
                    className="text-sm text-[#1B4332] hover:text-[#2D6A4F] hover:underline"
                  >
                    {campground.email}
                  </a>
                </div>
              )}

              {campground.openingHours && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {campground.openingHours}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t -mx-4 px-4 py-4 space-y-3">
            <Button
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
              onClick={() => openRouteInGoogleMaps(lat, lng)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Route planen
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => handleShare(campground)}
              data-share-button
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
