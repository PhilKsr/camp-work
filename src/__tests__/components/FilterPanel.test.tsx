import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '@/components/search/FilterPanel';
import { useFilterStore } from '@/stores/filterStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useViewportCampgrounds } from '@/hooks/useViewportCampgrounds';
import { mockGeoJSON } from '../helpers';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() =>
        Promise.reject(new Error('Supabase not available in tests')),
      ),
    })),
  },
}));

// Mock the stores and hooks
vi.mock('@/stores/filterStore');
vi.mock('@/stores/favoriteStore');
vi.mock('@/hooks/useViewportCampgrounds');

const mockFilterStore = {
  coverageLevels: ['5g', '4g', '3g', 'none'],
  workFriendlyOnly: false,
  types: ['camp_site', 'caravan_site'],
  features: [],
  favoritesOnly: false,
  toggleCoverageLevel: vi.fn(),
  setWorkFriendlyOnly: vi.fn(),
  toggleType: vi.fn(),
  toggleFeature: vi.fn(),
  setFavoritesOnly: vi.fn(),
  resetFilters: vi.fn(),
  activeFilterCount: vi.fn(() => 0),
};

const mockFavoriteStore = {
  favorites: ['1', '2'],
};

// Mock viewport campgrounds - just the properties array
const mockViewportCampgrounds = mockGeoJSON.features.map((f) => f.properties);

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.mocked(useFilterStore).mockReturnValue(mockFilterStore);
    vi.mocked(useFavoriteStore).mockReturnValue(mockFavoriteStore);
    vi.mocked(useViewportCampgrounds).mockReturnValue(mockViewportCampgrounds);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter sections', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    // Open the filter panel
    fireEvent.click(screen.getByText('Open Filter'));

    expect(screen.getByText('Filter')).toBeInTheDocument(); // Single Sheet
    expect(screen.getByText('Nur zum Arbeiten geeignet')).toBeInTheDocument();
    expect(screen.getByText('Netzabdeckung')).toBeInTheDocument();
    expect(screen.getByText('Typ')).toBeInTheDocument();
    expect(screen.getByText('Ausstattung')).toBeInTheDocument();
    expect(screen.getByText('Favoriten')).toBeInTheDocument();
  });

  it('should render coverage level options', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    expect(screen.getByText('5G – Exzellent')).toBeInTheDocument();
    expect(screen.getByText('LTE/4G – Gut zum Arbeiten')).toBeInTheDocument();
    expect(screen.getByText('3G – Eingeschränkt')).toBeInTheDocument();
    expect(screen.getByText('Kein Netz')).toBeInTheDocument();
  });

  it('should render campground types', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    expect(screen.getByText('Campingplätze')).toBeInTheDocument();
    expect(screen.getByText('Wohnmobilstellplätze')).toBeInTheDocument();
  });

  it('should call toggle functions when options are clicked', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    // Test coverage level toggle (use hidden: true to access aria-hidden elements)
    const fiveGCheckboxes = screen.getAllByRole('checkbox', {
      name: /5g.*exzellent/i,
      hidden: true,
    });
    fireEvent.click(fiveGCheckboxes[0]);
    expect(mockFilterStore.toggleCoverageLevel).toHaveBeenCalledWith('5g');

    // Test work-friendly toggle
    const workFriendlySwitches = screen.getAllByRole('switch', {
      name: /mindestens lte\/4g verbindung/i,
      hidden: true,
    });
    fireEvent.click(workFriendlySwitches[0]);
    expect(mockFilterStore.setWorkFriendlyOnly).toHaveBeenCalledWith(true);

    // Test type toggle
    const campSiteCheckboxes = screen.getAllByRole('checkbox', {
      name: /campingplätze/i,
      hidden: true,
    });
    fireEvent.click(campSiteCheckboxes[0]);
    expect(mockFilterStore.toggleType).toHaveBeenCalledWith('camp_site');
  });

  it('should show correct result count', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    // Should show filtered result count (both campgrounds match all filters)
    expect(
      screen.getByText('3 Ergebnisse im Kartenbereich'),
    ).toBeInTheDocument();
  });

  it('should call reset filters when reset button is clicked', () => {
    // Mock active filter count > 0 to enable reset button
    mockFilterStore.activeFilterCount = vi.fn(() => 2);

    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    const resetButtons = screen.getAllByRole('button', {
      name: /filter zurücksetzen/i,
      hidden: true,
    });
    const resetButton = resetButtons[0];
    expect(resetButton).not.toBeDisabled();

    fireEvent.click(resetButton);
    expect(mockFilterStore.resetFilters).toHaveBeenCalled();
  });

  it('should disable reset button when no filters are active', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    const resetButtons = screen.getAllByRole('button', {
      name: /filter zurücksetzen/i,
      hidden: true,
    });
    const resetButton = resetButtons[0];
    expect(resetButton).not.toBeDisabled();
  });

  it('should show favorites count', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    expect(screen.getByText(/2 gespeichert/)).toBeInTheDocument();
  });
});
