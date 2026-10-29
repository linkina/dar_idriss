// No music and no ambient sound: only short, soft notification tones on
// player actions, synthesised with Web Audio so the game ships no audio files.

export class Sounds {
  private ctx?: AudioContext;
  private master?: GainNode;
  enabled = true;

  // Browsers only allow audio after a user gesture.
  start() {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
    } catch {
      return;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 1 : 0;
    this.master.connect(this.ctx.destination);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  // One bell-like note: a sine with a quiet octave above, fast attack, soft decay.
  private note(freq: number, delay = 0, length = 0.35, volume = 0.12) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    g.connect(this.master);
    for (const [mult, level] of [[1, 1], [2, 0.25]]) {
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      og.gain.value = level;
      osc.connect(og).connect(g);
      osc.start(t);
      osc.stop(t + length + 0.05);
    }
  }

  // Tapping an object or a generator.
  tap() {
    this.note(1046, 0, 0.18, 0.08);
  }

  // Moving an object to another cell.
  move() {
    this.note(784, 0, 0.15, 0.06);
  }

  // Merging: two rising notes, higher for bigger objects.
  merge(level: number) {
    const base = 660 * Math.pow(1.06, level);
    this.note(base, 0, 0.25);
    this.note(base * 1.5, 0.08, 0.35);
  }

  // Delivering an order: a short three-note notification.
  deliver() {
    this.note(880, 0, 0.3);
    this.note(1109, 0.09, 0.3);
    this.note(1319, 0.18, 0.5);
  }

  // Not possible right now (no energy, board full).
  deny() {
    this.note(330, 0, 0.2, 0.08);
    this.note(294, 0.1, 0.25, 0.08);
  }
}
