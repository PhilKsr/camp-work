import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCoverageStore } from '@/stores/coverageStore';

describe('coverageStore', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useCoverageStore());

    expect(result.current.source).toBe('o2');
    expect(result.current.visibleLayers).toEqual([]);
    expect(result.current.opacity).toBe(0.4);
  });

  it('should toggle individual layers', () => {
    const { result } = renderHook(() => useCoverageStore());

    // Initially no layers are visible
    expect(result.current.visibleLayers).toEqual([]);

    // Toggle 5G layer
    act(() => {
      result.current.toggleLayer('5g');
    });
    expect(result.current.visibleLayers).toEqual(['5g']);

    // Toggle 4G layer
    act(() => {
      result.current.toggleLayer('4g');
    });
    expect(result.current.visibleLayers).toEqual(['5g', '4g']);

    // Toggle 5G layer off
    act(() => {
      result.current.toggleLayer('5g');
    });
    expect(result.current.visibleLayers).toEqual(['4g']);
  });

  it('should switch between sources', () => {
    const { result } = renderHook(() => useCoverageStore());

    // Initially O2 source
    expect(result.current.source).toBe('o2');

    // Switch to BNetzA
    act(() => {
      result.current.setSource('bnetza');
    });
    expect(result.current.source).toBe('bnetza');
    expect(result.current.visibleLayers).toEqual([]); // Clear layers on source change

    // Switch back to O2
    act(() => {
      result.current.setSource('o2');
    });
    expect(result.current.source).toBe('o2');
    expect(result.current.visibleLayers).toEqual([]); // Clear layers on source change
  });

  it('should set opacity within bounds', () => {
    const { result } = renderHook(() => useCoverageStore());

    // Test valid opacity
    act(() => {
      result.current.setOpacity(0.7);
    });
    expect(result.current.opacity).toBe(0.7);

    // Test minimum boundary
    act(() => {
      result.current.setOpacity(0.05);
    });
    expect(result.current.opacity).toBe(0.1);

    // Test maximum boundary
    act(() => {
      result.current.setOpacity(0.9);
    });
    expect(result.current.opacity).toBe(0.8);
  });

  it('should set all layers at once', () => {
    const { result } = renderHook(() => useCoverageStore());

    // Set O2 layers
    act(() => {
      result.current.setAllLayers(['5g', '4g', '2g']);
    });
    expect(result.current.visibleLayers).toEqual(['5g', '4g', '2g']);

    // Clear all layers
    act(() => {
      result.current.setAllLayers([]);
    });
    expect(result.current.visibleLayers).toEqual([]);

    // Set BNetzA layer
    act(() => {
      result.current.setAllLayers(['all']);
    });
    expect(result.current.visibleLayers).toEqual(['all']);
  });
});
