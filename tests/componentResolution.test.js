import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Nuxt does not generate stale auto-imports for moved chat components', () => {
  assert.match(read('nuxt.config.ts'), /components:\s*false/);
});

test('welcome page imports the component from its current folder', () => {
  const page = read('pages/index.vue');
  assert.match(page, /@\/components\/chat\/ChatWelcome\.vue/);
  assert.ok(fs.existsSync(path.join(root, 'components/chat/ChatWelcome.vue')));
});

test('development startup clears stale Nuxt and Vite generated caches', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.predev, 'node scripts/clear-nuxt-cache.mjs');
  assert.ok(fs.existsSync(path.join(root, 'scripts/clear-nuxt-cache.mjs')));
});

test('local send failures do not reuse backend edited status 2', () => {
  const input = read('components/chat/MessageInput.vue');
  assert.match(input, /deliveryState:\s*'failed'/);
  assert.doesNotMatch(input, /status:\s*2/);
});
