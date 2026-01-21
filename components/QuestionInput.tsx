'use client';

import { useState } from 'react';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const EXAMPLE_QUESTIONS = [
  "How has IBM's stock performed over the last 2 weeks?", // line-chart
  "Compare AAPL vs GOOGL performance", // comparison-chart
  "Show me Amazon's key stock metrics", // metric-grid
  "Show me Microsoft's weekly trading data", // data-table
  "Explain the current market conditions", // text-block
];

export default function QuestionInput({ onSubmit, isLoading }: QuestionInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setQuestion(example);
    }
  };

  return (
    <div className="w-full space-y-4 pt-8">
      {/* Example Questions */}
      <div className="space-y-2">
        <p className="text-[#ff00ff] text-xs font-pixel">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="px-3 py-2 bg-[#1a1f3a] border-2 border-[#00ff9f] text-[#00ff9f] text-xs font-pixel hover:bg-[#00ff9f] hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about any stock..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-[#0a0e27] border-4 border-[#00ff9f] text-[#00ff9f] placeholder-[#00ff9f]/50 font-pixel text-sm focus:outline-none focus:border-[#ff00ff] disabled:opacity-50 pixel-border"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-6 py-3 bg-[#00ff9f] border-4 border-[#00ff9f] text-[#0a0e27] font-pixel text-sm hover:bg-[#ff00ff] hover:border-[#ff00ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
        >
          {isLoading ? (
            <span className="inline-flex">
              <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}>L</span>
              <span className="animate-bounce" style={{ animationDelay: '100ms', animationDuration: '1s' }}>O</span>
              <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}>A</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}>D</span>
              <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}>I</span>
              <span className="animate-bounce" style={{ animationDelay: '500ms', animationDuration: '1s' }}>N</span>
              <span className="animate-bounce" style={{ animationDelay: '600ms', animationDuration: '1s' }}>G</span>
              <span className="animate-bounce" style={{ animationDelay: '700ms', animationDuration: '1s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '800ms', animationDuration: '1s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '900ms', animationDuration: '1s' }}>.</span>
            </span>
          ) : (
            'ASK'
          )}
        </button>
      </form>
    </div>
  );
}

// Made with Bob
