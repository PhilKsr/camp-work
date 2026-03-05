'use client';

import { useCallback, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/stores/mapStore';
import MapControls from './MapControls';
import GeolocationMarker from './GeolocationMarker';
import CoverageLayer from './CoverageLayer';
import CoverageLegend from './CoverageLegend';
import CoverageControls from './CoverageControls';
import { CampingMarkers } from './CampingMarkers';

export default function MapViewInner() {
  const { viewport, setViewport } = useMapStore();

  // Map style with fallback
  const mapStyle = process.env.NEXT_PUBLIC_MAPTILER_KEY
    ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
    : 'https://demotiles.maplibre.org/style.json';

  // Show info if using fallback style (only once)
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPTILER_KEY) {
      console.warn('NEXT_PUBLIC_MAPTILER_KEY not set, using demo tiles');
    }
  }, []);

  const onMove = useCallback(
    (evt: {
      viewState: { longitude: number; latitude: number; zoom: number };
    }) => {
      setViewport({
        longitude: evt.viewState.longitude,
        latitude: evt.viewState.latitude,
        zoom: evt.viewState.zoom,
      });
    },
    [setViewport],
  );

  return (
    <div className="h-full w-full relative">
      <Map
        {...viewport}
        onMove={onMove}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
      >
        <CoverageLayer />
        <CampingMarkers />
        <GeolocationMarker />
      </Map>

      {/* Coverage Controls & Legend - Bottom Left */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-2">
        <CoverageControls />
        <CoverageLegend />
      </div>

      {/* Map Controls - Bottom Right */}
      <MapControls />
    </div>
  );
}
