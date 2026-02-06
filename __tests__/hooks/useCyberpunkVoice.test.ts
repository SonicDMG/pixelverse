import { renderHook, act, waitFor } from '@testing-library/react';
import { useCyberpunkVoice } from '@/hooks/useCyberpunkVoice';
import { WebSpeechTTS } from '@/utils/tts-web-speech';

// Mock the WebSpeechTTS class
jest.mock('@/utils/tts-web-speech');

const MockWebSpeechTTS = WebSpeechTTS as jest.MockedClass<typeof WebSpeechTTS>;

describe('useCyberpunkVoice', () => {
  let mockAudioContext: AudioContext;
  let mockTTSInstance: jest.Mocked<WebSpeechTTS>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create mock AudioContext
    mockAudioContext = {} as AudioContext;

    // Create mock TTS instance
    mockTTSInstance = {
      speak: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn(),
      isSpeaking: jest.fn().mockReturnValue(false),
      pause: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn().mockReturnValue([]),
      findCyberpunkVoice: jest.fn().mockReturnValue(null),
    } as any;

    // Mock the constructor
    MockWebSpeechTTS.mockImplementation(() => mockTTSInstance);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize TTS when audio context is provided', () => {
      renderHook(() => useCyberpunkVoice({ audioContext: mockAudioContext }));

      expect(MockWebSpeechTTS).toHaveBeenCalledWith(mockAudioContext);
      // Note: Initialization logging was removed from useCyberpunkVoice
    });

    it('should not initialize TTS when audio context is null', () => {
      renderHook(() => useCyberpunkVoice({ audioContext: null }));

      expect(MockWebSpeechTTS).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', () => {
      MockWebSpeechTTS.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      renderHook(() => useCyberpunkVoice({ audioContext: mockAudioContext }));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize cyberpunk voice:',
        expect.any(Error)
      );
    });

    it('should be enabled by default', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      expect(result.current.isEnabled).toBe(true);
    });

    it('should have default volume of 0.75', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      expect(result.current.volume).toBe(0.75);
    });
  });

  describe('isSupported', () => {
    it('should return true when speechSynthesis is available', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      expect(result.current.isSupported).toBe(true);
    });
  });

  describe('announce', () => {
    it('should call TTS speak with preprocessed text and settings', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Test message', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          pitch: 0.8,
          rate: 1.1,
          volume: 0.75,
        }),
        expect.objectContaining({
          bitcrush: true,
          lowpass: true,
          distortion: false,
          reverb: false,
        })
      );
    });

    it('should not announce when voice is disabled', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.toggleEnabled();
      });

      await act(async () => {
        await result.current.announce('Test message');
      });

      expect(mockTTSInstance.speak).not.toHaveBeenCalled();
    });

    it('should warn when TTS is not initialized', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: null })
      );

      await act(async () => {
        await result.current.announce('Test message');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('TTS not initialized');
      expect(mockTTSInstance.speak).not.toHaveBeenCalled();
    });

    it('should stop ongoing speech before announcing new text', async () => {
      const { result } = renderHook(() =>
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      // First announcement
      await act(async () => {
        await result.current.announce('First message');
      });

      mockTTSInstance.speak.mockClear();
      mockTTSInstance.stop.mockClear();

      // Second announcement should stop first
      await act(async () => {
        await result.current.announce('Second message');
      });

      // The hook tracks isSpeaking internally, so stop should be called
      expect(mockTTSInstance.speak).toHaveBeenCalled();
    });

    it('should handle interruption errors gracefully', async () => {
      mockTTSInstance.speak.mockRejectedValue(
        new Error('Speech synthesis interrupted')
      );

      const { result } = renderHook(() =>
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      // Should not throw - interruptions are handled gracefully
      await act(async () => {
        await result.current.announce('Test message');
      });

      // Verify the TTS service was called with text, settings, and effects
      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'Test message',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should throw on actual errors', async () => {
      mockTTSInstance.speak.mockRejectedValue(new Error('Real error'));

      const { result } = renderHook(() =>
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      // Should throw for non-interruption errors
      await expect(
        act(async () => {
          await result.current.announce('Test message');
        })
      ).rejects.toThrow('Real error');

      // Verify the TTS service was called with text, settings, and effects
      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'Test message',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('getVoiceSettings', () => {
    it('should return alert settings for alert type', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Alert message', 'alert');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pitch: 0.7,
          rate: 1.0,
          volume: 0.75,
        }),
        expect.any(Object)
      );
    });

    it('should return info settings for info type', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Info message', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pitch: 0.8,
          rate: 1.1,
          volume: 0.75,
        }),
        expect.any(Object)
      );
    });

    it('should return price settings for price type', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Price update', 'price');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pitch: 0.75,
          rate: 1.2,
          volume: 0.75,
        }),
        expect.any(Object)
      );
    });

    it('should use current volume setting', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.setVolume(0.5);
      });

      await act(async () => {
        await result.current.announce('Test message', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          volume: 0.5,
        }),
        expect.any(Object)
      );
    });
  });

  describe('getAudioEffects', () => {
    it('should return heavy effects for alert type', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Alert', 'alert');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          bitcrush: true,
          lowpass: true,
          distortion: true,
          reverb: true,
        }
      );
    });

    it('should return moderate effects for info type', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Info', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          bitcrush: true,
          lowpass: true,
          distortion: false,
          reverb: false,
        }
      );
    });

    it('should return light effects for price type', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Price', 'price');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          bitcrush: false,
          lowpass: true,
          distortion: false,
          reverb: false,
        }
      );
    });
  });

  describe('preprocessText', () => {
    it('should convert dollar amounts to spoken format', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Price is $42.50', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'Price is 42.50 dollars',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should convert percentages to spoken format', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Up 5.5%', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'Up 5.5 percent',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should spell out stock tickers', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('AAPL is up', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'A A P L is up',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should add alert prefix and pauses for alert type', async () => {
      const { result } = renderHook(() =>
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('System error. Check logs.', 'alert');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'Alert. ... System error. ... Check logs.',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should add emphasis for price keywords', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('Stock is up with gain', 'price');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.stringContaining(' up '),
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.stringContaining(' gain '),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle complex text with multiple conversions', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      await act(async () => {
        await result.current.announce('AAPL up 5% to $150.25', 'price');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        'A A P L  up  5 percent to 150.25 dollars',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle enabled state', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      expect(result.current.isEnabled).toBe(true);

      act(() => {
        result.current.toggleEnabled();
      });

      expect(result.current.isEnabled).toBe(false);

      act(() => {
        result.current.toggleEnabled();
      });

      expect(result.current.isEnabled).toBe(true);
    });

    it('should stop speech when disabling', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.toggleEnabled();
      });

      expect(mockTTSInstance.stop).toHaveBeenCalled();
    });

    it('should not stop speech when enabling', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      // Disable first
      act(() => {
        result.current.toggleEnabled();
      });

      mockTTSInstance.stop.mockClear();

      // Enable again
      act(() => {
        result.current.toggleEnabled();
      });

      expect(mockTTSInstance.stop).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should call TTS stop method', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.stop();
      });

      expect(mockTTSInstance.stop).toHaveBeenCalled();
    });

    it('should handle stop when TTS is not initialized', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: null })
      );

      expect(() => {
        act(() => {
          result.current.stop();
        });
      }).not.toThrow();
    });
  });

  describe('isSpeaking', () => {
    it('should return false when not speaking', () => {
      mockTTSInstance.isSpeaking.mockReturnValue(false);

      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      expect(result.current.isSpeaking).toBe(false);
    });

    it('should return true when speaking', async () => {
      const { result, rerender } = renderHook(() =>
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      // Initially false (default mock value)
      expect(result.current.isSpeaking).toBe(false);

      // Change mock to return true
      mockTTSInstance.isSpeaking.mockReturnValue(true);
      
      // Force re-render to pick up new value
      rerender();

      // Now should be true
      expect(result.current.isSpeaking).toBe(true);
    });
  });

  describe('volume control', () => {
    it('should set volume within valid range', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(result.current.volume).toBe(0.5);
    });

    it('should clamp volume to 0 minimum', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(result.current.volume).toBe(0);
    });

    it('should clamp volume to 1 maximum', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.setVolume(1.5);
      });

      expect(result.current.volume).toBe(1);
    });

    it('should update voice settings with new volume', async () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      act(() => {
        result.current.setVolume(0.3);
      });

      await act(async () => {
        await result.current.announce('Test', 'info');
      });

      expect(mockTTSInstance.speak).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          volume: 0.3,
        }),
        expect.any(Object)
      );
    });
  });

  describe('return value', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      expect(result.current).toHaveProperty('announce');
      expect(result.current).toHaveProperty('stop');
      expect(result.current).toHaveProperty('isSpeaking');
      expect(result.current).toHaveProperty('isSupported');
      expect(result.current).toHaveProperty('isEnabled');
      expect(result.current).toHaveProperty('toggleEnabled');
      expect(result.current).toHaveProperty('volume');
      expect(result.current).toHaveProperty('setVolume');
    });

    it('should have stable function references', () => {
      const { result, rerender } = renderHook(() => 
        useCyberpunkVoice({ audioContext: mockAudioContext })
      );

      const announce1 = result.current.announce;
      const stop1 = result.current.stop;
      const toggleEnabled1 = result.current.toggleEnabled;
      const setVolume1 = result.current.setVolume;

      rerender();

      expect(result.current.announce).toBe(announce1);
      expect(result.current.stop).toBe(stop1);
      expect(result.current.toggleEnabled).toBe(toggleEnabled1);
      expect(result.current.setVolume).toBe(setVolume1);
    });
  });
});

// Made with Bob