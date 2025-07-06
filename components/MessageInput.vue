<!--MessageInput.vue:-->
<template>
  <div class="message-input violet-gradient-theme">
    <textarea v-model="newMessage" @keydown.enter.prevent="handleEnter" ref="textarea" :style="textDirection" :placeholder="placeholderText" @input="adjustHeight" rows="1" class="violet-gradient-input"></textarea>
    <button @click="sendMessage" class="violet-gradient-button">
      <span class="flower-effect">ارسال</span> <span class="small-flower">🌸</span>
    </button>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { post } from '~/composables/post.js';
import { hashOpenChat, responseSentChat, tempMessageSent } from '~/composables/eventBus';

const newMessage = ref('');
const textarea   = ref(null);
const hash       = ref(null);
const isSending  = ref(false);

watch(hashOpenChat, (newVal) => { hash.value = newVal }, { immediate: true });


// MessageInput.vue
const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

  isSending.value = true;
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const messageText = newMessage.value;

  // ایجاد پیام موقت با status: null (در حال ارسال)
  const tempMessage = {
    id: tempId,
    text: messageText,
    sender: 'me',
    created_at: new Date().toISOString(),
    status: null
  };

  // ارسال به tempMessageSent برای نمایش فوری
  tempMessageSent.value = tempMessage;

  try {
    const response = await post('send', {
      receiver: hash.value,
      text: messageText
    });

    if (!response?.success) {
      throw new Error('ارسال ناموفق بود');
    }

    // ارسال پیام موفق - استفاده از responseSentChat
    responseSentChat.value = {
      id: response.id,
      text: messageText,
      sender: response.sender || 'me',
      created_at: response.created_at || new Date().toISOString(),
      status: 1 // وضعیت موفق
    };

    newMessage.value = '';
    playSoftSound();
  } catch (error) {
    console.error('خطا در ارسال پیام:', error);

    // ارسال وضعیت ناموفق - استفاده از tempMessageSent
    tempMessageSent.value = {
      ...tempMessage,
      status: 2 // وضعیت ناموفق
    };

    playErrorSound();
  } finally {
    isSending.value = false;
  }
};


const textDirection = computed(() => {
  const persianRegex = /[\u0600-\u06FF]/;
  return {
    direction: persianRegex.test(newMessage.value) ? 'rtl' : 'ltr',
    textAlign: persianRegex.test(newMessage.value) ? 'right' : 'left'
  };
});
// تشخیص placeholder مناسب

const placeholderText = computed(() => {
  return textDirection.value.direction === 'rtl'
      ? 'پیام عاشقانه بنویس... 🌸'
      : 'Type your sweet message... 🌸';
});
// تنظیم ارتفاع خودکار
const adjustHeight    = () => {
  if ( textarea.value ) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${ textarea.value.scrollHeight }px`;
  }
};
// ارسال پیام جدید

// مدیریت کلید اینتر
const handleEnter = (e) => {
  if ( e.shiftKey ) {
    newMessage.value += '\n';
    adjustHeight();
  } else {
    sendMessage();
  }
};

// پخش صداهای ملایم
const playSoftSound = () => {
  const audio  = new Audio('/assets/Checkeffect.mp3');
  audio.volume = 0.05;
  audio.play().catch(e => console.error('خطا در پخش صدا:', e));
};

const playErrorSound = () => {
  const audio  = new Audio('/assets/Checkeffect.mp3');
  audio.volume = 0.05;
};

watch(newMessage, (val) => {
  if ( !val && textarea.value ) {
    textarea.value.style.height = 'auto';
  }
});
</script>
<style scoped>
@import "assets/css/input.css";
</style>