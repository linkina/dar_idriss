import Phaser from 'phaser';
import { CHAINS, ZONES, type Zone } from './data';
import type { Sounds } from './sound';
import { save, type Save } from './state';
import { button, closeButton, FONT, INK, panel, text, W } from './ui';

const ZONE_BONUS = 50;
const ROOM_X = 40;
const ROOM_Y = 196;

export interface RiadData {
  save: Save;
  sfx: Sounds;
  onClose: () => void;
}

const zoneDone = (s: Save, z: Zone) => z.tasks.every((t) => s.tasksDone.includes(t.id));
const zoneOpen = (s: Save, i: number) => i === 0 || zoneDone(s, ZONES[i - 1]);

// The riad: spend stars on renovation tasks and watch each room come back to life.
export class RiadScene extends Phaser.Scene {
  private d!: RiadData;
  private zone = 0;
  private layer!: Phaser.GameObjects.Container;
  private starText!: Phaser.GameObjects.Text;
  private note!: Phaser.GameObjects.Text;

  constructor() {
    super('riad');
  }

  create(d: RiadData) {
    this.d = d;
    // Open on the first zone that still has work to do.
    const firstOpen = ZONES.findIndex((z, i) => zoneOpen(d.save, i) && !zoneDone(d.save, z));
    this.zone = firstOpen < 0 ? ZONES.length - 1 : firstOpen;

    panel(this, 16, 40, W - 32, 1210);
    text(this, 44, 64, 'Le riad', 34);
    this.add.image(470, 84, 'pill').setDisplaySize(150, 50);
    this.add.image(420, 84, 'icon-star').setDisplaySize(34, 34);
    this.starText = text(this, 446, 68, '', 28);
    closeButton(this, W - 56, 84, () => this.close());
    this.layer = this.add.container(0, 0);
    this.note = this.add.text(W / 2, 1210, '', { fontFamily: FONT, fontSize: '20px', color: '#2a7fb8', align: 'center', wordWrap: { width: W - 80 } }).setOrigin(0.5);
    this.render();
  }

  private close() {
    this.d.sfx.tap();
    this.d.onClose();
    this.scene.stop();
  }

