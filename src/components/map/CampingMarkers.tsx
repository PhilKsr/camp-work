'use client';

import { useRef } from 'react';
import { Source, Layer, type MapRef } from 'react-map-gl/maplibre';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useMapStore } from '@/stores/mapStore';
import { colors } from '@/lib/brand';
import type { MapLayerMouseEvent } from 'maplibre-gl';

export function CampingMarkers() {
  const { data: campgroundsData } = useCampgrounds();
  const { setSelectedCampground, flyTo } = useMapStore();
  const mapRef = useRef<MapRef>(null);

  if (!campgroundsData) return null;

  const handleClusterClick = (e: MapLayerMouseEvent) => {
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ['clusters'],
    });

    const clusterId = features?.[0]?.properties?.cluster_id;
    if (!clusterId) return;

    const mapboxSource = mapRef.current?.getSource('campgrounds') as {
      getClusterExpansionZoom: (
        id: number,
        callback: (err: unknown, zoom: number) => void,
      ) => void;
    };
    mapboxSource?.getClusterExpansionZoom(
      clusterId,
      (err: unknown, zoom: number) => {
        if (err) return;

        const [lng, lat] = (
          features[0].geometry as { coordinates: [number, number] }
        ).coordinates;
        flyTo(lat, lng, zoom);
      },
    );
  };

  const handleMarkerClick = (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature?.properties) return;

    const campgroundId = feature.properties.id;
    const [lng, lat] = (feature.geometry as { coordinates: [number, number] })
      .coordinates;

    setSelectedCampground(campgroundId);
    flyTo(lat, lng, 14);
  };

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
          'circle-color': colors.brand.warmGold,
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
        onClick={handleClusterClick}
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
        onClick={handleMarkerClick}
        onMouseEnter={() => {
          if (mapRef.current?.getCanvas) {
            mapRef.current.getCanvas().style.cursor = 'pointer';
          }
        }}
        onMouseLeave={() => {
          if (mapRef.current?.getCanvas) {
            mapRef.current.getCanvas().style.cursor = '';
          }
        }}
      />

      {/* Selected marker highlight */}
      <Layer
        id="campground-selected"
        type="circle"
        source="campgrounds"
        filter={[
          '==',
          ['get', 'id'],
          useMapStore.getState().selectedCampground || '',
        ]}
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
