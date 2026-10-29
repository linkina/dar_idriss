import Phaser from 'phaser';

export const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
export const INK = '#1a2f6b';
// Palette inspired by zellige: terracotta, saffron, red, cobalt, emerald and gold.
export const BLUE = 0x1d3f94;
export const GOLD = 0xd9a441;
export const CREAM = 0xfdf6e7;
export const W = 720;
// Phones are taller than 16:9: the game grows in height to fill the screen.
export const H = Math.max(1280, Math.min(1700, Math.round((W * window.innerHeight) / Math.max(1, window.innerWidth))));
// Overlays are laid out for 1280 and centred vertically.
export const OVERLAY_DY = (H - 1280) / 2;

// A raised button; greyed out and inert when disabled.
export function button(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, enabled: boolean, onClick: () => void) {
  const c = scene.add.container(x, y);
  c.add(scene.add.image(0, 0, enabled ? 'btnGreen' : 'btnGrey').setDisplaySize(w, h + 6));
  c.add(scene.add.text(0, -3, label, { fontFamily: FONT, fontSize: `${Math.round(h * 0.42)}px`, color: '#fff', fontStyle: 'bold', stroke: enabled ? '#146b38' : '#8c7e66', strokeThickness: 4 }).setOrigin(0.5));
  c.setSize(w, h).setInteractive({ useHandCursor: enabled });
  c.on('pointerup', () => {
    if (!enabled) return;
    scene.tweens.add({ targets: c, scale: 0.92, duration: 70, yoyo: true });
    onClick();
  });
  return c;
}

// Dimmed backdrop and a white panel with a turquoise rim; blocks input below.
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
  scene.cameras.main.setScroll(0, -OVERLAY_DY);
  scene.add.rectangle(0, -OVERLAY_DY, W, H, 0x3a1a0c, 0.55).setOrigin(0).setInteractive();
  const g = scene.add.graphics();
  g.fillStyle(0x3a1a0c, 0.45).fillRoundedRect(x, y + 8, w, h, 30);
  g.fillStyle(BLUE, 1).fillRoundedRect(x, y, w, h, 30);
  g.lineStyle(3, GOLD, 1).strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 27);
  g.fillStyle(CREAM, 1).fillRoundedRect(x + 8, y + 8, w - 16, h - 16, 24);
  return g;
}

export function closeButton(scene: Phaser.Scene, x: number, y: number, onClick: () => void) {
  const c = scene.add.container(x, y);
  c.add(scene.add.circle(0, 3, 26, 0x8f1d18));
  c.add(scene.add.circle(0, 0, 26, 0xd22b26).setStrokeStyle(3, 0xffffff));
  c.add(scene.add.text(0, -2, '×', { fontFamily: FONT, fontSize: '40px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5));
  c.setSize(56, 56).setInteractive({ useHandCursor: true });
  c.on('pointerup', onClick);
  return c;
}

export function text(scene: Phaser.Scene, x: number, y: number, s: string, size = 24, color = INK, bold = true) {
  return scene.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' });
}
