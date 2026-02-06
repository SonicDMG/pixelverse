/**
 * Unit tests for Web Speech API Text-to-Speech with Cyberpunk Effects
 * Tests WebSpeechTTS class focusing on core functionality
 */

import { WebSpeechTTS, CyberpunkVoiceSettings, AudioEffectSettings } from '@/utils/audio/tts-web-speech';

describe('WebSpeechTTS', () => {
  let audioContext: AudioContext;
  let tts: WebSpeechTTS;
  let mockSynth: any;
  let mockAlexVoice: SpeechSynthesisVoice;

  const defaultSettings: CyberpunkVoiceSettings = {
    pitch: 0.8,
    rate: 1.0,
    volume: 0.75,
  };

  const defaultEffects: AudioEffectSettings = {
    bitcrush: true,
    lowpass: true,
    distortion: false,
    reverb: false,
  };

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

    // Mock SpeechSynthesisUtterance constructor
    (global as any).SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string = '') => ({
      text: text,
      voice: null as SpeechSynthesisVoice | null,
      pitch: 1.0,
      rate: 1.0,
      volume: 1.0,
      onend: null as (() => void) | null,
      onerror: null as ((event: any) => void) | null,
      onstart: null as (() => void) | null,
    }));

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
    
    // Reset call counts
    mockSynth.getVoices.mockClear();
    mockSynth.speak.mockClear();
    mockSynth.cancel.mockClear();
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
  });

  describe('getVoices()', () => {
    it('should return available voices', () => {
      const voices = tts.getVoices();
      expect(voices).toContain(mockAlexVoice);
    });
  });

  describe('findCyberpunkVoice()', () => {
    it('should find Alex voice', () => {
      const voice = tts.findCyberpunkVoice();
      expect(voice?.name).toBe('Alex');
    });

    it('should return null when no voices available', () => {
      mockSynth.getVoices.mockReturnValue([]);
      const newTts = new WebSpeechTTS(audioContext);
      const voice = newTts.findCyberpunkVoice();
      expect(voice).toBeNull();
    });
  });

  describe('speak()', () => {
    it('should speak text with settings', async () => {
      const speakPromise = tts.speak('Hello world', defaultSettings, defaultEffects);
      
      await Promise.resolve();
      
      expect(mockSynth.cancel).toHaveBeenCalled();
      expect(mockSynth.speak).toHaveBeenCalled();
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      expect(utterance.text).toBe('Hello world');
      expect(utterance.pitch).toBe(0.8);
      expect(utterance.rate).toBe(1.0);
      expect(utterance.volume).toBe(0.75);
      
      // Trigger completion
      if (utterance.onend) utterance.onend();
      
      await expect(speakPromise).resolves.toBeUndefined();
    });

    it('should handle interrupted error as normal', async () => {
      const speakPromise = tts.speak('Test', defaultSettings, defaultEffects);
      
      await Promise.resolve();
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      if (utterance.onerror) {
        utterance.onerror({ error: 'interrupted' });
      }
      
      await expect(speakPromise).resolves.toBeUndefined();
    });

    it('should reject on actual errors', async () => {
      const speakPromise = tts.speak('Test', defaultSettings, defaultEffects);
      
      await Promise.resolve();
      
      const utterance = mockSynth.speak.mock.calls[0][0];
      if (utterance.onerror) {
        utterance.onerror({ error: 'network' });
      }
      
      await expect(speakPromise).rejects.toThrow('Speech synthesis error: network');
    });

    it('should reject when API not supported', async () => {
      delete (global as any).speechSynthesis;
      const newTts = new WebSpeechTTS(audioContext);
      
      await expect(newTts.speak('Test', defaultSettings, defaultEffects))
        .rejects.toThrow('Speech synthesis not supported');
    });
  });

  describe('stop()', () => {
    it('should cancel ongoing speech', () => {
      tts.stop();
      expect(mockSynth.cancel).toHaveBeenCalled();
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
  });

  describe('pause() and resume()', () => {
    it('should pause speech', () => {
      tts.pause();
      expect(mockSynth.pause).toHaveBeenCalled();
    });

    it('should resume speech', () => {
      tts.resume();
      expect(mockSynth.resume).toHaveBeenCalled();
    });
  });
});

// Made with Bob
