'use client';

import { useEffect } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/stores/mapStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUIStore } from '@/stores/uiStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export default function MapControls() {
  const { viewport, setViewport, flyTo } = useMapStore();
  const {
    latitude,
    longitude,
    isLoading,
    isTracking,
    startTracking,
    stopTracking,
  } = useGeolocation();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const bottomSheetSnap = useUIStore((s) => s.bottomSheetSnap);

  const zoomIn = () => {
    setViewport({ zoom: Math.min(viewport.zoom + 1, 20) });
  };

  const zoomOut = () => {
    setViewport({ zoom: Math.max(viewport.zoom - 1, 0) });
  };

  const handleGeolocation = () => {
    if (isTracking) {
      stopTracking();
      return;
    }

    if (latitude && longitude) {
      // Already have location → fly there
      flyTo(latitude, longitude, 15);
      return;
    }

    // No location → request permission
    startTracking();
  };

  // Auto-fly to location after successful tracking
  useEffect(() => {
    if (latitude && longitude && isTracking) {
      flyTo(latitude, longitude, 15);
    }
  }, [latitude, longitude, isTracking, flyTo]);

  // Calculate mobile bottom offset for geolocation button
  const mobileBottomClass = isMobile
    ? bottomSheetSnap === 'full'
      ? 'bottom-[80vh]'
      : bottomSheetSnap === 'peek'
        ? 'bottom-44'
        : 'bottom-24'
    : 'bottom-6';

  return (
    <>
      {/* Zoom Controls – nur Desktop */}
      <div className="hidden lg:flex absolute bottom-6 right-4 flex-col rounded-2xl overflow-hidden shadow-md z-10">
        <Button
          size="icon"
          variant="outline"
          className="w-10 h-10 rounded-none border-0 bg-white hover:bg-[#F9F8E6] transition-colors border-b border-[#E8E4D8]"
          onClick={zoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="w-10 h-10 rounded-none border-0 bg-white hover:bg-[#F9F8E6] transition-colors"
          onClick={zoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Geolocation Button */}
      <div className={cn('absolute right-4 z-10', mobileBottomClass)}>
        <Button
          size="icon"
          variant="outline"
          className={cn(
            'w-10 h-10 rounded-full shadow-md border-0 transition-all duration-200',
            {
              // Inactive state
              'bg-white text-[#5C5650] hover:bg-[#F9F8E6]':
                !isTracking && !latitude,
              // Active state (has location)
              'bg-[#D5ECF7] text-[#6AA3C9] hover:bg-[#ABD8EF]/20':
                !isTracking && latitude,
              // Tracking state
              'bg-[#ABD8EF] text-white ring-2 ring-[#ABD8EF]/50 animate-pulse':
                isTracking,
            },
          )}
          onClick={handleGeolocation}
          disabled={isLoading}
        >
          <Crosshair className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>
    </>
  );
}
