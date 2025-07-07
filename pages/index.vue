<template>
  <div class="welcome-page">
    <h1>💫 به چت‌لند خوش آمدید</h1>
    <p>برای شروع یک چت جدید، از منوی سمت راست استفاده کنید.</p>
  </div>
</template>
<script setup>
import { check } from '~/utils/check.js';
import { setPageLayout, useCookie } from "#app";

setPageLayout('chat');

let auth = await check();

if ( Boolean(auth.isLoggedIn) === false ) {
  navigateTo('/login');
} else {
  let last_hash;
  last_hash = useCookie('last_hash').value
  if ( last_hash ) {
    await navigateTo(`/chat/${ last_hash }`);
  }
}
</script>
<style>
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}
</style>