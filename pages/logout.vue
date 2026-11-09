<script setup>
import { deleteCookie, post } from '~/composables/api/post.ts';
import { updateAuthSnapshot, createUncheckedAuthSnapshot } from '~/utils/auth/authState.js';

definePageMeta({ layout: 'login' });

const routeAuthState = useState('chatland:auth-state', createUncheckedAuthSnapshot);

useHead({
  title: 'خروج از حساب'
});

onMounted(async () => {
  try {
    await post('logout');
    deleteCookie('hash');
    deleteCookie('token');
    updateAuthSnapshot(routeAuthState, null);
    await navigateTo('/login');
  } catch (error) {
    console.error('Logout request failed:', error);
    deleteCookie('hash');
    deleteCookie('token');
    updateAuthSnapshot(routeAuthState, null);
    await navigateTo('/login');
  }
});
</script>
<template>
  <div>Logging out...</div>
</template>