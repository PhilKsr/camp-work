'use client';

import { Plus, Minus, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/stores/mapStore';
import { useGeolocation } from '@/hooks/useGeolocation';
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

  const zoomIn = () => {
    setViewport({ zoom: Math.min(viewport.zoom + 1, 20) });
  };

  const zoomOut = () => {
    setViewport({ zoom: Math.max(viewport.zoom - 1, 0) });
  };

  const handleGeolocation = () => {
    if (isTracking) {
      stopTracking();
    } else if (latitude && longitude) {
      flyTo(latitude, longitude, 15);
    } else {
      startTracking();
    }
  };

  return (
    <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-10">
      {/* Zoom Controls */}
      <div className="flex flex-col rounded-2xl overflow-hidden shadow-md">
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
  );
}
