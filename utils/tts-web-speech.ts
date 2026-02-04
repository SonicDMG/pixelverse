/**
 * Web Speech API Text-to-Speech with Cyberpunk Voice Effects
 * Integrates browser's native speech synthesis with Web Audio API for robotic/digital effects
 */

export interface CyberpunkVoiceSettings {
  pitch: number; // 0.0 to 2.0, default 1.0
  rate: number; // 0.1 to 10.0, default 1.0
  volume: number; // 0.0 to 1.0, default 1.0
  voicePreference?: string; // Preferred voice name pattern
}

export interface AudioEffectSettings {
  bitcrush: boolean;
  lowpass: boolean;
  distortion: boolean;
  reverb: boolean;
}

export class WebSpeechTTS {
  private audioContext: AudioContext;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.synth = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;

    if (this.isSupported) {
      // Load voices (may be async in some browsers)
      this.loadVoices();
      
      // Trigger voice loading with a dummy utterance (helps in some browsers)
      const dummyUtterance = new SpeechSynthesisUtterance('');
      this.synth.speak(dummyUtterance);
      this.synth.cancel();
      
      // Some browsers fire voiceschanged event when voices are loaded
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    } else {
      console.warn('Web Speech API not supported in this browser');
    }
  }

  /**
   * Load available voices from the browser
   */
  private loadVoices(): void {
    this.voices = this.synth.getVoices();
  }

  /**
   * Ensure voices are loaded before attempting to use them
   * Returns a promise that resolves when voices are available
   */
  private ensureVoicesLoaded(): Promise<void> {
    return new Promise((resolve) => {
      // If voices are already loaded, resolve immediately
      if (this.voices.length > 0) {
        resolve();
        return;
      }

      // Try loading voices
      this.loadVoices();
      
      // If voices loaded after manual call, resolve
      if (this.voices.length > 0) {
        resolve();
        return;
      }

      // Wait for voiceschanged event
      const handleVoicesChanged = () => {
        this.loadVoices();
        if (this.voices.length > 0) {
          speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }
      };

      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Fallback timeout - resolve after 1 second even if no voices loaded
      setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      }, 1000);
    });
  }

  /**
   * Get all available voices
   */
  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Find the best voice for cyberpunk aesthetic
   * Prefers Alex (male voice), English, with specific patterns
   */
  public findCyberpunkVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    // Priority order for voice selection - Alex first for cyberpunk aesthetic
    const preferences = [
      'Alex', // macOS - deep, authoritative, perfect for cyberpunk
      'Daniel', // macOS - British, sophisticated
      'Google UK English Male', // Robotic quality
      'Google US English Male', // Clean digital sound
      'Fred', // macOS - unique character
    ];

    // Try exact matches first
    for (const pref of preferences) {
      const voice = this.voices.find(v => v.name === pref);
      if (voice) return voice;
    }

    // Try partial matches
    for (const pref of preferences) {
      const voice = this.voices.find(v =>
        v.name.toLowerCase().includes(pref.toLowerCase())
      );
      if (voice) return voice;
    }

    // Fallback: any male English voice
    const maleVoice = this.voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('male') ||
       v.name.toLowerCase().includes('alex') ||
       v.name.toLowerCase().includes('daniel') ||
       v.name.toLowerCase().includes('fred'))
    );
    if (maleVoice) return maleVoice;

    // Last resort: first English voice
    const englishVoice = this.voices.find(v => v.lang.startsWith('en'));
    return englishVoice || this.voices[0] || null;
  }

  /**
   * Create a bitcrusher effect curve for digital/lo-fi sound
   */
  private createBitcrusherCurve(bits: number = 4): Float32Array | null {
    const samples = 65536;
    const curve = new Float32Array(samples);
    const step = Math.pow(0.5, bits);
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Quantize the signal
      curve[i] = Math.round(x / step) * step;
    }
    
    return curve;
  }

  /**
   * Create a distortion curve for harsh digital sound
   */
  private createDistortionCurve(amount: number = 50): Float32Array | null {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }

  /**
   * Apply cyberpunk audio effects to a media stream
   */
  private applyCyberpunkEffects(
    source: MediaStreamAudioSourceNode,
    effects: AudioEffectSettings
  ): AudioNode {
    let currentNode: AudioNode = source;

    // Bitcrusher for digital/lo-fi effect
    if (effects.bitcrush) {
      const bitcrusher = this.audioContext.createWaveShaper();
      bitcrusher.curve = this.createBitcrusherCurve(4) as any;
      bitcrusher.oversample = 'none';
      currentNode.connect(bitcrusher);
      currentNode = bitcrusher;
    }

    // Distortion for harsh robotic sound
    if (effects.distortion) {
      const distortion = this.audioContext.createWaveShaper();
      distortion.curve = this.createDistortionCurve(30) as any;
      distortion.oversample = '2x';
      currentNode.connect(distortion);
      currentNode = distortion;
    }

    // Low-pass filter for muffled radio effect
    if (effects.lowpass) {
      const lowpass = this.audioContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 2800; // Cut off high frequencies
      lowpass.Q.value = 0.7;
      currentNode.connect(lowpass);
      currentNode = lowpass;
    }

    // Simple reverb using delay for radio/intercom effect
    if (effects.reverb) {
      const delay = this.audioContext.createDelay();
      delay.delayTime.value = 0.03; // 30ms delay
      
      const feedback = this.audioContext.createGain();
      feedback.gain.value = 0.3;
      
      const wet = this.audioContext.createGain();
      wet.gain.value = 0.4;
      
      currentNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      
      // Mix dry and wet signals
      const mixer = this.audioContext.createGain();
      currentNode.connect(mixer);
      wet.connect(mixer);
      currentNode = mixer;
    }

    return currentNode;
  }

  /**
   * Speak text with cyberpunk voice settings and audio effects
   */
  public async speak(
    text: string,
    settings: CyberpunkVoiceSettings,
    effects: AudioEffectSettings
  ): Promise<void> {
    if (!this.isSupported) {
      console.error('Speech synthesis not supported');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Ensure voices are loaded before attempting to find and use a voice
    await this.ensureVoicesLoaded();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply voice settings
        utterance.pitch = settings.pitch;
        utterance.rate = settings.rate;
        utterance.volume = settings.volume;

        // Select voice
        const voice = this.findCyberpunkVoice();
        if (voice) {
          utterance.voice = voice;
        }

        // Event handlers
        utterance.onend = () => {
          resolve();
        };

        utterance.onerror = (event) => {
          // "interrupted" is not really an error - it's normal when speech is cancelled
          if (event.error === 'interrupted') {
            resolve(); // Resolve instead of reject
            return;
          }
          
          // Handle actual errors
          console.error('Speech error:', event);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Note: Web Speech API doesn't provide direct audio stream access
        // Effects would need to be applied differently (e.g., using MediaRecorder)
        // For now, we'll just use the native speech with pitch/rate adjustments
        // which already provide a robotic effect when pitch is lowered

        this.synth.speak(utterance);
      } catch (error) {
        console.error('Failed to speak:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop any ongoing speech
   */
  public stop(): void {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }

  /**
   * Check if speech synthesis is currently speaking
   */
  public isSpeaking(): boolean {
    return this.isSupported && this.synth.speaking;
  }

  /**
   * Pause speech synthesis
   */
  public pause(): void {
    if (this.isSupported) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech synthesis
   */
  public resume(): void {
    if (this.isSupported) {
      this.synth.resume();
    }
  }
}

// Made with Bob
