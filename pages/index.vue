<template>
  <div>
    INDEX PAGE
  </div>
</template>
<script setup>
import { check } from '~/utils/check.js';
import { setPageLayout } from "#app";

setPageLayout('chat');


let auth = await check();

if ( Boolean(auth.isLoggedIn) === false ) {
  navigateTo('/login');
}
</script>