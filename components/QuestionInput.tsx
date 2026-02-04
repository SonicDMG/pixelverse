'use client';

import { LoadingStatus } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  loadingStatus: LoadingStatus;
  question: string;
  setQuestion: (question: string) => void;
}

const MAX_LENGTH = 500;
const MIN_LENGTH = 1;

// Client-side validation patterns (subset of server-side for UX feedback)
// Note: Using non-global flags to avoid regex state issues
const DANGEROUS_PATTERNS = [
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b/i,
  /\b(ignore|disregard)\s+(previous|all)?\s*(instructions?|prompts?|rules?)/i,
  /\b(system\s*:?\s*(prompt|message|instruction))/i,
  /\b(reveal|show)\s+(me\s+)?(the\s+)?(secret|password|api[_\s]?key)/i,
  /\b(you\s+are\s+now|act\s+as)/i,
];

export function QuestionInput({ onSubmit, loadingStatus, question, setQuestion }: QuestionInputProps) {
  const { theme } = useTheme();
  const isLoading = loadingStatus !== null && loadingStatus !== 'done';
  const [validationError, setValidationError] = useState<string>('');
  const [charCount, setCharCount] = useState(0);

  // Update character count when question changes
  useEffect(() => {
    setCharCount(question.length);
    
    // Only clear validation error when user makes significant changes
    // This prevents the error from disappearing too quickly
    if (validationError && question.length === 0) {
      setValidationError('');
    }
  }, [question, validationError]);

  const validateInput = (input: string): { valid: boolean; error?: string } => {
    const trimmed = input.trim();

    if (trimmed.length < MIN_LENGTH) {
      return { valid: false, error: 'Please enter a question' };
    }

    if (trimmed.length > MAX_LENGTH) {
      return { valid: false, error: `Question too long (max ${MAX_LENGTH} characters)` };
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        return { valid: false, error: 'Invalid input detected. Please rephrase your question.' };
      }
    }

    return { valid: true };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      return;
    }

    const validation = validateInput(question);
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid input');
      return;
    }

    setValidationError('');
    onSubmit(question.trim());
    setQuestion('');
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setQuestion(example);
      setValidationError('');
    }
  };

  // Get example questions from theme, with fallback to empty array
  const exampleQuestions = theme.exampleQuestions || [];
  
  // Generate dynamic placeholder based on theme
  const placeholder = `Ask about ${theme.name.toLowerCase().replace('pixel', '')}...`;

  // Determine if input is approaching or exceeding max length
  const isNearLimit = charCount > MAX_LENGTH * 0.9;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <div className="w-full space-y-4 pt-8">
      {/* Example Questions */}
      {exampleQuestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[var(--color-accent)] text-xs font-pixel">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="px-3 py-2 bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-pixel hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border pixel-shift-hover"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={MAX_LENGTH}
            className={`flex-1 px-4 py-3 bg-[var(--color-bg-dark)] border-4 text-[var(--color-primary)] placeholder-[var(--color-primary)]/50 font-pixel text-sm focus:outline-none disabled:opacity-50 pixel-border ${
              validationError || isOverLimit
                ? 'border-red-500 focus:border-red-600'
                : 'border-[var(--color-primary)] focus:border-[var(--color-secondary)]'
            }`}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'validation-error' : undefined}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim() || isOverLimit}
            className="px-6 py-3 bg-[var(--color-primary)] border-4 border-[var(--color-primary)] text-white font-pixel text-sm hover:bg-[var(--color-secondary)] hover:border-[var(--color-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
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
        </div>

        {/* Character count and validation feedback */}
        <div className="flex justify-between items-center text-xs font-pixel">
          <div>
            {validationError && (
              <span id="validation-error" className="text-red-500" role="alert">
                ⚠ {validationError}
              </span>
            )}
          </div>
          <div className={`${isNearLimit ? (isOverLimit ? 'text-red-500' : 'text-yellow-500') : 'text-[var(--color-primary)]/50'}`}>
            {charCount}/{MAX_LENGTH}
          </div>
        </div>
      </form>
    </div>
  );
}

// Made with Bob
