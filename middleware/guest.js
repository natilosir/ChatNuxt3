import { getRouteAuthState } from '~/utils/auth/routeGuard.js';

export default defineNuxtRouteMiddleware(async () => {
  const authState = await getRouteAuthState();

  if (authState.value.isLoggedIn) {
    return navigateTo('/');
  }
});
