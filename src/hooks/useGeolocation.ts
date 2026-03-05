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

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isLoading: false,
          isTracking: true,
          error: null,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
          isTracking: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );

    setWatchId(id);
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
