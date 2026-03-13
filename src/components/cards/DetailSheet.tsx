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
import { FEATURES } from '@/lib/features';
import { useFavoriteStore } from '@/stores/favoriteStore';
import type { Campground } from '@/types/campground';

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

interface DetailSheetProps {
  campground: Campground;
  onClose: () => void;
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

async function handleShare(campground: Campground) {
  const [lng, lat] = campground.coordinates;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const shareText = [
    campground.name,
    campground.type === 'caravan_site' ? 'Wohnmobilstellplatz' : 'Campingplatz',
    campground.website ? `🌐 ${campground.website}` : null,
    `📍 ${mapsUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  if (navigator.share) {
    try {
      await navigator.share({
        title: campground.name,
        text: shareText,
        url: mapsUrl,
      });
      return;
    } catch {
      // User cancelled – fallthrough to clipboard
    }
  }

  // Fallback: Clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    // Visuelles Feedback: Button-Text kurz ändern
    const button = document.querySelector('[data-share-button]') as HTMLElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Link kopiert';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  } catch {
    // Clipboard nicht verfügbar
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
            <SectionDivider label="Netzabdeckung" />
            {campground.coverageLevel === 'none' ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-200"></div>
                  <span className="text-sm text-gray-500">Kein O2-Netz</span>
                </div>
                <p className="text-sm text-gray-500">
                  Kein O2-Mobilfunk am Standort. Andere Anbieter können
                  verfügbar sein.
                </p>
              </>
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
                      ? 'O2 5G'
                      : campground.coverageLevel === '4g'
                        ? 'O2 LTE'
                        : campground.coverageLevel === '3g'
                          ? 'O2 2G'
                          : 'Kein O2-Netz'}
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
              <SectionDivider label="Ausstattung" />
              <div className="flex flex-wrap gap-2">
                {campground.features.map((f) => {
                  const config = FEATURES[f as keyof typeof FEATURES];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-sm"
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kontakt */}
          <div>
            <SectionDivider label="Kontakt" />
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
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white cursor-pointer"
              onClick={() => openRouteInGoogleMaps(lat, lng)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Route planen
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
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
