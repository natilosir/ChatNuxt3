<template>
  <ChatWelcome />
</template>

<script setup>
import ChatWelcome from '@/components/chat/ChatWelcome.vue';

definePageMeta({ layout: 'chat', middleware: 'auth' });

const lastHashCookie = useCookie('last_hash');

const lastHash = lastHashCookie.value;
if (lastHash) {
  await navigateTo(`/chat/${lastHash}`);
}
</script>
