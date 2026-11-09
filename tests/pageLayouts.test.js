import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pageLayouts = [
  ['pages/login.vue', 'login', 'guest'],
  ['pages/register.vue', 'login', 'guest'],
  ['pages/forgot-password.vue', 'login', 'guest'],
  ['pages/logout.vue', 'login', null],
  ['pages/index.vue', 'chat', 'auth'],
  ['pages/chat/[_hash].vue', 'chat', 'auth'],
  ['pages/profile.vue', 'chat', 'auth'],
  ['pages/settings.vue', 'chat', 'auth'],
];

test('pages declare layouts and route guards statically for SSR hydration', async () => {
  for (const [file, layout, middleware] of pageLayouts) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');

    assert.match(
      source,
      new RegExp(`definePageMeta\\(\\{[^}]*layout:\\s*['"]${layout}['"]`),
      `${file} must declare the ${layout} layout with definePageMeta`,
    );
    assert.doesNotMatch(source, /setPageLayout\s*\(/, `${file} must not change layout at runtime`);

    if (middleware) {
      assert.match(
        source,
        new RegExp(`middleware:\\s*['"]${middleware}['"]`),
        `${file} must use ${middleware} middleware`,
      );
    }
  }
});

test('login auth is resolved by guest middleware, not by async page setup', async () => {
  const source = await readFile(new URL('../pages/login.vue', import.meta.url), 'utf8');
  assert.match(source, /middleware:\s*['"]guest['"]/);
  assert.doesNotMatch(source, /const\s+auth\s*=\s*await\s+check\s*\(/);
});
