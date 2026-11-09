import { useState } from '#app';
import { check } from './check.js';
import { createAuthSnapshot, createUncheckedAuthSnapshot } from './authState.js';

const AUTH_STATE_KEY = 'chatland:auth-state';

/**
 * Resolve authentication once per SSR request / client application.
 * Nuxt serializes this state so the server and browser make the same initial
 * route decision during hydration.
 */
export async function getRouteAuthState() {
  const authState = useState(AUTH_STATE_KEY, createUncheckedAuthSnapshot);

  if (!authState.value.checked) {
    const result = await check();
    authState.value = result?.isLoggedIn
      ? createAuthSnapshot(result.user)
      : createAuthSnapshot(null);
  }

  return authState;
}
