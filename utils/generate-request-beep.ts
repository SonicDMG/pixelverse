/**
 * Generate an ethereal chime sound for request submission
 * Uses Web Audio API to synthesize a bell-like, glass-like chime with:
 * - Multiple harmonic frequencies for richness
 * - Gentle attack and long decay for ethereal quality
 * - Reverb effect for spaciousness
 * - Subtle vibrato for shimmer
 */
export function generateRequestBeep(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 1.5; // 1.5 seconds with natural fade out
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate); // Stereo for depth
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  // Fundamental frequency (C6 - 1046.5 Hz, a pleasant high note)
  const fundamental = 1046.5;
  
  // Harmonic series with frequency ratios for bell-like timbre
  // Using inharmonic ratios typical of bells/chimes
  const harmonics = [
    { freq: fundamental * 1.0, amp: 1.0 },      // Fundamental
    { freq: fundamental * 2.76, amp: 0.6 },     // First overtone (bell-like)
    { freq: fundamental * 5.40, amp: 0.35 },    // Second overtone
    { freq: fundamental * 8.93, amp: 0.2 },     // Third overtone
    { freq: fundamental * 2.0, amp: 0.4 },      // Octave (adds clarity)
    { freq: fundamental * 3.0, amp: 0.25 },     // Perfect fifth above octave
    { freq: fundamental * 4.0, amp: 0.15 },     // Two octaves
  ];

  // Vibrato parameters for ethereal shimmer
  const vibratoRate = 4.5; // Hz
  const vibratoDepth = 0.008; // Subtle pitch modulation

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let leftSample = 0;
    let rightSample = 0;

    // Vibrato (subtle pitch modulation for ethereal quality)
    const vibrato = Math.sin(2 * Math.PI * vibratoRate * t) * vibratoDepth;

    // Generate each harmonic with sine waves
    for (const harmonic of harmonics) {
      const freq = harmonic.freq * (1 + vibrato);
      const harmonicSignal = Math.sin(2 * Math.PI * freq * t) * harmonic.amp;
      
      // Add to both channels with slight phase difference for stereo width
      leftSample += harmonicSignal;
      rightSample += harmonicSignal * Math.cos(0.1 * harmonic.freq * t);
    }

    // Envelope: gentle attack and long exponential decay
    let envelope = 1;
    const attackTime = 0.015; // Very quick attack (15ms) for bell strike
    const decayRate = 3.5; // Exponential decay rate
    
    if (t < attackTime) {
      // Smooth attack curve
      envelope = Math.pow(t / attackTime, 0.5);
    } else {
      // Exponential decay for natural bell sound
      envelope = Math.exp(-decayRate * (t - attackTime));
    }

    leftSample *= envelope;
    rightSample *= envelope;

    // Add reverb/echo for spaciousness (multiple delays)
    const echoDelays = [0.05, 0.11, 0.17]; // Multiple echo times in seconds
    const echoDecay = 0.3; // Echo amplitude decay
    
    for (let e = 0; e < echoDelays.length; e++) {
      const echoTime = t - echoDelays[e];
      if (echoTime > 0) {
        const echoIndex = Math.floor(echoTime * sampleRate);
        if (echoIndex < i) {
          const echoAmp = echoDecay * Math.pow(0.6, e);
          leftSample += leftChannel[echoIndex] * echoAmp;
          rightSample += rightChannel[echoIndex] * echoAmp * 0.9;
        }
      }
    }

    // Add subtle high-frequency shimmer (glass-like quality)
    const shimmerFreq = 6000 + Math.sin(2 * Math.PI * 3 * t) * 1000;
    const shimmer = Math.sin(2 * Math.PI * shimmerFreq * t) * 0.08 * envelope;
    leftSample += shimmer;
    rightSample += shimmer * 0.95;

    // Master fade out at the end for smooth finish
    let masterEnv = 1;
    const fadeOutStart = duration - 0.3;
    if (t > fadeOutStart) {
      masterEnv = Math.pow((duration - t) / (duration - fadeOutStart), 2);
    }

    // Soft limiting to prevent clipping while maintaining dynamics
    leftSample = Math.tanh(leftSample * 0.8) * masterEnv * 0.5;
    rightSample = Math.tanh(rightSample * 0.8) * masterEnv * 0.5;

    leftChannel[i] = leftSample;
    rightChannel[i] = rightSample;
  }

  return buffer;
}

// Made with Bob