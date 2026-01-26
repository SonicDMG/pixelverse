'use client';

import { useMemo } from 'react';

interface TextBlockProps {
  content: string;
  format?: 'plain' | 'markdown';
}

/**
 * TextBlock - Displays formatted text content with space theme styling
 * 
 * Supports both plain text and markdown formatting with:
 * - Dark background matching space theme
 * - Glowing text effects
 * - Proper spacing and typography
 * - Responsive design
 */
export default function TextBlock({ content, format = 'plain' }: TextBlockProps) {
  // Simple markdown parser for basic formatting
  const formattedContent = useMemo(() => {
    if (format === 'plain') {
      return content;
    }

    // Basic markdown support
    let formatted = content;

    // Headers (## Header)
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-lg font-pixel text-[#00CED1] mb-3 mt-4 first:mt-0 glow-text">$1</h2>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-base font-pixel text-[#9370DB] mb-2 mt-3 glow-text">$1</h3>');
    
    // Bold (**text**)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#00CED1] font-bold">$1</strong>');
    
    // Italic (*text*)
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="text-[#9370DB] italic">$1</em>');
    
    // Code (`code`)
    formatted = formatted.replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-[#1a1f3a] border border-[#4169E1]/30 rounded text-[#00CED1] font-mono text-xs">$1</code>');
    
    // Links ([text](url))
    formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#4169E1] hover:text-[#00CED1] underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Line breaks (double newline = paragraph)
    formatted = formatted.split('\n\n').map(para => 
      para.trim() ? `<p class="mb-3 last:mb-0">${para.replace(/\n/g, '<br />')}</p>` : ''
    ).join('');

    return formatted;
  }, [content, format]);

  if (format === 'markdown') {
    return (
      <div className="p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-2 border-[#4169E1]/40 rounded-lg pixel-border hover:border-[#00CED1]/60 transition-all duration-300 shadow-lg hover:shadow-[#4169E1]/20">
        <div 
          className="font-pixel text-sm text-white/90 leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-2 border-[#4169E1]/40 rounded-lg pixel-border hover:border-[#00CED1]/60 transition-all duration-300 shadow-lg hover:shadow-[#4169E1]/20">
      <p className="font-pixel text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}

// Made with Bob