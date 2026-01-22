/**
 * Generate a cyberpunk/synthwave completion sound using Web Audio API
 * Creates a futuristic, retro-electronic power-up style sound effect
 */
export function generateChaChing(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 1.2; // 1.2 seconds for full synthwave experience
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Cyberpunk/Synthwave sound design:
  // 1. Punchy bass hit at start (0-0.1s)
  // 2. Rising arpeggio with layered synths (0.05-0.8s)
  // 3. Sustained chord with filter sweep (0.6-1.2s)

  // Helper function for sawtooth wave (classic analog synth sound)
  const sawtooth = (freq: number, t: number, phase: number = 0) => {
    const period = 1 / freq;
    const pos = ((t + phase) % period) / period;
    return 2 * pos - 1;
  };

  // Helper function for square wave (digital/chip-tune character)
  const square = (freq: number, t: number, phase: number = 0) => {
    return Math.sin(2 * Math.PI * freq * t + phase) > 0 ? 1 : -1;
  };

  // Arpeggio notes (minor chord progression for that cyberpunk feel)
  // Using C minor pentatonic: C, Eb, F, G, Bb
  const baseFreq = 261.63; // C4
  const arpeggioNotes = [
    baseFreq,           // C
    baseFreq * 1.189,   // Eb (minor third)
    baseFreq * 1.335,   // F (perfect fourth)
    baseFreq * 1.498,   // G (perfect fifth)
    baseFreq * 1.782,   // Bb (minor seventh)
  ];

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Part 1: Punchy bass hit (0-0.15s) - gives it weight and impact
    if (t < 0.15) {
      const bassEnv = Math.exp(-t * 25); // Fast attack/decay
      const bassFreq = 65.41; // C2 - deep bass
      // Layered bass with sine and slight distortion
      const bassSine = Math.sin(2 * Math.PI * bassFreq * t);
      const bassDistortion = Math.tanh(bassSine * 3); // Soft clipping for punch
      sample += bassDistortion * bassEnv * 0.4;
    }

    // Part 2: Rising arpeggio (0.05-0.8s) - the main synthwave character
    if (t >= 0.05 && t < 0.8) {
      const arpT = t - 0.05;
      const noteIndex = Math.floor(arpT / 0.15) % arpeggioNotes.length;
      const noteT = arpT % 0.15;
      const freq = arpeggioNotes[noteIndex];
      
      // ADSR envelope for each note
      const attack = 0.02;
      const decay = 0.05;
      const sustain = 0.6;
      const release = 0.08;
      
      let noteEnv = 0;
      if (noteT < attack) {
        noteEnv = noteT / attack;
      } else if (noteT < attack + decay) {
        noteEnv = 1 - ((noteT - attack) / decay) * (1 - sustain);
      } else if (noteT < 0.15 - release) {
        noteEnv = sustain;
      } else {
        noteEnv = sustain * (1 - (noteT - (0.15 - release)) / release);
      }

      // Layer 1: Sawtooth (main synth lead)
      sample += sawtooth(freq, arpT) * noteEnv * 0.25;
      
      // Layer 2: Detuned sawtooth (analog warmth)
      sample += sawtooth(freq * 1.005, arpT, 0.1) * noteEnv * 0.2;
      
      // Layer 3: Square wave (digital character)
      sample += square(freq * 2, arpT) * noteEnv * 0.15;
      
      // Layer 4: Sub-oscillator (thickness)
      sample += Math.sin(2 * Math.PI * freq * 0.5 * arpT) * noteEnv * 0.2;
    }

    // Part 3: Sustained chord with filter sweep (0.6-1.2s) - the payoff
    if (t >= 0.6) {
      const chordT = t - 0.6;
      const chordEnv = Math.exp(-chordT * 3); // Gradual decay
      
      // Filter sweep effect (simulated by frequency modulation)
      const filterSweep = 1 + (chordT * 2); // Increases over time
      
      // Play a full chord (C minor triad)
      const chordFreqs = [
        baseFreq * 2,       // C5
        baseFreq * 2.378,   // Eb5
        baseFreq * 2.997,   // G5
      ];
      
      chordFreqs.forEach((freq, idx) => {
        // Sawtooth with filter sweep simulation
        const sawValue = sawtooth(freq * filterSweep, chordT);
        sample += sawValue * chordEnv * 0.15;
        
        // Add slight detuning for analog warmth
        const detunedSaw = sawtooth(freq * 1.003 * filterSweep, chordT, 0.05);
        sample += detunedSaw * chordEnv * 0.12;
      });
      
      // Add a subtle sine wave pad for smoothness
      sample += Math.sin(2 * Math.PI * baseFreq * 2 * chordT) * chordEnv * 0.1;
    }

    // Master processing
    // Apply gentle compression/limiting to prevent clipping
    const compressed = Math.tanh(sample * 1.2);
    
    // Master envelope for smooth fade in/out
    let masterEnv = 1;
    if (t < 0.01) {
      masterEnv = t / 0.01; // Quick fade in to prevent clicks
    } else if (t > duration - 0.1) {
      masterEnv = (duration - t) / 0.1; // Fade out
    }
    
    data[i] = compressed * masterEnv * 0.6; // Final scaling
  }

  return buffer;
}

// Made with Bob
