import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelCard, PixelCardHeader, PixelCardContent } from '@/components/shared/PixelCard';

describe('PixelCard', () => {
  describe('basic rendering', () => {
    it('should render children', () => {
      render(
        <PixelCard>
          <div>Test Content</div>
        </PixelCard>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply base variant styles by default', () => {
      const { container } = render(<PixelCard>Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
      expect(card).toHaveClass('bg-[var(--color-bg-dark)]');
      expect(card).toHaveClass('border-4');
      expect(card).toHaveClass('pixel-border');
    });
  });

  describe('variant prop', () => {
    it('should apply base variant styles', () => {
      const { container } = render(<PixelCard variant="base">Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('pixel-border');
    });

    it('should apply glow variant styles', () => {
      const { container } = render(<PixelCard variant="glow">Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('glitch-hover');
      expect(card).toHaveClass('hover:border-[var(--color-secondary)]');
    });

    it('should apply gradient variant styles', () => {
      const { container } = render(<PixelCard variant="gradient">Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('should apply scanline variant styles', () => {
      const { container } = render(<PixelCard variant="scanline">Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('scanline-container');
    });
  });

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(<PixelCard className="custom-class">Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should preserve base styles when custom className is added', () => {
      const { container } = render(<PixelCard className="custom-class">Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('pixel-border');
    });
  });

  describe('onClick prop', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<PixelCard onClick={handleClick}>Content</PixelCard>);
      const card = screen.getByRole('button');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when onClick is provided', () => {
      render(<PixelCard onClick={() => {}}>Content</PixelCard>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not have button role when onClick is not provided', () => {
      render(<PixelCard>Content</PixelCard>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should apply cursor-pointer when onClick is provided', () => {
      const { container } = render(<PixelCard onClick={() => {}}>Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should be keyboard accessible with Enter key', () => {
      const handleClick = jest.fn();
      render(<PixelCard onClick={handleClick}>Content</PixelCard>);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', () => {
      const handleClick = jest.fn();
      render(<PixelCard onClick={handleClick}>Content</PixelCard>);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have tabIndex when onClick is provided', () => {
      const { container } = render(<PixelCard onClick={() => {}}>Content</PixelCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});

describe('PixelCardHeader', () => {
  it('should render children', () => {
    render(<PixelCardHeader>Header Text</PixelCardHeader>);
    expect(screen.getByText('Header Text')).toBeInTheDocument();
  });

  it('should apply default header styles', () => {
    const { container } = render(<PixelCardHeader>Header</PixelCardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header.tagName).toBe('H3');
    expect(header).toHaveClass('text-lg');
    expect(header).toHaveClass('font-pixel');
    expect(header).toHaveClass('text-[var(--color-primary)]');
    expect(header).toHaveClass('glow-text-subtle');
  });

  it('should apply custom className', () => {
    const { container } = render(<PixelCardHeader className="custom-header">Header</PixelCardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('custom-header');
    expect(header).toHaveClass('font-pixel');
  });
});

describe('PixelCardContent', () => {
  it('should render children', () => {
    render(
      <PixelCardContent>
        <p>Content Text</p>
      </PixelCardContent>
    );
    expect(screen.getByText('Content Text')).toBeInTheDocument();
  });

  it('should apply default content styles', () => {
    const { container } = render(<PixelCardContent>Content</PixelCardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('space-y-3');
  });

  it('should apply custom className', () => {
    const { container } = render(<PixelCardContent className="custom-content">Content</PixelCardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('custom-content');
    expect(content).toHaveClass('space-y-3');
  });
});

describe('PixelCard composition', () => {
  it('should work with header and content components', () => {
    render(
      <PixelCard>
        <PixelCardHeader>Title</PixelCardHeader>
        <PixelCardContent>
          <p>Body text</p>
        </PixelCardContent>
      </PixelCard>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });
});

// Made with Bob
