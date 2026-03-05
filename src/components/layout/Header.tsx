'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);

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
        'sticky top-0 z-50 h-16 bg-[#F9F8E6]/80 backdrop-blur-md border-b border-[#E8E4D8] transition-shadow duration-200',
        hasScrolled && 'shadow-sm',
      )}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo variant="full" size="md" className="hidden lg:block" />
          <Logo variant="icon" size="md" className="block lg:hidden" />
        </div>

        {/* Search - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Campingplatz suchen..."
              className="pl-10 rounded-full bg-white border-[#E8E4D8] focus:border-primary transition-colors"
              readOnly
            />
          </div>
        </div>

        {/* Search - Mobile */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden rounded-full bg-white border-[#E8E4D8] hover:bg-[#F9F8E6] transition-colors"
          onClick={() => console.log('Mobile search clicked')}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Filter Button */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white border-[#E8E4D8] hover:bg-[#F9F8E6] transition-colors"
          onClick={() => console.log('Filter clicked')}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
