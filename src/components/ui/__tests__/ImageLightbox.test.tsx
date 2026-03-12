import { render, screen, fireEvent } from '@testing-library/react';
import { ImageLightbox } from '../ImageLightbox';
import { vi } from 'vitest';

// Mock createPortal to render in same DOM
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (element: React.ReactNode) => element,
}));

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

describe('ImageLightbox', () => {
  const defaultProps = {
    images: mockImages,
    initialIndex: 0,
    alt: 'Test campground',
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<ImageLightbox {...defaultProps} isOpen={false} />);

    expect(screen.queryByAltText('Test campground 1')).not.toBeInTheDocument();
  });

  it('renders lightbox when open', () => {
    render(<ImageLightbox {...defaultProps} />);

    expect(screen.getByAltText('Test campground 1')).toBeInTheDocument();
  });

  it('shows close button', () => {
    render(<ImageLightbox {...defaultProps} />);

    expect(screen.getByLabelText('Schließen')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Schließen'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when background clicked', () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);

    // Click on background (parent div)
    const background = screen.getByRole('img').closest('.fixed');
    fireEvent.click(background!);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not close when image container clicked', () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);

    // Click on image container
    const imageContainer = screen.getByRole('img').closest('.relative');
    fireEvent.click(imageContainer!);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows navigation arrows for multiple images', () => {
    render(<ImageLightbox {...defaultProps} />);

    expect(screen.getByLabelText('Vorheriges Bild')).toBeInTheDocument();
    expect(screen.getByLabelText('Nächstes Bild')).toBeInTheDocument();
  });

  it('hides navigation arrows for single image', () => {
    render(
      <ImageLightbox
        {...defaultProps}
        images={['https://example.com/single.jpg']}
      />,
    );

    expect(screen.queryByLabelText('Vorheriges Bild')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nächstes Bild')).not.toBeInTheDocument();
  });

  it('shows image counter for multiple images', () => {
    render(<ImageLightbox {...defaultProps} />);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('hides image counter for single image', () => {
    render(
      <ImageLightbox
        {...defaultProps}
        images={['https://example.com/single.jpg']}
      />,
    );

    expect(screen.queryByText(/\/ 1$/)).not.toBeInTheDocument();
  });

  it('shows dot indicators for multiple images (up to 10)', () => {
    render(<ImageLightbox {...defaultProps} />);

    const dots = screen.getAllByLabelText(/^Bild \d+$/);
    expect(dots).toHaveLength(3);
  });

  it('hides dot indicators for more than 10 images', () => {
    const manyImages = Array.from({ length: 12 }, (_, i) => `img${i}.jpg`);
    render(<ImageLightbox {...defaultProps} images={manyImages} />);

    const dots = screen.queryAllByLabelText(/^Bild \d+$/);
    expect(dots).toHaveLength(0);
  });

  it('navigates to next image', () => {
    render(<ImageLightbox {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Nächstes Bild'));

    expect(screen.getByAltText('Test campground 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous image', () => {
    render(<ImageLightbox {...defaultProps} initialIndex={1} />);

    fireEvent.click(screen.getByLabelText('Vorheriges Bild'));

    expect(screen.getByAltText('Test campground 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates via dot indicators', () => {
    render(<ImageLightbox {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Bild 3'));

    expect(screen.getByAltText('Test campground 3')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);

    // Test Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    // Reset mock
    onClose.mockClear();

    // Test Arrow keys
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Test campground 2')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Test campground 1')).toBeInTheDocument();
  });

  it('handles touch swipe gestures', () => {
    render(<ImageLightbox {...defaultProps} />);

    const imageContainer = screen.getByRole('img').closest('.relative');

    // Simulate swipe left (next image)
    fireEvent.touchStart(imageContainer!, {
      touches: [{ clientX: 100, clientY: 0 }],
    });
    fireEvent.touchMove(imageContainer!, {
      touches: [{ clientX: 40, clientY: 0 }],
    });
    fireEvent.touchEnd(imageContainer!);

    expect(screen.getByAltText('Test campground 2')).toBeInTheDocument();
  });

  it('cycles through images correctly', () => {
    render(<ImageLightbox {...defaultProps} initialIndex={2} />);

    // At last image, next should go to first
    fireEvent.click(screen.getByLabelText('Nächstes Bild'));
    expect(screen.getByAltText('Test campground 1')).toBeInTheDocument();

    // At first image, previous should go to last
    fireEvent.click(screen.getByLabelText('Vorheriges Bild'));
    expect(screen.getByAltText('Test campground 3')).toBeInTheDocument();
  });

  it('starts at correct initial index', () => {
    render(<ImageLightbox {...defaultProps} initialIndex={1} />);

    expect(screen.getByAltText('Test campground 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('updates when initial index changes', () => {
    const { rerender } = render(
      <ImageLightbox {...defaultProps} initialIndex={0} />,
    );

    expect(screen.getByAltText('Test campground 1')).toBeInTheDocument();

    rerender(<ImageLightbox {...defaultProps} initialIndex={2} />);

    expect(screen.getByAltText('Test campground 3')).toBeInTheDocument();
  });

  it('locks body scroll when open', () => {
    const originalOverflow = document.body.style.overflow;

    render(<ImageLightbox {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');

    // Cleanup
    document.body.style.overflow = originalOverflow;
  });
});
