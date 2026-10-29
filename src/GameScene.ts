import Phaser from 'phaser';
import { CHAINS, CHARACTERS, COLS, ENERGY_MAX, MAX_LEVEL, ROWS } from './data';
import { Nature } from './sound';
import { load, makeOrder, msToNextEnergy, save, tickEnergy, type Cell, type Order, type Save } from './state';

const W = 720;
const CELL = 96;
const BOARD_X = (W - COLS * CELL) / 2;
const BOARD_Y = 352;
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
const INK = '#3b2412';

const texKey = (c: NonNullable<Cell>) => (c.kind === 'gen' ? `gen-${c.chain}` : `${c.chain}-${c.level}`);
const cellName = (c: NonNullable<Cell>) => (c.kind === 'gen' ? CHAINS[c.chain].generator : CHAINS[c.chain].items[c.level - 1]);

export class GameScene extends Phaser.Scene {
  private s!: Save;
  private nature = new Nature();
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

  constructor() {
    super('game');
  }

  create() {
    this.s = load();
    tickEnergy(this.s);
    this.nature.enabled = this.s.sound;
    this.input.dragDistanceThreshold = 8;
    this.input.once('pointerdown', () => this.nature.start());

    this.add.tileSprite(0, 0, W, 1280, 'zellige').setOrigin(0).setAlpha(0.9);
    this.drawTopBar();
    this.orderLayer = this.add.container(0, 0);
    this.drawBoardFrame();
    this.selection = this.add.graphics().setDepth(5);

    this.add.rectangle(0, 1226, W, 54, 0x24507e, 0.92).setOrigin(0);
    this.info = this.add.text(W / 2, 1253, '', { fontFamily: FONT, fontSize: '20px', color: '#f3e9d2', align: 'center', wordWrap: { width: W - 32 } }).setOrigin(0.5);
    this.say('Bienvenue à Dar Idriss ! Touche le jardin de menthe pour faire pousser une feuille.');

    this.renderBoard();
    this.renderOrders();
    this.refreshHud();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.refreshHud() });
  }

  // ---------- Drawing ----------

  private drawTopBar() {
    this.add.rectangle(0, 0, W, 92, 0x24507e, 0.95).setOrigin(0);
    this.add.rectangle(0, 92, W, 4, 0xd4a24c).setOrigin(0);
    const pill = (x: number, w: number) => this.add.rectangle(x, 46, w, 56, 0x173a5e).setOrigin(0, 0.5).setStrokeStyle(2, 0xd4a24c);
    pill(16, 230);
    pill(262, 180);
    pill(458, 150);
    this.add.image(46, 46, 'icon-energy').setDisplaySize(44, 44);
    this.energyText = this.add.text(74, 30, '', { fontFamily: FONT, fontSize: '28px', color: '#fff', fontStyle: 'bold' });
    this.timerText = this.add.text(152, 36, '', { fontFamily: FONT, fontSize: '18px', color: '#f4c430' });
    this.add.image(292, 46, 'icon-coin').setDisplaySize(42, 42);
    this.coinText = this.add.text(322, 30, '', { fontFamily: FONT, fontSize: '28px', color: '#fff', fontStyle: 'bold' });
    this.add.image(488, 46, 'icon-star').setDisplaySize(42, 42);
    this.starText = this.add.text(518, 30, '', { fontFamily: FONT, fontSize: '28px', color: '#fff', fontStyle: 'bold' });
    this.soundIcon = this.add.image(668, 46, this.s.sound ? 'icon-soundOn' : 'icon-soundOff').setDisplaySize(44, 44).setInteractive({ useHandCursor: true });
    this.soundIcon.on('pointerup', () => {
      this.s.sound = !this.s.sound;
      this.nature.start();
      this.nature.setEnabled(this.s.sound);
      this.soundIcon.setTexture(this.s.sound ? 'icon-soundOn' : 'icon-soundOff');
      save(this.s);
    });
  }

  private drawBoardFrame() {
    const g = this.add.graphics();
    g.fillStyle(0x8a5a2c, 1).fillRoundedRect(BOARD_X - 12, BOARD_Y - 12, COLS * CELL + 24, ROWS * CELL + 24, 18);
    g.fillStyle(0xe8d5ad, 1).fillRoundedRect(BOARD_X - 6, BOARD_Y - 6, COLS * CELL + 12, ROWS * CELL + 12, 14);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = BOARD_X + c * CELL;
        const y = BOARD_Y + r * CELL;
        g.fillStyle((r + c) % 2 ? 0xf6ecd6 : 0xf0e2c4, 1).fillRoundedRect(x + 3, y + 3, CELL - 6, CELL - 6, 12);
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
  }

  private makeSprite(cell: NonNullable<Cell>, i: number) {
    const { x, y } = this.cellCenter(i);
    const sp = this.add.image(x, y, texKey(cell)).setDisplaySize(CELL - 10, CELL - 10).setDepth(2);
    sp.setInteractive({ useHandCursor: true, draggable: true });
    sp.setData('cell', i);
    sp.on('pointerup', () => {
      if (!this.dragging) this.tap(sp.getData('cell'));
    });
    sp.on('dragstart', () => {
      this.dragging = true;
      sp.setDepth(10).setDisplaySize(CELL + 6, CELL + 6);
    });
    sp.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => sp.setPosition(dx, dy));
    sp.on('dragend', (p: Phaser.Input.Pointer) => {
      this.time.delayedCall(0, () => (this.dragging = false));
      this.drop(sp.getData('cell'), this.cellAt(p.worldX, p.worldY));
    });
    return sp;
  }

  private drawSelection() {
    this.selection.clear();
    if (this.selected < 0 || !this.s.board[this.selected]) return;
    const { x, y } = this.cellCenter(this.selected);
    this.selection.lineStyle(5, 0x1f8a70, 1).strokeRoundedRect(x - CELL / 2 + 2, y - CELL / 2 + 2, CELL - 4, CELL - 4, 14);
  }

  private pop(i: number) {
    const sp = this.sprites[i];
    if (!sp) return;
    const size = CELL - 10;
    sp.setDisplaySize(size * 0.4, size * 0.4);
    this.tweens.add({ targets: sp, displayWidth: size, displayHeight: size, duration: 260, ease: 'Back.Out' });
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
    const chain = CHAINS[cell.chain];
    this.say(cell.level < MAX_LEVEL
      ? `${cellName(cell)} (niveau ${cell.level}/${MAX_LEVEL}). Fusionne-en deux pour obtenir : ${chain.items[cell.level]}.`
      : `${cellName(cell)} : niveau maximum ! Les invités l'adorent.`);
  }

  private generate(i: number) {
    tickEnergy(this.s);
    if (this.s.energy <= 0) return this.say("Plus d'énergie. Elle revient toute seule : 1 point toutes les 2 minutes.");
    const target = this.nearestEmpty(i);
    if (target < 0) return this.say('Le plateau est plein. Fusionne ou livre des objets pour faire de la place.');
    const gen = this.s.board[i]!;
    if (this.s.energy === ENERGY_MAX) this.s.energyAt = Date.now();
    this.s.energy--;
    this.s.board[target] = { kind: 'item', chain: gen.chain, level: 1 };
    this.nature.tok(0.8);
    const from = this.cellCenter(i);
    const to = this.cellCenter(target);
    const sp = this.makeSprite(this.s.board[target]!, target).setPosition(from.x, from.y).setScale(0.2);
    this.sprites[target] = sp;
    this.tweens.add({ targets: sp, x: to.x, y: to.y, displayWidth: CELL - 10, displayHeight: CELL - 10, duration: 280, ease: 'Quad.Out' });
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
      this.nature.tok(0.7);
    } else if (a.kind === 'item' && t.kind === 'item' && a.chain === t.chain && a.level === t.level && a.level < MAX_LEVEL) {
      const level = a.level + 1;
      b[to] = { kind: 'item', chain: a.chain, level };
      b[from] = null;
      this.selected = to;
      this.nature.tok(1 + level * 0.15);
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
      this.nature.tok(0.7);
    }
    this.afterChange(true);
  }

  private afterChange(rerender: boolean) {
    if (rerender) this.renderBoard();
    else this.drawSelection();
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

  private renderOrders() {
    this.orderLayer.removeAll(true);
    const cardW = 220;
    const gap = (W - 3 * cardW) / 4;
    this.s.orders.forEach((o, k) => {
      const x = gap + k * (cardW + gap);
      const y = 112;
      const ready = this.findItems(o) !== null;
      const who = CHARACTERS.find((c) => c.id === o.who)!;
      const card = this.add.graphics();
      card.fillStyle(0x000000, 0.18).fillRoundedRect(x + 4, y + 6, cardW, 222, 18);
      card.fillStyle(0xfdf6e7, 1).fillRoundedRect(x, y, cardW, 222, 18);
      card.lineStyle(3, ready ? 0x27ae60 : 0xd4a24c, 1).strokeRoundedRect(x, y, cardW, 222, 18);
      this.orderLayer.add(card);
      this.orderLayer.add(this.add.image(x + 52, y + 56, `face-${o.who}`).setDisplaySize(84, 84));
      this.orderLayer.add(this.add.text(x + 52, y + 108, who.name, { fontFamily: FONT, fontSize: who.name.length > 8 ? '16px' : '20px', color: INK, fontStyle: 'bold' }).setOrigin(0.5, 0));

      const used = new Set<number>();
      o.wants.forEach((w, n) => {
        const ix = x + 152;
        const iy = y + (o.wants.length === 1 ? 70 : 42 + n * 66);
        this.orderLayer.add(this.add.circle(ix, iy, 32, 0xf0e2c4).setStrokeStyle(2, 0xc9a46a));
        this.orderLayer.add(this.add.image(ix, iy, `${w.chain}-${w.level}`).setDisplaySize(56, 56));
        const have = this.s.board.findIndex((c, j) => !used.has(j) && c?.kind === 'item' && c.chain === w.chain && c.level === w.level);
        if (have >= 0) {
          used.add(have);
          this.orderLayer.add(this.add.image(ix + 24, iy + 22, 'icon-check').setDisplaySize(24, 24));
        }
      });

      const btn = this.add.graphics();
      btn.fillStyle(ready ? 0x27ae60 : 0xbdb2a0, 1).fillRoundedRect(x + 14, y + 160, cardW - 28, 48, 14);
      this.orderLayer.add(btn);
      const label = ready ? 'Livrer' : `${o.coins}`;
      const txt = this.add.text(x + cardW / 2 + (ready ? 0 : 14), y + 184, label, { fontFamily: FONT, fontSize: '24px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      this.orderLayer.add(txt);
      if (!ready) this.orderLayer.add(this.add.image(x + cardW / 2 - 22, y + 184, 'icon-coin').setDisplaySize(28, 28));
      const hit = this.add.zone(x, y, cardW, 222).setOrigin(0).setInteractive({ useHandCursor: ready });
      hit.on('pointerup', () => (ready ? this.deliver(k) : this.say(`${who.name} attend : ${o.wants.map((w) => CHAINS[w.chain].items[w.level - 1]).join(' et ')}.`)));
      this.orderLayer.add(hit);
    });
  }

  private deliver(k: number) {
    const o = this.s.orders[k];
    const cells = this.findItems(o);
    if (!cells) return;
    cells.forEach((i) => {
      const sp = this.sprites[i];
      this.s.board[i] = null;
      this.sprites[i] = null;
      if (sp) this.tweens.add({ targets: sp, y: 230, x: 110 + k * 235, alpha: 0, duration: 380, ease: 'Quad.In', onComplete: () => sp.destroy() });
    });
    this.s.coins += o.coins;
    this.s.stars += 1;
    this.nature.chime();
    this.float(110 + k * 235, 200, `+${o.coins}  +1 étoile`, '#f4c430');
    const who = CHARACTERS.find((c) => c.id === o.who)!;
    this.say(`${who.name} te remercie ! Les étoiles serviront à rénover le riad.`);
    this.s.orders[k] = makeOrder(this.s);
    this.selected = -1;
    save(this.s);
    this.refreshHud();
    this.time.delayedCall(400, () => this.afterChange(true));
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
