import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import Header from '@/components/layout/Header';

// Mock the Logo component
vi.mock('@/components/ui/Logo', () => ({
  Logo: ({
    variant,
    size,
    className,
  }: {
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <div data-testid={`logo-${variant}-${size}`} className={className}>
      Logo
    </div>
  ),
}));

// Mock SearchBar component
vi.mock('@/components/search/SearchBar', () => ({
  default: () => (
    <div data-testid="search-bar">
      <input placeholder="Campingplatz suchen..." readOnly />
    </div>
  ),
}));

// Mock FilterPanel component
vi.mock('@/components/search/FilterPanel', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="filter-panel">{children}</div>
  ),
}));

describe('Header', () => {
  it('renders logo', () => {
    render(<Header />);

    // Should render desktop logo
    expect(screen.getByTestId('logo-full-md')).toBeInTheDocument();

    // Should render mobile logo
    expect(screen.getByTestId('logo-icon-md')).toBeInTheDocument();
  });

  it('renders search input on desktop', () => {
    render(<Header />);

    const searchInput = screen.getByPlaceholderText('Campingplatz suchen...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('readonly');
  });

  it('renders filter button', () => {
    render(<Header />);

    // Look for the button with the sliders icon (filter button)
    const filterButton = screen.getByRole('button');
    const hasFilterIcon = filterButton.querySelector(
      '.lucide-sliders-horizontal',
    );
    expect(hasFilterIcon).toBeTruthy();
    expect(filterButton).toBeInTheDocument();
  });

  it.skip('renders mobile search button', () => {
    render(<Header />);

    // Look for the mobile search button (should be a button with Search icon and lg:hidden class)
    const buttons = screen.getAllByRole('button');
    const mobileSearchButton = buttons.find((button) =>
      button.className.includes('lg:hidden'),
    );

    // Fallback: look for any button that has search icon
    const searchButton =
      mobileSearchButton ||
      buttons.find((button) => button.querySelector('.lucide-search'));

    expect(searchButton).toBeInTheDocument();
  });
});
