import Phaser from 'phaser';
import { CHAINS, CHARACTERS, COLS, ENERGY_MAX, MAX_LEVEL, ROWS } from './data';
import { Sounds } from './sound';
import { load, makeOrder, msToNextEnergy, save, tickEnergy, type Cell, type Order, type Save } from './state';

const W = 720;
const CELL = 96;
const BOARD_X = (W - COLS * CELL) / 2;
const BOARD_Y = 352;
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
const INK = '#1b3a5c';

const texKey = (c: NonNullable<Cell>) => (c.kind === 'gen' ? `gen-${c.chain}` : `${c.chain}-${c.level}`);
const cellName = (c: NonNullable<Cell>) => (c.kind === 'gen' ? CHAINS[c.chain].generator : CHAINS[c.chain].items[c.level - 1]);

export class GameScene extends Phaser.Scene {
  private s!: Save;
  private sfx = new Sounds();
  private sparkles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sprites: (Phaser.GameObjects.Image | null)[] = [];
  private selection!: Phaser.GameObjects.Graphics;
  private selected = -1;
  private energyText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private starText!: Phaser.GameObjects.Text;
  private info!: Phaser.GameObjects.Text;
  private soundIcon!: Phaser.GameObjects.Image;
  private orderLayer!: Phaser.GameObjects.Container;
  private dragging = false;
  private glows: Phaser.GameObjects.Image[] = [];
  private selRays!: Phaser.GameObjects.Image;
  private busts: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('game');
  }

  create() {
    this.s = load();
    tickEnergy(this.s);
    this.sfx.enabled = this.s.sound;
    this.input.dragDistanceThreshold = 8;
    this.input.once('pointerdown', () => this.sfx.start());

    this.add.image(0, 0, 'courtyard').setOrigin(0);
    this.drawTopBar();
    this.drawCharacters();
    this.orderLayer = this.add.container(0, 0);
    this.drawBoardFrame();
    this.selection = this.add.graphics().setDepth(5);
    // Golden sunburst that turns slowly behind the selected object.
    this.selRays = this.add.image(0, 0, 'rays').setDisplaySize(CELL * 1.9, CELL * 1.9).setDepth(1.5).setVisible(false);
    this.tweens.add({ targets: this.selRays, angle: 360, duration: 9000, repeat: -1 });
    this.sparkles = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 120, max: 320 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 },
      lifespan: 650, gravityY: 300, rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(15);

    this.add.rectangle(0, 1226, W, 54, 0xffffff, 0.85).setOrigin(0);
    this.add.rectangle(0, 1226, W, 3, 0x3cb4e0).setOrigin(0);
    this.info = this.add.text(W / 2, 1253, '', { fontFamily: FONT, fontSize: '20px', color: INK, align: 'center', wordWrap: { width: W - 32 } }).setOrigin(0.5);
    this.say('Bienvenue à Dar Idriss ! Touche le jardin de menthe pour faire pousser une feuille.');

    this.renderBoard();
    this.renderOrders();
    this.refreshHud();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.refreshHud() });
  }

  // ---------- Drawing ----------

  private drawTopBar() {
    const pill = (x: number, w: number) => this.add.image(x, 46, 'pill').setOrigin(0, 0.5).setDisplaySize(w, 60);
    pill(16, 230);
    pill(262, 180);
    pill(458, 150);
    this.add.image(46, 46, 'icon-energy').setDisplaySize(44, 44);
    this.energyText = this.add.text(74, 30, '', { fontFamily: FONT, fontSize: '28px', color: INK, fontStyle: 'bold' });
    this.timerText = this.add.text(152, 36, '', { fontFamily: FONT, fontSize: '18px', color: '#2a7fb8', fontStyle: 'bold' });
    this.add.image(292, 46, 'icon-coin').setDisplaySize(42, 42);
    this.coinText = this.add.text(322, 30, '', { fontFamily: FONT, fontSize: '28px', color: INK, fontStyle: 'bold' });
    this.add.image(488, 46, 'icon-star').setDisplaySize(42, 42);
    this.starText = this.add.text(518, 30, '', { fontFamily: FONT, fontSize: '28px', color: INK, fontStyle: 'bold' });
    this.add.circle(668, 49, 30, 0x2a7fb8, 0.4);
    this.add.circle(668, 46, 30, 0x3cb4e0).setStrokeStyle(3, 0xffffff);
    this.soundIcon = this.add.image(668, 46, this.s.sound ? 'icon-soundOn' : 'icon-soundOff').setDisplaySize(36, 36).setInteractive({ useHandCursor: true });
    this.soundIcon.on('pointerup', () => {
      this.s.sound = !this.s.sound;
      this.sfx.start();
      this.sfx.setEnabled(this.s.sound);
      this.sfx.tap();
      this.soundIcon.setTexture(this.s.sound ? 'icon-soundOn' : 'icon-soundOff');
      save(this.s);
    });
  }

  private drawBoardFrame() {
    // Soft white panel with a turquoise rim, then raised tiles.
    const g = this.add.graphics();
    const fw = COLS * CELL + 24;
    const fh = ROWS * CELL + 24;
    g.fillStyle(0x2a7fb8, 0.3).fillRoundedRect(BOARD_X - 12, BOARD_Y - 6, fw, fh, 26);
    g.fillStyle(0x3cb4e0, 1).fillRoundedRect(BOARD_X - 12, BOARD_Y - 12, fw, fh, 26);
    g.fillStyle(0xffffff, 0.75).fillRoundedRect(BOARD_X - 7, BOARD_Y - 7, fw - 10, fh - 10, 22);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.add.image(BOARD_X + c * CELL, BOARD_Y + r * CELL, (r + c) % 2 ? 'tile' : 'tileAlt').setOrigin(0);
      }
    }
  }

  private cellCenter(i: number) {
    return { x: BOARD_X + (i % COLS) * CELL + CELL / 2, y: BOARD_Y + Math.floor(i / COLS) * CELL + CELL / 2 };
  }

  private cellAt(x: number, y: number) {
    const c = Math.floor((x - BOARD_X) / CELL);
    const r = Math.floor((y - BOARD_Y) / CELL);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return -1;
    return r * COLS + c;
  }

  private renderBoard() {
    this.sprites.forEach((sp) => sp?.destroy());
    this.sprites = this.s.board.map((cell, i) => (cell ? this.makeSprite(cell, i) : null));
    this.drawSelection();
    this.drawGlows();
  }

  private makeSprite(cell: NonNullable<Cell>, i: number) {
    const { x, y } = this.cellCenter(i);
    const sp = this.add.image(x, y - 2, texKey(cell)).setDisplaySize(CELL + 2, CELL + 2).setDepth(2);
    if (cell.kind === 'gen') {
      // Generators breathe gently so the player sees they can be tapped.
      this.tweens.add({ targets: sp, scaleY: sp.scaleY * 1.05, scaleX: sp.scaleX * 0.97, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: i * 37 });
    }
    sp.setInteractive({ useHandCursor: true, draggable: true });
    sp.setData('cell', i);
    sp.on('pointerup', () => {
      if (!this.dragging) this.tap(sp.getData('cell'));
    });
    sp.on('dragstart', () => {
      this.dragging = true;
      this.tweens.killTweensOf(sp);
      sp.setDepth(10).setDisplaySize(CELL + 16, CELL + 16);
      this.sfx.tap();
    });
    sp.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => sp.setPosition(dx, dy));
    sp.on('dragend', (p: Phaser.Input.Pointer) => {
      this.time.delayedCall(0, () => (this.dragging = false));
      this.drop(sp.getData('cell'), this.cellAt(p.worldX, p.worldY));
    });
    return sp;
  }

  // Green halo only under objects of orders that can be delivered right now.
  private drawGlows() {
    this.glows.forEach((g) => g.destroy());
    this.glows = [];
    const ready = new Set<number>();
    for (const o of this.s.orders) this.findItems(o)?.forEach((i) => ready.add(i));
    ready.forEach((i) => {
      const { x, y } = this.cellCenter(i);
      const g = this.add.image(x, y - 2, 'glowGreen').setDisplaySize(CELL - 2, CELL - 2).setDepth(1);
      this.tweens.add({ targets: g, alpha: 0.5, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.glows.push(g);
    });
  }

  private drawSelection() {
    this.selection.clear();
    this.selRays.setVisible(false);
    if (this.selected < 0 || !this.s.board[this.selected]) return;
    const { x, y } = this.cellCenter(this.selected);
    this.selRays.setPosition(x, y).setVisible(true);
    this.selection.lineStyle(4, 0xffc21a, 1).strokeRoundedRect(x - CELL / 2 + 4, y - CELL / 2 + 2, CELL - 8, CELL - 10, 16);
  }

  private pop(i: number) {
    const sp = this.sprites[i];
    if (!sp) return;
    const size = CELL + 2;
    sp.setDisplaySize(size * 0.4, size * 0.4);
    const burst = this.add.image(sp.x, sp.y, 'rays').setDepth(1.6).setDisplaySize(CELL, CELL);
    this.tweens.add({ targets: burst, displayWidth: CELL * 3, displayHeight: CELL * 3, angle: 90, alpha: 0, duration: 700, ease: 'Cubic.Out', onComplete: () => burst.destroy() });
    this.tweens.add({ targets: sp, displayWidth: size, displayHeight: size, duration: 320, ease: 'Back.Out' });
    const glow = this.add.image(sp.x, sp.y, 'glow').setDepth(1).setScale(0.3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, scale: 1.4, alpha: 0, duration: 500, ease: 'Cubic.Out', onComplete: () => glow.destroy() });
    this.sparkles.explode(14, sp.x, sp.y);
  }

  private float(x: number, y: number, text: string, color = '#fff') {
    const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: '30px', color, fontStyle: 'bold', stroke: INK, strokeThickness: 6 }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1100, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private say(text: string) {
    this.info.setText(text);
  }

  // ---------- Board actions ----------

  private tap(i: number) {
    const cell = this.s.board[i];
    if (!cell) return;
    this.selected = i;
    this.drawSelection();
    if (cell.kind === 'gen') return this.generate(i);
    this.sfx.tap();
    const chain = CHAINS[cell.chain];
    this.say(cell.level < MAX_LEVEL
      ? `${cellName(cell)} (niveau ${cell.level}/${MAX_LEVEL}). Fusionne-en deux pour obtenir : ${chain.items[cell.level]}.`
      : `${cellName(cell)} : niveau maximum ! Les invités l'adorent.`);
  }

  private generate(i: number) {
    tickEnergy(this.s);
    if (this.s.energy <= 0) {
      this.sfx.deny();
      return this.say("Plus d'énergie. Elle revient toute seule : 1 point toutes les 2 minutes.");
    }
    const target = this.nearestEmpty(i);
    if (target < 0) {
      this.sfx.deny();
      return this.say('Le plateau est plein. Fusionne ou livre des objets pour faire de la place.');
    }
    const gen = this.s.board[i]!;
    if (this.s.energy === ENERGY_MAX) this.s.energyAt = Date.now();
    this.s.energy--;
    this.s.board[target] = { kind: 'item', chain: gen.chain, level: 1 };
    this.sfx.tap();
    const from = this.cellCenter(i);
    const to = this.cellCenter(target);
    const sp = this.makeSprite(this.s.board[target]!, target).setPosition(from.x, from.y).setScale(0.2);
    this.sprites[target] = sp;
    // The new object jumps out of the generator in a small arc.
    const peak = Math.min(from.y, to.y) - 60;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 360, ease: 'Sine.Out',
      onUpdate: (tw) => {
        const k = tw.getValue() ?? 1;
        sp.x = from.x + (to.x - from.x) * k;
        sp.y = (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * peak + k * k * (to.y - 2);
        sp.setDisplaySize((CELL + 2) * (0.3 + 0.7 * k), (CELL + 2) * (0.3 + 0.7 * k));
      },
    });
    this.say(`${CHAINS[gen.chain].generator} : +1 ${CHAINS[gen.chain].items[0].toLowerCase()}. Glisse deux objets identiques l'un sur l'autre pour les fusionner.`);
    this.afterChange(false);
  }

  private nearestEmpty(i: number) {
    const c0 = i % COLS;
    const r0 = Math.floor(i / COLS);
    let best = -1;
    let bestD = Infinity;
    this.s.board.forEach((cell, j) => {
      if (cell) return;
      const d = Math.hypot((j % COLS) - c0, Math.floor(j / COLS) - r0);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    });
    return best;
  }

  private drop(from: number, to: number) {
    const b = this.s.board;
    const a = b[from];
    if (!a || to < 0 || to === from) return this.renderBoard();
    const t = b[to];
    if (!t) {
      b[to] = a;
      b[from] = null;
      this.selected = to;
      this.sfx.move();
    } else if (a.kind === 'item' && t.kind === 'item' && a.chain === t.chain && a.level === t.level && a.level < MAX_LEVEL) {
      const level = a.level + 1;
      b[to] = { kind: 'item', chain: a.chain, level };
      b[from] = null;
      this.selected = to;
      this.sfx.merge(level);
      this.renderBoard();
      this.pop(to);
      const { x, y } = this.cellCenter(to);
      this.float(x, y - 30, CHAINS[a.chain].items[level - 1], '#fff8e1');
      this.say(level < MAX_LEVEL
        ? `Bravo : ${CHAINS[a.chain].items[level - 1]} ! Prochaine étape : ${CHAINS[a.chain].items[level]}.`
        : `Magnifique : ${CHAINS[a.chain].items[level - 1]}, le plus bel objet de la famille !`);
      return this.afterChange(false);
    } else {
      b[to] = a;
      b[from] = t;
      this.selected = to;
      this.sfx.move();
    }
    this.afterChange(true);
  }

  private afterChange(rerender: boolean) {
    if (rerender) this.renderBoard();
    else {
      this.drawSelection();
      this.drawGlows();
    }
    save(this.s);
    this.renderOrders();
    this.refreshHud();
  }

  // ---------- Orders ----------

  // Board cells that fulfil an order, or null if something is missing.
  private findItems(o: Order): number[] | null {
    const used = new Set<number>();
    for (const w of o.wants) {
      const i = this.s.board.findIndex((c, j) => !used.has(j) && c?.kind === 'item' && c.chain === w.chain && c.level === w.level);
      if (i < 0) return null;
      used.add(i);
    }
    return [...used];
  }

  // Characters stand in arches above a counter; each keeps breathing.
  private drawCharacters() {
    const colW = W / 3;
    for (let k = 0; k < 3; k++) {
      const cx = colW * k + colW / 2;
      this.add.image(cx, 100, 'arch').setOrigin(0.5, 0).setDisplaySize(220, 250);
      const bust = this.add.image(cx, 284, `bust-${this.s.orders[k].who}`).setOrigin(0.5, 1).setDisplaySize(176, 176);
      bust.setData('base', bust.scaleY);
      this.busts.push(bust);
      this.breathe(bust, k);
    }
  }

  private breathe(bust: Phaser.GameObjects.Image, k: number) {
    const base = bust.getData('base') as number;
    bust.setScale(base);
    this.tweens.add({ targets: bust, scaleY: base * 1.035, scaleX: base * 0.99, duration: 1400 + k * 170, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private renderOrders() {
    this.orderLayer.removeAll(true);
    const colW = W / 3;
    this.s.orders.forEach((o, k) => {
      const cx = colW * k + colW / 2;
      const ready = this.findItems(o) !== null;
      const who = CHARACTERS.find((c) => c.id === o.who)!;
      this.orderLayer.add(this.add.image(cx, 256, 'tray').setOrigin(0.5, 0).setDisplaySize(220, 96));
      this.orderLayer.add(this.add.text(cx - 96, 266, who.name, { fontFamily: FONT, fontSize: '17px', color: '#2a7fb8', fontStyle: 'bold' }));
      this.orderLayer.add(this.add.image(cx + 58, 276, 'icon-coin').setDisplaySize(22, 22));
      this.orderLayer.add(this.add.text(cx + 72, 266, `+${o.coins}`, { fontFamily: FONT, fontSize: '17px', color: INK, fontStyle: 'bold' }));

      const used = new Set<number>();
      o.wants.forEach((w, n) => {
        const ix = cx + (o.wants.length === 1 ? 0 : n === 0 ? -40 : 40);
        const iy = 312;
        this.orderLayer.add(this.add.image(ix, iy, `${w.chain}-${w.level}`).setDisplaySize(62, 62));
        const have = this.s.board.findIndex((c, j) => !used.has(j) && c?.kind === 'item' && c.chain === w.chain && c.level === w.level);
        if (have >= 0) {
          used.add(have);
          this.orderLayer.add(this.add.image(ix + 24, iy + 18, 'icon-check').setDisplaySize(26, 26));
        }
      });

      if (ready) {
        const btn = this.add.container(cx + 50, 236);
        btn.add(this.add.image(0, 0, 'btnGreen').setDisplaySize(112, 42));
        btn.add(this.add.text(0, -3, 'Livrer', { fontFamily: FONT, fontSize: '20px', color: '#fff', fontStyle: 'bold', stroke: '#146b38', strokeThickness: 4 }).setOrigin(0.5));
        this.tweens.add({ targets: btn, scale: 1.08, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.orderLayer.add(btn);
      }
      const hit = this.add.zone(colW * k, 100, colW, 250).setOrigin(0).setInteractive({ useHandCursor: ready });
      hit.on('pointerup', () => (ready ? this.deliver(k) : this.say(`${who.name} attend : ${o.wants.map((w) => CHAINS[w.chain].items[w.level - 1]).join(' et ')}.`)));
      this.orderLayer.add(hit);
    });
  }

  private deliver(k: number) {
    const o = this.s.orders[k];
    const cells = this.findItems(o);
    if (!cells) return;
    const cx = (W / 3) * k + W / 6;
    cells.forEach((i) => {
      const sp = this.sprites[i];
      this.s.board[i] = null;
      this.sprites[i] = null;
      if (sp) this.tweens.add({ targets: sp, y: 300, x: cx, alpha: 0, duration: 380, ease: 'Quad.In', onComplete: () => sp.destroy() });
    });
    this.s.coins += o.coins;
    this.s.stars += 1;
    this.sfx.deliver();
    this.sparkles.explode(28, cx, 200);
    this.float(cx, 170, `+${o.coins}  +1 étoile`, '#ffd54a');
    const who = CHARACTERS.find((c) => c.id === o.who)!;
    this.say(`${who.name} te remercie ! Les étoiles serviront à rénover le riad.`);
    this.s.orders[k] = makeOrder(this.s);
    this.selected = -1;
    save(this.s);
    this.refreshHud();
    this.cheer(k, this.s.orders[k].who);
    this.time.delayedCall(400, () => this.afterChange(true));
  }

  // The character jumps for joy, then the next one steps in.
  private cheer(k: number, next: string) {
    const bust = this.busts[k];
    const base = bust.getData('base') as number;
    const who = bust.texture.key.replace('bust-', '');
    this.tweens.killTweensOf(bust);
    bust.setTexture(`happy-${who}`).setScale(base);
    this.tweens.chain({
      targets: bust,
      tweens: [
        { scaleY: base * 0.9, scaleX: base * 1.08, duration: 110, ease: 'Quad.Out' },
        { y: 254, scaleY: base * 1.06, scaleX: base * 0.96, duration: 200, ease: 'Quad.Out' },
        { y: 284, scaleY: base, scaleX: base, duration: 200, ease: 'Bounce.Out' },
        { y: 264, duration: 160, ease: 'Quad.Out', yoyo: true },
        { alpha: 0, y: 308, duration: 260, delay: 350, ease: 'Quad.In' },
      ],
      onComplete: () => {
        bust.setTexture(`bust-${next}`).setAlpha(0).setY(284);
        this.tweens.add({ targets: bust, alpha: 1, duration: 300, onComplete: () => this.breathe(bust, k) });
      },
    });
  }

  // ---------- HUD ----------

  private refreshHud() {
    tickEnergy(this.s);
    this.energyText.setText(`${this.s.energy}`);
    if (this.s.energy < ENERGY_MAX) {
      const ms = msToNextEnergy(this.s);
      const m = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      this.timerText.setText(`+1 dans ${m}:${sec}`);
    } else this.timerText.setText('plein');
    this.coinText.setText(`${this.s.coins}`);
    this.starText.setText(`${this.s.stars}`);
  }
}
