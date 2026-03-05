import { Marker } from 'react-map-gl/maplibre';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function GeolocationMarker() {
  const { latitude, longitude, accuracy, isTracking } = useGeolocation();

  if (!latitude || !longitude) return null;

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="center">
      <div className="relative">
        {/* Accuracy ring for low accuracy */}
        {accuracy && accuracy > 50 && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ABD8EF]/30 bg-[#ABD8EF]/10"
            style={{
              width: `${Math.min(accuracy / 10, 100)}px`,
              height: `${Math.min(accuracy / 10, 100)}px`,
            }}
          />
        )}

        {/* Pulsing outer circle */}
        <div
          className={`w-6 h-6 bg-[#ABD8EF]/30 rounded-full ${
            isTracking ? 'animate-ping' : ''
          }`}
        />

        {/* Inner position dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#ABD8EF] border-2 border-white rounded-full" />
      </div>
    </Marker>
  );
}
