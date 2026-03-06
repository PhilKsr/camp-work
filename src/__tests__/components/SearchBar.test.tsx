import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '@/components/search/SearchBar';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { mockGeoJSON, createMockQueryResult } from '../helpers';

// Mock the stores and hooks
vi.mock('@/stores/filterStore');
vi.mock('@/stores/mapStore');
vi.mock('@/hooks/useCampgrounds');

const mockFilterStore = {
  setSearchQuery: vi.fn(),
};

const mockMapStore = {
  setSelectedCampground: vi.fn(),
  flyTo: vi.fn(),
};

const mockCampgroundsData = mockGeoJSON;

describe('SearchBar', () => {
  beforeEach(() => {
    vi.mocked(useFilterStore).mockReturnValue(mockFilterStore);
    vi.mocked(useMapStore).mockReturnValue(mockMapStore);
    vi.mocked(useCampgrounds).mockReturnValue(
      createMockQueryResult(mockCampgroundsData),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input on desktop', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should update search query on input', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.change(searchInput, { target: { value: 'Berlin' } });

    // Wait for debounced query to update
    await waitFor(
      () => {
        expect(mockFilterStore.setSearchQuery).toHaveBeenCalledWith('Berlin');
      },
      { timeout: 500 },
    );
  });

  it('should show search results when typing', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.change(searchInput, { target: { value: 'Camping' } });
    fireEvent.focus(searchInput);

    // Wait for debounced search
    await waitFor(
      () => {
        expect(screen.getByText('Camping am See')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should show placeholder text for empty query', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.focus(searchInput);

    expect(screen.getByText('Suche nach Name oder Ort...')).toBeInTheDocument();
  });

  it('should show no results message for query with no matches', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    fireEvent.focus(searchInput);

    await waitFor(
      () => {
        expect(
          screen.getByText('Keine Ergebnisse für "Nonexistent"'),
        ).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should select campground when clicked', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.change(searchInput, { target: { value: 'Camping' } });
    fireEvent.focus(searchInput);

    await waitFor(
      () => {
        const resultItem = screen.getByText('Camping am See');
        fireEvent.click(resultItem);
      },
      { timeout: 500 },
    );

    expect(mockMapStore.setSelectedCampground).toHaveBeenCalledWith('1');
    expect(mockMapStore.flyTo).toHaveBeenCalledWith(52.5, 13.4, 14);
    expect(mockFilterStore.setSearchQuery).toHaveBeenCalledWith('');
  });

  it('should close dropdown on escape key', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.change(searchInput, { target: { value: 'Camping' } });
    fireEvent.focus(searchInput);

    await waitFor(
      () => {
        expect(screen.getByText('Camping am See')).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Camping am See')).not.toBeInTheDocument();
    });
  });

  it('should show coverage and type badges in search results', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');
    fireEvent.change(searchInput, { target: { value: 'Camping' } });
    fireEvent.focus(searchInput);

    await waitFor(
      () => {
        expect(screen.getByText('4G')).toBeInTheDocument();
        expect(screen.getByText('Campingplatz')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should debounce search input', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText('Suche Campingplätze...');

    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'C' } });
    fireEvent.change(searchInput, { target: { value: 'Ca' } });
    fireEvent.change(searchInput, { target: { value: 'Cam' } });

    // Should only call setSearchQuery once after debounce delay
    await waitFor(
      () => {
        expect(mockFilterStore.setSearchQuery).toHaveBeenCalledTimes(1);
        expect(mockFilterStore.setSearchQuery).toHaveBeenCalledWith('Cam');
      },
      { timeout: 500 },
    );
  });
});
