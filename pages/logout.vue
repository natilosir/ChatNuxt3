<script setup>
import { setPageLayout, useRouter } from '#app';
import { deleteCookie, post } from '~/composables/post.js';

const router = useRouter();
setPageLayout('login');

useHead({
  title: 'Logging out'
})

onMounted(async () => {
  const response = await post('logout');
  try {
    if ( response.status === true ) {
      deleteCookie('hash')
      await navigateTo('/login');
    }
  } catch ( e ) {
    await navigateTo('/');
  }
});
</script>
<template>
  <div>Logging out...</div>
</template>