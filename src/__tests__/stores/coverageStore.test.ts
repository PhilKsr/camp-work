import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCoverageStore } from '@/stores/coverageStore';

describe('coverageStore', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useCoverageStore());

    expect(result.current.isVisible).toBe(true);
    expect(result.current.opacity).toBe(0.5);
    expect(result.current.source).toBe('o2');
  });

  it('should toggle visibility', () => {
    const { result } = renderHook(() => useCoverageStore());

    act(() => {
      result.current.toggleVisibility();
    });

    expect(result.current.isVisible).toBe(false);

    act(() => {
      result.current.toggleVisibility();
    });

    expect(result.current.isVisible).toBe(true);
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

  it('should switch data source', () => {
    const { result } = renderHook(() => useCoverageStore());

    expect(result.current.source).toBe('o2');

    act(() => {
      result.current.setSource('bnetza');
    });

    expect(result.current.source).toBe('bnetza');

    act(() => {
      result.current.setSource('o2');
    });

    expect(result.current.source).toBe('o2');
  });
});
