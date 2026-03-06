import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGeolocation } from '@/hooks/useGeolocation';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isTracking).toBe(false);
  });

  it('should start tracking when startTracking is called', () => {
    const mockWatchId = 123;
    mockGeolocation.watchPosition.mockReturnValue(mockWatchId);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.startTracking();
    });

    expect(mockGeolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
    expect(result.current.isLoading).toBe(true);
  });

  it('should stop tracking when stopTracking is called', () => {
    const mockWatchId = 123;
    mockGeolocation.watchPosition.mockReturnValue(mockWatchId);

    const { result } = renderHook(() => useGeolocation());

    // Start tracking first
    act(() => {
      result.current.startTracking();
    });

    // Simulate successful position
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
      },
    };

    act(() => {
      const successCallback = mockGeolocation.watchPosition.mock.calls[0][0];
      successCallback(mockPosition);
    });

    expect(result.current.isTracking).toBe(true);

    // Now stop tracking
    act(() => {
      result.current.stopTracking();
    });

    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(mockWatchId);
    expect(result.current.isTracking).toBe(false);
  });

  it('should update position when geolocation succeeds', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.startTracking();
    });

    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
      },
    };

    act(() => {
      const successCallback = mockGeolocation.watchPosition.mock.calls[0][0];
      successCallback(mockPosition);
    });

    expect(result.current.latitude).toBe(51.5074);
    expect(result.current.longitude).toBe(-0.1278);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isTracking).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle geolocation error', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.startTracking();
    });

    const mockError = {
      code: 1,
      message: 'User denied geolocation',
    };

    act(() => {
      const errorCallback = mockGeolocation.watchPosition.mock.calls[0][1];
      errorCallback(mockError);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isTracking).toBe(false);
  });

  it.skip('should handle missing geolocation support', () => {
    // Temporarily spy on navigator.geolocation
    const spy = vi
      .spyOn(navigator, 'geolocation', 'get')
      .mockReturnValue(undefined as unknown as Geolocation);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.error).toEqual({
      code: 2,
      message: 'Geolocation is not supported by this browser.',
    });

    // Restore geolocation
    spy.mockRestore();
  });
});
