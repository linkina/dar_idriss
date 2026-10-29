import { ALL_TASKS, CHARACTERS, START_CHAINS, COLS, ENERGY_MAX, ENERGY_REGEN_MS, MAX_LEVEL, ROWS, type ChainId, type CharacterId } from './data';

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
  dirhams: number;
  tasksDone: string[];
  lastGift: string;
  inbox: ChainId[];
}

const KEY = 'dar-idriss-save-v1';

export function newGame(): Save {
  const board: Cell[] = Array(COLS * ROWS).fill(null);
  board[idx(1, 4)] = { kind: 'gen', chain: 'menthe' };
  board[idx(3, 4)] = { kind: 'gen', chain: 'pain' };
  board[idx(5, 4)] = { kind: 'gen', chain: 'couture' };
  board[idx(2, 6)] = { kind: 'item', chain: 'menthe', level: 1 };
  board[idx(4, 6)] = { kind: 'item', chain: 'pain', level: 1 };
  const s: Save = { board, energy: ENERGY_MAX, energyAt: Date.now(), coins: 0, stars: 0, orders: [], nextWho: 0, sound: true, dirhams: 20, tasksDone: [], lastGift: '', inbox: [] };
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
    // Older saves lack the newer fields; fill them in.
    if (raw) return { dirhams: 20, tasksDone: [], lastGift: '', inbox: [], ...JSON.parse(raw) } as Save;
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

export function unlockedChains(s: Save): ChainId[] {
  const extra = ALL_TASKS.filter((t) => t.unlocks && s.tasksDone.includes(t.id)).map((t) => t.unlocks!);
  return [...START_CHAINS, ...extra];
}

export const today = () => new Date().toISOString().slice(0, 10);

// Orders get harder as the player earns stars.
export function makeOrder(s: Save): Order {
  const who = CHARACTERS[s.nextWho % CHARACTERS.length].id;
  s.nextWho++;
  const chains = unlockedChains(s);
  const progress = s.stars + s.tasksDone.length * 2;
  const maxLevel = Math.min(MAX_LEVEL, 3 + Math.floor(progress / 5));
  const count = progress >= 3 && Math.random() < 0.4 ? 2 : 1;
  const wants: Want[] = [];
  for (let i = 0; i < count; i++) {
    // Newly unlocked chains show up more often so players use them.
    const fresh = chains.slice(START_CHAINS.length);
    const pool = fresh.length && Math.random() < 0.5 ? fresh : chains;
    const chain = pool[Math.floor(Math.random() * pool.length)];
    const level = 2 + Math.floor(Math.random() * (maxLevel - 1));
    wants.push({ chain, level });
  }
  const coins = wants.reduce((sum, w) => sum + 2 ** (w.level - 1), 0);
  return { who, wants, coins };
}
