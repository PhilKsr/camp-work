import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import CoverageLegend from '@/components/map/CoverageLegend';

// Mock the simplified coverage store
const mockUseCoverageStore = vi.fn(() => ({
  isVisible: true,
}));

vi.mock('@/stores/coverageStore', () => ({
  useCoverageStore: mockUseCoverageStore,
}));

describe('CoverageLegend', () => {
  it('renders BNetzA coverage legend when visible', () => {
    render(<CoverageLegend />);

    expect(screen.getByText('O2 Netzabdeckung')).toBeInTheDocument();
    expect(
      screen.getByText('© Bundesnetzagentur, Stand: Okt. 2025'),
    ).toBeInTheDocument();
    expect(screen.getByText('Versorgung in Gebäuden')).toBeInTheDocument();
    expect(screen.getByText('Versorgung im Freien')).toBeInTheDocument();
    expect(screen.getByText('Keine Versorgung')).toBeInTheDocument();
  });

  it('does not render when coverage layer is not visible', () => {
    mockUseCoverageStore.mockReturnValue({
      isVisible: false,
    });

    render(<CoverageLegend />);

    expect(screen.queryByText('O2 Netzabdeckung')).not.toBeInTheDocument();
  });

  it('shows BNetzA attribution and data source', () => {
    render(<CoverageLegend />);

    expect(screen.getByText('O2 Netzabdeckung')).toBeInTheDocument();
    expect(
      screen.getByText('© Bundesnetzagentur, Stand: Okt. 2025'),
    ).toBeInTheDocument();
  });

  it('renders color indicators for each coverage type', () => {
    render(<CoverageLegend />);

    const colorIndicators = screen.getAllByTestId(/^coverage-indicator-/);
    expect(colorIndicators).toHaveLength(3); // Indoor, Outdoor, None
  });
});
