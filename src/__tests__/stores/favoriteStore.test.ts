import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFavoriteStore } from '@/stores/favoriteStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('favoriteStore', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    // Reset store state
    useFavoriteStore.getState().clearFavorites();
  });

  it('should have empty favorites initially', () => {
    const { result } = renderHook(() => useFavoriteStore());

    expect(result.current.favorites).toEqual([]);
  });

  it('should add favorite correctly', () => {
    const { result } = renderHook(() => useFavoriteStore());

    act(() => {
      result.current.toggleFavorite('campground_1');
    });

    expect(result.current.favorites).toEqual(['campground_1']);
    expect(result.current.isFavorite('campground_1')).toBe(true);
  });

  it('should remove favorite correctly', () => {
    const { result } = renderHook(() => useFavoriteStore());

    // Add favorite first
    act(() => {
      result.current.toggleFavorite('campground_1');
    });

    expect(result.current.isFavorite('campground_1')).toBe(true);

    // Remove it
    act(() => {
      result.current.toggleFavorite('campground_1');
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite('campground_1')).toBe(false);
  });

  it('should handle multiple favorites', () => {
    const { result } = renderHook(() => useFavoriteStore());

    act(() => {
      result.current.toggleFavorite('campground_1');
      result.current.toggleFavorite('campground_2');
      result.current.toggleFavorite('campground_3');
    });

    expect(result.current.favorites).toEqual([
      'campground_1',
      'campground_2',
      'campground_3',
    ]);

    expect(result.current.isFavorite('campground_1')).toBe(true);
    expect(result.current.isFavorite('campground_2')).toBe(true);
    expect(result.current.isFavorite('campground_3')).toBe(true);
    expect(result.current.isFavorite('campground_4')).toBe(false);
  });

  it('should clear all favorites', () => {
    const { result } = renderHook(() => useFavoriteStore());

    // Add some favorites
    act(() => {
      result.current.toggleFavorite('campground_1');
      result.current.toggleFavorite('campground_2');
    });

    expect(result.current.favorites.length).toBe(2);

    // Clear all
    act(() => {
      result.current.clearFavorites();
    });

    expect(result.current.favorites).toEqual([]);
  });

  it('should persist favorites in localStorage', () => {
    const { result } = renderHook(() => useFavoriteStore());

    act(() => {
      result.current.toggleFavorite('campground_1');
    });

    // Should call setItem to persist
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should check isFavorite correctly for non-existent items', () => {
    const { result } = renderHook(() => useFavoriteStore());

    expect(result.current.isFavorite('non_existent')).toBe(false);
  });

  it('should maintain order of favorites', () => {
    const { result } = renderHook(() => useFavoriteStore());

    act(() => {
      result.current.toggleFavorite('first');
      result.current.toggleFavorite('second');
      result.current.toggleFavorite('third');
    });

    expect(result.current.favorites).toEqual(['first', 'second', 'third']);

    // Remove middle item
    act(() => {
      result.current.toggleFavorite('second');
    });

    expect(result.current.favorites).toEqual(['first', 'third']);
  });
});
