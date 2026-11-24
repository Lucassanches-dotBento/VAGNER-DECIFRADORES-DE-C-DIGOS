export interface MPBTrack {
  id: string;
  title: string;
  style: string;
  bpm: number;
  groove?: 'BOSSA' | 'POP_ROCK' | 'PAGODE';
  chords: {
    name: string;
    bass: number;
    voicing: number[];
    melody: (number | null)[];
  }[];
}

// MIDI note to Hz helper
function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Authentic MPB / Bossa Nova / Brazilian Pop-Rock chord progressions & melodies
export const MPB_TRACKS: MPBTrack[] = [
  {
    id: 'oh-anna-julia',
    title: 'Oh, Anna Júlia',
    style: 'MPB / Pop Brasileiro',
    bpm: 134,
    groove: 'POP_ROCK',
    chords: [
      {
        name: 'C',
        bass: midiToHz(48), // C3
        voicing: [midiToHz(60), midiToHz(64), midiToHz(67), midiToHz(72)], // C4 E4 G4 C5
        // "Oh, An-na Jú-li-a" melodic motif
        melody: [midiToHz(79), null, midiToHz(76), midiToHz(74), midiToHz(72), null, midiToHz(74), null],
      },
      {
        name: 'Am',
        bass: midiToHz(45), // A2
        voicing: [midiToHz(60), midiToHz(64), midiToHz(69), midiToHz(72)], // C4 E4 A4 C5
        melody: [midiToHz(76), null, midiToHz(72), null, midiToHz(69), null, midiToHz(72), null],
      },
      {
        name: 'F',
        bass: midiToHz(41), // F2
        voicing: [midiToHz(60), midiToHz(65), midiToHz(69), midiToHz(72)], // C4 F4 A4 C5
        melody: [midiToHz(77), null, midiToHz(76), midiToHz(74), midiToHz(72), null, midiToHz(69), null],
      },
      {
        name: 'G',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(62), midiToHz(67), midiToHz(71), midiToHz(74)], // D4 G4 B4 D5
        melody: [midiToHz(74), null, midiToHz(79), null, midiToHz(77), midiToHz(74), midiToHz(71), null],
      },
      {
        name: 'C',
        bass: midiToHz(48),
        voicing: [midiToHz(60), midiToHz(64), midiToHz(67), midiToHz(72)],
        melody: [midiToHz(76), midiToHz(76), midiToHz(76), midiToHz(74), midiToHz(72), null, midiToHz(74), null],
      },
      {
        name: 'Am',
        bass: midiToHz(45),
        voicing: [midiToHz(60), midiToHz(64), midiToHz(69), midiToHz(72)],
        melody: [midiToHz(76), null, midiToHz(72), midiToHz(74), midiToHz(72), null, midiToHz(69), null],
      },
      {
        name: 'F',
        bass: midiToHz(41),
        voicing: [midiToHz(60), midiToHz(65), midiToHz(69), midiToHz(72)],
        melody: [midiToHz(72), null, midiToHz(74), midiToHz(76), midiToHz(77), null, midiToHz(76), null],
      },
      {
        name: 'G7',
        bass: midiToHz(43),
        voicing: [midiToHz(62), midiToHz(65), midiToHz(67), midiToHz(71)],
        melody: [midiToHz(74), null, midiToHz(76), null, midiToHz(74), null, midiToHz(71), null],
      },
    ],
  },
  {
    id: 'cheia-de-manias',
    title: 'Cheia de Manias (Raça Negra)',
    style: 'Pagode Romântico',
    bpm: 112,
    groove: 'PAGODE',
    chords: [
      {
        name: 'G',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(67), midiToHz(71), midiToHz(74), midiToHz(79)], // G4 B4 D5 G5
        melody: [midiToHz(79), null, midiToHz(76), midiToHz(74), midiToHz(71), null, midiToHz(74), null],
      },
      {
        name: 'Bm',
        bass: midiToHz(47), // B2
        voicing: [midiToHz(66), midiToHz(71), midiToHz(74), midiToHz(78)], // F#4 B4 D5 F#5
        melody: [midiToHz(78), null, midiToHz(74), null, midiToHz(71), null, midiToHz(74), null],
      },
      {
        name: 'C',
        bass: midiToHz(48), // C3
        voicing: [midiToHz(67), midiToHz(72), midiToHz(76), midiToHz(79)], // G4 C5 E5 G5
        melody: [midiToHz(76), null, midiToHz(79), null, midiToHz(76), midiToHz(74), midiToHz(72), null],
      },
      {
        name: 'D7',
        bass: midiToHz(50), // D3
        voicing: [midiToHz(66), midiToHz(69), midiToHz(72), midiToHz(74)], // F#4 A4 C5 D5
        melody: [midiToHz(74), null, midiToHz(78), null, midiToHz(76), null, midiToHz(74), null],
      },
    ],
  },
  {
    id: 'cigana-raca-negra',
    title: 'Cigana (Raça Negra)',
    style: 'Pagode Clássico',
    bpm: 106,
    groove: 'PAGODE',
    chords: [
      {
        name: 'D',
        bass: midiToHz(38), // D2
        voicing: [midiToHz(66), midiToHz(69), midiToHz(74), midiToHz(78)],
        melody: [midiToHz(78), null, midiToHz(76), midiToHz(74), null, midiToHz(71), midiToHz(69), null],
      },
      {
        name: 'F#m',
        bass: midiToHz(42), // F#2
        voicing: [midiToHz(66), midiToHz(69), midiToHz(73), midiToHz(78)],
        melody: [midiToHz(76), null, midiToHz(74), null, midiToHz(73), null, midiToHz(69), null],
      },
      {
        name: 'G',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(67), midiToHz(71), midiToHz(74), midiToHz(79)],
        melody: [midiToHz(74), null, midiToHz(76), midiToHz(78), midiToHz(79), null, midiToHz(78), null],
      },
      {
        name: 'A7',
        bass: midiToHz(45), // A2
        voicing: [midiToHz(67), midiToHz(69), midiToHz(73), midiToHz(76)],
        melody: [midiToHz(76), null, midiToHz(74), null, midiToHz(73), null, midiToHz(69), null],
      },
    ],
  },
  {
    id: 'e-tarde-demais',
    title: 'É Tarde Demais (Raça Negra)',
    style: 'Samba-Canção / Pagode',
    bpm: 98,
    groove: 'PAGODE',
    chords: [
      {
        name: 'C',
        bass: midiToHz(48), // C3
        voicing: [midiToHz(67), midiToHz(72), midiToHz(76), midiToHz(79)],
        melody: [midiToHz(76), null, midiToHz(77), midiToHz(79), null, midiToHz(76), midiToHz(74), null],
      },
      {
        name: 'Em',
        bass: midiToHz(40), // E2
        voicing: [midiToHz(67), midiToHz(71), midiToHz(76), midiToHz(79)],
        melody: [midiToHz(76), null, midiToHz(74), null, midiToHz(72), null, midiToHz(71), null],
      },
      {
        name: 'F',
        bass: midiToHz(41), // F2
        voicing: [midiToHz(69), midiToHz(72), midiToHz(77), midiToHz(81)],
        melody: [midiToHz(72), null, midiToHz(74), midiToHz(76), midiToHz(77), null, midiToHz(76), null],
      },
      {
        name: 'G7',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(67), midiToHz(71), midiToHz(74), midiToHz(77)],
        melody: [midiToHz(74), null, midiToHz(77), null, midiToHz(76), null, midiToHz(74), null],
      },
    ],
  },
  {
    id: 'garota-do-arquivo',
    title: 'Garota do Arquivo',
    style: 'Bossa Nova Clássica',
    bpm: 116,
    chords: [
      {
        name: 'Cmaj9',
        bass: midiToHz(48), // C3
        voicing: [midiToHz(64), midiToHz(67), midiToHz(71), midiToHz(74)], // E4 G4 B4 D5
        melody: [midiToHz(79), null, midiToHz(76), null, midiToHz(74), null, midiToHz(72), null],
      },
      {
        name: 'D7(9)',
        bass: midiToHz(50), // D3
        voicing: [midiToHz(66), midiToHz(69), midiToHz(72), midiToHz(76)], // F#4 A4 C5 E5
        melody: [midiToHz(78), null, midiToHz(76), null, midiToHz(74), null, midiToHz(72), null],
      },
      {
        name: 'Dm7(9)',
        bass: midiToHz(50), // D3
        voicing: [midiToHz(65), midiToHz(69), midiToHz(72), midiToHz(76)], // F4 A4 C5 E5
        melody: [midiToHz(77), null, midiToHz(76), null, midiToHz(72), null, midiToHz(69), null],
      },
      {
        name: 'G13(b9)',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(65), midiToHz(68), midiToHz(71), midiToHz(76)], // F4 Ab4 B4 E5
        melody: [midiToHz(74), null, midiToHz(71), null, midiToHz(69), null, midiToHz(67), null],
      },
    ],
  },
  {
    id: 'tarde-em-ipanema',
    title: 'Tarde em Ipanema',
    style: 'MPB Acústica',
    bpm: 94,
    chords: [
      {
        name: 'Fmaj7',
        bass: midiToHz(41), // F2
        voicing: [midiToHz(60), midiToHz(64), midiToHz(69), midiToHz(72)],
        melody: [midiToHz(76), null, midiToHz(74), midiToHz(72), null, midiToHz(69), null, null],
      },
      {
        name: 'G6',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(62), midiToHz(67), midiToHz(71), midiToHz(76)],
        melody: [midiToHz(79), null, midiToHz(76), null, midiToHz(74), null, midiToHz(71), null],
      },
      {
        name: 'Em7',
        bass: midiToHz(40), // E2
        voicing: [midiToHz(62), midiToHz(67), midiToHz(71), midiToHz(74)],
        melody: [midiToHz(76), null, midiToHz(74), null, midiToHz(71), null, midiToHz(67), null],
      },
      {
        name: 'A7(b13)',
        bass: midiToHz(45), // A2
        voicing: [midiToHz(61), midiToHz(65), midiToHz(67), midiToHz(72)],
        melody: [midiToHz(73), null, midiToHz(72), null, midiToHz(69), null, midiToHz(67), null],
      },
    ],
  },
  {
    id: 'samba-de-meia-noite',
    title: 'Samba de Meia-Noite',
    style: 'Samba-Jazz MPB',
    bpm: 126,
    chords: [
      {
        name: 'Am9',
        bass: midiToHz(45), // A2
        voicing: [midiToHz(60), midiToHz(64), midiToHz(67), midiToHz(71)],
        melody: [midiToHz(76), null, midiToHz(79), null, midiToHz(76), midiToHz(74), null, midiToHz(72)],
      },
      {
        name: 'D9',
        bass: midiToHz(50), // D3
        voicing: [midiToHz(64), midiToHz(66), midiToHz(69), midiToHz(72)],
        melody: [midiToHz(74), null, midiToHz(78), null, midiToHz(76), null, midiToHz(72), null],
      },
      {
        name: 'Gmaj7',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(62), midiToHz(66), midiToHz(71), midiToHz(74)],
        melody: [midiToHz(79), null, midiToHz(76), null, midiToHz(74), null, midiToHz(71), null],
      },
      {
        name: 'E7(#9)',
        bass: midiToHz(40), // E2
        voicing: [midiToHz(62), midiToHz(68), midiToHz(71), midiToHz(75)],
        melody: [midiToHz(76), null, midiToHz(75), null, midiToHz(71), null, midiToHz(68), null],
      },
    ],
  },
  {
    id: 'chuva-no-leblon',
    title: 'Chuva no Leblon',
    style: 'Bossa Lenta',
    bpm: 84,
    chords: [
      {
        name: 'Am7',
        bass: midiToHz(45), // A2
        voicing: [midiToHz(60), midiToHz(64), midiToHz(67), midiToHz(72)],
        melody: [midiToHz(72), null, midiToHz(76), null, midiToHz(74), null, null, null],
      },
      {
        name: 'Am/G',
        bass: midiToHz(43), // G2
        voicing: [midiToHz(60), midiToHz(64), midiToHz(67), midiToHz(72)],
        melody: [midiToHz(79), null, midiToHz(76), null, midiToHz(72), null, null, null],
      },
      {
        name: 'Fmaj7',
        bass: midiToHz(41), // F2
        voicing: [midiToHz(60), midiToHz(64), midiToHz(69), midiToHz(72)],
        melody: [midiToHz(74), null, midiToHz(72), null, midiToHz(69), null, null, null],
      },
      {
        name: 'E7(b9)',
        bass: midiToHz(40), // E2
        voicing: [midiToHz(62), midiToHz(65), midiToHz(68), midiToHz(71)],
        melody: [midiToHz(71), null, midiToHz(69), null, midiToHz(68), null, null, null],
      },
    ],
  },
];

