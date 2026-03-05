'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const { data: campgroundsData, isLoading } = useCampgrounds();
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
    if (!campgroundsData?.features) return [];

    let campgrounds = campgroundsData.features.map((f) => f.properties);

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
    campgroundsData,
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

  const totalCampgrounds = campgroundsData?.features?.length || 0;

  const handleCampgroundClick = (campground: Campground) => {
    const [lng, lat] = campground.coordinates;
    setSelectedCampground(campground.id);
    flyTo(lat, lng, 14);
  };

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[180px] rounded-2xl" />
              <div className="space-y-2 px-3 pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!filteredAndSortedCampgrounds.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">
          Keine Campingplätze gefunden
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Versuche es mit anderen Suchkriterien oder zoome die Karte heraus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">
          {filteredAndSortedCampgrounds.length} von {totalCampgrounds}{' '}
          Campingplätze
        </h2>

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
                    ease: 'easeOut'
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
