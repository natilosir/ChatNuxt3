import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAuthSnapshot,
  createUncheckedAuthSnapshot,
  updateAuthSnapshot,
} from '../utils/auth/authState.js';

test('auth starts unchecked until the route middleware resolves the session', () => {
  assert.deepEqual(createUncheckedAuthSnapshot(), {
    checked: false,
    isLoggedIn: false,
    user: null,
  });
});

test('authenticated snapshot carries the user and a stable checked flag', () => {
  const user = { hash: 'user-hash', name: 'Test User' };
  assert.deepEqual(createAuthSnapshot(user), {
    checked: true,
    isLoggedIn: true,
    user,
  });
});

test('successful login updates the existing Nuxt state ref without reacquiring context', () => {
  const state = { value: createUncheckedAuthSnapshot() };
  const user = { hash: 'user-hash' };

  updateAuthSnapshot(state, user);

  assert.deepEqual(state.value, {
    checked: true,
    isLoggedIn: true,
    user,
  });
});

test('logout clears the user and marks the auth check complete', () => {
  const state = { value: createAuthSnapshot({ hash: 'user-hash' }) };

  updateAuthSnapshot(state, null);

  assert.deepEqual(state.value, {
    checked: true,
    isLoggedIn: false,
    user: null,
  });
});
