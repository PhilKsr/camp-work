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
    async function requestLocation() {
      if (!navigator.geolocation) {
        setState({
          isLoading: false,
          error: 'Geolocation nicht unterstützt',
          hasLocation: false,
        });
        return;
      }

      // Check if we're on HTTPS (required for geolocation in most browsers)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setState({
          isLoading: false,
          error:
            'Standort benötigt HTTPS. Nutze Tailscale Serve für HTTPS-Zugriff',
          hasLocation: false,
        });
        return;
      }

      // Prüfe Permission-Status
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: 'geolocation',
          });
          if (permission.state === 'denied') {
            setState({
              isLoading: false,
              error: 'Standort-Berechtigung verweigert',
              hasLocation: false,
            });
            return;
          }
        }
      } catch {
        // permissions API nicht verfügbar, trotzdem versuchen
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
    }

    requestLocation();
  }, [initializeFromGeolocation]); // Include initializeFromGeolocation in dependencies

  return state;
}
