'use client';

import { Source, Layer } from 'react-map-gl/maplibre';
import { useCoverageStore } from '@/stores/coverageStore';

interface CoverageLayerProps {
  visible?: boolean;
  opacity?: number;
}

// WMS layer configuration with colors matching the brand system
const COVERAGE_LAYERS = [
  {
    name: '5g',
    label: '5G',
    color: '#28A745', // excellent - green
    zIndex: 3,
  },
  {
    name: 'lte',
    label: '4G/LTE',
    color: '#E19B53', // good - warm gold
    zIndex: 2,
  },
  {
    name: 'gsm',
    label: '3G/GSM',
    color: '#FFC107', // limited - yellow
    zIndex: 1,
  },
] as const;

export default function CoverageLayer({
  visible,
  opacity,
}: CoverageLayerProps) {
  const {
    visibleLayers,
    opacity: storeOpacity,
    isVisible: storeVisible,
  } = useCoverageStore();

  // Use props or fall back to store values
  const layerVisible = visible !== undefined ? visible : storeVisible;
  const layerOpacity = opacity !== undefined ? opacity : storeOpacity;

  if (!layerVisible || visibleLayers.length === 0) return null;

  // Official BNetzA WMS service
  // Data source: © Bundesnetzagentur (CC BY-ND 3.0 DE)
  return (
    <>
      {COVERAGE_LAYERS.filter((layer) =>
        visibleLayers.includes(layer.name as '5g' | 'lte' | 'gsm'),
      ).map((layer) => (
        <Source
          key={layer.name}
          id={`bnetza-${layer.name}`}
          type="raster"
          tiles={[
            'https://sgx.geodatenzentrum.de/wms_bnetza_mobilfunk?' +
              'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true' +
              `&LAYERS=${layer.name}&CRS=EPSG:3857&STYLES=` +
              '&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
          ]}
          tileSize={512}
          minzoom={8}
          maxzoom={14}
        >
          <Layer
            id={`bnetza-${layer.name}-layer`}
            type="raster"
            paint={{
              'raster-opacity': layerOpacity,
              'raster-fade-duration': 0,
              // Color overlay to distinguish layers
              'raster-hue-rotate':
                layer.name === '5g'
                  ? 120 // Green tint for 5G
                  : layer.name === 'lte'
                    ? 30 // Orange tint for LTE
                    : 0, // Default for GSM
            }}
          />
        </Source>
      ))}
    </>
  );
}
