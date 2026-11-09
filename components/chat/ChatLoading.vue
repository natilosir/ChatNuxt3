<template>
  <div
    class="chat-loading"
    :class="{ 'chat-loading--overlay': overlay }"
    role="status"
    :aria-label="label"
  >
    <span class="visually-hidden">{{ label }}</span>
    <div class="load" aria-hidden="true">
      <div v-for="circle in 5" :key="circle" class="circle"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'در حال بارگذاری',
  },
  overlay: {
    type: Boolean,
    default: false,
  },
});
</script>

<style>
@import "@/assets/css/chat/chat-loading.css";
</style>
