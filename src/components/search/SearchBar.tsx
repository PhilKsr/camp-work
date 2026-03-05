'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useSearch, useDebounce } from '@/hooks/useSearch';
import { useMapStore } from '@/stores/mapStore';
import { useFilterStore } from '@/stores/filterStore';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';
import type { Campground } from '@/types/campground';

interface SearchResultItemProps {
  campground: Campground;
  onClick: () => void;
}

function SearchResultItem({ campground, onClick }: SearchResultItemProps) {
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
        return '4G';
      case '3g':
        return '3G';
      default:
        return 'Kein Netz';
    }
  };

  const getTypeLabel = (type: string): string => {
    return type === 'caravan_site' ? 'Stellplatz' : 'Campingplatz';
  };

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {campground.name}
            </h4>
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor:
                  getCoverageColor(campground.coverageLevel) + '20',
              }}
            >
              {getCoverageLabel(campground.coverageLevel)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(campground.type)}
            </Badge>
            {campground.address && (
              <span className="truncate">{campground.address}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

interface SearchResultsProps {
  query: string;
  results: Campground[];
  onSelect: (campground: Campground) => void;
}

function SearchResults({ query, results, onSelect }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        Suche nach Name oder Ort...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        Keine Ergebnisse für &quot;{query}&quot;
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {results.map((campground) => (
        <SearchResultItem
          key={campground.id}
          campground={campground}
          onClick={() => onSelect(campground)}
        />
      ))}
    </div>
  );
}

interface SearchBarDesktopProps {
  className?: string;
}

function SearchBarDesktop({ className }: SearchBarDesktopProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data: campgroundsData } = useCampgrounds();
  const { setSelectedCampground, flyTo } = useMapStore();
  const { setSearchQuery } = useFilterStore();

  const campgrounds = campgroundsData?.features?.map((f) => f.properties) || [];
  const searchResults = useSearch(debouncedQuery, campgrounds);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleSelect = (campground: Campground) => {
    const [lng, lat] = campground.coordinates;
    setSelectedCampground(campground.id);
    flyTo(lat, lng, 14);
    setIsOpen(false);
    setQuery('');
    setSearchQuery(''); // Clear search filter
  };

  // Sync debounced query with filter store
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Suche Campingplätze..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 rounded-full border-gray-200 focus:border-primary-warmGold focus:ring-primary-warmGold"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-hidden">
          <div className="overflow-y-auto max-h-80">
            <SearchResults
              query={debouncedQuery}
              results={searchResults}
              onSelect={handleSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchBarMobileProps {
  className?: string;
}

function SearchBarMobile({ className }: SearchBarMobileProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data: campgroundsData } = useCampgrounds();
  const { setSelectedCampground, flyTo } = useMapStore();
  const { setSearchQuery } = useFilterStore();

  const campgrounds = campgroundsData?.features?.map((f) => f.properties) || [];
  const searchResults = useSearch(debouncedQuery, campgrounds);

  // Sync debounced query with filter store
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  const handleSelect = (campground: Campground) => {
    const [lng, lat] = campground.coordinates;
    setSelectedCampground(campground.id);
    flyTo(lat, lng, 14);
    setIsOpen(false);
    setQuery('');
    setSearchQuery(''); // Clear search filter
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('rounded-full', className)}
        >
          <Search className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Suche Campingplätze..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="pl-10 border-0 focus:ring-0 text-base"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <SearchResults
            query={debouncedQuery}
            results={searchResults}
            onSelect={handleSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  return (
    <>
      {/* Desktop */}
      <SearchBarDesktop className={cn('hidden lg:block', className)} />

      {/* Mobile */}
      <SearchBarMobile className={cn('lg:hidden', className)} />
    </>
  );
}
