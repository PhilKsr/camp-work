import { useEffect, useState } from 'react';
import { useMapStore } from '@/stores/mapStore';

interface LocationState {
  isLoading: boolean;
  error: string | null;
  hasLocation: boolean;
}

/**
 * Hook for automatic geolocation on app start
 * Immediately requests user location and centers map on it
 */
export function useInitialLocation() {
  const [state, setState] = useState<LocationState>({
    isLoading: false,
    error: null,
    hasLocation: false,
  });

  const initializeFromGeolocation = useMapStore(
    (store) => store.initializeFromGeolocation,
  );

  useEffect(() => {
    // Skip if geolocation is not supported
    if (!navigator.geolocation) {
      setState({
        isLoading: false,
        error: 'Geolocation wird von diesem Browser nicht unterstützt',
        hasLocation: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000, // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Initialize map with user location
        initializeFromGeolocation(latitude, longitude);

        setState({
          isLoading: false,
          error: null,
          hasLocation: true,
        });
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht ermittelt werden';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Standort-Berechtigung verweigert';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Standort nicht verfügbar';
            break;
          case error.TIMEOUT:
            errorMessage = 'Standort-Anfrage timeout';
            break;
        }

        setState({
          isLoading: false,
          error: errorMessage,
          hasLocation: false,
        });
      },
      options,
    );
  }, [initializeFromGeolocation]); // Include initializeFromGeolocation in dependencies

  return state;
}
