import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '@/components/search/FilterPanel';
import { useFilterStore } from '@/stores/filterStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { mockGeoJSON, createMockQueryResult } from '../helpers';

// Mock the stores and hooks
vi.mock('@/stores/filterStore');
vi.mock('@/stores/favoriteStore');
vi.mock('@/hooks/useCampgrounds');

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

const mockCampgroundsData = mockGeoJSON;

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.mocked(useFilterStore).mockReturnValue(mockFilterStore);
    vi.mocked(useFavoriteStore).mockReturnValue(mockFavoriteStore);
    vi.mocked(useCampgrounds).mockReturnValue(
      createMockQueryResult(mockCampgroundsData),
    );
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

    expect(screen.getAllByText('Filter')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('Nur zum Arbeiten geeignet')).toHaveLength(2);
    expect(screen.getAllByText('Netzabdeckung')).toHaveLength(2);
    expect(screen.getAllByText('Typ')).toHaveLength(2);
    expect(screen.getAllByText('Ausstattung')).toHaveLength(2);
    expect(screen.getAllByText('Favoriten')).toHaveLength(2);
  });

  it('should render coverage level options', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    expect(screen.getAllByText('5G – Exzellent')).toHaveLength(2);
    expect(screen.getAllByText('LTE/4G – Gut zum Arbeiten')).toHaveLength(2);
    expect(screen.getAllByText('3G – Eingeschränkt')).toHaveLength(2);
    expect(screen.getAllByText('Kein Netz')).toHaveLength(2);
  });

  it('should render campground types', () => {
    render(
      <FilterPanel>
        <button>Open Filter</button>
      </FilterPanel>,
    );

    fireEvent.click(screen.getByText('Open Filter'));

    expect(screen.getAllByText('Campingplätze')).toHaveLength(2);
    expect(screen.getAllByText('Wohnmobilstellplätze')).toHaveLength(2);
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
    expect(screen.getAllByText('3 Ergebnisse anzeigen')).toHaveLength(2);
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

    expect(screen.getAllByText(/2 gespeichert/)).toHaveLength(2);
  });
});
