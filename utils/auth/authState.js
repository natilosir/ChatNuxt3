export function createUncheckedAuthSnapshot() {
  return {
    checked: false,
    isLoggedIn: false,
    user: null,
  };
}

export function createAuthSnapshot(user) {
  return {
    checked: true,
    isLoggedIn: Boolean(user),
    user: user ?? null,
  };
}

export function updateAuthSnapshot(authState, user) {
  if (!authState || !('value' in authState)) {
    throw new TypeError('An auth state ref is required.');
  }

  authState.value = createAuthSnapshot(user);
  return authState.value;
}
