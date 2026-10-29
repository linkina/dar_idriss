export type ChainId = 'menthe' | 'pain' | 'couture';

export interface Chain {
  id: ChainId;
  generator: string;
  items: string[];
}

// Each chain: a generator and its items, from level 1 to the last level.
export const CHAINS: Record<ChainId, Chain> = {
  menthe: {
    id: 'menthe',
    generator: 'Jardin de menthe',
    items: ['Feuille de menthe', 'Brin de menthe', 'Bouquet de menthe', 'Verre de thé', 'Théière', 'Plateau à thé'],
  },
  pain: {
    id: 'pain',
    generator: 'Four à pain',
    items: ['Épi de blé', 'Sac de farine', 'Boule de pâte', 'Khobz', 'Msemen', 'Cornes de gazelle'],
  },
  couture: {
    id: 'couture',
    generator: 'Coffre de couture',
    items: ['Fil', 'Bobine', 'Tissu', 'Foulard', 'Coussin brodé', 'Caftan'],
  },
};

export const CHAIN_IDS = Object.keys(CHAINS) as ChainId[];
export const MAX_LEVEL = 6;

export type CharacterId = 'idriss' | 'sarah' | 'fatima' | 'brahim' | 'omar' | 'amr' | 'ali';

export interface Character {
  id: CharacterId;
  name: string;
}

export const CHARACTERS: Character[] = [
  { id: 'idriss', name: 'Idriss' },
  { id: 'sarah', name: 'Sarah' },
  { id: 'fatima', name: 'Lalla Fatima' },
  { id: 'brahim', name: 'Brahim' },
  { id: 'omar', name: 'Omar' },
  { id: 'amr', name: 'Amr' },
  { id: 'ali', name: 'Ali' },
];

export const COLS = 7;
export const ROWS = 9;
export const ENERGY_MAX = 100;
export const ENERGY_REGEN_MS = 2 * 60 * 1000;
