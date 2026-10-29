import Phaser from 'phaser';
import { CHAINS, ZONES, type Task, type Zone } from './data';
import type { Sounds } from './sound';
import { save, type Save } from './state';
import { closeButton, FONT, H, INK, text, W } from './ui';

const ZONE_BONUS = 50;
// Isometric grid: 10 x 10 tiles of 64 x 32 px, walls on the two back edges.
const N = 10;
const TW = 64;
const TH = 32;
const WALL_H = 200;
const UNIT = Math.hypot(TW / 2, TH / 2);
const PANEL_H = 210;

export interface RiadData {
  save: Save;
  sfx: Sounds;
  onClose: () => void;
}

// Where each renovation shows up in the riad, in grid coordinates.
interface Spot { key: string; c: number; r: number; ox?: number; oy: number; scale?: number; flip?: boolean; lift?: number }
const SPOTS: Record<string, Spot[]> = {
  porte: [{ key: 'porte', c: 9.75, r: 9.75, oy: 0.98, scale: 0.5 }],
  lanternes: [{ key: 'lanterne', c: 9.6, r: 6.9, oy: 0.97, scale: 0.8 }, { key: 'lanterne', c: 6.9, r: 9.6, oy: 0.97, scale: 0.8 }],
  jarres: [{ key: 'jarre', c: 9.4, r: 4.9, oy: 0.95, scale: 0.8 }, { key: 'jarre', c: 4.9, r: 9.4, oy: 0.95, scale: 0.8 }],
  tapis: [],
  fontaine: [{ key: 'fontaine', c: 5, r: 5, oy: 0.73, scale: 0.9 }],
  zellige: [],
  orangers: [{ key: 'oranger', c: 8.3, r: 3.3, oy: 0.94, scale: 0.85 }, { key: 'oranger', c: 3.3, r: 8.3, oy: 0.94, scale: 0.85 }],
  banquettes: [{ key: 'banquette', c: 7.4, r: 5.2, oy: 0.8, scale: 0.8 }, { key: 'banquette', c: 5.2, r: 7.4, oy: 0.8, scale: 0.8, flip: true }],
  sedari: [{ key: 'sedari', c: 0.5, r: 0.9, ox: 0, oy: 70 / 170, scale: 0.78 }],
  coussins: [{ key: 'coussins', c: 0.5, r: 0.9, ox: 0, oy: 70 / 170, scale: 0.78, lift: 1 }],
  table: [{ key: 'table', c: 2.9, r: 2.9, oy: 0.88, scale: 0.85 }],
  lustre: [{ key: 'lustre', c: 2.7, r: 2.7, oy: 1, scale: 0.85, lift: 120 }],
};
// Where the task bubble and Idriss go when a spot has no object (floor tasks).
const FLOOR_SPOT: Record<string, [number, number]> = { porte: [9.3, 9.3], jarres: [4.9, 9.4], tapis: [7.4, 7.4], zellige: [6.4, 3.6], sedari: [2.2, 1.4], coussins: [3.4, 1.2] };

const zoneDone = (s: Save, z: Zone) => z.tasks.every((t) => s.tasksDone.includes(t.id));
const zoneOpen = (s: Save, i: number) => i === 0 || zoneDone(s, ZONES[i - 1]);
// Front of the riad is the entrance, the middle the patio, the back the salon.
const zoneOfTile = (c: number, r: number) => (c + r >= 13 ? 0 : c + r >= 7 ? 1 : 2);

// The riad in isometric view: Idriss walks around and each renovation appears in place.
export class RiadScene extends Phaser.Scene {
  private d!: RiadData;
  private ox = W / 2;
  private oy = 0;
  private world!: Phaser.GameObjects.Container;
  private hud!: Phaser.GameObjects.Container;
  private starText!: Phaser.GameObjects.Text;
  private note!: Phaser.GameObjects.Text;
  private idriss!: Phaser.GameObjects.Image;
  private walking = false;

  constructor() {
    super('riad');
  }

