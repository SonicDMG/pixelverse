import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChangeIndicator, ChangeIndicatorWithSign } from '@/components/shared/ChangeIndicator';

describe('ChangeIndicator', () => {
  describe('basic rendering', () => {
    it('should render positive change with up arrow', () => {
      render(<ChangeIndicator value={5.25} />);
      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('5.25%')).toBeInTheDocument();
    });

    it('should render negative change with down arrow', () => {
      render(<ChangeIndicator value={-3.5} />);
      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.getByText('3.50%')).toBeInTheDocument();
    });

    it('should render zero with up arrow', () => {
      render(<ChangeIndicator value={0} />);
      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });

    it('should not render when value is undefined', () => {
      const { container } = render(<ChangeIndicator value={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('showIcon prop', () => {
    it('should hide icon when showIcon is false', () => {
      render(<ChangeIndicator value={5.25} showIcon={false} />);
      expect(screen.queryByText('▲')).not.toBeInTheDocument();
      expect(screen.getByText('5.25%')).toBeInTheDocument();
    });

    it('should show icon by default', () => {
      render(<ChangeIndicator value={5.25} />);
      expect(screen.getByText('▲')).toBeInTheDocument();
    });
  });

  describe('showPercentage prop', () => {
    it('should hide percentage when showPercentage is false', () => {
      render(<ChangeIndicator value={5.25} showPercentage={false} />);
      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.queryByText('5.25%')).not.toBeInTheDocument();
    });

    it('should show percentage by default', () => {
      render(<ChangeIndicator value={5.25} />);
      expect(screen.getByText('5.25%')).toBeInTheDocument();
    });
  });

  describe('label prop', () => {
    it('should render label when provided', () => {
      render(<ChangeIndicator value={5.25} label="vs last month" />);
      expect(screen.getByText('(vs last month)')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(<ChangeIndicator value={5.25} />);
      expect(container.textContent).not.toContain('(');
    });
  });

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(<ChangeIndicator value={5.25} className="custom-class" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });
  });

  describe('color styling', () => {
    it('should apply secondary color for positive values', () => {
      const { container } = render(<ChangeIndicator value={5.25} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-[var(--color-secondary)]');
    });

    it('should apply error color for negative values', () => {
      const { container } = render(<ChangeIndicator value={-5.25} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-[var(--color-error)]');
    });
  });
});

describe('ChangeIndicatorWithSign', () => {
  describe('basic rendering', () => {
    it('should render positive change with + sign', () => {
      render(<ChangeIndicatorWithSign value={5.25} />);
      expect(screen.getByText('+5.25%')).toBeInTheDocument();
    });

    it('should render negative change with - sign', () => {
      render(<ChangeIndicatorWithSign value={-3.5} />);
      expect(screen.getByText('-3.50%')).toBeInTheDocument();
    });

    it('should render zero with + sign', () => {
      render(<ChangeIndicatorWithSign value={0} />);
      expect(screen.getByText('+0.00%')).toBeInTheDocument();
    });

    it('should not render when value is undefined', () => {
      const { container } = render(<ChangeIndicatorWithSign value={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('label prop', () => {
    it('should render label when provided', () => {
      render(<ChangeIndicatorWithSign value={5.25} label="vs last year" />);
      expect(screen.getByText('(vs last year)')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(<ChangeIndicatorWithSign value={5.25} />);
      expect(container.textContent).not.toContain('(');
    });
  });

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(<ChangeIndicatorWithSign value={5.25} className="custom-class" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });
  });

  describe('color styling', () => {
    it('should apply secondary color for positive values', () => {
      const { container } = render(<ChangeIndicatorWithSign value={5.25} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-[var(--color-secondary)]');
    });

    it('should apply error color for negative values', () => {
      const { container } = render(<ChangeIndicatorWithSign value={-5.25} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-[var(--color-error)]');
    });
  });
});

// Made with Bob
