import { CHAIN_IDS, CHARACTERS, COLS, ENERGY_MAX, ENERGY_REGEN_MS, MAX_LEVEL, ROWS, type ChainId, type CharacterId } from './data';

export type Cell =
  | { kind: 'item'; chain: ChainId; level: number }
  | { kind: 'gen'; chain: ChainId }
  | null;

export interface Want { chain: ChainId; level: number }
export interface Order { who: CharacterId; wants: Want[]; coins: number }

export interface Save {
  board: Cell[];
  energy: number;
  energyAt: number;
  coins: number;
  stars: number;
  orders: Order[];
  nextWho: number;
  sound: boolean;
}

const KEY = 'dar-idriss-save-v1';

export function newGame(): Save {
  const board: Cell[] = Array(COLS * ROWS).fill(null);
  board[idx(1, 4)] = { kind: 'gen', chain: 'menthe' };
  board[idx(3, 4)] = { kind: 'gen', chain: 'pain' };
  board[idx(5, 4)] = { kind: 'gen', chain: 'couture' };
  board[idx(2, 6)] = { kind: 'item', chain: 'menthe', level: 1 };
  board[idx(4, 6)] = { kind: 'item', chain: 'pain', level: 1 };
  const s: Save = { board, energy: ENERGY_MAX, energyAt: Date.now(), coins: 0, stars: 0, orders: [], nextWho: 0, sound: true };
  // The first orders stay easy so the player learns by doing.
  s.orders.push({ who: 'idriss', wants: [{ chain: 'menthe', level: 2 }], coins: 4 });
  s.orders.push({ who: 'fatima', wants: [{ chain: 'pain', level: 2 }], coins: 4 });
  s.orders.push({ who: 'sarah', wants: [{ chain: 'couture', level: 3 }], coins: 8 });
  s.nextWho = 3;
  return s;
}

export function idx(col: number, row: number) {
  return row * COLS + col;
}

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Save;
  } catch {
    // Storage can be blocked; start fresh.
  }
  return newGame();
}

export function save(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Ignore: progress is simply not kept.
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

// Adds the energy earned since the last check.
export function tickEnergy(s: Save, now = Date.now()) {
  if (s.energy >= ENERGY_MAX) {
    s.energyAt = now;
    return;
  }
  const gained = Math.floor((now - s.energyAt) / ENERGY_REGEN_MS);
  if (gained > 0) {
    s.energy = Math.min(ENERGY_MAX, s.energy + gained);
    s.energyAt += gained * ENERGY_REGEN_MS;
  }
}

export function msToNextEnergy(s: Save, now = Date.now()) {
  return ENERGY_REGEN_MS - ((now - s.energyAt) % ENERGY_REGEN_MS);
}

// Orders get harder as the player earns stars.
export function makeOrder(s: Save): Order {
  const who = CHARACTERS[s.nextWho % CHARACTERS.length].id;
  s.nextWho++;
  const maxLevel = Math.min(MAX_LEVEL, 3 + Math.floor(s.stars / 4));
  const count = s.stars >= 3 && Math.random() < 0.4 ? 2 : 1;
  const wants: Want[] = [];
  for (let i = 0; i < count; i++) {
    const chain = CHAIN_IDS[Math.floor(Math.random() * CHAIN_IDS.length)];
    const level = 2 + Math.floor(Math.random() * (maxLevel - 1));
    wants.push({ chain, level });
  }
  const coins = wants.reduce((sum, w) => sum + 2 ** (w.level - 1), 0);
  return { who, wants, coins };
}
