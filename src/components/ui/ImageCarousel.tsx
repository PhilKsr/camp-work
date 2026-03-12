'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Tent } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  height?: string;
  showDots?: boolean;
  showArrows?: boolean;
  onImageClick?: (index: number) => void;
  className?: string;
}

export function ImageCarousel({
  images,
  alt,
  height = 'h-[200px]',
  showDots = true,
  showArrows = true,
  onImageClick,
  className,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageStates, setImageStates] = useState<
    Record<number, 'loading' | 'loaded' | 'error'>
  >({});

  const touchStart = useRef(0);
  const touchDelta = useRef(0);

  const handleImageLoad = useCallback((index: number) => {
    setImageStates((prev) => ({ ...prev, [index]: 'loaded' }));
  }, []);

  const handleImageError = useCallback((index: number) => {
    setImageStates((prev) => ({ ...prev, [index]: 'error' }));
  }, []);

  const prev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    e.stopPropagation();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStart.current;
    e.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current > 0) prev();
      else next();
    }
    touchDelta.current = 0;
  }, [prev, next]);

  const handleImageClick = useCallback(() => {
    onImageClick?.(currentIndex);
  }, [onImageClick, currentIndex]);

  // Fallback: Brand-Gradient mit Zelt-Icon
  if (!images.length) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg bg-gradient-to-br from-[#E19B53] to-[#ABD8EF] flex items-center justify-center',
          height,
          className,
        )}
      >
        <Tent className="w-8 h-8 text-white/80" />
      </div>
    );
  }

  const maxDots = Math.min(images.length, 5);
  const showDotsActual = showDots && images.length > 1;

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg', height, className)}
    >
      {/* Images Container */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((url, index) => {
          const state = imageStates[index];
          const shouldLoad = Math.abs(index - currentIndex) <= 1; // Current + next/prev

          return (
            <div
              key={`${url}-${index}`}
              className="flex-shrink-0 w-full h-full relative bg-gradient-to-br from-[#E19B53] to-[#ABD8EF] cursor-pointer"
              onClick={handleImageClick}
            >
              {shouldLoad && (
                <img
                  src={url}
                  alt={`${alt} ${index + 1}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  className={cn(
                    'object-cover w-full h-full transition-opacity duration-300',
                    state === 'loaded' ? 'opacity-100' : 'opacity-0',
                  )}
                />
              )}

              {/* Loading state - show gradient */}
              {(!shouldLoad || state !== 'loaded') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Tent className="w-6 h-6 text-white/60" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Desktop only) */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDotsActual && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: maxDots }, (_, i) => {
            const dotIndex =
              maxDots === images.length
                ? i
                : Math.floor((i / (maxDots - 1)) * (images.length - 1));
            const isActive = currentIndex === dotIndex;

            return (
              <button
                key={i}
                onClick={() => goToSlide(dotIndex)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  isActive ? 'bg-white' : 'bg-white/50',
                )}
                aria-label={`Bild ${dotIndex + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
