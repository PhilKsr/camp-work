'use client';

import { Source, Layer } from 'react-map-gl/maplibre';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useMapStore } from '@/stores/mapStore';
import { colors } from '@/lib/brand';

export function CampingMarkers() {
  const { data: campgroundsData } = useCampgrounds();
  const { selectedCampground } = useMapStore();

  if (!campgroundsData) return null;

  return (
    <Source
      id="campgrounds"
      type="geojson"
      data={campgroundsData}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      {/* Cluster circles */}
      <Layer
        id="clusters"
        type="circle"
        source="campgrounds"
        filter={['has', 'point_count']}
        paint={{
          'circle-color': colors.primary.warmGold,
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // Default size
            10,
            25,
            30,
            30,
            750,
            40,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        }}
      />

      {/* Cluster count labels */}
      <Layer
        id="cluster-count"
        type="symbol"
        source="campgrounds"
        filter={['has', 'point_count']}
        layout={{
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        }}
        paint={{
          'text-color': '#ffffff',
        }}
      />

      {/* Individual markers */}
      <Layer
        id="campground-markers"
        type="circle"
        source="campgrounds"
        filter={['!', ['has', 'point_count']]}
        paint={{
          'circle-color': [
            'case',
            ['==', ['get', 'coverageLevel'], '5g'],
            colors.coverage.excellent,
            ['==', ['get', 'coverageLevel'], '4g'],
            colors.coverage.good,
            ['==', ['get', 'coverageLevel'], '3g'],
            colors.coverage.limited,
            colors.coverage.none,
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 8, 14, 16],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        }}
      />

      {/* Selected marker highlight */}
      <Layer
        id="campground-selected"
        type="circle"
        source="campgrounds"
        filter={['==', ['get', 'id'], selectedCampground || '']}
        paint={{
          'circle-color': [
            'case',
            ['==', ['get', 'coverageLevel'], '5g'],
            colors.coverage.excellent,
            ['==', ['get', 'coverageLevel'], '4g'],
            colors.coverage.good,
            ['==', ['get', 'coverageLevel'], '3g'],
            colors.coverage.limited,
            colors.coverage.none,
          ],
          'circle-radius': 20,
          'circle-stroke-width': 4,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        }}
      />
    </Source>
  );
}
