// High-performance procedural Web Audio API engine (zero external dependencies, zero file loading delays)
class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : 0.04, this.ctx?.currentTime || 0, 0.4);
    }
  }

  // Futuristic metallic UI click (tactile switch)
  playClickSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio fallback silent
    }
  }

  // Harmonic cyber chime when adding item to cart
  playAddToCartSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        const startTime = now + i * 0.04;
        const endTime = startTime + 0.22;

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch {
      // Audio fallback silent
    }
  }

  // Victory / Order completed sound
  playPurchaseSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [392.00, 493.88, 587.33, 783.99]; // G chord
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.85);
      });
    } catch {
      // Audio fallback silent
    }
  }

  // Atmospheric dark cyber pad (ultra-subtle ambient background)
  toggleAmbient(enable) {
    this.init();
    if (!this.ctx) return;

    if (enable) {
      if (!this.ambientOsc1) {
        try {
          const now = this.ctx.currentTime;
          this.ambientGain = this.ctx.createGain();
          this.ambientGain.gain.setValueAtTime(0.0001, now);
          this.ambientGain.gain.linearRampToValueAtTime(0.035, now + 1.5);

          // Sub-bass root note (D2 - 73.42 Hz)
          this.ambientOsc1 = this.ctx.createOscillator();
          this.ambientOsc1.type = 'sine';
          this.ambientOsc1.frequency.setValueAtTime(73.42, now);

          // Ethereal fifth harmonic (A2 - 110 Hz)
          this.ambientOsc2 = this.ctx.createOscillator();
          this.ambientOsc2.type = 'triangle';
          this.ambientOsc2.frequency.setValueAtTime(110.0, now);

          // Low-pass filter for velvety warmth
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(380, now);

          this.ambientOsc1.connect(filter);
          this.ambientOsc2.connect(filter);
          filter.connect(this.ambientGain);
          this.ambientGain.connect(this.ctx.destination);

          this.ambientOsc1.start();
          this.ambientOsc2.start();
        } catch {
          // Audio fallback
        }
      } else if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0.035, this.ctx.currentTime, 0.4);
      }
    } else {
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      }
    }
  }
}

export const audio = new AudioService();
