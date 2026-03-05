'use client';

import { Source, Layer } from 'react-map-gl/maplibre';
import { useCoverageStore } from '@/stores/coverageStore';

interface CoverageLayerProps {
  visible?: boolean;
  opacity?: number;
}

export default function CoverageLayer({
  visible,
  opacity,
}: CoverageLayerProps) {
  const { isVisible: storeVisible, opacity: storeOpacity } = useCoverageStore();

  // Use props or fall back to store values
  const layerVisible = visible !== undefined ? visible : storeVisible;
  const layerOpacity = opacity !== undefined ? opacity : storeOpacity;

  if (!layerVisible) return null;

  // Official BNetzA WMS service
  // Direct integration - no proxy needed, no CORS issues
  // Data source: © Bundesnetzagentur (CC BY-ND 3.0 DE)
  return (
    <Source
      id="bnetza-coverage"
      type="raster"
      tiles={[
        'https://sgx.geodatenzentrum.de/wms_bnetza_mobilfunk?' +
          'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true' +
          '&LAYERS=mobilfunkmonitor&CRS=EPSG:3857&STYLES=' +
          '&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
      ]}
      tileSize={256}
      minzoom={6}
      maxzoom={16}
    >
      <Layer
        id="bnetza-coverage-layer"
        type="raster"
        paint={{
          'raster-opacity': layerOpacity,
          'raster-fade-duration': 300,
        }}
      />
    </Source>
  );
}
