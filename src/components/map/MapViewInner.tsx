'use client';

import { useCallback, useEffect, useState } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/stores/mapStore';
import { useCoverageStore } from '@/stores/coverageStore';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import MapControls from './MapControls';
import GeolocationMarker from './GeolocationMarker';
import CoverageLayer from './CoverageLayer';
import { CampingMarkers } from './CampingMarkers';

export default function MapViewInner() {
  const { viewport, setViewport, setSelectedCampground, flyTo } = useMapStore();
  const { isVisible } = useCoverageStore();
  const [cursor, setCursor] = useState('auto');

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

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      // Check if a campground marker was clicked (including hit area)
      const campgroundFeature = e.features?.find(
        (f) =>
          f.layer?.id === 'campground-markers' ||
          f.layer?.id === 'campground-markers-hitarea',
      );
      if (campgroundFeature?.properties?.id) {
        const id = campgroundFeature.properties.id;
        const [lng, lat] = (campgroundFeature.geometry as GeoJSON.Point)
          .coordinates as [number, number];
        setSelectedCampground(id);
        flyTo(lat, lng, 14);
        return;
      }

      // Check if a cluster was clicked
      const clusterFeature = e.features?.find(
        (f) => f.layer?.id === 'clusters',
      );
      if (clusterFeature?.properties?.cluster_id) {
        // Zoom to cluster
        const [lng, lat] = (clusterFeature.geometry as GeoJSON.Point)
          .coordinates as [number, number];
        flyTo(lat, lng, Math.min(viewport.zoom + 3, 16));
        return;
      }
    },
    [setSelectedCampground, flyTo, viewport.zoom],
  );

  const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const hasFeature = e.features && e.features.length > 0;
    setCursor(hasFeature ? 'pointer' : 'auto');
  }, []);

  return (
    <div className="h-full w-full relative">
      <Map
        {...viewport}
        onMove={onMove}
        onClick={handleMapClick}
        onMouseMove={onMouseMove}
        cursor={cursor}
        interactiveLayerIds={[
          'campground-markers',
          'campground-markers-hitarea',
          'clusters',
        ]}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
        maxZoom={18}
        minZoom={5}
      >
        <CoverageLayer />
        <CampingMarkers />
        <GeolocationMarker />
      </Map>

      {/* Minimal Coverage Legend - Only when layer is active */}
      {isVisible && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <p className="text-[10px] text-gray-400 mb-1">O2 Netz · © BNetzA</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Indoor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Outdoor
            </span>
          </div>
        </div>
      )}

      {/* Map Controls - Bottom Right */}
      <MapControls />
    </div>
  );
}
