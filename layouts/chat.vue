<template>
  <div class="authentication-wrapper">
    <!-- لوگو -->
    <NuxtLink to="/" class="auth-logo">
      <span style="color: #FF5555">index</span>
    </NuxtLink>
    <slot/>
  </div>
</template>
<style>
@import "@/assets/css/auth-style.css";

:global(body) {
  margin: 0;
}
</style>
<script setup lang="ts">
import Index from "~/pages/index.vue";
</script>