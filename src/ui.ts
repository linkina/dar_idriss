import Phaser from 'phaser';

export const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
export const INK = '#1b3a5c';
export const BLUE = 0x3cb4e0;
export const W = 720;
export const H = 1280;

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
  scene.add.rectangle(0, 0, W, H, 0x0b2540, 0.55).setOrigin(0).setInteractive();
  const g = scene.add.graphics();
  g.fillStyle(0x2a7fb8, 0.4).fillRoundedRect(x, y + 8, w, h, 30);
  g.fillStyle(BLUE, 1).fillRoundedRect(x, y, w, h, 30);
  g.fillStyle(0xf4fbff, 1).fillRoundedRect(x + 6, y + 6, w - 12, h - 12, 26);
  return g;
}

export function closeButton(scene: Phaser.Scene, x: number, y: number, onClick: () => void) {
  const c = scene.add.container(x, y);
  c.add(scene.add.circle(0, 3, 26, 0xa93226));
  c.add(scene.add.circle(0, 0, 26, 0xe74c3c).setStrokeStyle(3, 0xffffff));
  c.add(scene.add.text(0, -2, '×', { fontFamily: FONT, fontSize: '40px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5));
  c.setSize(56, 56).setInteractive({ useHandCursor: true });
  c.on('pointerup', onClick);
  return c;
}

export function text(scene: Phaser.Scene, x: number, y: number, s: string, size = 24, color = INK, bold = true) {
  return scene.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' });
}
