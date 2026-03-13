'use client';

import { X } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { FEATURES } from '@/lib/features';

export function ActiveFilters() {
  const {
    coverageLevels,
    types,
    features,
    workFriendlyOnly,
    favoritesOnly,
    toggleCoverageLevel,
    toggleType,
    toggleFeature,
    setWorkFriendlyOnly,
    setFavoritesOnly,
    activeFilterCount,
  } = useFilterStore();

  if (activeFilterCount() === 0) return null;

  const chips: Array<{ label: string; onRemove: () => void }> = [];

  // Coverage Filter Chips
  const defaultCoverage = ['5g', '4g', '3g', 'none'];
  const missingCoverage = defaultCoverage.filter(
    (c) => !coverageLevels.includes(c),
  );
  if (missingCoverage.length > 0) {
    missingCoverage.forEach((c) => {
      chips.push({
        label: `Ohne ${c.toUpperCase()}`,
        onRemove: () => toggleCoverageLevel(c),
      });
    });
  }

  // Type Filter Chips
  if (!types.includes('camp_site')) {
    chips.push({
      label: 'Nur Stellplätze',
      onRemove: () => toggleType('camp_site'),
    });
  }
  if (!types.includes('caravan_site')) {
    chips.push({
      label: 'Nur Campingplätze',
      onRemove: () => toggleType('caravan_site'),
    });
  }

  // Feature Chips
  features.forEach((f) => {
    const config = FEATURES[f as keyof typeof FEATURES];
    if (config) {
      chips.push({ label: config.label, onRemove: () => toggleFeature(f) });
    }
  });

  // Boolean Chips
  if (workFriendlyOnly) {
    chips.push({
      label: 'Work-Friendly',
      onRemove: () => setWorkFriendlyOnly(false),
    });
  }
  if (favoritesOnly) {
    chips.push({
      label: 'Nur Favoriten',
      onRemove: () => setFavoritesOnly(false),
    });
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full 
                     bg-[#D8F3DC] text-[#1B4332] text-xs font-medium 
                     hover:bg-[#95D5B2] transition-colors shrink-0"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}
