class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(value: boolean) {
    this.enabled = value;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.06, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore audio failures when browser blocks autoplay
    }
  }

  public playClick() {
    this.playTone(540, 0.045, 'triangle', 0.04);
  }

  public playClear() {
    this.playTone(320, 0.06, 'triangle', 0.035);
  }

  public playError() {
    this.playTone(210, 0.14, 'sawtooth', 0.04, 0);
    this.playTone(175, 0.18, 'sawtooth', 0.04, 0.09);
  }

  public playSuccess() {
    this.playTone(523.25, 0.14, 'triangle', 0.06, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.06, 0.08);
    this.playTone(783.99, 0.24, 'triangle', 0.07, 0.16);
  }

  public playVaultUnlock() {
    this.playTone(392.0, 0.18, 'sine', 0.07, 0);
    this.playTone(493.88, 0.18, 'sine', 0.07, 0.1);
    this.playTone(587.33, 0.22, 'sine', 0.07, 0.2);
    this.playTone(783.99, 0.42, 'triangle', 0.08, 0.3);
  }
}

export const soundFX = new SoundEngine();
