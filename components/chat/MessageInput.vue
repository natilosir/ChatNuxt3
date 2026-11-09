<template>
  <form class="message-input" @submit.prevent="sendMessage">
    <textarea
      ref="textarea"
      v-model="newMessage"
      class="violet-gradient-input"
      :style="textDirection"
      :placeholder="placeholderText"
      :disabled="isSending"
      rows="1"
      wrap="soft"
      dir="auto"
      aria-label="نوشتن پیام"
      @keydown.enter.prevent="handleEnter"
      @input="adjustHeight"
    ></textarea>

    <button
      type="submit"
      class="violet-gradient-button btn"
      :disabled="!newMessage.trim() || isSending || !hash"
      :aria-label="isSending ? 'در حال ارسال پیام' : 'ارسال پیام'"
      title="ارسال پیام"
    >
      <span v-if="isSending" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <i v-else class="bi bi-send-fill" aria-hidden="true"></i>
    </button>
  </form>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useCookie } from '#app';
import { post } from '~/composables/api/post.ts';
import { hashOpenChat, responseSentChat, tempMessageSent } from '~/composables/state/eventBus.js';

const newMessage = ref('');
const textarea = ref(null);
const hash = ref(null);
const isSending = ref(false);
const preferencesCookie = useCookie('chat_preferences');

watch(hashOpenChat, (newHash) => {
  hash.value = newHash;
}, { immediate: true });

const textDirection = computed(() => {
  const hasPersianText = /[\u0600-\u06FF]/.test(newMessage.value);
  const direction = hasPersianText || !newMessage.value ? 'rtl' : 'ltr';
  return { direction, textAlign: direction === 'rtl' ? 'right' : 'left' };
});

const placeholderText = computed(() =>
  textDirection.value.direction === 'rtl'
    ? 'پیام خود را بنویسید...'
    : 'Write a message...',
);

const adjustHeight = () => {
  if (!textarea.value) return;
  textarea.value.style.height = 'auto';
  textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 132)}px`;
};

const playSound = (source, volume) => {
  if (!import.meta.client || preferencesCookie.value?.soundsEnabled === false) return;
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play().catch(() => {});
};

const sendMessage = async () => {
  const messageText = newMessage.value.trim();
  if (!messageText || isSending.value || !hash.value) return;

  isSending.value = true;
  const receiver = hash.value;
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const tempMessage = {
    id: tempId,
    text: messageText,
    sender: 'me',
    created_at: new Date().toLocaleTimeString('fa-IR'),
    status: null,
    receiver,
  };

  newMessage.value = '';
  await nextTick();
  adjustHeight();
  tempMessageSent.value = tempMessage;

  try {
    const response = await post('send', {
      receiver,
      text: messageText,
    });

    if (!response?.success) throw new Error('ارسال پیام ناموفق بود.');

    responseSentChat.value = {
      id: response.id,
      text: messageText,
      sender: response.sender || 'me',
      created_at: response.created_at,
      status: 0,
      receiver,
    };

    playSound('/assets/sound_out.wav', 0.99);
  } catch (error) {
    console.error('خطا در ارسال پیام:', error);
    tempMessageSent.value = { ...tempMessage, deliveryState: 'failed' };
    playSound('/assets/error.mp3', 0.99);
  } finally {
    isSending.value = false;
    textarea.value?.focus();
  }
};

const handleEnter = (event) => {
  if (event.shiftKey) {
    newMessage.value += '\n';
    nextTick(adjustHeight);
    return;
  }

  sendMessage();
};

watch(newMessage, (value) => {
  if (!value) nextTick(adjustHeight);
});
</script>

<style>
@import "@/assets/css/chat/message-input.css";
</style>
