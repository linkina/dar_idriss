import Phaser from 'phaser';
import { FONT, H, W } from './ui';

// Opening animation: the DAS Apps logo, then the game title. A tap skips it.
export class SplashScene extends Phaser.Scene {
  private done = false;

  constructor() {
    super('splash');
  }

  create() {
    const cy = H / 2;
    this.add.rectangle(0, 0, W, H, 0x1d3f94).setOrigin(0);
    const rays = this.add.image(W / 2, cy - 80, 'rays').setDisplaySize(700, 700).setAlpha(0);
    const icon = this.add.image(W / 2, cy - 80, 'appIcon').setScale(0).setAngle(-20);
    const company = this.add.text(W / 2, cy + 110, 'DAS Apps', { fontFamily: FONT, fontSize: '64px', color: '#fdf6e7', fontStyle: 'bold', stroke: '#0f2560', strokeThickness: 8 }).setOrigin(0.5).setAlpha(0);
    const presents = this.add.text(W / 2, cy + 180, 'présente', { fontFamily: FONT, fontSize: '28px', color: '#f7c531', fontStyle: 'italic' }).setOrigin(0.5).setAlpha(0);
    const size = 260 / icon.width;

    this.tweens.add({ targets: rays, alpha: 0.55, angle: 90, duration: 2600, ease: 'Sine.Out' });
    this.tweens.add({ targets: icon, scale: size, angle: 0, duration: 700, ease: 'Back.Out', delay: 200 });
    this.tweens.add({ targets: company, alpha: 1, y: cy + 100, duration: 500, delay: 800 });
    this.tweens.add({ targets: presents, alpha: 1, duration: 500, delay: 1300 });

    // Then the game title over the terracotta courtyard.
    this.time.delayedCall(2600, () => this.title());
    this.input.once('pointerdown', () => this.finish());
  }

  private title() {
    if (this.done) return;
    const cy = H / 2;
    const bg = this.add.image(0, 0, 'courtyard').setOrigin(0).setDisplaySize(W, H).setAlpha(0);
    const name = this.add.text(W / 2, cy - 20, 'Dar Idriss', { fontFamily: FONT, fontSize: '96px', color: '#f7c531', fontStyle: 'bold', stroke: '#24140a', strokeThickness: 12 }).setOrigin(0.5).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: bg, alpha: 1, duration: 400 });
    this.tweens.add({ targets: name, alpha: 1, scale: 1, duration: 600, ease: 'Back.Out', delay: 200 });
    // The family pops in under the title.
    ['sarah', 'idriss', 'amr'].forEach((who, n) => {
      const b = this.add.image(W / 2 + (n - 1) * 190, cy + 250, `happy-${who}`).setDisplaySize(200, 200);
      const sc = b.scale;
      b.setScale(0);
      this.tweens.add({ targets: b, scale: sc, duration: 450, ease: 'Back.Out', delay: 500 + n * 150 });
    });
    this.time.delayedCall(2000, () => this.finish());
  }

  private finish() {
    if (this.done) return;
    this.done = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('game'));
  }
}
