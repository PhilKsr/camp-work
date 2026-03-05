import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import CoverageLegend from '@/components/map/CoverageLegend';

// Mock the coverage store
const mockUseCoverageStore = vi.fn(() => ({
  isVisible: true,
  source: 'o2',
}));

vi.mock('@/stores/coverageStore', () => ({
  useCoverageStore: mockUseCoverageStore,
}));

// Mock brand colors
vi.mock('@/lib/brand', () => ({
  coverageColors: {
    '5g': { hex: '#28A745', label: 'Exzellent' },
    '4g': { hex: '#E19B53', label: 'Gut zum Arbeiten' },
    '3g': { hex: '#FFC107', label: 'Eingeschränkt' },
    none: { hex: '#DC3545', label: 'Kein Netz' },
  },
}));

describe('CoverageLegend', () => {
  it('renders all coverage levels when visible', () => {
    render(<CoverageLegend />);

    expect(screen.getByText('O2 Netzabdeckung')).toBeInTheDocument();
    expect(screen.getByText('5G – Exzellent')).toBeInTheDocument();
    expect(screen.getByText('LTE/4G – Gut zum Arbeiten')).toBeInTheDocument();
    expect(screen.getByText('3G – Eingeschränkt')).toBeInTheDocument();
    expect(screen.getByText('Kein Netz')).toBeInTheDocument();
  });

  it('does not render when coverage layer is not visible', () => {
    mockUseCoverageStore.mockReturnValue({
      isVisible: false,
      source: 'o2',
    });

    render(<CoverageLegend />);

    expect(screen.queryByText('O2 Netzabdeckung')).not.toBeInTheDocument();
  });

  it('shows BNetzA data source when applicable', () => {
    mockUseCoverageStore.mockReturnValue({
      isVisible: true,
      source: 'bnetza',
    });

    render(<CoverageLegend />);

    expect(screen.getByText('BNetzA Netzabdeckung')).toBeInTheDocument();
  });

  it('renders color indicators for each coverage level', () => {
    render(<CoverageLegend />);

    const colorIndicators = screen.getAllByTestId(/^coverage-indicator-/);
    expect(colorIndicators).toHaveLength(4);
  });
});
