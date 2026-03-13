import { useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useFilterStore } from '@/stores/filterStore';

export function useUrlState() {
  const { viewport, setViewport } = useMapStore();
  const {
    coverageLevels,
    types,
    features,
    workFriendlyOnly,
    favoritesOnly,
    setSearchQuery,
    toggleCoverageLevel,
    toggleType,
    toggleFeature,
    setWorkFriendlyOnly,
    setFavoritesOnly,
  } = useFilterStore();

  // Load state from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    // Map viewport
    const lat = params.get('lat');
    const lng = params.get('lng');
    const zoom = params.get('zoom');

    if (lat && lng && zoom) {
      setViewport({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        zoom: parseFloat(zoom),
      });
    }

    // Filters
    const coverage = params.get('coverage');
    if (coverage) {
      // Clear current and set from URL
      coverageLevels.forEach((level) => toggleCoverageLevel(level));
      coverage.split(',').forEach((level) => {
        if (['5g', '4g', '3g', 'none'].includes(level)) {
          toggleCoverageLevel(level);
        }
      });
    }

    const typeParam = params.get('type');
    if (typeParam) {
      // Clear current and set from URL
      types.forEach((type) => toggleType(type));
      typeParam.split(',').forEach((type) => {
        if (['camp_site', 'caravan_site'].includes(type)) {
          toggleType(type);
        }
      });
    }

    const featuresParam = params.get('features');
    if (featuresParam) {
      featuresParam.split(',').forEach((feature) => {
        toggleFeature(feature);
      });
    }

    const workFriendly = params.get('workFriendly');
    if (workFriendly === 'true') {
      setWorkFriendlyOnly(true);
    }

    const favOnly = params.get('favorites');
    if (favOnly === 'true') {
      setFavoritesOnly(true);
    }

    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();

    // Map viewport
    params.set('lat', viewport.latitude.toFixed(4));
    params.set('lng', viewport.longitude.toFixed(4));
    params.set('zoom', viewport.zoom.toFixed(1));

    // Coverage levels (only if not default)
    const defaultCoverage = ['4g', '3g'];
    if (
      JSON.stringify([...coverageLevels].sort()) !==
      JSON.stringify([...defaultCoverage].sort())
    ) {
      params.set('coverage', coverageLevels.join(','));
    }

    // Types (only if not default)
    const defaultTypes = ['camp_site', 'caravan_site'];
    if (
      JSON.stringify([...types].sort()) !==
      JSON.stringify([...defaultTypes].sort())
    ) {
      params.set('type', types.join(','));
    }

    // Features
    if (features.length > 0) {
      params.set('features', features.join(','));
    }

    // Work-friendly
    if (workFriendlyOnly) {
      params.set('workFriendly', 'true');
    }

    // Favorites only
    if (favoritesOnly) {
      params.set('favorites', 'true');
    }

    // Update URL without triggering navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [
    viewport,
    coverageLevels,
    types,
    features,
    workFriendlyOnly,
    favoritesOnly,
  ]);
}