  create(d: RiadData) {
    this.d = d;
    const top = 110;
    const bottom = H - PANEL_H;
    // Centre the riad (walls + floor diamond) in the space between header and panel.
    // The floor sits near the bottom panel; sky, sun and minaret fill the space above.
    this.oy = Math.round(Math.max(top + WALL_H + 60, bottom - N * TH - 60));

    const sky = this.add.graphics();
    sky.fillGradientStyle(0x7fc8f0, 0x7fc8f0, 0xd8f0fb, 0xd8f0fb, 1).fillRect(0, 0, W, H);
    sky.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
    sky.on('pointerup', (p: Phaser.Input.Pointer) => this.tapFloor(p.x, p.y));

    this.drawSky();
    this.world = this.add.container(0, 0);
    this.hud = this.add.container(0, 0).setDepth(10000);
    this.drawHeader();
    this.drawPanel();
    this.idriss = this.add.image(0, 0, 'walker').setOrigin(0.5, 0.96).setScale(0.62);
    const start = this.iso(6.2, 7.6);
    this.idriss.setPosition(start.x, start.y).setDepth(start.y);
    this.tweens.add({ targets: this.idriss, scaleY: 0.64, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.render();
    this.say('Touche une bulle pour rénover, ou le sol pour promener Idriss.');
  }

  // Sun, clouds and a minaret behind the walls.
  private drawSky() {
    const g = this.add.graphics();
    g.fillStyle(0xfff3b0, 0.5).fillCircle(W - 120, 190, 70);
    g.fillStyle(0xffd54a, 1).fillCircle(W - 120, 190, 44);
    const back = this.iso(0, 0);
    // Minaret.
    const mx = back.x - 190;
    const my = back.y - WALL_H + 60;
    g.fillStyle(0xe2a77f, 1).fillRect(mx - 28, my - 260, 56, 260);
    g.fillStyle(0x1d3f94, 1).fillRect(mx - 28, my - 200, 56, 14);
    g.fillStyle(0x22b35e, 1).fillRect(mx - 34, my - 268, 68, 14);
    g.fillStyle(0xe2a77f, 1).fillRect(mx - 18, my - 320, 36, 52);
    g.fillStyle(0x22b35e, 1).fillTriangle(mx - 22, my - 320, mx + 22, my - 320, mx, my - 352);
    g.fillStyle(0x6e4a2e, 1).fillRoundedRect(mx - 10, my - 160, 20, 36, { tl: 10, tr: 10, bl: 0, br: 0 });
    g.fillStyle(0xd9a441, 1).fillCircle(mx, my - 360, 6);
    g.lineStyle(3, 0x24140a, 1).strokeRect(mx - 28, my - 260, 56, 260).strokeRect(mx - 18, my - 320, 36, 52);
    for (const [x, y, k] of [[110, 170, 1], [330, 120, 0.8], [560, 300, 0.7]]) {
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x, y, 26 * k).fillCircle(x + 30 * k, y - 12 * k, 32 * k).fillCircle(x + 64 * k, y, 24 * k).fillRoundedRect(x - 20 * k, y, 106 * k, 22 * k, 11 * k);
    }
  }

  private iso(c: number, r: number) {
    return { x: this.ox + (c - r) * (TW / 2), y: this.oy + (c + r) * (TH / 2) };
  }

  private close() {
    this.d.sfx.tap();
    this.d.onClose();
    this.scene.stop();
  }

  private drawHeader() {
    const g = this.add.graphics();
    g.fillStyle(0x1d3f94, 1).fillRect(0, 0, W, 96);
    g.fillStyle(0xd9a441, 1).fillRect(0, 96, W, 5);
    this.hud.add(g);
    this.hud.add(text(this, 28, 26, 'Le riad', 36, '#fdf6e7').setStroke('#0f2560', 6));
    this.hud.add(this.add.image(470, 50, 'pill').setDisplaySize(150, 52));
    this.hud.add(this.add.image(420, 50, 'icon-star').setDisplaySize(34, 34));
    this.starText = text(this, 446, 33, '', 28);
    this.hud.add(this.starText);
    this.hud.add(closeButton(this, W - 50, 50, () => this.close()));
  }

  private drawPanel() {
    const g = this.add.graphics();
    g.fillStyle(0x5a2410, 0.35).fillRoundedRect(0, H - PANEL_H - 4, W, PANEL_H + 40, 28);
    g.fillStyle(0xfdf6e7, 1).fillRoundedRect(0, H - PANEL_H, W, PANEL_H + 40, 28);
    const rim = [0xd22b26, 0xef7d1a, 0xf7c531, 0x0f8a5f, 0x1d3f94, 0x7fb3e3];
    rim.forEach((c, k) => g.fillStyle(c, 1).fillRect((W / rim.length) * k, H - PANEL_H, W / rim.length + 1, 6));
    this.hud.add(g);
    this.note = this.add.text(W / 2, H - 52, '', { fontFamily: FONT, fontSize: '20px', color: INK, align: 'center', wordWrap: { width: W - 60 } }).setOrigin(0.5);
    this.hud.add(this.note);
  }

  // ---------- Drawing the riad ----------

  private render() {
    const s = this.d.save;
    this.world.removeAll(true);
    this.children.list.filter((o) => o.getData?.('riad')).forEach((o) => o.destroy());
    this.starText.setText(`${s.stars}`);
    this.drawWalls();
    this.drawFloor();
    this.drawObjects();
    this.drawZoneChips();
  }

  private wallPt(side: 'L' | 'R', u: number, v: number) {
    const b = side === 'R' ? this.iso(u, 0) : this.iso(0, u);
    return new Phaser.Math.Vector2(b.x, b.y - v);
  }

  private wallPoly(g: Phaser.GameObjects.Graphics, side: 'L' | 'R', u0: number, u1: number, v0: number, v1: number) {
    g.fillPoints([this.wallPt(side, u0, v0), this.wallPt(side, u1, v0), this.wallPt(side, u1, v1), this.wallPt(side, u0, v1)], true);
  }

  private drawWalls() {
    const g = this.add.graphics();
    this.world.add(g);
    for (const side of ['L', 'R'] as const) {
      // The left wall is in shade, the right one in the sun.
      g.fillStyle(side === 'L' ? 0xe8cfa6 : 0xf6e6c8, 1);
      this.wallPoly(g, side, 0, N, 0, WALL_H);
      // Zellige wainscot.
      g.fillStyle(0x1d3f94, 1);
      this.wallPoly(g, side, 0, N, 0, 30);
      for (let u = 0; u < N; u += 0.5) {
        g.fillStyle((u * 2) % 2 ? 0x22b35e : 0xfdf6e7, 1);
        g.fillPoints([this.wallPt(side, u + 0.25, 6), this.wallPt(side, u + 0.4, 15), this.wallPt(side, u + 0.25, 24), this.wallPt(side, u + 0.1, 15)], true);
      }
      // Arches.
      for (const uc of [2, 5, 8]) {
        const pts: Phaser.Math.Vector2[] = [this.wallPt(side, uc - 0.8, 30)];
        for (let a = Math.PI; a >= 0; a -= Math.PI / 12) pts.push(this.wallPt(side, uc + 0.8 * Math.cos(a), 84 + 0.8 * UNIT * 0.8 * Math.sin(a)));
        pts.push(this.wallPt(side, uc + 0.8, 30));
        g.fillStyle(0xd9a441, 1).fillPoints(pts.map((p, i) => (i === 0 || i === pts.length - 1 ? p : new Phaser.Math.Vector2(p.x, p.y - 5))), true);
        g.fillStyle(side === 'L' ? 0x5a3a24 : 0x6e4a2e, 1).fillPoints(pts, true);
      }
      // Upper gallery: small arches above a wooden balustrade.
      g.fillStyle(0x8e5a2b, 1);
      this.wallPoly(g, side, 0, N, 118, 126);
      for (let u = 0.5; u < N; u += 1) {
        const pts: Phaser.Math.Vector2[] = [this.wallPt(side, u, 126)];
        for (let a = Math.PI; a >= 0; a -= Math.PI / 8) pts.push(this.wallPt(side, u + 0.5 + 0.32 * Math.cos(a), 160 + 14 * Math.sin(a)));
        pts.push(this.wallPt(side, u + 0.82, 126));
        g.fillStyle(side === 'L' ? 0x5a3a24 : 0x6e4a2e, 1).fillPoints(pts, true);
      }
      for (let u = 0.25; u < N; u += 0.5) g.lineStyle(2, 0x8e5a2b, 1).lineBetween(this.wallPt(side, u, 100).x, this.wallPt(side, u, 100).y, this.wallPt(side, u, 118).x, this.wallPt(side, u, 118).y);
      g.lineStyle(3, 0x8e5a2b, 1).strokePoints([this.wallPt(side, 0, 100), this.wallPt(side, N, 100)], false);
      // Terracotta cornice and outline.
      g.fillStyle(0xc8643c, 1);
      this.wallPoly(g, side, 0, N, WALL_H - 12, WALL_H);
      g.lineStyle(3, 0x24140a, 1).strokePoints([this.wallPt(side, 0, 0), this.wallPt(side, N, 0), this.wallPt(side, N, WALL_H), this.wallPt(side, 0, WALL_H)], true);
    }
  }

  private drawFloor() {
    const s = this.d.save;
    const zellige = s.tasksDone.includes('zellige');
    const g = this.add.graphics();
    this.world.add(g);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const z = zoneOfTile(c, r);
        const alt = (c + r) % 2 === 0;
        let color: number;
        if (z === 1 && zellige) color = [0xfdf6e7, 0x1d3f94, 0x22b35e, 0xfdf6e7][(c % 2) * 2 + (r % 2)];
        else if (z === 1) color = alt ? 0xd8c3a0 : 0xcdb48c;
        else if (z === 2) color = alt ? 0xe2a77f : 0xd9966b;
        else color = alt ? 0xead6b0 : 0xdcc49a;
        const pts = [this.iso(c, r), this.iso(c + 1, r), this.iso(c + 1, r + 1), this.iso(c, r + 1)].map((p) => new Phaser.Math.Vector2(p.x, p.y));
        g.fillStyle(color, 1).fillPoints(pts, true);
        g.lineStyle(1, 0x24140a, 0.25).strokePoints(pts, true);
        if (z === 1 && !zellige && (c * 7 + r * 3) % 5 === 0) {
          // A few cracks in the old patio floor.
          const m = this.iso(c + 0.5, r + 0.5);
          g.lineStyle(1.5, 0x8a7356, 0.8).lineBetween(m.x - 12, m.y - 2, m.x + 2, m.y + 3).lineBetween(m.x + 2, m.y + 3, m.x + 10, m.y - 4);
        }
      }
    }
    if (s.tasksDone.includes('tapis')) {
      // Long red rug from the gate into the patio.
      const rug = (a: number, b: number) => [this.iso(a, a), this.iso(b, a), this.iso(b, b), this.iso(a, b)].map((p) => new Phaser.Math.Vector2(p.x, p.y));
      g.fillStyle(0xd9a441, 1).fillPoints(rug(7.3, 9.4), true);
      g.fillStyle(0xc0392b, 1).fillPoints(rug(7.5, 9.2), true);
      g.fillStyle(0x1d3f94, 1).fillPoints(rug(8.1, 8.6), true);
      g.lineStyle(2.5, 0x24140a, 1).strokePoints(rug(7.3, 9.4), true);
    }
    // Locked rooms stay in the shadow.
    ZONES.forEach((_, zi) => {
      if (zoneOpen(s, zi)) return;
      g.fillStyle(0x1a0d05, 0.45);
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (zoneOfTile(c, r) !== zi) continue;
        g.fillPoints([this.iso(c, r), this.iso(c + 1, r), this.iso(c + 1, r + 1), this.iso(c, r + 1)].map((p) => new Phaser.Math.Vector2(p.x, p.y)), true);
      }
      const centre = zi === 2 ? this.iso(2.2, 2.2) : this.iso(5, 5);
      const lock = this.add.image(centre.x, centre.y - 10, 'icon-lock').setDisplaySize(56, 56).setDepth(4000).setData('riad', true);
      this.tweens.add({ targets: lock, y: centre.y - 20, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
  }

  private placeSpot(sp: Spot) {
    const p = this.iso(sp.c, sp.r);
    const key = sp.key === 'fontaine' && !this.d.save.tasksDone.includes('fontaine') ? 'iso-fontaine-off' : `iso-${sp.key}`;
    const img = this.add.image(p.x, p.y - (sp.lift && sp.lift > 1 ? sp.lift : 0), key)
      .setOrigin(sp.ox ?? 0.5, sp.oy).setScale(sp.scale ?? 1).setFlipX(!!sp.flip)
      .setDepth(p.y + (sp.lift ?? 0)).setData('riad', true);
    return img;
  }

  private drawObjects() {
    const s = this.d.save;
    // The dry fountain stays visible until it is restored.
    if (zoneOpen(s, 1) && !s.tasksDone.includes('fontaine')) this.placeSpot(SPOTS.fontaine[0]);
    ZONES.forEach((z, zi) => {
      const open = zoneOpen(s, zi);
      for (const t of z.tasks) {
        if (s.tasksDone.includes(t.id)) {
          SPOTS[t.id].forEach((sp) => this.placeSpot(sp));
        } else if (open) {
          this.bubble(t);
        }
      }
    });
  }

  private anchorOf(t: Task) {
    const [c, r] = FLOOR_SPOT[t.id] ?? [SPOTS[t.id][0].c, SPOTS[t.id][0].r];
    return { c, r, ...this.iso(c, r) };
  }

  // A floating bubble with the star cost over the place to renovate.
  private bubble(t: Task) {
    const s = this.d.save;
    const a = this.anchorOf(t);
    const ok = s.stars >= t.cost;
    if (t.id !== 'fontaine') this.add.image(a.x, a.y, 'iso-rubble').setOrigin(0.5, 0.85).setScale(0.7).setDepth(a.y).setData('riad', true);
    const b = this.add.container(a.x, a.y - 70).setDepth(5000).setData('riad', true);
    b.add(this.add.triangle(0, 30, -10, 0, 10, 0, 0, 14, 0xffffff).setStrokeStyle(2.5, 0x24140a));
    b.add(this.add.circle(0, 0, 32, 0xffffff).setStrokeStyle(5, ok ? 0x22b35e : 0x9aa3a8));
    b.add(this.add.image(-9, 0, 'icon-star').setDisplaySize(30, 30));
    b.add(this.add.text(14, 0, `${t.cost}`, { fontFamily: FONT, fontSize: '24px', color: INK, fontStyle: 'bold' }).setOrigin(0.5));
    b.setSize(70, 70).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: b, y: a.y - 80, duration: 800 + (t.cost * 97) % 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    b.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation();
      this.d.sfx.tap();
      if (!ok) return this.say(`${t.name} : il te faut ${t.cost} étoiles. Livre des commandes pour en gagner.`);
      this.say(`${t.name}…`);
      this.walkTo(a.c + 0.9, a.r + 0.9, () => this.renovate(t));
    });
  }

