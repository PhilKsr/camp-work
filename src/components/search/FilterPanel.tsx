'use client';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useFilterStore } from '@/stores/filterStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useCoverageStore } from '@/stores/coverageStore';
import { useViewportCampgrounds } from '@/hooks/useViewportCampgrounds';
import { colors } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { FEATURES, type FeatureConfig } from '@/lib/features';
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

  const {
    isVisible: isCoverageLayerVisible,
    opacity: coverageOpacity,
    toggleVisibility: toggleCoverageLayer,
    setOpacity: setCoverageOpacity,
  } = useCoverageStore();

  const viewportCampgrounds = useViewportCampgrounds();
  const { favorites } = useFavoriteStore();

  // Get available features from viewport campgrounds only
  const availableFeatures = Array.from(
    new Set(viewportCampgrounds?.flatMap((c) => c.features) || []),
  ).sort();

  // Filter feature entries to only show those that exist in viewport data
  const featureEntries = Object.entries(FEATURES).filter(([value]) =>
    availableFeatures.includes(value as CampgroundFeature),
  ) as [CampgroundFeature, FeatureConfig][];

  // Calculate result count - only for viewport campgrounds
  const filteredCount = viewportCampgrounds.filter((c) => {
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
        <SheetTitle>Filter</SheetTitle>
        <SheetDescription>
          Filtere Campingplätze nach deinen Bedürfnissen
        </SheetDescription>
      </SheetHeader>

      <div
        className="flex-1 overflow-y-auto px-6"
        onClick={(e) => e.stopPropagation()}
      >
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

          {/* Netzabdeckung auf Karte */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Netzabdeckung auf Karte
            </Label>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">O2-Layer anzeigen</span>
              <Switch
                checked={isCoverageLayerVisible}
                onCheckedChange={toggleCoverageLayer}
              />
            </div>

            {isCoverageLayerVisible && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Deckkraft</span>
                  <span className="text-xs text-gray-400">
                    {Math.round(coverageOpacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[coverageOpacity]}
                  onValueChange={([v]) => setCoverageOpacity(v)}
                  min={0.1}
                  max={0.8}
                  step={0.05}
                />
              </div>
            )}
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
              {featureEntries.map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${value}`}
                      checked={features.includes(value)}
                      onCheckedChange={() => toggleFeature(value)}
                    />
                    <Label
                      htmlFor={`feature-${value}`}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      {config.label}
                    </Label>
                  </div>
                );
              })}
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
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
        <Button
          className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white cursor-pointer"
          onClick={onClose}
        >
          {filteredCount} Ergebnisse im Kartenbereich
        </Button>
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={resetFilters}
          disabled={activeFilterCount() === 0}
        >
          Filter zurücksetzen
        </Button>
      </div>
    </div>
  );
}

export default function FilterPanel({ children }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'bg-white p-0 overflow-y-auto border-gray-200',
          isMobile ? 'h-[85vh] rounded-t-2xl border-t' : 'w-[380px] border-l',
        )}
      >
        <FilterContent onClose={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
