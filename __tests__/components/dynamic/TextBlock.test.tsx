import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextBlock } from '@/components/dynamic/TextBlock';

describe('TextBlock', () => {
  describe('plain text format', () => {
    it('should render plain text content', () => {
      render(<TextBlock content="Simple text content" format="plain" />);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should use markdown format by default', () => {
      const content = '**Bold text**';
      const { container } = render(<TextBlock content={content} />);

      // Should render markdown by default (bold text becomes <strong>)
      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong).toHaveTextContent('Bold text');
    });

    it('should preserve whitespace in plain text', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<TextBlock content={content} format="plain" />);

      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass('whitespace-pre-wrap');
    });

    it('should render multiline plain text', () => {
      const content = 'First line\nSecond line\nThird line';
      const { container } = render(<TextBlock content={content} format="plain" />);

      const paragraph = container.querySelector('p');
      // The paragraph should contain the text, but HTML rendering may collapse whitespace
      // The whitespace-pre-wrap class preserves it in the browser
      expect(paragraph).toHaveClass('whitespace-pre-wrap');
      expect(paragraph?.textContent).toContain('First line');
      expect(paragraph?.textContent).toContain('Second line');
      expect(paragraph?.textContent).toContain('Third line');
    });
  });

  describe('markdown format', () => {
    it('should render markdown headers', () => {
      const content = '## Main Header\n### Sub Header';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');

      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
      expect(h2).toHaveTextContent('Main Header');
      expect(h3).toHaveTextContent('Sub Header');
    });

    it('should render bold text', () => {
      const content = 'This is **bold text**';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong).toHaveTextContent('bold text');
    });

    it('should render italic text', () => {
      const content = 'This is *italic text*';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const em = container.querySelector('em');
      expect(em).toBeInTheDocument();
      expect(em).toHaveTextContent('italic text');
    });

    it('should render inline code', () => {
      const content = 'Use `console.log()` for debugging';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code).toHaveTextContent('console.log()');
    });

    it('should render links', () => {
      const content = 'Visit [OpenAI](https://openai.com) for more info';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://openai.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveTextContent('OpenAI');
    });

    it('should render paragraphs from double newlines', () => {
      const content = 'First paragraph\n\nSecond paragraph\n\nThird paragraph';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(3);
    });

    it('should convert single newlines to line breaks within paragraphs', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const paragraph = container.querySelector('p');
      expect(paragraph?.innerHTML).toContain('<br');
    });

    it('should handle mixed markdown formatting', () => {
      const content = '## Header\n\nThis is **bold** and *italic* with `code`.\n\nVisit [link](https://example.com)';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeInTheDocument();
    });

    it('should use dangerouslySetInnerHTML for markdown', () => {
      const content = '**Bold text**';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const div = container.querySelector('div[class*="prose"]');
      expect(div).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply space theme styling', () => {
      const { container } = render(<TextBlock content="Test" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-gradient-to-br');
      expect(wrapper).toHaveClass('from-[#0a0e27]');
      expect(wrapper).toHaveClass('to-[#1a1f3a]');
    });

    it('should have border styling', () => {
      const { container } = render(<TextBlock content="Test" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('border-2');
      expect(wrapper).toHaveClass('pixel-border');
    });

    it('should have hover effects', () => {
      const { container } = render(<TextBlock content="Test" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('hover:border-[#00CED1]/60');
      expect(wrapper).toHaveClass('transition-all');
    });

    it('should apply font-pixel class', () => {
      const { container } = render(<TextBlock content="Test" format="plain" />);

      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass('font-pixel');
    });

    it('should apply prose styling for markdown', () => {
      const { container } = render(<TextBlock content="Test" format="markdown" />);

      const div = container.querySelector('div[class*="prose"]');
      expect(div).toHaveClass('prose');
      expect(div).toHaveClass('prose-invert');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<TextBlock content="" format="plain" />);

      // With plain format, empty content should still render a <p> tag
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(10000);
      render(<TextBlock content={longText} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in plain text', () => {
      const content = '<script>alert("xss")</script>';
      render(<TextBlock content={content} format="plain" />);

      // Should render as text, not execute
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('should handle markdown with no formatting', () => {
      const content = 'Just plain text in markdown mode';
      render(<TextBlock content={content} format="markdown" />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('should handle incomplete markdown syntax', () => {
      const content = '**Unclosed bold';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      // Should still render something
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('should handle multiple consecutive newlines', () => {
      const content = 'Text\n\n\n\nMore text';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
    });
  });

  describe('markdown header styling', () => {
    it('should apply glow effect to h2 headers', () => {
      const content = '## Glowing Header';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const h2 = container.querySelector('h2');
      expect(h2).toHaveClass('glow-text');
      expect(h2).toHaveClass('text-[#00CED1]');
    });

    it('should apply different color to h3 headers', () => {
      const content = '### Sub Header';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const h3 = container.querySelector('h3');
      expect(h3).toHaveClass('glow-text');
      expect(h3).toHaveClass('text-[#9370DB]');
    });

    it('should apply proper spacing to headers', () => {
      const content = '## Header\n\nContent';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const h2 = container.querySelector('h2');
      expect(h2).toHaveClass('mb-3');
      expect(h2).toHaveClass('mt-4');
      expect(h2).toHaveClass('first:mt-0');
    });
  });

  describe('markdown code styling', () => {
    it('should apply monospace font to code', () => {
      const content = 'Use `code` here';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const code = container.querySelector('code');
      expect(code).toHaveClass('font-mono');
    });

    it('should apply background to code blocks', () => {
      const content = 'Use `code` here';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const code = container.querySelector('code');
      expect(code).toHaveClass('bg-[#1a1f3a]');
      expect(code).toHaveClass('border');
    });
  });

  describe('markdown link styling', () => {
    it('should apply hover effects to links', () => {
      const content = '[Link](https://example.com)';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const link = container.querySelector('a');
      expect(link).toHaveClass('hover:text-[#00CED1]');
      expect(link).toHaveClass('transition-colors');
    });

    it('should apply underline to links', () => {
      const content = '[Link](https://example.com)';
      const { container } = render(<TextBlock content={content} format="markdown" />);

      const link = container.querySelector('a');
      expect(link).toHaveClass('underline');
    });
  });

  describe('useMemo optimization', () => {
    it('should memoize formatted content', () => {
      const content = '**Bold text**';
      const { rerender } = render(<TextBlock content={content} format="markdown" />);

      // Re-render with same props
      rerender(<TextBlock content={content} format="markdown" />);

      // Content should still be rendered correctly
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('should update when content changes', () => {
      const { rerender } = render(<TextBlock content="First" format="plain" />);

      expect(screen.getByText('First')).toBeInTheDocument();

      rerender(<TextBlock content="Second" format="plain" />);

      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should update when format changes', () => {
      const content = '**Bold**';
      const { container, rerender } = render(<TextBlock content={content} format="plain" />);

      expect(screen.getByText(content)).toBeInTheDocument();
      expect(container.querySelector('strong')).not.toBeInTheDocument();

      rerender(<TextBlock content={content} format="markdown" />);

      expect(container.querySelector('strong')).toBeInTheDocument();
    });
  });
});

// Made with Bob