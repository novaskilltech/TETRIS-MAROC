// Procedural Web Audio API Sound Synthesizer for Tetris Maroc
// Zero external assets required, immediate latency, 100% offline & local-first.

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('tetris_maroc_muted');
      if (savedMute !== null) {
        this.muted = savedMute === 'true';
      }
    }
  }

  // Ensure AudioContext is initialized and resumed on user interaction
  public init(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tetris_maroc_muted', String(muted));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Helper to play synthesized tone
  private playTone(
    freq: number,
    type: OscillatorType,
    durationMs: number,
    startGain: number = 0.15,
    endFreq?: number
  ): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + durationMs / 1000);
      }

      gain.gain.setValueAtTime(startGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch (e) {
      // AudioContext could still be restricted before user gesture
    }
  }

  public playMove(): void {
    this.playTone(280, 'sine', 35, 0.08, 330);
  }

  public playRotate(): void {
    this.playTone(420, 'triangle', 60, 0.12, 620);
  }

  public playSoftDrop(): void {
    this.playTone(190, 'sine', 30, 0.06);
  }

  public playHardDrop(): void {
    this.playTone(140, 'triangle', 90, 0.25, 45);
  }

  public playLineClear(lines: number): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (lines >= 4) {
      // Royal Tetris 4-note celebration arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 180, 0.22);
        }, idx * 70);
      });
    } else {
      // Classic 1-3 line harmonious chime
      const baseFreq = lines === 1 ? 523.25 : lines === 2 ? 659.25 : 783.99;
      this.playTone(baseFreq, 'sine', 120, 0.18, baseFreq * 1.3);
    }
  }

  public playLevelUp(): void {
    if (this.muted) return;
    const fanfare = [392.0, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 140, 0.18);
      }, i * 60);
    });
  }

  public playGameOver(): void {
    if (this.muted) return;
    const notes = [440, 370, 311, 220];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 250, 0.15, f * 0.8);
      }, i * 140);
    });
  }

  public playButtonClick(): void {
    this.playTone(600, 'sine', 25, 0.08);
  }

  // Bonus Rewind Sound (Reverse time chime)
  public playRewind(): void {
    if (this.muted) return;
    const reverseChimes = [261.63, 329.63, 392.0, 523.25, 659.25];
    reverseChimes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 90, 0.16, f * 1.15);
      }, i * 45);
    });
  }

  // Bonus Galactic Bomb Sound (Deep sub-bass explosion rumble)
  public playBombExplosion(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // 1. Initial thunder strike
      this.playTone(180, 'sawtooth', 350, 0.35, 45);
      // 2. Sub-bass shockwave
      setTimeout(() => {
        this.playTone(85, 'triangle', 600, 0.4, 25);
      }, 50);
      // 3. Cosmic resonance ripple
      setTimeout(() => {
        this.playTone(440, 'sine', 400, 0.2, 880);
      }, 150);
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();
