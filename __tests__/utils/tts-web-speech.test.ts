/**
 * Unit tests for Web Speech API Text-to-Speech with Cyberpunk Effects
 * Tests WebSpeechTTS class focusing on Alex voice and core functionality
 */

import { WebSpeechTTS, CyberpunkVoiceSettings, AudioEffectSettings } from '@/utils/tts-web-speech';

describe('WebSpeechTTS', () => {
  let audioContext: AudioContext;
  let tts: WebSpeechTTS;
  let mockSynth: any;
  let mockAlexVoice: SpeechSynthesisVoice;

  beforeEach(() => {
    // Create mock AudioContext
    audioContext = new AudioContext();

    // Create Alex voice mock
    mockAlexVoice = {
      name: 'Alex',
      lang: 'en-US',
      default: false,
      localService: true,
      voiceURI: 'Alex'
    } as SpeechSynthesisVoice;

    // Setup mock speechSynthesis
    mockSynth = {
      speaking: false,
      pending: false,
      paused: false,
      getVoices: jest.fn(() => [mockAlexVoice]),
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      onvoiceschanged: null,
    };

    (global as any).speechSynthesis = mockSynth;

    // Create TTS instance
    tts = new WebSpeechTTS(audioContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with AudioContext', () => {
      expect(tts).toBeInstanceOf(WebSpeechTTS);
    });

    it('should detect Web Speech API support', () => {
      expect((global as any).speechSynthesis).toBeDefined();
    });

    it('should load voices on initialization', () => {
      expect(mockSynth.getVoices).toHaveBeenCalled();
    });

    it('should setup voiceschanged event handler', () => {
      const newTTS = new WebSpeechTTS(audioContext);
      expect(mockSynth.onvoiceschanged).toBeDefined();
    });

    it('should handle missing Web Speech API gracefully', () => {
      const originalSpeechSynthesis = (global as any).speechSynthesis;
      delete (global as any).speechSynthesis;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const newTTS = new WebSpeechTTS(audioContext);

      expect(consoleSpy).toHaveBeenCalledWith('Web Speech API not supported in this browser');
      
      (global as any).speechSynthesis = originalSpeechSynthesis;
      consoleSpy.mockRestore();
    });
  });

  describe('getVoices()', () => {
    it('should return available voices', () => {
      const voices = tts.getVoices();
      expect(voices).toHaveLength(1);
      expect(voices[0].name).toBe('Alex');
    });

    it('should return empty array when no voices loaded', () => {
      mockSynth.getVoices.mockReturnValue([]);
      const newTTS = new WebSpeechTTS(audioContext);
      expect(newTTS.getVoices()).toEqual([]);
    });
  });

  describe('findCyberpunkVoice()', () => {
    it('should find and return Alex voice', () => {
      const voice = tts.findCyberpunkVoice();
      expect(voice).toBeDefined();
      expect(voice?.name).toBe('Alex');
    });

    it('should return null when no voices available', () => {
      mockSynth.getVoices.mockReturnValue([]);
      const newTTS = new WebSpeechTTS(audioContext);
      
      const voice = newTTS.findCyberpunkVoice();
      expect(voice).toBeNull();
    });

    it('should reload voices if not initially loaded', () => {
      mockSynth.getVoices.mockReturnValueOnce([]).mockReturnValueOnce([mockAlexVoice]);
      const newTTS = new WebSpeechTTS(audioContext);
      
      const voice = newTTS.findCyberpunkVoice();
      expect(voice?.name).toBe('Alex');
      expect(mockSynth.getVoices).toHaveBeenCalledTimes(3);
    });
  });

  describe('speak()', () => {
    const defaultSettings: CyberpunkVoiceSettings = {
      pitch: 0.8,
      rate: 1.0,
      volume: 1.0,
    };

    const defaultEffects: AudioEffectSettings = {
      bitcrush: false,
      lowpass: false,
      distortion: false,
      reverb: false,
    };

    it('should speak text with Alex voice', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const speakPromise = tts.speak('Hello world', defaultSettings, defaultEffects);
      
      expect(mockSynth.cancel).toHaveBeenCalled();
      expect(mockSynth.speak).toHaveBeenCalled();
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      expect(utterance.text).toBe('Hello world');
      expect(utterance.voice.name).toBe('Alex');
      expect(consoleSpy).toHaveBeenCalledWith('Using voice: Alex');
      
      utterance.onend();
      await expect(speakPromise).resolves.toBeUndefined();
      consoleSpy.mockRestore();
    });

    it('should apply voice settings correctly', async () => {
      const settings: CyberpunkVoiceSettings = {
        pitch: 0.5,
        rate: 1.5,
        volume: 0.8,
      };
      
      const speakPromise = tts.speak('Test', settings, defaultEffects);
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      expect(utterance.pitch).toBe(0.5);
      expect(utterance.rate).toBe(1.5);
      expect(utterance.volume).toBe(0.8);
      
      utterance.onend();
      await speakPromise;
    });

    it('should cancel ongoing speech before speaking', async () => {
      const speakPromise = tts.speak('Test', defaultSettings, defaultEffects);
      
      expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      utterance.onend();
      await speakPromise;
    });

    it('should handle speech completion', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const speakPromise = tts.speak('Test', defaultSettings, defaultEffects);
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      utterance.onend();
      
      await expect(speakPromise).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Speech finished');
      consoleSpy.mockRestore();
    });

    it('should handle interrupted error as normal behavior', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const speakPromise = tts.speak('Test', defaultSettings, defaultEffects);
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      utterance.onerror({ error: 'interrupted' } as any);
      
      await expect(speakPromise).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('[TTS] Speech interrupted (normal behavior)');
      consoleSpy.mockRestore();
    });

    it('should reject on actual speech errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const speakPromise = tts.speak('Test', defaultSettings, defaultEffects);
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      utterance.onerror({ error: 'network' } as any);
      
      await expect(speakPromise).rejects.toThrow('Speech synthesis error: network');
      consoleSpy.mockRestore();
    });

    it('should reject when speech synthesis not supported', async () => {
      delete (global as any).speechSynthesis;
      const newTTS = new WebSpeechTTS(audioContext);
      
      await expect(newTTS.speak('Test', defaultSettings, defaultEffects))
        .rejects.toThrow('Speech synthesis not supported');
      
      (global as any).speechSynthesis = mockSynth;
    });

    it('should handle exceptions during speak', async () => {
      mockSynth.speak.mockImplementation(() => {
        throw new Error('Mock error');
      });
      
      await expect(tts.speak('Test', defaultSettings, defaultEffects))
        .rejects.toThrow('Mock error');
    });
  });

  describe('stop()', () => {
    it('should cancel ongoing speech', () => {
      tts.stop();
      expect(mockSynth.cancel).toHaveBeenCalled();
    });

    it('should handle stop when API not supported', () => {
      delete (global as any).speechSynthesis;
      const newTTS = new WebSpeechTTS(audioContext);
      
      expect(() => newTTS.stop()).not.toThrow();
      
      (global as any).speechSynthesis = mockSynth;
    });
  });

  describe('isSpeaking()', () => {
    it('should return false when not speaking', () => {
      mockSynth.speaking = false;
      expect(tts.isSpeaking()).toBe(false);
    });

    it('should return true when speaking', () => {
      mockSynth.speaking = true;
      expect(tts.isSpeaking()).toBe(true);
    });

    it('should return false when API not supported', () => {
      delete (global as any).speechSynthesis;
      const newTTS = new WebSpeechTTS(audioContext);
      
      expect(newTTS.isSpeaking()).toBe(false);
      
      (global as any).speechSynthesis = mockSynth;
    });
  });

  describe('pause()', () => {
    it('should pause speech synthesis', () => {
      tts.pause();
      expect(mockSynth.pause).toHaveBeenCalled();
    });

    it('should handle pause when API not supported', () => {
      delete (global as any).speechSynthesis;
      const newTTS = new WebSpeechTTS(audioContext);
      
      expect(() => newTTS.pause()).not.toThrow();
      
      (global as any).speechSynthesis = mockSynth;
    });
  });

  describe('resume()', () => {
    it('should resume paused speech synthesis', () => {
      tts.resume();
      expect(mockSynth.resume).toHaveBeenCalled();
    });

    it('should handle resume when API not supported', () => {
      delete (global as any).speechSynthesis;
      const newTTS = new WebSpeechTTS(audioContext);
      
      expect(() => newTTS.resume()).not.toThrow();
      
      (global as any).speechSynthesis = mockSynth;
    });
  });

  describe('audio effect generation', () => {
    it('should create bitcrusher curve', () => {
      // Access private method through type assertion for testing
      const createBitcrusherCurve = (tts as any).createBitcrusherCurve.bind(tts);
      const curve = createBitcrusherCurve(4);
      
      expect(curve).toBeInstanceOf(Float32Array);
      expect(curve.length).toBe(65536);
    });

    it('should create distortion curve', () => {
      const createDistortionCurve = (tts as any).createDistortionCurve.bind(tts);
      const curve = createDistortionCurve(50);
      
      expect(curve).toBeInstanceOf(Float32Array);
      expect(curve.length).toBe(44100);
    });

    it('should handle different bitcrusher bit depths', () => {
      const createBitcrusherCurve = (tts as any).createBitcrusherCurve.bind(tts);
      
      const curve2bit = createBitcrusherCurve(2);
      const curve8bit = createBitcrusherCurve(8);
      
      expect(curve2bit).toBeInstanceOf(Float32Array);
      expect(curve8bit).toBeInstanceOf(Float32Array);
      expect(curve2bit).not.toEqual(curve8bit);
    });

    it('should handle different distortion amounts', () => {
      const createDistortionCurve = (tts as any).createDistortionCurve.bind(tts);
      
      const curve20 = createDistortionCurve(20);
      const curve100 = createDistortionCurve(100);
      
      expect(curve20).toBeInstanceOf(Float32Array);
      expect(curve100).toBeInstanceOf(Float32Array);
      expect(curve20).not.toEqual(curve100);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple speak calls in sequence', async () => {
      const settings: CyberpunkVoiceSettings = {
        pitch: 0.8,
        rate: 1.0,
        volume: 1.0,
      };
      const effects: AudioEffectSettings = {
        bitcrush: false,
        lowpass: false,
        distortion: false,
        reverb: false,
      };

      // First speak
      const speak1 = tts.speak('First message', settings, effects);
      let utterance1 = mockSynth.speak.mock.calls[0][0];
      utterance1.onend();
      await speak1;

      // Second speak should cancel first
      const speak2 = tts.speak('Second message', settings, effects);
      expect(mockSynth.cancel).toHaveBeenCalledTimes(2); // Once per speak call
      
      let utterance2 = mockSynth.speak.mock.calls[1][0];
      utterance2.onend();
      await speak2;
    });

    it('should work with different voice settings', async () => {
      const effects: AudioEffectSettings = {
        bitcrush: false,
        lowpass: false,
        distortion: false,
        reverb: false,
      };

      // Low pitch, slow rate
      const settings1: CyberpunkVoiceSettings = { pitch: 0.5, rate: 0.8, volume: 1.0 };
      const speak1 = tts.speak('Low and slow', settings1, effects);
      let utterance1 = mockSynth.speak.mock.calls[0][0];
      expect(utterance1.pitch).toBe(0.5);
      expect(utterance1.rate).toBe(0.8);
      utterance1.onend();
      await speak1;

      // High pitch, fast rate
      const settings2: CyberpunkVoiceSettings = { pitch: 1.5, rate: 1.5, volume: 0.8 };
      const speak2 = tts.speak('High and fast', settings2, effects);
      let utterance2 = mockSynth.speak.mock.calls[1][0];
      expect(utterance2.pitch).toBe(1.5);
      expect(utterance2.rate).toBe(1.5);
      expect(utterance2.volume).toBe(0.8);
      utterance2.onend();
      await speak2;
    });

    it('should handle stop during speech', async () => {
      const settings: CyberpunkVoiceSettings = { pitch: 0.8, rate: 1.0, volume: 1.0 };
      const effects: AudioEffectSettings = {
        bitcrush: false,
        lowpass: false,
        distortion: false,
        reverb: false,
      };

      const speakPromise = tts.speak('Test message', settings, effects);
      
      // Stop before completion
      tts.stop();
      expect(mockSynth.cancel).toHaveBeenCalledTimes(2); // Once in speak(), once in stop()
      
      // Complete the utterance
      const utterance = mockSynth.speak.mock.calls[0][0];
      utterance.onend();
      await speakPromise;
    });
  });
});

// Made with Bob