  private drawZoneChips() {
    const s = this.d.save;
    const y = H - PANEL_H + 30;
    const w = (W - 60) / 3;
    ZONES.forEach((z, i) => {
      const x = 20 + i * (w + 10);
      const open = zoneOpen(s, i);
      const done = z.tasks.filter((t) => s.tasksDone.includes(t.id)).length;
      const g = this.add.graphics().setDepth(10001).setData('riad', true);
      g.fillStyle(open ? 0xffffff : 0xece3d3, 1).fillRoundedRect(x, y, w, 92, 18);
      g.lineStyle(3, open ? 0xd9a441 : 0xc9bba3, 1).strokeRoundedRect(x, y, w, 92, 18);
      g.fillStyle(0xe8dcc6, 1).fillRoundedRect(x + 14, y + 62, w - 28, 14, 7);
      if (done) g.fillStyle(done === z.tasks.length ? 0x22b35e : 0xef7d1a, 1).fillRoundedRect(x + 14, y + 62, ((w - 28) * done) / z.tasks.length, 14, 7);
      this.add.text(x + w / 2, y + 22, z.short, { fontFamily: FONT, fontSize: '22px', color: open ? INK : '#9a8a72', fontStyle: 'bold' }).setOrigin(0.5).setDepth(10001).setData('riad', true);
      this.add.text(x + w / 2, y + 46, open ? `${done}/${z.tasks.length}` : 'Fermé', { fontFamily: FONT, fontSize: '17px', color: open ? '#b5532e' : '#9a8a72', fontStyle: 'bold' }).setOrigin(0.5).setDepth(10001).setData('riad', true);
      if (!open) this.add.image(x + 24, y + 22, 'icon-lock').setDisplaySize(24, 24).setDepth(10001).setData('riad', true);
      if (done === z.tasks.length) this.add.image(x + w - 18, y + 8, 'icon-check').setDisplaySize(30, 30).setDepth(10002).setData('riad', true);
    });
  }

