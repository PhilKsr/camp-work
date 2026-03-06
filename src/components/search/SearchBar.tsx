'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useGeocodingSearch,
  type GeocodingResult,
} from '@/hooks/useGeocodingSearch';
import { useMapStore } from '@/stores/mapStore';
import { cn } from '@/lib/utils';

interface SearchResultItemProps {
  place: GeocodingResult;
  onClick: () => void;
}

function SearchResultItem({ place, onClick }: SearchResultItemProps) {
  const getPlaceTypeLabel = (type: string): string => {
    switch (type) {
      case 'city':
        return 'Stadt';
      case 'town':
        return 'Ort';
      case 'village':
        return 'Dorf';
      case 'address':
        return 'Adresse';
      default:
        return 'Ort';
    }
  };

  // Extract main place name and region from display name
  const formatDisplayName = (
    displayName: string,
  ): { name: string; region: string } => {
    const parts = displayName.split(', ');
    const name = parts[0] || displayName;
    const region = parts.slice(1, 3).join(', '); // Take next 1-2 parts as region
    return { name, region };
  };

  const { name, region } = formatDisplayName(place.displayName);

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-[#F9F8E6] focus:bg-[#F9F8E6] focus:outline-none"
    >
      <div className="flex items-center gap-3">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate">{name}</h4>
            <Badge variant="outline" className="text-xs">
              {getPlaceTypeLabel(place.type)}
            </Badge>
          </div>
          {region && (
            <p className="text-sm text-muted-foreground truncate">{region}</p>
          )}
        </div>
      </div>
    </button>
  );
}

interface SearchResultsProps {
  query: string;
  results: GeocodingResult[];
  isLoading: boolean;
  error: string | null;
  onSelect: (place: GeocodingResult) => void;
}

function SearchResults({
  query,
  results,
  isLoading,
  error,
  onSelect,
}: SearchResultsProps) {
  if (!query) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        Suche nach Orten, Städten oder Adressen...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Suche nach &quot;{query}&quot;...
      </div>
    );
  }

  if (error) {
    return <div className="px-4 py-8 text-center text-red-500">{error}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        Keine Orte gefunden für &quot;{query}&quot;
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E8E4D8]/50">
      {results.map((place, index) => (
        <SearchResultItem
          key={`${place.lat}-${place.lng}-${index}`}
          place={place}
          onClick={() => onSelect(place)}
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
  const { flyTo } = useMapStore();
  const { results, isLoading, error } = useGeocodingSearch(query);

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

  const handleSelect = (place: GeocodingResult) => {
    // Determine zoom level based on place type
    let zoom = 12;
    switch (place.type) {
      case 'city':
        zoom = 12;
        break;
      case 'town':
        zoom = 14;
        break;
      case 'village':
        zoom = 15;
        break;
      case 'address':
        zoom = 16;
        break;
    }

    flyTo(place.lat, place.lng, zoom);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Suche nach Orten, Städten..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 rounded-full border-[#E8E4D8] focus:border-[#E19B53] focus:ring-[#E19B53]"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E8E4D8] z-50 max-h-80 overflow-hidden">
          <div className="overflow-y-auto max-h-80">
            <SearchResults
              query={query}
              results={results}
              isLoading={isLoading}
              error={error}
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
  const { flyTo } = useMapStore();
  const { results, isLoading, error } = useGeocodingSearch(query);

  const handleSelect = (place: GeocodingResult) => {
    // Determine zoom level based on place type
    let zoom = 12;
    switch (place.type) {
      case 'city':
        zoom = 12;
        break;
      case 'town':
        zoom = 14;
        break;
      case 'village':
        zoom = 15;
        break;
      case 'address':
        zoom = 16;
        break;
    }

    flyTo(place.lat, place.lng, zoom);
    setIsOpen(false);
    setQuery('');
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
        <div className="border-b border-[#E8E4D8] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Suche nach Orten, Städten..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="pl-10 border-0 focus:ring-0 text-base"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <SearchResults
            query={query}
            results={results}
            isLoading={isLoading}
            error={error}
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
