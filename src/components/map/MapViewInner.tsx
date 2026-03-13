'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import Map, { type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/stores/mapStore';
import { useCoverageStore } from '@/stores/coverageStore';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import MapControls from './MapControls';
import GeolocationMarker from './GeolocationMarker';
import CoverageLayer from './CoverageLayer';
import { CampingMarkers } from './CampingMarkers';

// Architecture: Uncontrolled Map
// MapLibre handled Panning/Zooming intern ohne React Re-Renders.
// Store updates nur bei: onMoveEnd (Viewport) + flyToTarget Effect (Navigation)
export default function MapViewInner() {
  const mapRef = useRef<MapRef>(null);
  const { viewport, setViewport, setSelectedCampground, flyToTarget } =
    useMapStore();
  const { source, visibleLayers } = useCoverageStore();
  const [cursor, setCursor] = useState('auto');
  const [hoveredCampground, setHoveredCampground] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);

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

  // Effect für flyTo target
  useEffect(() => {
    if (flyToTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToTarget.longitude, flyToTarget.latitude],
        zoom: flyToTarget.zoom,
        duration: 1000,
      });
    }
  }, [flyToTarget]);

  // Nur bei MoveEnd den Store aktualisieren
  const onMoveEnd = useCallback(
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
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
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
        const currentZoom = mapRef.current?.getZoom() || 10;
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: Math.min(currentZoom + 3, 16),
          duration: 800,
        });
        return;
      }
    },
    [setSelectedCampground],
  );

  const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.find(
      (f) =>
        f.layer?.id === 'campground-markers' ||
        f.layer?.id === 'campground-markers-hitarea',
    );

    if (feature?.properties?.name) {
      setCursor('pointer');
      setHoveredCampground({
        name: feature.properties.name,
        x: e.point.x,
        y: e.point.y,
      });
    } else if (e.features?.some((f) => f.layer?.id === 'clusters')) {
      setCursor('pointer');
      setHoveredCampground(null);
    } else {
      setCursor('auto');
      setHoveredCampground(null);
    }
  }, []);

  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        initialViewState={viewport}
        onMoveEnd={onMoveEnd}
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
        maxTileCacheSize={200}
      >
        <CoverageLayer />
        <CampingMarkers />
        <GeolocationMarker />

        {/* Marker Hover Tooltip – nur Desktop */}
        {hoveredCampground && (
          <div
            className="hidden lg:block absolute z-20 pointer-events-none"
            style={{
              left: hoveredCampground.x,
              top: hoveredCampground.y - 40,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap max-w-[200px] truncate">
              {hoveredCampground.name}
            </div>
            <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
          </div>
        )}
      </Map>

      {/* Inline Coverage Legend - Adapts to selected source */}
      {visibleLayers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <p className="text-[10px] text-gray-400 mb-1.5">
            {source === 'o2' ? 'O2 / Telefónica' : 'Alle Anbieter · © BNetzA'}
          </p>
          <div className="flex flex-col gap-1 text-xs text-gray-600">
            {source === 'o2' ? (
              <>
                {visibleLayers.includes('5g') && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />{' '}
                    5G
                  </span>
                )}
                {visibleLayers.includes('4g') && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{' '}
                    LTE / 4G
                  </span>
                )}
                {visibleLayers.includes('2g') && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{' '}
                    2G / GSM
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{' '}
                Mobilfunk
              </span>
            )}
          </div>
        </div>
      )}

      {/* Map Controls - Bottom Right */}
      <MapControls />
    </div>
  );
}