  // ---------- Idriss ----------

  private tapFloor(x: number, y: number) {
    if (y < 110 || y > H - PANEL_H) return;
    const u = (x - this.ox) / (TW / 2);
    const v = (y - this.oy) / (TH / 2);
    const c = (u + v) / 2;
    const r = (v - u) / 2;
    if (c < 0 || r < 0 || c > N || r > N) return;
    this.walkTo(Phaser.Math.Clamp(c, 0.6, N - 0.4), Phaser.Math.Clamp(r, 0.6, N - 0.4));
  }

  private walkTo(c: number, r: number, then?: () => void) {
    const to = this.iso(c, r);
    const me = this.idriss;
    this.tweens.killTweensOf(me);
    me.setTexture('walker').setScale(0.62);
    const dist = Phaser.Math.Distance.Between(me.x, me.y, to.x, to.y);
    me.setFlipX(to.x < me.x);
    this.walking = true;
    // A little hop at each step.
    const hop = this.tweens.add({ targets: me, scaleY: 0.58, scaleX: 0.65, duration: 140, yoyo: true, repeat: -1 });
    this.tweens.add({
      targets: me, x: to.x, y: to.y, duration: Math.max(200, dist * 5), ease: 'Linear',
      onUpdate: () => me.setDepth(me.y),
      onComplete: () => {
        hop.remove();
        me.setScale(0.62);
        this.walking = false;
        this.tweens.add({ targets: me, scaleY: 0.64, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        then?.();
      },
    });
  }

  private cheer() {
    const me = this.idriss;
    this.tweens.killTweensOf(me);
    me.setTexture('walker-happy').setScale(0.62);
    const y = me.y;
    this.tweens.chain({
      targets: me,
      tweens: [
        { y: y - 30, duration: 180, ease: 'Quad.Out' },
        { y, duration: 180, ease: 'Bounce.Out' },
        { y: y - 18, duration: 140, ease: 'Quad.Out', yoyo: true },
      ],
      onComplete: () => {
        me.setTexture('walker');
        this.tweens.add({ targets: me, scaleY: 0.64, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      },
    });
  }

  // ---------- Renovating ----------

  private renovate(t: Task) {
    const s = this.d.save;
    const zi = ZONES.findIndex((z) => z.tasks.includes(t));
    const z = ZONES[zi];
    if (s.stars < t.cost || s.tasksDone.includes(t.id)) return;
    s.stars -= t.cost;
    s.tasksDone.push(t.id);
    if (t.unlocks) s.inbox.push(t.unlocks);
    let msg = `${t.name} : c'est fait !`;
    if (t.unlocks) msg += ` Nouveau sur ton plateau : ${CHAINS[t.unlocks].generator}.`;
    if (zoneDone(s, z)) {
      s.coins += ZONE_BONUS;
      msg = `${z.name} est rénové ! Bonus : +${ZONE_BONUS} pièces.` + (zi < ZONES.length - 1 ? ` ${ZONES[zi + 1].name} est ouvert.` : '');
    }
    save(s);
    this.d.sfx.deliver();
    this.render();
    this.say(msg);
    this.cheer();

    // The new pieces pop in with a burst of light.
    const a = this.anchorOf(t);
    this.children.list
      .filter((o): o is Phaser.GameObjects.Image => o instanceof Phaser.GameObjects.Image && o.getData('riad') && o.texture.key.startsWith('iso-') && SPOTS[t.id].some((sp) => o.texture.key === `iso-${sp.key}`))
      .forEach((img) => {
        const sc = img.scale;
        img.setScale(0);
        this.tweens.add({ targets: img, scale: sc, duration: 550, ease: 'Back.Out' });
      });
    const rays = this.add.image(a.x, a.y - 30, 'rays').setDisplaySize(120, 120).setDepth(6000);
    this.tweens.add({ targets: rays, displayWidth: 520, displayHeight: 520, alpha: 0, angle: 60, duration: 900, ease: 'Cubic.Out', onComplete: () => rays.destroy() });
    this.add.particles(0, 0, 'sparkle', {
      x: { min: a.x - 90, max: a.x + 90 }, y: { min: a.y - 120, max: a.y + 10 },
      speed: { min: 40, max: 160 }, scale: { start: 1, end: 0 }, lifespan: 900, quantity: 30, emitting: false,
    }).setDepth(6001).explode(30);
  }

  private say(msg: string) {
    this.note.setText(msg);
  }
}