// Authentic Bossa Nova, Pop-Rock & Pagode 8-step eighth-note comping patterns
const BOSSA_COMPING_PATTERN = [1, 0, 0, 1, 0, 0, 1, 0];
const BOSSA_RIMSHOT_PATTERN = [1, 0, 0, 1, 0, 0, 1, 0];
const POP_COMPING_PATTERN = [1, 0, 1, 1, 0, 1, 1, 0];
const POP_SNARE_PATTERN = [0, 0, 1, 0, 0, 0, 1, 0];
const PAGODE_COMPING_PATTERN = [1, 0, 1, 1, 0, 1, 0, 1];
const PAGODE_TAMBORIM_PATTERN = [0, 1, 0, 1, 1, 0, 1, 0];

class MPBPlayerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timerId: number | null = null;
  private isPlaying = false;
  private trackIndex = 0;
  private stepIndex = 0; // 0..31 (4 chords * 8 eighth-notes)
  private volume = 0.55;
  private onStateChange: (() => void) | null = null;

  public subscribe(listener: () => void) {
    this.onStateChange = listener;
  }

  private notify() {
    if (this.onStateChange) this.onStateChange();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume * 0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.45, this.ctx.currentTime, 0.04);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getTrackIndex(): number {
    return this.trackIndex;
  }

  public getCurrentTrack(): MPBTrack {
    return MPB_TRACKS[this.trackIndex] ?? MPB_TRACKS[0];
  }

  public getCurrentChordName(): string {
    const track = this.getCurrentTrack();
    const chordIdx = Math.floor(this.stepIndex / 8) % track.chords.length;
    return track.chords[chordIdx]?.name ?? '';
  }

  public setTrack(index: number, autoStart = true) {
    this.trackIndex = ((index % MPB_TRACKS.length) + MPB_TRACKS.length) % MPB_TRACKS.length;
    this.stepIndex = 0;
    if (this.isPlaying) {
      if (this.timerId !== null) {
        window.clearInterval(this.timerId);
      }
      this.tick();
      this.timerId = window.setInterval(() => this.tick(), this.getStepDurationMs());
      this.notify();
    } else if (autoStart) {
      this.start();
    } else {
      this.notify();
    }
  }

  public nextTrack() {
    this.setTrack(this.trackIndex + 1, this.isPlaying);
  }

  public prevTrack() {
    this.setTrack(this.trackIndex - 1, this.isPlaying);
  }

  public start(): boolean {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (this.isPlaying) return true;

    this.isPlaying = true;
    const stepMs = this.getStepDurationMs();
    this.tick();
    this.timerId = window.setInterval(() => this.tick(), stepMs);
    this.notify();
    return true;
  }

  public pause() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    }
    return this.start();
  }

  private getStepDurationMs(): number {
    const bpm = this.getCurrentTrack().bpm;
    // Eighth note duration in ms
    return Math.round((60 / bpm / 2) * 1000);
  }

  private restartIntervalIfTempoChanged(prevBpm: number) {
    if (!this.isPlaying) return;
    const newBpm = this.getCurrentTrack().bpm;
    if (prevBpm !== newBpm && this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = window.setInterval(() => this.tick(), this.getStepDurationMs());
    }
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || ctx.state !== 'running') return;

    const track = this.getCurrentTrack();
    const chordIdx = Math.floor(this.stepIndex / 8) % track.chords.length;
    const subStep = this.stepIndex % 8;
    const chord = track.chords[chordIdx];
    const now = ctx.currentTime;

    const groove = track.groove ?? 'BOSSA';

    // 1. Bass / Surdo line
    if (groove === 'PAGODE') {
      if (subStep === 0 || subStep === 4) {
        this.playBassNote(chord.bass, now, 0.32);
      } else if (subStep === 3 || subStep === 6) {
        this.playBassNote(chord.bass * 1.498, now, 0.2);
      }
    } else if (groove === 'POP_ROCK') {
      if (subStep === 0 || subStep === 2 || subStep === 4 || subStep === 6) {
        const pitch = subStep === 4 ? chord.bass * 1.498 : chord.bass;
        this.playBassNote(pitch, now, 0.24);
      }
    } else {
      if (subStep === 0) {
        this.playBassNote(chord.bass, now, 0.52);
      } else if (subStep === 4) {
        this.playBassNote(chord.bass * 1.498, now, 0.36);
      } else if (subStep === 6) {
        this.playBassNote(chord.bass, now, 0.28);
      }
    }

    // 2. Guitar / Cavaquinho comping
    if (groove === 'PAGODE') {
      if (PAGODE_COMPING_PATTERN[subStep] === 1) {
        this.playCavaquinhoChord(chord.voicing, now);
      }
    } else {
      const compPattern = groove === 'POP_ROCK' ? POP_COMPING_PATTERN : BOSSA_COMPING_PATTERN;
      if (compPattern[subStep] === 1) {
        this.playViolaoChord(chord.voicing, now);
      }
    }

    // 3. Warm Rhodes pad on downbeat of each bar
    if (subStep === 0) {
      this.playRhodesChord(chord.voicing, now, groove === 'BOSSA' ? 1.6 : 1.15);
    }

    // 4. Melodic lead phrase
    const melodyHz = chord.melody[subStep];
    if (melodyHz) {
      if (groove === 'PAGODE') {
        this.playBrassMelodyNote(melodyHz, now, 0.38);
      } else {
        this.playMelodyNote(melodyHz, now, groove === 'POP_ROCK' ? 0.34 : 0.45);
      }
    }

    // 5. Pandeiro / Shaker & Tamborim / Rimshot groove
    this.playShaker(
      now,
      groove === 'PAGODE'
        ? subStep % 2 === 0
          ? 0.055
          : 0.032
        : subStep % 2 === 0
        ? 0.045
        : 0.025
    );
    const percPattern =
      groove === 'PAGODE'
        ? PAGODE_TAMBORIM_PATTERN
        : groove === 'POP_ROCK'
        ? POP_SNARE_PATTERN
        : BOSSA_RIMSHOT_PATTERN;
    if (percPattern[subStep] === 1) {
      this.playRimshot(now);
    }

    const prevBpm = track.bpm;
    this.stepIndex = (this.stepIndex + 1) % (track.chords.length * 8);
    if (subStep === 0) {
      this.notify();
    }
    this.restartIntervalIfTempoChanged(prevBpm);
  }

  private playViolaoChord(freqs: number[], startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    freqs.forEach((freq, idx) => {
      const t = startTime + idx * 0.014; // Gentle guitar finger-roll strum
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1450, t);
      filter.frequency.exponentialRampToValueAtTime(520, t + 0.35);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  private playCavaquinhoChord(freqs: number[], startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    freqs.forEach((freq, idx) => {
      const t = startTime + idx * 0.008; // Crisp fast cavaquinho strum
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.frequency.exponentialRampToValueAtTime(750, t + 0.2);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.075, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.23);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  private playBrassMelodyNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1750, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.04);
  }

  private playRhodesChord(freqs: number[], startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.04);
    });
  }

  private playBassNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.24, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  private playMelodyNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.075, startTime + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.04);
  }

  private playShaker(startTime: number, level: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const ctx = this.ctx;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6200, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(level, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(startTime);
    src.stop(startTime + 0.055);
  }

  private playRimshot(startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, startTime);
    osc.frequency.exponentialRampToValueAtTime(420, startTime + 0.025);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.035, startTime + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.045);
  }
}

export const mpbPlayer = new MPBPlayerEngine();
