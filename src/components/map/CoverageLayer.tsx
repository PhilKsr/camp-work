'use client';

import { Source, Layer } from 'react-map-gl/maplibre';
import { useCoverageStore } from '@/stores/coverageStore';

interface CoverageLayerProps {
  visible?: boolean;
  opacity?: number;
  source?: 'o2' | 'bnetza';
}

export default function CoverageLayer({
  visible,
  opacity,
  source,
}: CoverageLayerProps) {
  const {
    isVisible: storeVisible,
    opacity: storeOpacity,
    source: storeSource,
  } = useCoverageStore();

  // Use props or fall back to store values
  const layerVisible = visible !== undefined ? visible : storeVisible;
  const layerOpacity = opacity !== undefined ? opacity : storeOpacity;
  const layerSource = source !== undefined ? source : storeSource;

  if (!layerVisible) return null;

  // O2 Live Tiles (via our proxy)
  if (layerSource === 'o2') {
    return (
      <>
        <Source
          id="coverage-o2-source"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/coverage-tiles?z={z}&x={x}&y={y}&tech=4g`,
          ]}
          tileSize={256}
          minzoom={6}
          maxzoom={16}
        >
          <Layer
            id="coverage-o2-layer"
            type="raster"
            paint={{
              'raster-opacity': layerOpacity,
              'raster-fade-duration': 300,
            }}
          />
        </Source>
      </>
    );
  }

  // BNetzA Data (GeoJSON)
  return (
    <>
      <Source
        id="coverage-bnetza-source"
        type="geojson"
        data="/src/data/coverage-bnetza.geojson"
      >
        {/* 5G Coverage */}
        <Layer
          id="coverage-5g-layer"
          type="circle"
          filter={['==', ['get', 'technology'], '5g']}
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6,
              2,
              10,
              4,
              14,
              8,
            ],
            'circle-color': '#28A745', // Excellent - Green
            'circle-opacity': layerOpacity,
            'circle-stroke-width': 0,
          }}
        />

        {/* 4G/LTE Coverage */}
        <Layer
          id="coverage-4g-layer"
          type="circle"
          filter={['==', ['get', 'technology'], '4g']}
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6,
              2,
              10,
              4,
              14,
              8,
            ],
            'circle-color': '#E19B53', // Good - Warm Gold
            'circle-opacity': layerOpacity,
            'circle-stroke-width': 0,
          }}
        />

        {/* 3G Coverage */}
        <Layer
          id="coverage-3g-layer"
          type="circle"
          filter={['==', ['get', 'technology'], '3g']}
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6,
              1,
              10,
              2,
              14,
              4,
            ],
            'circle-color': '#FFC107', // Limited - Yellow
            'circle-opacity': layerOpacity * 0.8, // Slightly less prominent
            'circle-stroke-width': 0,
          }}
        />

        {/* 2G Coverage */}
        <Layer
          id="coverage-2g-layer"
          type="circle"
          filter={['==', ['get', 'technology'], '2g']}
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6,
              1,
              10,
              2,
              14,
              3,
            ],
            'circle-color': '#DC3545', // None/Emergency - Red
            'circle-opacity': layerOpacity * 0.6, // Less prominent
            'circle-stroke-width': 0,
          }}
        />
      </Source>
    </>
  );
}
