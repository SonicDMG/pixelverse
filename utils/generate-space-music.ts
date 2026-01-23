import * as Tone from 'tone';

/**
 * Generate epic, inspiring space music
 * Features: Rhythmic pulse, ascending melodies, bright harmonies, wonder and awe
 */
export class SpaceMusicGenerator {
  private synths: {
    drone?: Tone.Synth;
    pad1?: Tone.PolySynth;
    pad2?: Tone.PolySynth;
    lead?: Tone.Synth;
    arp?: Tone.Synth;
    kick?: Tone.MembraneSynth;
    shimmer?: Tone.MetalSynth;
    noise?: Tone.NoiseSynth;
  } = {};
  
  private effects: {
    reverb?: Tone.Reverb;
    delay?: Tone.PingPongDelay;
    filter?: Tone.Filter;
    chorus?: Tone.Chorus;
  } = {};
  
  private loops: Tone.Loop[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Create effects - reverb for space atmosphere but brighter
    this.effects.reverb = new Tone.Reverb({
      decay: 5,
      wet: 0.5
    }).toDestination();

    this.effects.delay = new Tone.PingPongDelay({
      delayTime: '8n',
      feedback: 0.35,
      wet: 0.4
    }).connect(this.effects.reverb);

    this.effects.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 5,
      depth: 0.6,
      wet: 0.4
    }).connect(this.effects.delay);

    this.effects.filter = new Tone.Filter({
      frequency: 1800,
      type: 'lowpass',
      rolloff: -12
    }).connect(this.effects.chorus);

    // Kick - Subtle pulse for rhythm
    this.synths.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0,
        release: 0.4
      }
    }).connect(this.effects.reverb);
    this.synths.kick.volume.value = -18;

    // Drone - Foundation with brighter tone
    this.synths.drone = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.8,
        release: 4
      }
    }).connect(this.effects.reverb);
    this.synths.drone.volume.value = -18;

    // Pad 1 - Uplifting major/suspended chords
    this.synths.pad1 = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.7,
        release: 4
      }
    }).connect(this.effects.filter);
    this.synths.pad1.volume.value = -14;

    // Pad 2 - Bright harmony layer
    this.synths.pad2 = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2.5,
        decay: 1.5,
        sustain: 0.6,
        release: 5
      }
    }).connect(this.effects.chorus);
    this.synths.pad2.volume.value = -16;

    // Lead - Melodic phrases that ascend
    this.synths.lead = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.5,
        decay: 1,
        sustain: 0.5,
        release: 2
      }
    }).connect(this.effects.delay);
    this.synths.lead.volume.value = -16;

    // Arpeggio - Ascending sequences for wonder
    this.synths.arp = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.2,
        release: 0.8
      }
    }).connect(this.effects.delay);
    this.synths.arp.volume.value = -18;

    // Shimmer - High sparkle for brightness
    this.synths.shimmer = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.4,
        release: 0.8
      },
      harmonicity: 8,
      modulationIndex: 20,
      resonance: 4000,
      octaves: 1.5
    }).connect(this.effects.reverb);
    this.synths.shimmer.volume.value = -24;

    // Noise - Filtered noise for texture
    this.synths.noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 1,
        decay: 0.5,
        sustain: 0.05,
        release: 2
      }
    }).connect(this.effects.filter);
    this.synths.noise.volume.value = -28;

    await this.effects.reverb.generate();
    this.isInitialized = true;
  }

  start() {
    if (!this.isInitialized) {
      throw new Error('Must call initialize() before start()');
    }

    Tone.Transport.bpm.value = 95; // More energetic tempo

    // Kick - Subtle pulse on quarter notes for rhythm
    const kickLoop = new Tone.Loop((time) => {
      this.synths.kick?.triggerAttackRelease('C1', '8n', time);
    }, '4n');
    kickLoop.start(0);
    this.loops.push(kickLoop);

    // Drone - Foundation with movement
    const droneLoop = new Tone.Loop((time) => {
      const notes = ['C2', 'D2', 'E2', 'G2'];
      const measure = Math.floor((Tone.Transport.ticks / 3840) % 4);
      this.synths.drone?.triggerAttackRelease(notes[measure], '2m', time);
    }, '2m');
    droneLoop.start(0);
    this.loops.push(droneLoop);

    // Pad 1 - Uplifting major/suspended chord progression
    const pad1Loop = new Tone.Loop((time) => {
      const chordProgression = [
        ['C4', 'E4', 'G4'],      // C major - bright
        ['D4', 'F#4', 'A4'],     // D major - uplifting
        ['E4', 'G4', 'B4'],      // E minor - emotional
        ['G4', 'B4', 'D5']       // G major - triumphant
      ];
      const measure = Math.floor((Tone.Transport.ticks / 3840) % 4);
      this.synths.pad1?.triggerAttackRelease(chordProgression[measure], '2m', time);
    }, '2m');
    pad1Loop.start(0);
    this.loops.push(pad1Loop);

    // Pad 2 - Bright harmony layer with suspended chords
    const pad2Loop = new Tone.Loop((time) => {
      const chords = [
        ['E4', 'A4', 'B4', 'E5'],    // Esus - wonder
        ['F#4', 'B4', 'C#5', 'F#5'], // F#sus - awe
        ['G4', 'C5', 'D5', 'G5'],    // Gsus - expansive
        ['A4', 'D5', 'E5', 'A5']     // Asus - inspiring
      ];
      const measure = Math.floor((Tone.Transport.ticks / 7680) % 4);
      this.synths.pad2?.triggerAttackRelease(chords[measure], '4m', time);
    }, '4m');
    pad2Loop.start('1m');
    this.loops.push(pad2Loop);

    // Lead - Ascending melodic phrases (evoke wonder)
    const leadLoop = new Tone.Loop((time) => {
      const melodies = [
        ['C5', 'E5', 'G5', 'C6'],    // Ascending C major arpeggio
        ['D5', 'F#5', 'A5', 'D6'],   // Ascending D major arpeggio
        ['E5', 'G5', 'B5', 'E6'],    // Ascending E minor arpeggio
        ['G5', 'B5', 'D6', 'G6']     // Ascending G major arpeggio
      ];
      const phrase = Math.floor((Tone.Transport.ticks / 7680) % 4);
      const melody = melodies[phrase];
      
      melody.forEach((note, i) => {
        this.synths.lead?.triggerAttackRelease(note, '4n', time + i * 0.5);
      });
    }, '4m');
    leadLoop.start('2m');
    this.loops.push(leadLoop);

    // Arpeggio - Fast ascending sequences for sparkle
    const arpLoop = new Tone.Loop((time) => {
      const arpeggios = [
        ['C5', 'E5', 'G5', 'B5', 'E6'],
        ['D5', 'F#5', 'A5', 'C#6', 'F#6'],
        ['E5', 'G5', 'B5', 'D6', 'G6'],
        ['G5', 'B5', 'D6', 'F#6', 'B6']
      ];
      const measure = Math.floor((Tone.Transport.ticks / 7680) % 4);
      const arp = arpeggios[measure];
      
      arp.forEach((note, i) => {
        this.synths.arp?.triggerAttackRelease(note, '16n', time + i * 0.125);
      });
    }, '2m');
    arpLoop.start('4m');
    this.loops.push(arpLoop);

    // Shimmer - High sparkle on beats for brightness
    const shimmerLoop = new Tone.Loop((time) => {
      if (Math.random() > 0.6) { // 40% chance
        this.synths.shimmer?.triggerAttackRelease('16n', time);
      }
    }, '2n');
    shimmerLoop.start('1m');
    this.loops.push(shimmerLoop);

    // Noise texture - Occasional bright swells
    const noiseLoop = new Tone.Loop((time) => {
      if (Math.random() > 0.75) { // 25% chance
        this.synths.noise?.triggerAttackRelease('8n', time);
      }
    }, '1m');
    noiseLoop.start('6m');
    this.loops.push(noiseLoop);

    // Modulate filter for evolving brightness
    const filterLoop = new Tone.Loop((time) => {
      const freq = 1200 + Math.sin(Tone.Transport.seconds * 0.2) * 600;
      this.effects.filter?.frequency.rampTo(freq, 2);
    }, '4n');
    filterLoop.start(0);
    this.loops.push(filterLoop);

    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    this.loops.forEach(loop => loop.stop());
    
    // Immediately release all synths to stop any lingering tones
    if (this.synths.kick) this.synths.kick.triggerRelease();
    if (this.synths.drone) this.synths.drone.triggerRelease();
    if (this.synths.pad1) this.synths.pad1.releaseAll();
    if (this.synths.pad2) this.synths.pad2.releaseAll();
    if (this.synths.lead) this.synths.lead.triggerRelease();
    if (this.synths.arp) this.synths.arp.triggerRelease();
    if (this.synths.shimmer) this.synths.shimmer.triggerRelease();
    if (this.synths.noise) this.synths.noise.triggerRelease();
  }

  setVolume(volume: number) {
    // Volume is 0-1, convert to dB (-40 to 0)
    const db = (volume * 40) - 40;
    if (this.synths.kick) this.synths.kick.volume.value = db - 18;
    if (this.synths.drone) this.synths.drone.volume.value = db - 18;
    if (this.synths.pad1) this.synths.pad1.volume.value = db - 14;
    if (this.synths.pad2) this.synths.pad2.volume.value = db - 16;
    if (this.synths.lead) this.synths.lead.volume.value = db - 16;
    if (this.synths.arp) this.synths.arp.volume.value = db - 18;
    if (this.synths.shimmer) this.synths.shimmer.volume.value = db - 24;
    if (this.synths.noise) this.synths.noise.volume.value = db - 28;
  }

  setMuted(muted: boolean) {
    const volume = muted ? -Infinity : 0;
    if (this.synths.kick) this.synths.kick.volume.value = volume;
    if (this.synths.drone) this.synths.drone.volume.value = volume;
    if (this.synths.pad1) this.synths.pad1.volume.value = volume;
    if (this.synths.pad2) this.synths.pad2.volume.value = volume;
    if (this.synths.lead) this.synths.lead.volume.value = volume;
    if (this.synths.arp) this.synths.arp.volume.value = volume;
    if (this.synths.shimmer) this.synths.shimmer.volume.value = volume;
    if (this.synths.noise) this.synths.noise.volume.value = volume;
  }

  dispose() {
    this.stop();
    this.loops = [];
    
    Object.values(this.synths).forEach(synth => synth?.dispose());
    Object.values(this.effects).forEach(effect => effect?.dispose());
    
    this.synths = {};
    this.effects = {};
    this.isInitialized = false;
  }
}

export function createSpaceMusic(): SpaceMusicGenerator {
  return new SpaceMusicGenerator();
}

// Made with Bob
