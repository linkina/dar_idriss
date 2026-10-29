// Natural sounds only, no music: a fountain, birds, and soft effects,
// all synthesised with Web Audio so the game ships no audio files.

export class Nature {
  private ctx?: AudioContext;
  private master?: GainNode;
  private birdTimer?: number;
  enabled = true;

  // Browsers only allow audio after a user gesture.
  start() {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
    } catch {
      return;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.enabled ? 1 : 0;
    this.master.connect(ctx.destination);
    this.fountain();
    this.scheduleBird();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.1);
  }

  // Running water: filtered noise whose level drifts slowly.
  private fountain() {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 900;
    band.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.18;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(band).connect(gain).connect(this.master!);
    src.start();
    lfo.start();
  }

  private scheduleBird() {
    const wait = 3000 + Math.random() * 6000;
    this.birdTimer = window.setTimeout(() => {
      this.bird();
      this.scheduleBird();
    }, wait);
  }

  // A short call of two to four rising chirps.
  private bird() {
    const ctx = this.ctx!;
    const base = 2200 + Math.random() * 1500;
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + i * 0.13;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.08);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      osc.connect(g).connect(this.master!);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  // Soft wooden "tok", pitched higher for bigger merges.
  tok(pitch = 1) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(240 * pitch, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Light chime for a delivered order.
  chime() {
    if (!this.ctx) return;
    [880, 1320, 1760].forEach((f, i) => setTimeout(() => this.tok(f / 420), i * 90));
  }
}
