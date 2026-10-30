import Phaser from 'phaser';
import { ALL_TASKS, CHAINS, CHARACTERS, COLS, ENERGY_MAX, IMAGE_CHAINS, maxLevel, ROWS } from './data';
import { Sounds } from './sound';
import { load, makeOrder, msToNextEnergy, save, tickEnergy, today, type Cell, type Order, type Save } from './state';
import { H, W } from './ui';

// Taller phones get full-size cells, a little air above the board and a big info panel.
const EXTRA = H - 1280;
const CELL = EXTRA >= 120 ? 96 : 92;
const BOARD_X = (W - COLS * CELL) / 2;
const BOARD_Y = 352 + Math.round(Math.max(0, Math.min(60, (EXTRA - 200) * 0.3)));
const PANEL_Y = BOARD_Y + ROWS * CELL + 22;
const PANEL_H = H - PANEL_Y;
const TALL = PANEL_H >= 190;
// One bright colour per family, used in the info panel.
const CHAIN_COLOR: Record<string, number> = {
  menthe: 0x22b35e, pain: 0xf39c12, couture: 0xe84393, souk: 0x8e44ad,
  poterie: 0x2471d6, orangers: 0xff7f11, cuivre: 0xc0392b, hammam: 0x14b8a6,
  arbres: 0x6a9a1f, fleurs: 0xe8578f,
};
const HINT_DELAY_MS = 6000;
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
const INK = '#1a2f6b';

