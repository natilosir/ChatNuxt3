import { rm } from 'node:fs/promises';

const generatedCaches = ['.nuxt', 'node_modules/.vite'];

for (const cachePath of generatedCaches) {
  await rm(cachePath, { recursive: true, force: true });
}

console.info('Nuxt and Vite generated caches cleared.');
