'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useViewportCampgrounds } from '@/hooks/useViewportCampgrounds';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CampingCard } from './CampingCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Campground, CampgroundFeature } from '@/types/campground';

type SortOption = 'coverage' | 'name' | 'distance';

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getCoverageScore(level: string): number {
  switch (level) {
    case '5g':
      return 4;
    case '4g':
      return 3;
    case '3g':
      return 2;
    default:
      return 1;
  }
}

export function CampingList() {
  const [sortBy, setSortBy] = useState<SortOption>('coverage');
  const { data: campgroundsData, isLoading, isError } = useCampgrounds();
  const viewportCampgrounds = useViewportCampgrounds();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const {
    searchQuery,
    coverageLevels,
    workFriendlyOnly,
    types,
    features,
    favoritesOnly,
  } = useFilterStore();
  const { setSelectedCampground, flyTo } = useMapStore();
  const { latitude, longitude } = useGeolocation();

  const userPosition = useMemo(() => {
    return latitude && longitude ? { lat: latitude, lng: longitude } : null;
  }, [latitude, longitude]);

  const filteredAndSortedCampgrounds = useMemo(() => {
    if (!viewportCampgrounds.length) return [];

    let campgrounds = viewportCampgrounds;

    // Apply filters
    campgrounds = campgrounds.filter((c) => {
      // Search query filter
      if (searchQuery && searchQuery.length >= 2) {
        const lower = searchQuery.toLowerCase();
        const matchesSearch =
          c.name.toLowerCase().includes(lower) ||
          (c.address && c.address.toLowerCase().includes(lower));
        if (!matchesSearch) return false;
      }

      // Coverage filter
      if (!coverageLevels.includes(c.coverageLevel)) return false;

      // Work-friendly filter
      if (workFriendlyOnly && !['5g', '4g'].includes(c.coverageLevel))
        return false;

      // Type filter
      if (!types.includes(c.type)) return false;

      // Feature filter
      if (
        features.length > 0 &&
        !features.every((f) => c.features.includes(f as CampgroundFeature))
      )
        return false;

      // Favorites filter
      if (favoritesOnly && !isFavorite(c.id)) return false;

      return true;
    });

    // Apply sorting
    return [...campgrounds].sort((a, b) => {
      switch (sortBy) {
        case 'coverage':
          return (
            getCoverageScore(b.coverageLevel) -
            getCoverageScore(a.coverageLevel)
          );

        case 'name':
          return a.name.localeCompare(b.name, 'de');

        case 'distance':
          if (!userPosition) return 0;
          const distA = calculateDistance(
            userPosition.lat,
            userPosition.lng,
            a.coordinates[1],
            a.coordinates[0],
          );
          const distB = calculateDistance(
            userPosition.lat,
            userPosition.lng,
            b.coordinates[1],
            b.coordinates[0],
          );
          return distA - distB;

        default:
          return 0;
      }
    });
  }, [
    viewportCampgrounds,
    sortBy,
    userPosition,
    searchQuery,
    coverageLevels,
    workFriendlyOnly,
    types,
    features,
    favoritesOnly,
    isFavorite,
  ]);

  const totalCampgrounds = viewportCampgrounds.length;

  const handleCampgroundClick = (campground: Campground) => {
    const [lng, lat] = campground.coordinates;
    setSelectedCampground(campground.id);
    flyTo(lat, lng, 14);
  };

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Show skeleton loading while data is loading OR viewport has no data yet
  if (isLoading || (!viewportCampgrounds.length && campgroundsData)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <Skeleton className="h-[140px] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && filteredAndSortedCampgrounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">
          Keine Campingplätze hier
        </h3>
        <p className="text-sm text-gray-500 max-w-[240px]">
          Verschiebe die Karte oder zoome heraus um Campingplätze zu finden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Supabase Error State */}
      {isError && (
        <div className="mx-4 my-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            Offline-Modus: Zeige gespeicherte Daten.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{totalCampgrounds}</span>{' '}
          Plätze im Kartenbereich
        </p>

        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coverage">Netzqualität</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            {userPosition && (
              <SelectItem value="distance">Entfernung</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Campground List */}
      <div className="space-y-3">
        {filteredAndSortedCampgrounds.map((campground, index) => (
          <motion.div
            key={campground.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    delay: Math.min(index, 20) * 0.03, // Limit animation delay to first 20 items
                    duration: 0.3,
                    ease: 'easeOut',
                  }
            }
          >
            <CampingCard
              campground={campground}
              isFavorite={isFavorite(campground.id)}
              onToggleFavorite={() => toggleFavorite(campground.id)}
              onClick={() => handleCampgroundClick(campground)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
