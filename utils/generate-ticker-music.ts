import * as Tone from 'tone';

/**
 * Generate synthwave-style procedural music for the ticker theme
 * Features: Retro synths, driving bassline, arpeggiated melodies, 80s aesthetic
 */
export class TickerMusicGenerator {
  private synths: {
    bass?: Tone.MonoSynth;
    lead?: Tone.PolySynth;
    pad?: Tone.PolySynth;
    arp?: Tone.Synth;
  } = {};
  
  private effects: {
    reverb?: Tone.Reverb;
    delay?: Tone.FeedbackDelay;
    chorus?: Tone.Chorus;
  } = {};
  
  private loops: Tone.Loop[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Create effects
    this.effects.reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.3
    }).toDestination();

    this.effects.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2
    }).connect(this.effects.reverb);

    this.effects.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      wet: 0.4
    }).connect(this.effects.delay);

    // Bass synth - deep, punchy synthwave bass
    this.synths.bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.8
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.5,
        baseFrequency: 200,
        octaves: 2.5
      }
    }).connect(this.effects.reverb);
    this.synths.bass.volume.value = -8;

    // Lead synth - bright, cutting lead for melodies
    this.synths.lead = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5
      }
    }).connect(this.effects.chorus);
    this.synths.lead.volume.value = -12;

    // Pad synth - lush background chords
    this.synths.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.8,
        decay: 0.5,
        sustain: 0.7,
        release: 2
      }
    }).connect(this.effects.reverb);
    this.synths.pad.volume.value = -18;

    // Arpeggiator synth
    this.synths.arp = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.1,
        release: 0.3
      }
    }).connect(this.effects.delay);
    this.synths.arp.volume.value = -14;

    await this.effects.reverb.generate();
    this.isInitialized = true;
  }

  start() {
    if (!this.isInitialized) {
      throw new Error('Must call initialize() before start()');
    }

    Tone.Transport.bpm.value = 125; // Classic synthwave tempo

    // Bass pattern - driving 16th note pattern
    const bassLoop = new Tone.Loop((time) => {
      const bassPattern = ['C2', 'C2', 'C2', 'C2', 'A#1', 'A#1', 'G#1', 'G#1'];
      const note = bassPattern[Math.floor((Tone.Transport.ticks / 480) % 8)];
      this.synths.bass?.triggerAttackRelease(note, '16n', time);
    }, '16n');
    bassLoop.start(0);
    this.loops.push(bassLoop);

    // Pad chords - sustained synthwave chords
    const padLoop = new Tone.Loop((time) => {
      const chordProgression = [
        ['C4', 'E4', 'G4'],
        ['A#3', 'D4', 'F4'],
        ['G#3', 'C4', 'D#4'],
        ['A#3', 'D4', 'F4']
      ];
      const measure = Math.floor((Tone.Transport.ticks / 1920) % 4);
      this.synths.pad?.triggerAttackRelease(chordProgression[measure], '2n', time);
    }, '2n');
    padLoop.start(0);
    this.loops.push(padLoop);

    // Arpeggio pattern - classic 80s arp
    const arpLoop = new Tone.Loop((time) => {
      const arpPattern = ['C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E5', 'G5'];
      const note = arpPattern[Math.floor((Tone.Transport.ticks / 240) % 8)];
      this.synths.arp?.triggerAttackRelease(note, '16n', time);
    }, '16n');
    arpLoop.start('2m'); // Start after 2 measures
    this.loops.push(arpLoop);

    // Lead melody - occasional melodic phrases
    const leadLoop = new Tone.Loop((time) => {
      const melodies = [
        ['C5', 'D5', 'E5', 'G5'],
        ['G5', 'F5', 'E5', 'D5'],
        ['E5', 'G5', 'A5', 'G5'],
        ['A5', 'G5', 'E5', 'C5']
      ];
      const phrase = Math.floor((Tone.Transport.ticks / 7680) % 4);
      const melody = melodies[phrase];
      
      melody.forEach((note, i) => {
        this.synths.lead?.triggerAttackRelease(note, '8n', time + i * 0.25);
      });
    }, '4m');
    leadLoop.start('4m'); // Start after 4 measures
    this.loops.push(leadLoop);

    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    this.loops.forEach(loop => loop.stop());
    
    // Immediately release all synths to stop any lingering tones
    if (this.synths.bass) this.synths.bass.triggerRelease();
    if (this.synths.lead) this.synths.lead.releaseAll();
    if (this.synths.pad) this.synths.pad.releaseAll();
    if (this.synths.arp) this.synths.arp.triggerRelease();
  }

  setVolume(volume: number) {
    // Volume is 0-1, convert to dB (-40 to 0)
    const db = (volume * 40) - 40;
    if (this.synths.bass) this.synths.bass.volume.value = db - 8;
    if (this.synths.lead) this.synths.lead.volume.value = db - 12;
    if (this.synths.pad) this.synths.pad.volume.value = db - 18;
    if (this.synths.arp) this.synths.arp.volume.value = db - 14;
  }

  setMuted(muted: boolean) {
    const volume = muted ? -Infinity : 0;
    if (this.synths.bass) this.synths.bass.volume.value = volume;
    if (this.synths.lead) this.synths.lead.volume.value = volume;
    if (this.synths.pad) this.synths.pad.volume.value = volume;
    if (this.synths.arp) this.synths.arp.volume.value = volume;
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

export function createTickerMusic(): TickerMusicGenerator {
  return new TickerMusicGenerator();
}

// Made with Bob
