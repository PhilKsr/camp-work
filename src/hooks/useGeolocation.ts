import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  isLoading: boolean;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<
    Omit<GeolocationState, 'startTracking' | 'stopTracking'>
  >({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
    isTracking: false,
  });
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 2,
          message: 'Geolocation is not supported by this browser.',
        } as GeolocationPositionError,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // First get current position → then start watching
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isLoading: false,
          isTracking: true,
        }));

        // Then start tracking
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            setState((prev) => ({
              ...prev,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            }));
          },
          (err) => {
            setState((prev) => ({ ...prev, error: err }));
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
        );
        setWatchId(id);
      },
      (error) => {
        setState((prev) => ({ ...prev, isLoading: false, error }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setState((prev) => ({
      ...prev,
      isTracking: false,
    }));
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
}
