export type ChainId = 'menthe' | 'pain' | 'couture' | 'souk' | 'poterie' | 'orangers' | 'cuivre' | 'hammam';

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
  souk: {
    id: 'souk',
    generator: 'Panier du souk',
    items: ['Datte', 'Poignée de dattes', 'Bol de fruits secs', "Pot d'olives", 'Sac d\'épices', 'Panier garni'],
  },
  poterie: {
    id: 'poterie',
    generator: 'Atelier de poterie',
    items: ["Motte d'argile", 'Petit bol', 'Jarre', 'Tajine', 'Plat décoré', 'Grande vasque'],
  },
  orangers: {
    id: 'orangers',
    generator: "Jardin d'orangers",
    items: ["Fleur d'oranger", 'Orange', "Branche d'oranges", "Jus d'orange", "Eau de fleur d'oranger", "Corbeille d'agrumes"],
  },
  cuivre: {
    id: 'cuivre',
    generator: 'Atelier du dinandier',
    items: ['Plaque de cuivre', 'Gobelet', 'Lanterne simple', 'Lanterne ciselée', 'Plateau gravé', 'Grand lustre'],
  },
  hammam: {
    id: 'hammam',
    generator: 'Coin du hammam',
    items: ['Savon noir', 'Gant kessa', 'Serviette', "Pot d'argile ghassoul", 'Coffret de soins', 'Seau en cuivre'],
  },
};

// Chains the player has at the start; the others come from renovation tasks.
export const START_CHAINS: ChainId[] = ['menthe', 'pain', 'couture'];

export interface Task {
  id: string;
  name: string;
  cost: number;
  unlocks?: ChainId;
}

export interface Zone {
  id: string;
  name: string;
  short: string;
  tasks: Task[];
}

export const ZONES: Zone[] = [
  {
    id: 'entree',
    name: "L'entrée",
    short: 'Entrée',
    tasks: [
      { id: 'porte', name: 'Réparer la porte sculptée', cost: 1 },
      { id: 'lanternes', name: 'Accrocher les lanternes', cost: 2, unlocks: 'souk' },
      { id: 'jarres', name: 'Installer les jarres fleuries', cost: 2 },
      { id: 'tapis', name: "Dérouler le tapis d'entrée", cost: 3, unlocks: 'poterie' },
    ],
  },
  {
    id: 'patio',
    name: 'Le patio',
    short: 'Patio',
    tasks: [
      { id: 'fontaine', name: 'Restaurer la fontaine', cost: 3 },
      { id: 'zellige', name: 'Refaire le zellige', cost: 3, unlocks: 'orangers' },
      { id: 'orangers', name: 'Planter les orangers', cost: 4 },
      { id: 'banquettes', name: 'Installer les banquettes', cost: 4, unlocks: 'cuivre' },
    ],
  },
  {
    id: 'salon',
    name: 'Le salon marocain',
    short: 'Salon',
    tasks: [
      { id: 'sedari', name: 'Poser les sedari', cost: 4 },
      { id: 'lustre', name: 'Suspendre le lustre', cost: 5, unlocks: 'hammam' },
      { id: 'coussins', name: 'Disposer les coussins', cost: 5 },
      { id: 'table', name: 'Dresser la table du thé', cost: 6 },
    ],
  },
];

export const ALL_TASKS = ZONES.flatMap((z) => z.tasks);

// Test packs for the Dirhams shop (real payments come with Capacitor).
export const PACKS = [
  { dirhams: 50, price: '0,99 €' },
  { dirhams: 300, price: '4,99 €' },
  { dirhams: 700, price: '9,99 €' },
];

export const ENERGY_REFILL_COST = 20;
export const DAILY_GIFT_ENERGY = 30;

export const CHAIN_IDS = Object.keys(CHAINS) as ChainId[];
export const MAX_LEVEL = 6;

export type CharacterId = 'idriss' | 'sarah' | 'fatima' | 'brahim' | 'omar' | 'amr' | 'ali' | 'wafa' | 'ghizlane' | 'samira' | 'abdellah' | 'amar' | 'abir' | 'tasnim';

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
  { id: 'wafa', name: 'Wafa' },
  { id: 'ghizlane', name: 'Ghizlane' },
  { id: 'samira', name: 'Samira' },
  { id: 'abdellah', name: 'Abdellah' },
  { id: 'amar', name: 'Amar' },
  { id: 'abir', name: 'Abir' },
  { id: 'tasnim', name: 'Tasnim' },
];

export const COLS = 7;
export const ROWS = 9;
export const ENERGY_MAX = 100;
export const ENERGY_REGEN_MS = 2 * 60 * 1000;
