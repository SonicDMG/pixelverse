'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Session Management Hook
 * 
 * Manages session IDs for conversation tracking with Langflow.
 * Sessions are reset on:
 * - Initial page load
 * - Theme/app mode changes
 * - Manual reset via resetSession()
 * 
 * @returns {Object} Session management interface
 * @returns {string} sessionId - Current session UUID
 * @returns {Function} resetSession - Function to generate a new session ID
 * 
 * @example
 * ```tsx
 * const { sessionId, resetSession } = useSession();
 * 
 * // Use sessionId in API calls
 * await axios.post('/api/ask-stock', {
 *   question: 'What is AAPL?',
 *   session_id: sessionId
 * });
 * 
 * // Reset session when clearing conversation
 * const handleClear = () => {
 *   resetSession();
 *   clearConversation();
 * };
 * ```
 */
export function useSession() {
  const { appMode } = useTheme();
  const [sessionId, setSessionId] = useState<string>('');
  const isInitialMount = useRef(true);
  const previousAppMode = useRef(appMode);

  /**
   * Generate a new session ID using crypto.randomUUID()
   * Falls back to a timestamp-based UUID if crypto.randomUUID is not available
   */
  const generateSessionId = (): string => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    
    // Fallback for environments without crypto.randomUUID
    // This should rarely be needed in modern browsers
    console.warn('[Session] crypto.randomUUID not available, using fallback');
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // Generate initial session ID on mount and track appMode changes
  useEffect(() => {
    if (isInitialMount.current) {
      // First mount: create initial session
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log('[Session] Initial session created:', newSessionId);
      isInitialMount.current = false;
      previousAppMode.current = appMode;
    } else if (previousAppMode.current !== appMode) {
      // AppMode changed: reset session
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log('[Session] New session for theme:', appMode, '- Session ID:', newSessionId);
      previousAppMode.current = appMode;
    }
  }, [appMode]);

  /**
   * Manually reset the session
   * Use this when clearing conversation history or starting a new conversation
   */
  const resetSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    console.log('[Session] Session manually reset:', newSessionId);
  };

  return { sessionId, resetSession };
}

// Made with Bob