// Illustrations fill their whole square, so they are drawn a little smaller.
const spriteSize = (c: NonNullable<Cell>) => (IMAGE_CHAINS.includes(c.chain) ? CELL - 8 : CELL + 2);
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
  private dirhamText!: Phaser.GameObjects.Text;
  private riadBadge!: Phaser.GameObjects.Arc;
  private shopBadge!: Phaser.GameObjects.Arc;
  private info!: Phaser.GameObjects.Text;
  private infoHead!: Phaser.GameObjects.Container;
  private soundIcon!: Phaser.GameObjects.Image;
  private orderLayer!: Phaser.GameObjects.Container;
  private dragging = false;
  private glows: Phaser.GameObjects.Image[] = [];
  private genDecor: Phaser.GameObjects.GameObject[] = [];
  private selFrame!: Phaser.GameObjects.Container;
  private infoBtn!: Phaser.GameObjects.Container;
  private titleW = 0;
  private lastAction = Date.now();
  private hint: Phaser.GameObjects.Image[] = [];
  private busts: Phaser.GameObjects.Image[] = [];
  private arches: Phaser.GameObjects.Image[] = [];
  private halos: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('game');
  }

  create() {
    this.s = load();
    tickEnergy(this.s);
    this.sfx.enabled = this.s.sound;
    this.input.dragDistanceThreshold = 8;
    this.input.once('pointerdown', () => this.sfx.start());
    this.input.on('pointerdown', () => {
      this.lastAction = Date.now();
      this.stopHint();
    });

    this.add.image(0, 0, 'courtyard').setOrigin(0).setDisplaySize(W, H);
    this.drawTopBar();
    this.drawCharacters();
    this.orderLayer = this.add.container(0, 0);
    this.drawBoardFrame();
    this.selection = this.add.graphics().setDepth(5);
    // Photo-frame corners around the selected object, gently pulsing.
    const corners = this.add.graphics();
    const h = CELL / 2 - 2;
    const len = 22;
    for (const [color, width] of [[0x1b3a5c, 11], [0xffd21f, 6]] as const) {
      corners.lineStyle(width, color, 1);
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        corners.beginPath();
        corners.moveTo(sx * h, sy * (h - len));
        corners.lineTo(sx * h, sy * h);
        corners.lineTo(sx * (h - len), sy * h);
        corners.strokePath();
      }
    }
    this.selFrame = this.add.container(0, 0, [corners]).setDepth(6).setVisible(false);
    this.tweens.add({ targets: this.selFrame, scale: 1.08, duration: 550, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // "i" button on the selected object: shows its whole merge chain.
    this.infoBtn = this.add.container(0, 0, [
      this.add.circle(0, 2, 17, 0x1d4f9c),
      this.add.circle(0, 0, 17, 0x2471d6).setStrokeStyle(3, 0xffffff),
      this.add.text(0, 0, 'i', { fontFamily: 'Georgia, serif', fontSize: '24px', color: '#fff', fontStyle: 'bold italic' }).setOrigin(0.5),
    ]).setDepth(8).setVisible(false).setSize(44, 44).setInteractive({ useHandCursor: true });
    this.infoBtn.on('pointerup', () => this.openChain());
    this.sparkles = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 120, max: 320 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 },
      lifespan: 650, gravityY: 300, rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(15);

    this.drawBottomPanel();
    this.say('Bienvenue à Dar Idriss ! Touche le jardin de menthe pour faire pousser une feuille.');

    this.placeInbox();
    this.renderBoard();
    this.renderOrders();
    this.refreshHud();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      this.refreshHud();
      this.maybeHint();
    } });
  }

  // ---------- Drawing ----------

  private drawTopBar() {
    const pill = (x: number, w: number) => this.add.image(x, 46, 'pill').setOrigin(0, 0.5).setDisplaySize(w, 60);
    pill(12, 176);
    pill(196, 150);
    pill(354, 130);
    pill(492, 150);
    const hud = { fontFamily: FONT, fontSize: '26px', color: INK, fontStyle: 'bold' };
    this.add.image(40, 46, 'icon-energy').setDisplaySize(40, 40);
    this.energyText = this.add.text(64, 30, '', hud);
    this.timerText = this.add.text(118, 37, '', { fontFamily: FONT, fontSize: '15px', color: '#b5532e', fontStyle: 'bold' });
    this.add.image(224, 46, 'icon-coin').setDisplaySize(38, 38);
    this.coinText = this.add.text(250, 30, '', hud);
    this.add.image(382, 46, 'icon-star').setDisplaySize(38, 38);
    this.starText = this.add.text(408, 30, '', hud);
    this.add.image(520, 46, 'icon-dirham').setDisplaySize(36, 36);
    this.dirhamText = this.add.text(546, 30, '', hud);
    this.add.circle(678, 49, 26, 0x5a2410, 0.4);
    this.add.circle(678, 46, 26, 0x1d3f94).setStrokeStyle(3, 0xffffff);
    this.soundIcon = this.add.image(678, 46, this.s.sound ? 'icon-soundOn' : 'icon-soundOff').setDisplaySize(30, 30).setInteractive({ useHandCursor: true });
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
    g.fillStyle(0x5a2410, 0.4).fillRoundedRect(BOARD_X - 12, BOARD_Y - 4, fw, fh, 26);
    g.fillStyle(0x0f8a5f, 1).fillRoundedRect(BOARD_X - 12, BOARD_Y - 12, fw, fh, 26);
    g.lineStyle(3, 0xe0b048, 1).strokeRoundedRect(BOARD_X - 8, BOARD_Y - 8, fw - 8, fh - 8, 23);
    g.fillStyle(0xfdf6e7, 0.9).fillRoundedRect(BOARD_X - 5, BOARD_Y - 5, fw - 14, fh - 14, 20);
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
    this.hint = [];
    this.sprites.forEach((sp) => sp?.destroy());
    this.genDecor.forEach((d) => d.destroy());
    this.genDecor = [];
    this.sprites = this.s.board.map((cell, i) => (cell ? this.makeSprite(cell, i) : null));
    this.drawSelection();
    this.drawGlows();
  }

  private makeSprite(cell: NonNullable<Cell>, i: number) {
    const { x, y } = this.cellCenter(i);
    const sp = this.add.image(x, y - 2, texKey(cell)).setDisplaySize(spriteSize(cell), spriteSize(cell)).setDepth(2);
    if (cell.kind === 'gen') {
      // Generators carry a pink energy badge in the corner: tapping them costs energy.
      const badge = this.add.image(x + CELL / 2 - 16, y + CELL / 2 - 16, 'genBadge').setDisplaySize(34, 34).setDepth(3);
      // Small white stars twinkle around it, each at its own pace.
      const stars = [[-30, -32], [32, -10], [-34, 18]].map(([dx, dy], n) => {
        const st = this.add.image(x + dx, y + dy, 'starWhite').setDepth(3).setScale(0);
        this.tweens.add({ targets: st, scale: 0.7 + 0.2 * n, angle: 90, duration: 450, yoyo: true, repeat: -1, repeatDelay: 900 + n * 350, delay: (i * 173 + n * 600) % 1800 });
        return st;
      });
      this.genDecor.push(badge, ...stars);
      sp.setData('decor', [badge, ...stars]);
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
      (sp.getData('decor') as Phaser.GameObjects.Image[] | undefined)?.forEach((d) => d.setVisible(false));
      sp.setDepth(10).setDisplaySize(spriteSize(cell) + 14, spriteSize(cell) + 14);
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
      // The cell itself turns light green and blinks.
      const g = this.add.image(x, y, 'tileGreen').setDisplaySize(CELL, CELL).setDepth(1);
      this.tweens.add({ targets: g, alpha: 0.15, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.glows.push(g);
    });
  }

  private drawSelection() {
    this.drawInfoHead();
    this.selection.clear();
    this.selFrame.setVisible(false);
    this.infoBtn.setVisible(false);
    if (this.selected < 0 || !this.s.board[this.selected]) return;
    const { x, y } = this.cellCenter(this.selected);
    this.selFrame.setPosition(x, y - 1).setVisible(true);
    // The "i" sits in the bottom panel, next to the description.
    if (TALL) this.infoBtn.setPosition(W / 2 + this.titleW / 2 + 28, this.infoHead.y + 20);
    else this.infoBtn.setPosition(W - 136, PANEL_Y + PANEL_H / 2 + 2);
    this.infoBtn.setVisible(true);
  }

  private pop(i: number) {
    const sp = this.sprites[i];
    if (!sp) return;
    const size = spriteSize(this.s.board[i]!);
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

  // Bottom panel: Riad and shop on the sides, info about the selected object in the middle.
  private drawBottomPanel() {
    const g = this.add.graphics();
    g.fillStyle(0x5a2410, 0.4).fillRoundedRect(0, PANEL_Y - 4, W, PANEL_H + 40, 30);
    g.fillStyle(0xfdf6e7, 1).fillRoundedRect(0, PANEL_Y, W, PANEL_H + 40, 30);
    // A rainbow rim along the top edge.
    const rim = [0xd22b26, 0xef7d1a, 0xf7c531, 0x0f8a5f, 0x1d3f94, 0x7fb3e3];
    rim.forEach((c, k) => g.fillStyle(c, 1).fillRect((W / rim.length) * k, PANEL_Y, W / rim.length + 1, 7));
    const midX = W / 2;
    const midW = W - 240;
    const btnY = TALL ? PANEL_Y + PANEL_H / 2 : PANEL_Y + PANEL_H / 2 + 2;
    this.riadBadge = this.roundButton(62, btnY, 'icon-riad', 'Riad', 0x0f8a5f, () => this.openRiad());
    this.shopBadge = this.roundButton(W - 62, btnY, 'icon-shop', 'Boutique', 0xd22b26, () => this.openShop());
    // Centre the info block when the panel has room to spare.
    const pad = Math.max(0, (PANEL_H - 260) / 2);
    this.infoHead = this.add.container(midX, PANEL_Y + 18 + pad);
    const textY = TALL ? PANEL_Y + 186 + pad : PANEL_Y + PANEL_H / 2 + 3;
    this.info = this.add.text(TALL ? midX : midX - 25, textY, '', {
      fontFamily: FONT, fontSize: TALL ? '21px' : '18px', color: INK, align: 'center', wordWrap: { width: TALL ? midW - 10 : midW - 60 }, lineSpacing: 2,
    }).setOrigin(0.5, TALL ? 0 : 0.5);
  }

  // Name, level and the whole family of the selected object (tall screens only).
  private drawInfoHead() {
    if (!TALL) return;
    const head = this.infoHead;
    head.removeAll(true);
    const cell = this.selected >= 0 ? this.s.board[this.selected] : null;
    if (!cell) {
      head.add(this.add.text(0, 6, 'Dar Idriss', { fontFamily: FONT, fontSize: '30px', color: '#c2410c', fontStyle: 'bold', stroke: '#ffe9b0', strokeThickness: 6 }).setOrigin(0.5, 0));
      head.add(this.add.text(0, 52, 'Touche un objet pour voir sa famille', { fontFamily: FONT, fontSize: '19px', color: '#0f8a5f', fontStyle: 'bold' }).setOrigin(0.5, 0));
      const icons = ['icon-energy', 'icon-coin', 'icon-star', 'icon-dirham'];
      icons.forEach((k, n) => head.add(this.add.image((n - 1.5) * 76, 120, k).setDisplaySize(52, 52)));
      return;
    }
    const color = CHAIN_COLOR[cell.chain] ?? 0x3cb4e0;
    const name = cellName(cell);
    const max = maxLevel(cell.chain);
    const tag = cell.kind === 'gen' ? 'Générateur' : `Niveau ${cell.level}/${max}`;
    const title = this.add.text(0, 4, name, { fontFamily: FONT, fontSize: '26px', color: hex(color), fontStyle: 'bold', stroke: '#fff', strokeThickness: 5 }).setOrigin(0.5, 0);
    const pillW = tag.length * 10 + 30;
    const pill = this.add.graphics();
    pill.fillStyle(color, 1).fillRoundedRect(-pillW / 2, 42, pillW, 30, 15);
    this.titleW = title.width;
    head.add([title, pill, this.add.text(0, 57, tag, { fontFamily: FONT, fontSize: '17px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5)]);
    // The family, from level 1 to the last, current level highlighted.
    const step = 76;
    for (let n = 0; n < max; n++) {
      const x = (n - (max - 1) / 2) * step;
      const current = cell.kind === 'item' && cell.level === n + 1;
      const done = cell.kind === 'item' && n + 1 < cell.level;
      const bg = this.add.graphics();
      bg.fillStyle(current ? color : done ? 0xe8f4ea : 0xf4e8d2, 1).fillRoundedRect(x - 33, 90, 66, 66, 16);
      if (current) bg.lineStyle(4, 0xffd21f, 1).strokeRoundedRect(x - 33, 90, 66, 66, 16);
      head.add(bg);
      head.add(this.add.image(x, 123, `${cell.chain}-${n + 1}`).setDisplaySize(58, 58));
      if (n < max - 1) head.add(this.add.text(x + step / 2, 123, '›', { fontFamily: FONT, fontSize: '24px', color: hex(color), fontStyle: 'bold' }).setOrigin(0.5));
    }
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
    this.say(cell.level < maxLevel(cell.chain)
      ? `${cellName(cell)} (niveau ${cell.level}/${maxLevel(cell.chain)}). Fusionne-en deux pour obtenir : ${chain.items[cell.level]}.`
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
        const sz = spriteSize(this.s.board[target]!) * (0.3 + 0.7 * k);
        sp.setDisplaySize(sz, sz);
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
    } else if (a.kind === 'item' && t.kind === 'item' && a.chain === t.chain && a.level === t.level && a.level < maxLevel(a.chain)) {
      const level = a.level + 1;
      b[to] = { kind: 'item', chain: a.chain, level };
      b[from] = null;
      this.selected = to;
      this.sfx.merge(level);
      this.renderBoard();
      this.pop(to);
      const { x, y } = this.cellCenter(to);
      this.float(x, y - 30, CHAINS[a.chain].items[level - 1], '#fff8e1');
      this.say(level < maxLevel(a.chain)
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
    if (this.placeInbox()) rerender = true;
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
      // Light behind the arch when this character's order can be delivered.
      const halo = this.add.container(cx, 200).setVisible(false);
      const rays = this.add.image(0, 0, 'rays').setDisplaySize(330, 330).setAlpha(0.9);
      const glow = this.add.image(0, 0, 'readyGlow').setDisplaySize(300, 300);
      halo.add([glow, rays]);
      this.tweens.add({ targets: rays, angle: 360, duration: 8000, repeat: -1 });
      this.tweens.add({ targets: glow, scale: glow.scale * 1.12, alpha: 0.7, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.halos.push(halo);
      this.arches.push(this.add.image(cx, 100, `arch-${this.s.orders[k].who}`).setOrigin(0.5, 0).setDisplaySize(220, 250));
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
      this.orderLayer.add(this.add.text(cx - 96, 266, who.name, { fontFamily: FONT, fontSize: '16px', color: '#b5532e', fontStyle: 'bold' }));
      // Rewards: coins and stars.
      const reward = { fontFamily: FONT, fontSize: '16px', color: INK, fontStyle: 'bold' };
      this.orderLayer.add(this.add.image(cx + 26, 276, 'icon-coin').setDisplaySize(20, 20));
      this.orderLayer.add(this.add.text(cx + 37, 267, `${o.coins}`, reward));
      this.orderLayer.add(this.add.image(cx + 74, 275, 'icon-star').setDisplaySize(22, 22));
      this.orderLayer.add(this.add.text(cx + 86, 267, `${o.stars ?? 1}`, reward));

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

      this.halos[k]?.setVisible(ready);
      this.arches[k]?.setTint(ready ? 0xfffbe0 : 0xffffff);
      if (ready) {
        const check = this.add.image(cx + 62, 214, 'bigCheck').setDisplaySize(84, 88);
        this.tweens.add({ targets: check, scale: check.scale * 1.12, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.orderLayer.add(check);
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
    const stars = o.stars ?? 1;
    this.s.stars += stars;
    this.sfx.deliver();
    this.sparkles.explode(28, cx, 200);
    this.float(cx, 170, `+${o.coins}  +${stars} étoile${stars > 1 ? 's' : ''}`, '#ffd54a');
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
        this.arches[k].setTexture(`arch-${next}`);
        this.tweens.add({ targets: bust, alpha: 1, duration: 300, onComplete: () => this.breathe(bust, k) });
      },
    });
  }

  // ---------- Riad, shop, new generators ----------

  // Round button in the bottom bar with a red dot for "something to do".
  private roundButton(x: number, y: number, icon: string, label: string, color: number, onClick: () => void) {
    const r = TALL ? 52 : 38;
    this.add.circle(x, y + 5, r, 0x5a2410, 0.4);
    const b = this.add.circle(x, y, r, color).setStrokeStyle(5, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.circle(x, y - 6, r * 0.62, 0xffffff, 0.9);
    this.add.image(x, y - 6, icon).setDisplaySize(r * 1.05, r * 1.05);
    this.add.text(x, y + r - 8, label, { fontFamily: FONT, fontSize: TALL ? '18px' : '15px', color: '#fff', fontStyle: 'bold', stroke: INK, strokeThickness: 5 }).setOrigin(0.5);
    b.on('pointerup', () => {
      this.sfx.tap();
      this.tweens.add({ targets: b, scale: 0.9, duration: 70, yoyo: true });
      onClick();
    });
    const dot = this.add.circle(x + r * 0.72, y - r * 0.72, 11, 0xe74c3c).setStrokeStyle(3, 0xffffff);
    this.tweens.add({ targets: dot, scale: 1.25, duration: 500, yoyo: true, repeat: -1 });
    return dot;
  }

  private openRiad() {
    this.input.enabled = false;
    this.scene.launch('riad', { save: this.s, sfx: this.sfx, onClose: () => this.closeOverlay() });
  }

  private openShop() {
    this.input.enabled = false;
    this.scene.launch('shop', { save: this.s, sfx: this.sfx, onClose: () => this.closeOverlay() });
  }

  private openChain() {
    const cell = this.s.board[this.selected];
    if (!cell) return;
    this.sfx.tap();
    this.input.enabled = false;
    this.scene.launch('chain', { chain: cell.chain, level: cell.kind === 'item' ? cell.level : 0, sfx: this.sfx, onClose: () => this.closeOverlay() });
  }

  private closeOverlay() {
    this.input.enabled = true;
    this.afterChange(true);
  }

  // Generators unlocked in the riad land on the board near its centre.
  private placeInbox(): boolean {
    let placed = false;
    while (this.s.inbox.length) {
      const spot = this.nearestEmpty(Math.floor((COLS * ROWS) / 2));
      if (spot < 0) break;
      const chain = this.s.inbox.shift()!;
      this.s.board[spot] = { kind: 'gen', chain };
      this.say(`Nouveau générateur : ${CHAINS[chain].generator} ! Touche-le pour créer de nouveaux objets.`);
      placed = true;
    }
    if (placed) save(this.s);
    return placed;
  }

  // ---------- Hint ----------

  // After a few idle seconds, two identical objects nudge toward each other.
  private maybeHint() {
    if (this.hint.length || !this.input.enabled || this.dragging || Date.now() - this.lastAction < HINT_DELAY_MS) return;
    const b = this.s.board;
    for (let i = 0; i < b.length; i++) {
      const a = b[i];
      if (a?.kind !== 'item' || a.level >= maxLevel(a.chain)) continue;
      const j = b.findIndex((c, k) => k > i && c?.kind === 'item' && c.chain === a.chain && c.level === a.level);
      const si = this.sprites[i];
      const sj = this.sprites[j];
      if (j < 0 || !si || !sj) continue;
      this.hint = [si, sj];
      for (const [sp, other] of [[si, sj], [sj, si]]) {
        const ang = Math.atan2(other.y - sp.y, other.x - sp.x);
        this.tweens.add({
          targets: sp, x: sp.x + Math.cos(ang) * 12, y: sp.y + Math.sin(ang) * 12, duration: 260,
          yoyo: true, repeat: 1, repeatDelay: 60, hold: 40, loop: -1, loopDelay: 1200, ease: 'Sine.InOut',
        });
      }
      return;
    }
  }

  private stopHint() {
    for (const sp of this.hint) {
      if (!sp.active) continue;
      this.tweens.killTweensOf(sp);
      const { x, y } = this.cellCenter(sp.getData('cell'));
      sp.setPosition(x, y - 2);
    }
    this.hint = [];
  }

  // ---------- HUD ----------

  private refreshHud() {
    tickEnergy(this.s);
    this.energyText.setText(`${this.s.energy}`);
    if (this.s.energy < ENERGY_MAX) {
      const ms = msToNextEnergy(this.s);
      const m = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      this.timerText.setText(`${m}:${sec}`);
    } else this.timerText.setText('max');
    this.coinText.setText(`${this.s.coins}`);
    this.starText.setText(`${this.s.stars}`);
    this.dirhamText.setText(`${this.s.dirhams}`);
    const next = ALL_TASKS.find((t) => !this.s.tasksDone.includes(t.id));
    this.riadBadge.setVisible(!!next && this.s.stars >= next.cost);
    this.shopBadge.setVisible(this.s.lastGift !== today());
  }
}