  private render() {
    const s = this.d.save;
    this.layer.removeAll(true);
    this.starText.setText(`${s.stars}`);

    // Zone tabs.
    ZONES.forEach((z, i) => {
      const x = 52 + i * 210;
      const open = zoneOpen(s, i);
      const active = i === this.zone;
      const tab = this.add.graphics();
      tab.fillStyle(active ? 0x3cb4e0 : open ? 0xdff1fa : 0xe5e8ea, 1).fillRoundedRect(x, 120, 196, 54, 18);
      this.layer.add(tab);
      const label = this.add.text(x + 98 + (open ? 0 : 12), 147, z.short, { fontFamily: FONT, fontSize: '21px', color: active ? '#fff' : open ? INK : '#8a9599', fontStyle: 'bold' }).setOrigin(0.5);
      this.layer.add(label);
      if (!open) this.layer.add(this.add.image(x + 30, 147, 'icon-lock').setDisplaySize(26, 26));
      if (zoneDone(s, z)) this.layer.add(this.add.image(x + 182, 124, 'icon-check').setDisplaySize(28, 28));
      const hit = this.add.zone(x, 120, 196, 54).setOrigin(0).setInteractive({ useHandCursor: open });
      hit.on('pointerup', () => {
        if (!open) return this.say(`Termine d'abord ${ZONES[i - 1].name.toLowerCase()} pour ouvrir cette pièce.`);
        this.d.sfx.tap();
        this.zone = i;
        this.render();
      });
      this.layer.add(hit);
    });

    // The room, with a layer for each finished task.
    const z = ZONES[this.zone];
    const frame = this.add.graphics();
    frame.fillStyle(0xc99a68, 1).fillRoundedRect(ROOM_X - 6, ROOM_Y - 6, 652, 452, 20);
    this.layer.add(frame);
    this.layer.add(this.add.image(ROOM_X, ROOM_Y, `room-${z.id}-base`).setOrigin(0));
    for (const t of z.tasks) if (s.tasksDone.includes(t.id)) this.layer.add(this.add.image(ROOM_X, ROOM_Y, `room-${z.id}-${t.id}`).setOrigin(0));
    const done = z.tasks.filter((t) => s.tasksDone.includes(t.id)).length;
    this.layer.add(text(this, ROOM_X + 16, ROOM_Y + 12, `${z.name} : ${done}/${z.tasks.length}`, 22, '#fff').setStroke(INK, 5));

    // Task list.
    z.tasks.forEach((t, k) => {
      const y = 670 + k * 128;
      const isDone = s.tasksDone.includes(t.id);
      const row = this.add.graphics();
      row.fillStyle(0x8cc6e0, 1).fillRoundedRect(40, y + 4, W - 80, 112, 20);
      row.fillStyle(isDone ? 0xe5f6ec : 0xffffff, 1).fillRoundedRect(40, y, W - 80, 110, 20);
      this.layer.add(row);
      this.layer.add(text(this, 64, y + 18, t.name, 24));
      if (t.unlocks) {
        this.layer.add(this.add.image(84, y + 76, `gen-${t.unlocks}`).setDisplaySize(40, 40));
        this.layer.add(text(this, 110, y + 63, `Débloque : ${CHAINS[t.unlocks].generator}`, 19, '#1f8a70'));
      }
      if (isDone) {
        this.layer.add(this.add.image(W - 120, y + 55, 'icon-check').setDisplaySize(52, 52));
      } else {
        const ok = s.stars >= t.cost;
        this.layer.add(button(this, W - 136, y + 55, 150, 54, `${t.cost}`, ok, () => this.renovate(t.id)).setDepth(1));
        this.layer.add(this.add.image(W - 172, y + 52, 'icon-star').setDisplaySize(30, 30).setDepth(2));
        if (!ok) {
          const hit = this.add.zone(W - 211, y + 28, 150, 54).setOrigin(0).setInteractive();
          hit.on('pointerup', () => this.say(`Il te faut ${t.cost} étoiles. Livre des commandes pour en gagner.`));
          this.layer.add(hit);
        }
      }
    });
  }

  private renovate(id: string) {
    const s = this.d.save;
    const z = ZONES[this.zone];
    const t = z.tasks.find((x) => x.id === id)!;
    if (s.stars < t.cost || s.tasksDone.includes(id)) return;
    s.stars -= t.cost;
    s.tasksDone.push(id);
    if (t.unlocks) s.inbox.push(t.unlocks);
    let msg = `${t.name} : c'est fait !`;
    if (t.unlocks) msg += ` Nouveau sur ton plateau : ${CHAINS[t.unlocks].generator}.`;
    if (zoneDone(s, z)) {
      s.coins += ZONE_BONUS;
      msg = `${z.name} est rénové ! Bonus : +${ZONE_BONUS} pièces.` + (this.zone < ZONES.length - 1 ? ` ${ZONES[this.zone + 1].name} est ouvert.` : '');
    }
    save(s);
    this.d.sfx.deliver();
    this.render();
    this.say(msg);

    // The new layer appears with a burst of light.
    const img = this.add.image(ROOM_X + 320, ROOM_Y + 220, `room-${z.id}-${id}`).setAlpha(0).setScale(1.06);
    this.tweens.add({ targets: img, alpha: 1, scale: 1, duration: 500, ease: 'Back.Out', onComplete: () => img.destroy() });
    const rays = this.add.image(ROOM_X + 320, ROOM_Y + 220, 'rays').setDisplaySize(200, 200);
    this.tweens.add({ targets: rays, displayWidth: 900, displayHeight: 900, alpha: 0, angle: 60, duration: 900, ease: 'Cubic.Out', onComplete: () => rays.destroy() });
    this.add.particles(0, 0, 'sparkle', {
      x: { min: ROOM_X + 40, max: ROOM_X + 600 }, y: { min: ROOM_Y + 40, max: ROOM_Y + 400 },
      speed: { min: 40, max: 160 }, scale: { start: 1, end: 0 }, lifespan: 900, quantity: 40, emitting: false,
    }).explode(40);
  }

  private say(msg: string) {
    this.note.setText(msg);
  }
}
