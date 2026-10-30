import Phaser from 'phaser';
import { CHAINS, maxLevel, type ChainId } from './data';
import type { Sounds } from './sound';
import { closeButton, FONT, INK, panel, text, W } from './ui';

export interface ChainData {
  chain: ChainId;
  level: number; // 0 for the generator itself
  sfx: Sounds;
  onClose: () => void;
}

// Shows every object of a merge chain, from level 1 to the last.
export class ChainScene extends Phaser.Scene {
  constructor() {
    super('chain');
  }

  create(d: ChainData) {
    const chain = CHAINS[d.chain];
    const top = 330;
    panel(this, 30, top, W - 60, 570);
    this.add.image(96, top + 70, `gen-${d.chain}`).setDisplaySize(84, 84);
    text(this, 150, top + 38, chain.generator, 30);
    text(this, 150, top + 78, 'Fusionne deux objets identiques pour passer au suivant.', 17, '#7a5a3a', false);
    const close = () => {
      d.sfx.tap();
      d.onClose();
      this.scene.stop();
    };
    closeButton(this, W - 68, top + 50, close);

    const cols = 3;
    const tile = 170;
    const gap = 30;
    const x0 = (W - (cols * tile + (cols - 1) * gap)) / 2;
    const max = maxLevel(d.chain);
    for (let i = 0; i < max; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = x0 + c * (tile + gap);
      const y = top + 140 + r * (tile + 50);
      const current = i + 1 === d.level;
      const g = this.add.graphics();
      g.fillStyle(0xd9b98a, 1).fillRoundedRect(x, y + 5, tile, tile, 22);
      g.fillStyle(current ? 0xfff3c4 : 0xffffff, 1).fillRoundedRect(x, y, tile, tile, 22);
      if (current) g.lineStyle(5, 0xffc21a, 1).strokeRoundedRect(x, y, tile, tile, 22);
      this.add.image(x + tile / 2, y + tile / 2 - 12, `${d.chain}-${i + 1}`).setDisplaySize(110, 110);
      this.add.circle(x + 24, y + 24, 17, 0x0f8a5f).setStrokeStyle(3, 0xffffff);
      this.add.text(x + 24, y + 24, `${i + 1}`, { fontFamily: FONT, fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(x + tile / 2, y + tile - 26, chain.items[i], { fontFamily: FONT, fontSize: '17px', color: INK, fontStyle: 'bold', align: 'center', wordWrap: { width: tile - 12 } }).setOrigin(0.5);
      // Arrow to the next level in the same row.
      if (c < cols - 1 && i < max - 1) this.add.text(x + tile + gap / 2, y + tile / 2, '›', { fontFamily: FONT, fontSize: '40px', color: '#d9a441', fontStyle: 'bold' }).setOrigin(0.5);
    }
  }
}
