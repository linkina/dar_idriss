import Phaser from 'phaser';
import { artEntries } from './art';
import { GameScene } from './GameScene';

// Turns every SVG into a texture before the game scene starts.
class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    const jobs = artEntries().map(
      ([key, svg]) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.textures.addImage(key, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }),
    );
    Promise.all(jobs).then(() => this.scene.start('game'));
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#24507e',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 720, height: 1280 },
  scene: [BootScene, GameScene],
});
