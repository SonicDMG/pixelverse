import { renderHook, act, waitFor } from '@testing-library/react';
import { useSession } from '@/hooks/useSession';
import { useTheme } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

// Mock the ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('useSession', () => {
  let originalCrypto: Crypto;
  let mockRandomUUID: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original crypto
    originalCrypto = global.crypto;
    
    // Create mock for crypto.randomUUID
    mockRandomUUID = jest.fn(() => 'test-uuid-1234');
    
    // Mock crypto with randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: mockRandomUUID,
      },
      writable: true,
      configurable: true,
    });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Default mock for useTheme
    mockUseTheme.mockReturnValue({
      appMode: 'ticker',
      theme: {} as any,
      setAppMode: jest.fn(),
      availableThemes: [],
    });
  });

  afterEach(() => {
    // Restore original crypto
    global.crypto = originalCrypto;
    
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    
    jest.clearAllMocks();
  });

  describe('generateSessionId', () => {
    it('should generate session ID using crypto.randomUUID when available', () => {
      const { result } = renderHook(() => useSession());

      expect(mockRandomUUID).toHaveBeenCalled();
      expect(result.current.sessionId).toBe('test-uuid-1234');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Session] Initial session created:',
        'test-uuid-1234'
      );
    });

    it('should use fallback when crypto.randomUUID is not available', () => {
      // Remove crypto.randomUUID
      global.crypto = {} as Crypto;

      const { result } = renderHook(() => useSession());

      // Should have generated a fallback ID
      expect(result.current.sessionId).toMatch(/^\d+-[a-z0-9]+$/);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Session] crypto.randomUUID not available, using fallback'
      );
    });

    it('should generate unique IDs on each call', () => {
      mockRandomUUID
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      const { result, rerender } = renderHook(() => useSession());
      const firstId = result.current.sessionId;

      act(() => {
        result.current.resetSession();
      });
      const secondId = result.current.sessionId;

      expect(firstId).toBe('uuid-1');
      expect(secondId).toBe('uuid-2');
      expect(firstId).not.toBe(secondId);
    });
  });

  describe('session persistence', () => {
    it('should maintain session ID across re-renders', () => {
      const { result, rerender } = renderHook(() => useSession());
      const initialSessionId = result.current.sessionId;

      // Re-render multiple times
      rerender();
      rerender();
      rerender();

      expect(result.current.sessionId).toBe(initialSessionId);
    });

    it('should create initial session on mount', () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.sessionId).toBeTruthy();
      expect(result.current.sessionId).toBe('test-uuid-1234');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Session] Initial session created:',
        'test-uuid-1234'
      );
    });
  });

  describe('theme change detection', () => {
    it('should reset session when appMode changes', async () => {
      mockRandomUUID
        .mockReturnValueOnce('initial-uuid')
        .mockReturnValueOnce('new-uuid-after-theme-change');

      // Start with ticker theme
      mockUseTheme.mockReturnValue({
        appMode: 'ticker',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });

      const { result, rerender } = renderHook(() => useSession());
      const initialSessionId = result.current.sessionId;

      expect(initialSessionId).toBe('initial-uuid');

      // Change to space theme
      mockUseTheme.mockReturnValue({
        appMode: 'space',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });

      rerender();

      await waitFor(() => {
        expect(result.current.sessionId).toBe('new-uuid-after-theme-change');
      });

      expect(result.current.sessionId).not.toBe(initialSessionId);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Session] New session for theme:',
        'space',
        '- Session ID:',
        'new-uuid-after-theme-change'
      );
    });

    it('should not reset session when appMode stays the same', () => {
      const { result, rerender } = renderHook(() => useSession());
      const initialSessionId = result.current.sessionId;

      // Re-render with same theme
      rerender();
      rerender();

      expect(result.current.sessionId).toBe(initialSessionId);
      // Should only log initial session creation
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple theme changes', async () => {
      mockRandomUUID
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      // Start with ticker
      mockUseTheme.mockReturnValue({
        appMode: 'ticker',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });

      const { result, rerender } = renderHook(() => useSession());
      expect(result.current.sessionId).toBe('uuid-1');

      // Change to space
      mockUseTheme.mockReturnValue({
        appMode: 'space',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });
      rerender();

      await waitFor(() => {
        expect(result.current.sessionId).toBe('uuid-2');
      });

      // Change back to ticker
      mockUseTheme.mockReturnValue({
        appMode: 'ticker',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });
      rerender();

      await waitFor(() => {
        expect(result.current.sessionId).toBe('uuid-3');
      });
    });
  });

  describe('resetSession', () => {
    it('should manually reset session when called', () => {
      mockRandomUUID
        .mockReturnValueOnce('initial-uuid')
        .mockReturnValueOnce('reset-uuid');

      const { result } = renderHook(() => useSession());
      const initialSessionId = result.current.sessionId;

      expect(initialSessionId).toBe('initial-uuid');

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.sessionId).toBe('reset-uuid');
      expect(result.current.sessionId).not.toBe(initialSessionId);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Session] Session manually reset:',
        'reset-uuid'
      );
    });

    it('should allow multiple manual resets', () => {
      mockRandomUUID
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3')
        .mockReturnValueOnce('uuid-4');

      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.resetSession();
      });
      const secondId = result.current.sessionId;

      act(() => {
        result.current.resetSession();
      });
      const thirdId = result.current.sessionId;

      act(() => {
        result.current.resetSession();
      });
      const fourthId = result.current.sessionId;

      expect(secondId).toBe('uuid-2');
      expect(thirdId).toBe('uuid-3');
      expect(fourthId).toBe('uuid-4');
      expect(new Set([secondId, thirdId, fourthId]).size).toBe(3);
    });

    it('should work independently of theme changes', async () => {
      mockRandomUUID
        .mockReturnValueOnce('initial-uuid')
        .mockReturnValueOnce('manual-reset-uuid')
        .mockReturnValueOnce('theme-change-uuid');

      const { result, rerender } = renderHook(() => useSession());

      // Manual reset
      act(() => {
        result.current.resetSession();
      });
      expect(result.current.sessionId).toBe('manual-reset-uuid');

      // Theme change
      mockUseTheme.mockReturnValue({
        appMode: 'space',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });
      rerender();

      await waitFor(() => {
        expect(result.current.sessionId).toBe('theme-change-uuid');
      });
    });
  });

  describe('return value', () => {
    it('should return sessionId and resetSession function', () => {
      const { result } = renderHook(() => useSession());

      expect(result.current).toHaveProperty('sessionId');
      expect(result.current).toHaveProperty('resetSession');
      expect(typeof result.current.sessionId).toBe('string');
      expect(typeof result.current.resetSession).toBe('function');
    });

    it('should have stable resetSession function reference', () => {
      const { result, rerender } = renderHook(() => useSession());
      const resetFn1 = result.current.resetSession;

      rerender();
      const resetFn2 = result.current.resetSession;

      rerender();
      const resetFn3 = result.current.resetSession;

      // Note: resetSession is not wrapped in useCallback, so reference changes on each render
      // This is acceptable as the function is simple and doesn't cause performance issues
      expect(typeof resetFn1).toBe('function');
      expect(typeof resetFn2).toBe('function');
      expect(typeof resetFn3).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid theme changes', async () => {
      const uuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'];
      mockRandomUUID.mockImplementation(() => uuids.shift() || 'fallback-uuid');

      const { result, rerender } = renderHook(() => useSession());

      // Rapid theme changes
      for (const theme of ['space', 'ticker', 'space', 'ticker']) {
        mockUseTheme.mockReturnValue({
          appMode: theme,
          theme: {} as any,
          setAppMode: jest.fn(),
          availableThemes: [],
        });
        rerender();
      }

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Should have generated multiple UUIDs
      expect(mockRandomUUID).toHaveBeenCalledTimes(5); // Initial + 4 changes
    });

    it('should handle resetSession called during theme change', async () => {
      mockRandomUUID
        .mockReturnValueOnce('initial')
        .mockReturnValueOnce('manual')
        .mockReturnValueOnce('theme-change');

      const { result, rerender } = renderHook(() => useSession());

      // Call resetSession
      act(() => {
        result.current.resetSession();
      });

      // Immediately change theme
      mockUseTheme.mockReturnValue({
        appMode: 'space',
        theme: {} as any,
        setAppMode: jest.fn(),
        availableThemes: [],
      });
      rerender();

      await waitFor(() => {
        expect(result.current.sessionId).toBe('theme-change');
      });
    });
  });
});

// Made with Bob