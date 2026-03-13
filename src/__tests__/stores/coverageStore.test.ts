import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCoverageStore } from '@/stores/coverageStore';

describe('coverageStore', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useCoverageStore());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.opacity).toBe(0.35);
  });

  it('should toggle visibility', () => {
    const { result } = renderHook(() => useCoverageStore());

    // Initially no layers are visible
    expect(result.current.isVisible).toBe(false);
    expect(result.current.visibleLayers).toEqual([]);

    // Toggle to show all layers
    act(() => {
      result.current.toggleVisibility();
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.visibleLayers).toEqual(['5g', 'lte', 'gsm']);

    // Toggle to hide all layers
    act(() => {
      result.current.toggleVisibility();
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.visibleLayers).toEqual([]);
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
      result.current.setOpacity(0.1);
    });
    expect(result.current.opacity).toBe(0.2);

    // Test maximum boundary
    act(() => {
      result.current.setOpacity(0.9);
    });
    expect(result.current.opacity).toBe(0.8);
  });

  it('should provide BNetzA attribution in simplified store', () => {
    const { result } = renderHook(() => useCoverageStore());

    // Verify that the store has the expected interface
    const expectedKeys = [
      'visibleLayers',
      'opacity',
      'toggleLayer',
      'setOpacity',
      'isVisible',
      'toggleVisibility',
    ];

    expect(Object.keys(result.current).sort()).toEqual(expectedKeys.sort());

    // No source switching needed - always uses BNetzA WMS
    expect('source' in result.current).toBe(false);
    expect('setSource' in result.current).toBe(false);
  });
});
