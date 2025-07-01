<script setup>
import { setPageLayout, useRouter } from '#app';
import { deleteCookie, post } from '~/composables/post.js';

const router   = useRouter();
setPageLayout('login');

onMounted(async () => {
  const response = await post('logout');
  if ( response.status === true ) {
    deleteCookie('hash')
    await navigateTo('/login');
  }
});
</script>
<template>
  <div>Logging out...</div>
</template>