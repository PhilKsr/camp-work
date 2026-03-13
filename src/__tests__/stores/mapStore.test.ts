import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/stores/mapStore';

describe('mapStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMapStore.setState({
      viewport: { latitude: 51.1, longitude: 10.4, zoom: 10 },
      selectedCampground: null,
      flyToTarget: null,
    });
  });

  it('should have initial viewport state', () => {
    const state = useMapStore.getState();
    expect(state.viewport).toEqual({
      latitude: 51.1,
      longitude: 10.4,
      zoom: 10,
    });
  });

  it('should update viewport', () => {
    const { setViewport } = useMapStore.getState();
    setViewport({ latitude: 52.5, longitude: 13.4 });

    const state = useMapStore.getState();
    expect(state.viewport).toEqual({
      latitude: 52.5,
      longitude: 13.4,
      zoom: 10, // unchanged
    });
  });

  it('should set selected campground', () => {
    const { setSelectedCampground } = useMapStore.getState();
    setSelectedCampground('camp123');

    const state = useMapStore.getState();
    expect(state.selectedCampground).toBe('camp123');
  });

  it('should create flyToTarget when calling flyTo', () => {
    const { flyTo } = useMapStore.getState();
    flyTo(52.5, 13.4, 14);

    const state = useMapStore.getState();
    expect(state.flyToTarget).toMatchObject({
      latitude: 52.5,
      longitude: 13.4,
      zoom: 14,
    });
    expect(state.flyToTarget?.id).toBeGreaterThan(0);
    expect(state.viewport).toEqual({
      latitude: 52.5,
      longitude: 13.4,
      zoom: 14,
    });
  });

  it('should increment flyToTarget ID on subsequent calls', () => {
    const { flyTo } = useMapStore.getState();

    flyTo(52.5, 13.4, 14);
    const state1 = useMapStore.getState();
    const firstId = state1.flyToTarget?.id;
    expect(firstId).toBeGreaterThan(0);

    flyTo(51.0, 11.0, 12);
    const state2 = useMapStore.getState();
    const secondId = state2.flyToTarget?.id;
    expect(secondId).toBeGreaterThan(firstId!);
  });

  it('should set flyToTarget when initializing from geolocation', () => {
    const { initializeFromGeolocation } = useMapStore.getState();
    initializeFromGeolocation(52.5, 13.4);

    const state = useMapStore.getState();
    expect(state.viewport).toEqual({
      latitude: 52.5,
      longitude: 13.4,
      zoom: 10,
    });
    expect(state.flyToTarget).toMatchObject({
      latitude: 52.5,
      longitude: 13.4,
      zoom: 10,
    });
    expect(state.flyToTarget?.id).toBeGreaterThan(0);
  });
});
