'use client';

import { Source, Layer } from 'react-map-gl/maplibre';
import { useCoverageStore } from '@/stores/coverageStore';

const O2_TILES = {
  '5g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_5g/{z}/{x}/{y}.png',
  '4g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_4g/{z}/{x}/{y}.png',
  '2g': 'https://dccb7552-tiles.spatialbuzz.net/tiles/o2_de-v332/styles/o2_de_v332_3g/{z}/{x}/{y}.png',
};

const BNETZA_TILE =
  'https://sgx.geodatenzentrum.de/wms_bnetza_mobilfunk?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=mobilfunkmonitor&CRS=EPSG:3857&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}';

export default function CoverageLayer() {
  const { source, visibleLayers, opacity } = useCoverageStore();

  if (visibleLayers.length === 0) return null;

  if (source === 'o2') {
    return (
      <>
        {visibleLayers.includes('5g') && (
          <Source
            id="o2-5g"
            type="raster"
            tiles={[O2_TILES['5g']]}
            tileSize={256}
            minzoom={6}
            maxzoom={16}
          >
            <Layer
              id="o2-5g-layer"
              type="raster"
              paint={{ 'raster-opacity': opacity, 'raster-fade-duration': 0 }}
            />
          </Source>
        )}
        {visibleLayers.includes('4g') && (
          <Source
            id="o2-4g"
            type="raster"
            tiles={[O2_TILES['4g']]}
            tileSize={256}
            minzoom={6}
            maxzoom={16}
          >
            <Layer
              id="o2-4g-layer"
              type="raster"
              paint={{ 'raster-opacity': opacity, 'raster-fade-duration': 0 }}
            />
          </Source>
        )}
        {visibleLayers.includes('2g') && (
          <Source
            id="o2-2g"
            type="raster"
            tiles={[O2_TILES['2g']]}
            tileSize={256}
            minzoom={6}
            maxzoom={16}
          >
            <Layer
              id="o2-2g-layer"
              type="raster"
              paint={{ 'raster-opacity': opacity, 'raster-fade-duration': 0 }}
            />
          </Source>
        )}
      </>
    );
  }

  // BNetzA Fallback (anbieterneutral, alle Provider)
  if (visibleLayers.includes('all')) {
    return (
      <Source
        id="bnetza-coverage"
        type="raster"
        tiles={[BNETZA_TILE]}
        tileSize={256}
        minzoom={8}
        maxzoom={14}
      >
        <Layer
          id="bnetza-coverage-layer"
          type="raster"
          paint={{ 'raster-opacity': opacity, 'raster-fade-duration': 0 }}
        />
      </Source>
    );
  }

  return null;
}
