'use client';

import { LoadingStatus } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  loadingStatus: LoadingStatus;
  question: string;
  setQuestion: (question: string) => void;
}

export default function QuestionInput({ onSubmit, loadingStatus, question, setQuestion }: QuestionInputProps) {
  const { theme } = useTheme();
  const isLoading = loadingStatus !== null && loadingStatus !== 'done';

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

  // Get example questions from theme, with fallback to empty array
  const exampleQuestions = theme.exampleQuestions || [];
  
  // Generate dynamic placeholder based on theme
  const placeholder = `Ask about ${theme.name.toLowerCase().replace('pixel', '')}...`;

  return (
    <div className="w-full space-y-4 pt-8">
      {/* Example Questions */}
      {exampleQuestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[#FFD700] text-xs font-pixel">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="px-3 py-2 bg-[#1a1f3a] border-2 border-[#4169E1] text-[#4169E1] text-xs font-pixel hover:bg-[#4169E1] hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border pixel-shift-hover"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-[#0a0e27] border-4 border-[#4169E1] text-[#4169E1] placeholder-[#4169E1]/50 font-pixel text-sm focus:outline-none focus:border-[#00CED1] disabled:opacity-50 pixel-border"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-6 py-3 bg-[#4169E1] border-4 border-[#4169E1] text-white font-pixel text-sm hover:bg-[#00CED1] hover:border-[#00CED1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
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
