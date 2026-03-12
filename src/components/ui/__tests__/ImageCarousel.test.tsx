import { render, screen, fireEvent } from '@testing-library/react';
import { ImageCarousel } from '../ImageCarousel';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const mockImages = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
];

describe('ImageCarousel', () => {
  it('renders fallback when no images provided', () => {
    render(<ImageCarousel images={[]} alt="Test" />);
    const tentIcon = document.querySelector('.lucide-tent');
    expect(tentIcon).toBeInTheDocument();
  });

  it('renders images when provided', () => {
    render(<ImageCarousel images={mockImages} alt="Test campground" />);

    // First image should be visible
    expect(screen.getByAltText('Test campground 1')).toBeInTheDocument();
  });

  it('shows navigation arrows for multiple images', () => {
    render(<ImageCarousel images={mockImages} alt="Test" showArrows={true} />);

    expect(screen.getByLabelText('Vorheriges Bild')).toBeInTheDocument();
    expect(screen.getByLabelText('Nächstes Bild')).toBeInTheDocument();
  });

  it('hides navigation arrows when disabled', () => {
    render(<ImageCarousel images={mockImages} alt="Test" showArrows={false} />);

    expect(screen.queryByLabelText('Vorheriges Bild')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nächstes Bild')).not.toBeInTheDocument();
  });

  it('shows dot indicators for multiple images', () => {
    render(<ImageCarousel images={mockImages} alt="Test" showDots={true} />);

    // Should have 3 dots for 3 images
    const dots = screen.getAllByLabelText(/^Bild \d+$/);
    expect(dots).toHaveLength(3);
  });

  it('hides dot indicators when disabled', () => {
    render(<ImageCarousel images={mockImages} alt="Test" showDots={false} />);

    const dots = screen.queryAllByLabelText(/^Bild \d+$/);
    expect(dots).toHaveLength(0);
  });

  it('navigates to next image when next button clicked', () => {
    render(<ImageCarousel images={mockImages} alt="Test" />);

    const nextButton = screen.getByLabelText('Nächstes Bild');
    fireEvent.click(nextButton);

    // Should show second image
    expect(screen.getByAltText('Test 2')).toBeInTheDocument();
  });

  it('navigates to previous image when prev button clicked', () => {
    render(<ImageCarousel images={mockImages} alt="Test" />);

    // Go to next first
    const nextButton = screen.getByLabelText('Nächstes Bild');
    fireEvent.click(nextButton);

    // Then go back
    const prevButton = screen.getByLabelText('Vorheriges Bild');
    fireEvent.click(prevButton);

    // Should be back to first image
    expect(screen.getByAltText('Test 1')).toBeInTheDocument();
  });

  it('calls onImageClick when image is clicked', () => {
    const onImageClick = vi.fn();
    render(
      <ImageCarousel
        images={mockImages}
        alt="Test"
        onImageClick={onImageClick}
      />,
    );

    // Click on the carousel container
    const carousel = screen.getByAltText('Test 1').closest('.cursor-pointer');
    fireEvent.click(carousel!);

    expect(onImageClick).toHaveBeenCalledWith(0);
  });

  it('navigates via dot indicators', () => {
    render(<ImageCarousel images={mockImages} alt="Test" />);

    // Click on third dot
    const thirdDot = screen.getByLabelText('Bild 3');
    fireEvent.click(thirdDot);

    expect(screen.getByAltText('Test 3')).toBeInTheDocument();
  });

  it('cycles through images correctly', () => {
    render(<ImageCarousel images={mockImages} alt="Test" />);

    const nextButton = screen.getByLabelText('Nächstes Bild');

    // Start at image 1, click next 3 times should cycle back to image 1
    fireEvent.click(nextButton); // Image 2
    fireEvent.click(nextButton); // Image 3
    fireEvent.click(nextButton); // Should cycle back to Image 1

    expect(screen.getByAltText('Test 1')).toBeInTheDocument();
  });

  it('handles touch events for swiping', () => {
    render(<ImageCarousel images={mockImages} alt="Test" />);

    const carousel = screen.getByAltText('Test 1').closest('div');

    // Simulate swipe left (should go to next)
    fireEvent.touchStart(carousel!, {
      touches: [{ clientX: 100, clientY: 0 }],
    });
    fireEvent.touchMove(carousel!, {
      touches: [{ clientX: 40, clientY: 0 }],
    });
    fireEvent.touchEnd(carousel!);

    // Should navigate to second image
    expect(screen.getByAltText('Test 2')).toBeInTheDocument();
  });

  it('applies custom height class', () => {
    render(<ImageCarousel images={mockImages} alt="Test" height="h-[300px]" />);

    const carousel = screen.getByAltText('Test 1').closest('.h-\\[300px\\]');
    expect(carousel).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ImageCarousel images={mockImages} alt="Test" className="custom-class" />,
    );

    const carousel = screen.getByAltText('Test 1').closest('.custom-class');
    expect(carousel).toBeInTheDocument();
  });
});
