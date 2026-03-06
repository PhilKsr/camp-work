import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBar from '@/components/search/SearchBar';

// Mock the geocoding hook
const mockFlyTo = vi.fn();

vi.mock('@/stores/mapStore', () => ({
  useMapStore: () => ({
    flyTo: mockFlyTo,
  }),
}));

vi.mock('@/hooks/useGeocodingSearch', () => ({
  useGeocodingSearch: (query: string) => {
    if (query === 'Berlin') {
      return {
        results: [
          {
            displayName: 'Berlin, Deutschland',
            lat: 52.52,
            lng: 13.405,
            type: 'city',
            importance: 0.9,
            state: 'Berlin',
          },
        ],
        isLoading: false,
        error: null,
      };
    }
    if (query === 'Nonexistent') {
      return { results: [], isLoading: false, error: null };
    }
    if (query.length >= 2) {
      return { results: [], isLoading: true, error: null };
    }
    return { results: [], isLoading: false, error: null };
  },
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input on desktop', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    expect(input).toBeInTheDocument();
  });

  it('should update input value on typing', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });
    expect(input).toHaveValue('Berlin');
  });

  it('should show geocoding results', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/Berlin/)).toBeInTheDocument();
    });
  });

  it('should show place type badge for results', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Stadt')).toBeInTheDocument();
    });
  });

  it('should show empty state message', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.focus(input);

    expect(screen.getByText(/Suche nach Orten, Städten/i)).toBeInTheDocument();
  });

  it('should show no results message', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.change(input, { target: { value: 'Nonexistent' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/Keine Orte gefunden/i)).toBeInTheDocument();
    });
  });

  it('should call flyTo when selecting a place', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.focus(input);

    await waitFor(() => {
      const result = screen.getByText(/Berlin/);
      fireEvent.click(result);
    });

    expect(mockFlyTo).toHaveBeenCalledWith(52.52, 13.405, 12); // city = zoom 12
  });

  it('should close dropdown on escape', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Suche nach Orten, Städten/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/Berlin/)).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Stadt')).not.toBeInTheDocument();
    });
  });
});
