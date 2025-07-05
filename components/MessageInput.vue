<template>
  <div class="message-input violet-gradient-theme">
    <textarea
        v-model="newMessage"
        @keydown.enter.prevent="handleEnter"
        ref="textarea"
        :style="textDirection"
        :placeholder="placeholderText"
        @input="adjustHeight"
        rows="1"
        class="violet-gradient-input"
    ></textarea>
    <button @click="sendMessage" class="violet-gradient-button">
      <span class="flower-effect">ارسال</span>
      <span class="small-flower">🌸</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const newMessage = ref('');
const textarea = ref(null);

const textDirection = computed(() => {
  const persianRegex = /[\u0600-\u06FF]/;
  return {
    direction: persianRegex.test(newMessage.value) ? 'rtl' : 'ltr',
    textAlign: persianRegex.test(newMessage.value) ? 'right' : 'left'
  };
});

const placeholderText = computed(() => {
  return textDirection.value.direction === 'rtl'
      ? 'پیام عاشقانه بنویس... 🌸'
      : 'Type your sweet message... 🌸';
});

// تنظیم ارتفاع خودکار
const adjustHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
};

// ارسال پیام جدید
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    let messageToSend = newMessage.value;

    if (textDirection.value.direction === 'rtl') {
      messageToSend = '🌸 ' + messageToSend + ' 🌸';
    }

    const response = await post('send', {
      receiver: hash,
      text: messageToSend
    });

    if (response.success) {
      newMessage.value = '';
      if (textarea.value) {
        textarea.value.style.height = 'auto';
      }
      await loadMessages();
      scrollToBottom();
      playSoftSound();
    }
  } catch (error) {
    console.error('خطا در ارسال پیام:', error);
    playErrorSound();
  }
};

// مدیریت کلید اینتر
const handleEnter = (e) => {
  if (e.shiftKey) {
    newMessage.value += '\n';
    adjustHeight();
  } else {
    sendMessage();
  }
};

// پخش صداهای ملایم
const playSoftSound = () => {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
  audio.volume = 0.2;
  audio.play().catch(e => console.error('خطا در پخش صدا:', e));
};

const playErrorSound = () => {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
  audio.volume = 0.1;
  audio.play().catch(e => console.error('خطا در پخش صدای اشتباه:', e));
};

watch(newMessage, (val) => {
  if (!val && textarea.value) {
    textarea.value.style.height = 'auto';
  }
});
</script>

<style scoped>
@import "assets/css/input.css";
</style>