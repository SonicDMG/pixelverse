/**
 * Generate a 3-minute looping cyberpunk/synthwave background music track using Web Audio API
 * Creates a dark, electronic, futuristic atmosphere with heavy beat, bass, synth melody, and ambient pads
 * Designed to loop seamlessly without gaps
 */
export function generateCyberpunkMusic(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 180.0; // 3 minutes (180 seconds) for extended listening
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate); // Stereo for depth
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  // Musical structure:
  // - 4/4 time signature at 128 BPM (faster, more energetic)
  // - Key: A minor (dark, moody)
  // - Heavy kick drum pattern for driving beat
  // - Bass line: Pulsing sub-bass with rhythm
  // - Synth melody: Arpeggiated pattern with variations
  // - Pads: Atmospheric wash
  // - Percussion: Hi-hat and snare patterns

  const bpm = 128; // Increased from 120 for more energy
  const beatDuration = 60 / bpm; // Duration of one beat in seconds
  const barDuration = beatDuration * 4; // Duration of one bar (4 beats)

  // Helper functions for waveforms
  const sawtooth = (freq: number, t: number, phase: number = 0): number => {
    const period = 1 / freq;
    const pos = ((t + phase) % period) / period;
    return 2 * pos - 1;
  };

  const square = (freq: number, t: number, phase: number = 0): number => {
    return Math.sin(2 * Math.PI * freq * t + phase) > 0 ? 1 : -1;
  };

  const triangle = (freq: number, t: number, phase: number = 0): number => {
    const period = 1 / freq;
    const pos = ((t + phase) % period) / period;
    return pos < 0.5 ? 4 * pos - 1 : 3 - 4 * pos;
  };

  // A minor scale frequencies (A3 as root)
  const rootFreq = 220; // A3
  const scaleFreqs = [
    rootFreq,           // A
    rootFreq * 1.122,   // B
    rootFreq * 1.189,   // C
    rootFreq * 1.335,   // D
    rootFreq * 1.498,   // E
    rootFreq * 1.587,   // F
    rootFreq * 1.782,   // G
    rootFreq * 2.0,     // A (octave)
  ];

  // Bass line pattern (repeats every 2 bars)
  const bassPattern = [0, 0, 4, 4, 0, 0, 3, 3]; // Indices into scale
  
  // Arpeggio pattern (repeats every bar) - with variations throughout the track
  const arpeggioPattern = [0, 2, 4, 7, 4, 2]; // Am chord arpeggio
  const arpeggioVariation1 = [0, 4, 7, 4, 2, 0]; // Variation 1
  const arpeggioVariation2 = [2, 4, 7, 2, 4, 0]; // Variation 2

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let leftSample = 0;
    let rightSample = 0;

    // Determine which section we're in (intro, verse, chorus, breakdown)
    const section = Math.floor(t / 30) % 6; // 30-second sections
    const barNumber = Math.floor(t / barDuration);
    
    // Select arpeggio pattern based on section for variety
    let currentArpeggio = arpeggioPattern;
    if (section === 2 || section === 4) {
      currentArpeggio = arpeggioVariation1;
    } else if (section === 3 || section === 5) {
      currentArpeggio = arpeggioVariation2;
    }

    // === HEAVY KICK DRUM ===
    // Four-on-the-floor kick pattern for driving beat
    const kickPhase = (t % beatDuration) / beatDuration;
    if (kickPhase < 0.15) { // Kick on every beat
      const kickEnv = Math.exp(-kickPhase * 40);
      // Deep kick with sub-bass punch
      const kickFreq = 60 + (1 - kickPhase / 0.15) * 40; // Pitch drop
      const kickSignal = Math.sin(2 * Math.PI * kickFreq * kickPhase) * kickEnv;
      leftSample += kickSignal * 0.6;
      rightSample += kickSignal * 0.6;
    }

    // === SNARE/CLAP ===
    // Snare on beats 2 and 4
    const beatInBar = (t % barDuration) / beatDuration;
    const snarePhase = (t % beatDuration) / beatDuration;
    if ((beatInBar > 1 && beatInBar < 1.1) || (beatInBar > 3 && beatInBar < 3.1)) {
      const snareEnv = Math.exp(-snarePhase * 50);
      // Noise-based snare
      const noise = Math.random() * 2 - 1;
      const snareSignal = noise * snareEnv * 0.4;
      leftSample += snareSignal;
      rightSample += snareSignal;
    }

    // === BASS LINE ===
    // Deep, pulsing sub-bass that drives the track
    const bassNoteIndex = Math.floor(t / beatDuration) % bassPattern.length;
    const bassScaleIndex = bassPattern[bassNoteIndex];
    const bassFreq = scaleFreqs[bassScaleIndex] * 0.5; // Drop an octave for sub-bass
    
    // Envelope for bass (attack on each beat)
    const beatPhase = (t % beatDuration) / beatDuration;
    const bassEnv = Math.exp(-beatPhase * 8) * 0.7 + 0.3; // Punchy with sustain
    
    // Layered bass: sine for sub + saw for harmonics
    const bassSine = Math.sin(2 * Math.PI * bassFreq * t);
    const bassSaw = sawtooth(bassFreq, t) * 0.3;
    const bassSignal = (bassSine * 0.7 + bassSaw) * bassEnv;
    
    leftSample += bassSignal * 0.35;
    rightSample += bassSignal * 0.35;

    // === SYNTH ARPEGGIO ===
    // Bright, cutting lead synth with stereo width
    const sixteenthNote = beatDuration / 4; // 16th note duration
    const arpIndex = Math.floor(t / sixteenthNote) % currentArpeggio.length;
    const arpScaleIndex = currentArpeggio[arpIndex];
    const arpFreq = scaleFreqs[arpScaleIndex] * 2; // Up an octave
    
    // Envelope for each arpeggio note
    const arpPhase = (t % sixteenthNote) / sixteenthNote;
    const arpAttack = 0.1;
    const arpDecay = 0.3;
    let arpEnv = 0;
    if (arpPhase < arpAttack) {
      arpEnv = arpPhase / arpAttack;
    } else if (arpPhase < arpAttack + arpDecay) {
      arpEnv = 1 - ((arpPhase - arpAttack) / arpDecay) * 0.6;
    } else {
      arpEnv = 0.4 * (1 - (arpPhase - arpAttack - arpDecay) / (1 - arpAttack - arpDecay));
    }
    
    // Layered synth: sawtooth + square for classic analog sound
    const arpSaw = sawtooth(arpFreq, t);
    const arpSaw2 = sawtooth(arpFreq * 1.01, t, 0.1); // Slight detune for width
    const arpSquare = square(arpFreq * 2, t) * 0.3; // Octave up for brightness
    
    const arpSignal = (arpSaw * 0.4 + arpSaw2 * 0.4 + arpSquare) * arpEnv;
    
    // Stereo spread for arpeggio
    leftSample += arpSignal * 0.22;
    rightSample += arpSignal * 0.18;

    // === AMBIENT PAD ===
    // Slow-moving atmospheric wash for depth
    const padFreqs = [
      scaleFreqs[0] * 2,  // A
      scaleFreqs[2] * 2,  // C
      scaleFreqs[4] * 2,  // E
    ];
    
    // Slow LFO for pad movement
    const lfoRate = 0.3; // Hz
    const lfo = Math.sin(2 * Math.PI * lfoRate * t) * 0.5 + 0.5;
    
    padFreqs.forEach((freq, idx) => {
      // Multiple detuned oscillators for thick pad sound
      const pad1 = triangle(freq, t) * 0.15;
      const pad2 = triangle(freq * 1.005, t, 0.2) * 0.15;
      const pad3 = Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.1; // Sub-oscillator
      
      const padSignal = (pad1 + pad2 + pad3) * (0.7 + lfo * 0.3);
      
      // Stereo positioning for pads
      const stereoPos = (idx - 1) * 0.3; // -0.3, 0, 0.3
      leftSample += padSignal * (0.5 - stereoPos) * 0.15;
      rightSample += padSignal * (0.5 + stereoPos) * 0.15;
    });

    // === HI-HAT PATTERN ===
    // More prominent hi-hat for driving rhythm
    const sixteenthNoteHH = beatDuration / 4;
    const hihatPhase = (t % sixteenthNoteHH) / sixteenthNoteHH;
    
    if (hihatPhase < 0.04) { // 16th note hi-hats
      // White noise filtered for hi-hat sound
      const noise = Math.random() * 2 - 1;
      const hihatEnv = Math.exp(-hihatPhase * 120);
      // Vary hi-hat volume - louder on off-beats
      const hihatVolume = (Math.floor(t / sixteenthNoteHH) % 2 === 1) ? 0.15 : 0.10;
      const hihatSignal = noise * hihatEnv * hihatVolume;
      
      leftSample += hihatSignal;
      rightSample += hihatSignal;
    }

    // === MASTER PROCESSING ===
    // Soft compression to prevent clipping
    leftSample = Math.tanh(leftSample * 1.3);
    rightSample = Math.tanh(rightSample * 1.3);
    
    // Seamless loop: crossfade at boundaries
    let loopEnv = 1;
    const fadeTime = 2.0; // 2 second crossfade for smooth 3-minute loop
    if (t < fadeTime) {
      loopEnv = t / fadeTime;
    } else if (t > duration - fadeTime) {
      loopEnv = (duration - t) / fadeTime;
    }
    
    // Apply master envelope and scaling
    leftChannel[i] = leftSample * loopEnv * 0.85;
    rightChannel[i] = rightSample * loopEnv * 0.85;
  }

  return buffer;
}

// Made with Bob