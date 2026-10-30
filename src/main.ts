import Phaser from 'phaser';
import { artEntries } from './art';
import { riadEntries } from './riadArt';
import { imageEntries } from './images';
import { GameScene } from './GameScene';
import { ChainScene } from './ChainScene';
import { RiadScene } from './RiadScene';
import { ShopScene } from './ShopScene';
import { SplashScene } from './SplashScene';
import { H, W } from './ui';

// Turns every SVG into a texture before the game scene starts.
class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    const svgs = [...artEntries(), ...riadEntries()].map(([key, svg]): [string, string] => [key, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)]);
    // Sarah's illustrations load alongside; an image replaces any drawn texture with the same key.
    const jobs = [...svgs, ...imageEntries()].map(
      ([key, src]) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (this.textures.exists(key)) this.textures.remove(key);
            this.textures.addImage(key, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        }),
    );
    Promise.all(jobs).then(() => this.scene.start('splash'));
  }
}

(window as unknown as { game: Phaser.Game }).game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#b5532e',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  scene: [BootScene, SplashScene, GameScene, RiadScene, ShopScene, ChainScene],
});
