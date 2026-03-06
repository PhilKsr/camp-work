'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useFilterStore } from '@/stores/filterStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { colors } from '@/lib/brand';
import type { CampgroundFeature } from '@/types/campground';

interface FilterPanelProps {
  children: React.ReactNode;
}

const COVERAGE_OPTIONS = [
  { value: '5g', label: '5G – Exzellent', color: colors.coverage.excellent },
  {
    value: '4g',
    label: 'LTE/4G – Gut zum Arbeiten',
    color: colors.coverage.good,
  },
  { value: '3g', label: '3G – Eingeschränkt', color: colors.coverage.limited },
  { value: 'none', label: 'Kein Netz', color: colors.coverage.none },
] as const;

const TYPE_OPTIONS = [
  { value: 'camp_site', label: 'Campingplätze' },
  { value: 'caravan_site', label: 'Wohnmobilstellplätze' },
] as const;

const FEATURE_OPTIONS: Array<{
  value: CampgroundFeature;
  label: string;
  icon: string;
}> = [
  { value: 'wifi', label: 'WLAN', icon: '📶' },
  { value: 'power', label: 'Strom', icon: '⚡' },
  { value: 'dogs', label: 'Hunde erlaubt', icon: '🐕' },
  { value: 'shower', label: 'Duschen', icon: '🚿' },
  { value: 'toilet', label: 'Toiletten', icon: '🚽' },
  { value: 'swimming', label: 'Schwimmen', icon: '🏊' },
  { value: 'shop', label: 'Einkaufsmöglichkeit', icon: '🛍️' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'playground', label: 'Spielplatz', icon: '🛝' },
  { value: 'laundry', label: 'Wäscherei', icon: '👕' },
  { value: 'bbq', label: 'Grillplatz', icon: '🔥' },
  { value: 'campfire', label: 'Lagerfeuer', icon: '🔥' },
];

function FilterContent({ onClose }: { onClose?: () => void }) {
  const {
    coverageLevels,
    workFriendlyOnly,
    types,
    features,
    favoritesOnly,
    toggleCoverageLevel,
    setWorkFriendlyOnly,
    toggleType,
    toggleFeature,
    setFavoritesOnly,
    resetFilters,
    activeFilterCount,
  } = useFilterStore();

  const { data: campgroundsData } = useCampgrounds();
  const { favorites } = useFavoriteStore();

  // Get available features from actual data
  const availableFeatures = Array.from(
    new Set(
      campgroundsData?.features?.flatMap((f) => f.properties.features) || [],
    ),
  ).sort();

  // Filter feature options to only show those that exist in data
  const filteredFeatureOptions = FEATURE_OPTIONS.filter((option) =>
    availableFeatures.includes(option.value),
  );

  // Calculate result count
  const campgrounds = campgroundsData?.features?.map((f) => f.properties) || [];
  const filteredCount = campgrounds.filter((c) => {
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
    if (favoritesOnly && !favorites.includes(c.id)) return false;

    return true;
  }).length;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <SheetTitle>Filter</SheetTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <SheetDescription>
          Filtere Campingplätze nach deinen Bedürfnissen
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-6">
          {/* Work-Friendly Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Nur zum Arbeiten geeignet
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="work-friendly"
                checked={workFriendlyOnly}
                onCheckedChange={setWorkFriendlyOnly}
              />
              <Label
                htmlFor="work-friendly"
                className="text-sm text-muted-foreground"
              >
                Mindestens LTE/4G Verbindung
              </Label>
            </div>
          </div>

          <Separator />

          {/* Coverage Levels */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Netzabdeckung</Label>
            <div className="space-y-3">
              {COVERAGE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`coverage-${option.value}`}
                    checked={coverageLevels.includes(option.value)}
                    onCheckedChange={() => toggleCoverageLevel(option.value)}
                    disabled={
                      workFriendlyOnly && !['5g', '4g'].includes(option.value)
                    }
                  />
                  <Label
                    htmlFor={`coverage-${option.value}`}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Campground Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Typ</Label>
            <div className="space-y-3">
              {TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={types.includes(option.value)}
                    onCheckedChange={() => toggleType(option.value)}
                  />
                  <Label htmlFor={`type-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Ausstattung</Label>
            <div className="grid grid-cols-2 gap-3">
              {filteredFeatureOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${option.value}`}
                    checked={features.includes(option.value)}
                    onCheckedChange={() => toggleFeature(option.value)}
                  />
                  <Label
                    htmlFor={`feature-${option.value}`}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Favorites Only */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Favoriten</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="favorites-only"
                checked={favoritesOnly}
                onCheckedChange={setFavoritesOnly}
              />
              <Label
                htmlFor="favorites-only"
                className="text-sm text-muted-foreground"
              >
                Nur gespeicherte Favoriten anzeigen ({favorites.length}{' '}
                gespeichert)
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#E8E4D8] bg-white sticky bottom-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1 sm:flex-initial"
            disabled={activeFilterCount() === 0}
          >
            Filter zurücksetzen
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-[#E19B53] hover:bg-[#C47F35] text-white"
          >
            {filteredCount} Ergebnisse anzeigen
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FilterPanel({ children }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      {/* Desktop */}
      <SheetContent
        side="right"
        className="hidden lg:block w-[380px] bg-white border-l border-[#E8E4D8] p-0 overflow-y-auto"
      >
        <FilterContent onClose={() => setIsOpen(false)} />
      </SheetContent>

      {/* Mobile */}
      <SheetContent
        side="bottom"
        className="lg:hidden h-[85vh] bg-white rounded-t-2xl border-t border-[#E8E4D8] p-0 overflow-y-auto"
      >
        <FilterContent onClose={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
