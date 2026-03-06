'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VersionBadge } from '@/components/ui/VersionBadge';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import { useFilterStore } from '@/stores/filterStore';
import { cn } from '@/lib/utils';

export default function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const activeFilterCount = useFilterStore((state) =>
    state.activeFilterCount(),
  );

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 bg-[#F9F8E6]/80 backdrop-blur-md border-b border-[#E8E4D8] border-b-2 border-b-[#E19B53]/20 transition-shadow duration-200',
        hasScrolled && 'shadow-sm',
      )}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <Logo variant="full" size="md" className="hidden lg:block" />
          <Logo variant="icon" size="md" className="block lg:hidden" />
          <VersionBadge className="hidden lg:block" />
        </div>

        {/* Search Bar */}
        <SearchBar className="flex-1 max-w-md mx-8" />

        {/* Filter Button */}
        <FilterPanel>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white border-[#E8E4D8] hover:bg-[#F9F8E6] transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#E19B53] text-white"
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
        </FilterPanel>
      </div>
    </header>
  );
}
