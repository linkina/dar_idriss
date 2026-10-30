import { IMAGE_CHAINS } from './data';

// Sarah's illustrations, bundled into the page by Vite.
const files = import.meta.glob('./img/*.webp', { eager: true, import: 'default' }) as Record<string, string>;

// Texture key and URL of each image: `gen-arbres`, `arbres-1`, ...
export function imageEntries(): [string, string][] {
  return Object.entries(files)
    .map(([path, url]) => {
      const name = path.replace('./img/', '').replace('.webp', '');
      const [chain, level] = name.split('-');
      return [level === 'gen' ? `gen-${chain}` : name, url] as [string, string];
    })
    .filter(([key]) => IMAGE_CHAINS.some((c) => key.includes(c)));
}
