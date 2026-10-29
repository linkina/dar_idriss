import Phaser from 'phaser';
import { DAILY_GIFT_ENERGY, ENERGY_MAX, ENERGY_REFILL_COST, PACKS } from './data';
import type { Sounds } from './sound';
import { save, tickEnergy, today, type Save } from './state';
import { button, closeButton, FONT, H, OVERLAY_DY, panel, text, W } from './ui';

export interface ShopData {
  save: Save;
  sfx: Sounds;
  onClose: () => void;
}

// Dirhams shop: daily gift, energy refill, and test packs behind a parental gate.
export class ShopScene extends Phaser.Scene {
  private d!: ShopData;
  private layer!: Phaser.GameObjects.Container;
  private note!: Phaser.GameObjects.Text;

  constructor() {
    super('shop');
  }

  create(d: ShopData) {
    this.d = d;
    panel(this, 16, 110, W - 32, 1060);
    text(this, 44, 134, 'Boutique', 34);
    closeButton(this, W - 56, 154, () => this.close());
    this.layer = this.add.container(0, 0);
    this.note = this.add.text(W / 2, 1120, '', { fontFamily: FONT, fontSize: '20px', color: '#b5532e', align: 'center', wordWrap: { width: W - 80 } }).setOrigin(0.5);
    this.render();
  }

  private close() {
    this.d.sfx.tap();
    this.d.onClose();
    this.scene.stop();
  }

  private card(y: number, h: number, icon: string, title: string, sub: string) {
    const g = this.add.graphics();
    g.fillStyle(0xd9b98a, 1).fillRoundedRect(40, y + 4, W - 80, h + 2, 20);
    g.fillStyle(0xffffff, 1).fillRoundedRect(40, y, W - 80, h, 20);
    this.layer.add(g);
    this.layer.add(this.add.image(96, y + h / 2, icon).setDisplaySize(64, 64));
    this.layer.add(text(this, 144, y + h / 2 - 30, title, 24));
    this.layer.add(text(this, 144, y + h / 2 + 4, sub, 18, '#7a5a3a', false));
  }

  private render() {
    const s = this.d.save;
    tickEnergy(s);
    this.layer.removeAll(true);

    this.layer.add(this.add.image(470, 154, 'pill').setDisplaySize(170, 50));
    this.layer.add(this.add.image(410, 154, 'icon-dirham').setDisplaySize(36, 36));
    this.layer.add(text(this, 436, 138, `${s.dirhams}`, 28));

    const giftReady = s.lastGift !== today();
    this.card(210, 120, 'icon-gift', 'Cadeau du jour', `+${DAILY_GIFT_ENERGY} énergie gratuite, chaque jour`);
    this.layer.add(button(this, W - 140, 270, 160, 56, giftReady ? 'Prendre' : 'Demain', giftReady, () => {
      s.energy = Math.min(ENERGY_MAX + DAILY_GIFT_ENERGY, s.energy + DAILY_GIFT_ENERGY);
      s.lastGift = today();
      this.done(`+${DAILY_GIFT_ENERGY} énergie ! Reviens demain pour un nouveau cadeau.`);
    }));

    const full = s.energy >= ENERGY_MAX;
    this.card(354, 120, 'icon-energy', "Remplir l'énergie", `Énergie au maximum (${ENERGY_MAX})`);
    this.layer.add(button(this, W - 140, 414, 160, 56, `${ENERGY_REFILL_COST}`, !full, () => {
      if (s.dirhams < ENERGY_REFILL_COST) return this.say(`Il te faut ${ENERGY_REFILL_COST} Dirhams.`);
      s.dirhams -= ENERGY_REFILL_COST;
      s.energy = ENERGY_MAX;
      this.done('Énergie remplie !');
    }));
    this.layer.add(this.add.image(W - 182, 411, 'icon-dirham').setDisplaySize(30, 30));

    this.layer.add(text(this, 44, 510, 'Dirhams', 28));
    PACKS.forEach((p, k) => {
      const y = 556 + k * 140;
      this.card(y, 120, 'icon-dirham', `${p.dirhams} Dirhams`, p.price);
      this.layer.add(button(this, W - 140, y + 60, 160, 56, 'Acheter', true, () => this.gate(p.dirhams)));
    });
    this.layer.add(this.add.text(W / 2, 1000, "Version de test : aucun paiement réel n'est effectué.\nLes Dirhams servent uniquement dans le jeu.", { fontFamily: FONT, fontSize: '18px', color: '#7a8a96', align: 'center' }).setOrigin(0.5));
  }

  // Grown-ups only: a multiplication a young child is unlikely to solve.
  private gate(amount: number) {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 3 + Math.floor(Math.random() * 7);
    const right = a * b;
    const options = Phaser.Utils.Array.Shuffle([right, right + a, right - b]);
    const g = this.add.container(0, 0);
    g.add(this.add.rectangle(0, -OVERLAY_DY, W, H, 0x3a1a0c, 0.6).setOrigin(0).setInteractive());
    const box = this.add.graphics();
    box.fillStyle(0x1d3f94, 1).fillRoundedRect(70, 440, W - 140, 400, 28);
    box.fillStyle(0xffffff, 1).fillRoundedRect(76, 446, W - 152, 388, 24);
    g.add(box);
    g.add(text(this, W / 2, 476, 'Réservé aux adultes', 30).setOrigin(0.5, 0));
    g.add(text(this, W / 2, 536, 'Pour acheter, réponds à cette question :', 20, '#7a5a3a', false).setOrigin(0.5, 0));
    g.add(text(this, W / 2, 586, `${a} × ${b} = ?`, 44).setOrigin(0.5, 0));
    options.forEach((o, i) => {
      g.add(button(this, 180 + i * 180, 712, 150, 64, `${o}`, true, () => {
        g.destroy();
        if (o !== right) {
          this.d.sfx.deny();
          return this.say('Réponse incorrecte. Demande à un adulte de t\'aider.');
        }
        this.d.save.dirhams += amount;
        this.done(`+${amount} Dirhams (achat de test).`);
      }));
    });
    g.add(this.add.text(W / 2, 790, 'Annuler', { fontFamily: FONT, fontSize: '20px', color: '#b5532e' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => g.destroy()));
  }

  private done(msg: string) {
    save(this.d.save);
    this.d.sfx.deliver();
    this.render();
    this.say(msg);
  }

  private say(msg: string) {
    this.note.setText(msg);
  }
}
