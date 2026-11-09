import { getRouteAuthState } from '~/utils/auth/routeGuard.js';

export default defineNuxtRouteMiddleware(async (to) => {
  const authState = await getRouteAuthState();

  if (!authState.value.isLoggedIn) {
    return navigateTo({
      path: '/login',
      query: to.fullPath === '/' ? undefined : { redirect: to.fullPath },
    });
  }
});
