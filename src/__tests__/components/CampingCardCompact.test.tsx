import { render, screen, fireEvent } from '@testing-library/react';
import { CampingCardCompact } from '@/components/cards/CampingCardCompact';
import type { Campground } from '@/types/campground';

const createMockCampground = (overrides?: Partial<Campground>): Campground => ({
  id: 'test-campground-1',
  name: 'Test Camping am See',
  type: 'camp_site',
  coordinates: [9.993682, 53.551086],
  features: ['wifi', 'power'],
  coverageLevel: '4g',
  source: 'osm',
  lastUpdated: '2024-01-01T00:00:00Z',
  thumbnail: '/campgrounds/test.webp',
  ...overrides,
});

describe('CampingCardCompact', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render campground name', () => {
    const campground = createMockCampground({
      name: 'Camping am Wundersee',
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    expect(screen.getByText('Camping am Wundersee')).toBeInTheDocument();
  });

  it('should render coverage badge with correct label', () => {
    const campground = createMockCampground({
      coverageLevel: '4g',
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    expect(screen.getByText('LTE')).toBeInTheDocument();
  });

  it('should render 5G coverage badge', () => {
    const campground = createMockCampground({
      coverageLevel: '5g',
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    expect(screen.getByText('5G')).toBeInTheDocument();
  });

  it('should render 3G coverage badge', () => {
    const campground = createMockCampground({
      coverageLevel: '3g',
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    expect(screen.getByText('3G')).toBeInTheDocument();
  });

  it('should render no coverage badge for "none" level', () => {
    const campground = createMockCampground({
      coverageLevel: 'none',
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    // 'none' coverage should not show any badge
    expect(screen.queryByText('Kein')).not.toBeInTheDocument();
    expect(screen.queryByText('5G')).not.toBeInTheDocument();
    expect(screen.queryByText('LTE')).not.toBeInTheDocument();
    expect(screen.queryByText('3G')).not.toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const campground = createMockCampground();

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    fireEvent.click(screen.getByText('Test Camping am See'));

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it('should render with images', () => {
    const campground = createMockCampground();
    const mockImages = [
      {
        id: '1',
        campground_id: 'test-campground-1',
        url: '/campgrounds/test.webp',
        source: 'og_image' as const,
        sort_order: 1,
      },
    ];

    render(
      <CampingCardCompact
        campground={campground}
        onClick={mockOnClick}
        images={mockImages}
      />,
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('test.webp'));
    expect(image).toHaveAttribute('alt', 'Test Camping am See');
  });

  it('should render text-focused layout when no images', () => {
    const campground = createMockCampground({
      thumbnail: undefined,
      type: 'caravan_site',
      features: ['power', 'wifi'],
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    // Should show type when no image
    expect(screen.getByText('Stellplatz')).toBeInTheDocument();

    // Should show features when no image (using SVG elements)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('should have correct compact dimensions', () => {
    const campground = createMockCampground();

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    // Find the root card element
    const card = screen
      .getByText('Test Camping am See')
      .closest('[class*="w-[160px]"]');
    expect(card).toHaveClass('w-[160px]', 'flex-shrink-0');
  });

  it('should truncate long campground names', () => {
    const campground = createMockCampground({
      name: 'Sehr langer Campingplatz Name der über mehrere Zeilen gehen würde wenn nicht getrunked',
    });

    render(
      <CampingCardCompact campground={campground} onClick={mockOnClick} />,
    );

    const nameElement = screen.getByText(/Sehr langer Campingplatz/);
    // Should have a line-clamp class (either 1 or 2 depending on image presence)
    expect(nameElement.className).toMatch(/line-clamp-[12]/);
  });
});
