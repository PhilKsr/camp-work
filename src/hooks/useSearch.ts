import { useMemo, useEffect, useState } from 'react';
import type { Campground } from '@/types/campground';

export function useSearch(query: string, campgrounds: Campground[]) {
  return useMemo(() => {
    if (!query || query.length < 2) return [];

    const lower = query.toLowerCase();
    return campgrounds
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          (c.address && c.address.toLowerCase().includes(lower)),
      )
      .slice(0, 5);
  }, [query, campgrounds]);
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
