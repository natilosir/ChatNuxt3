<template>
  <div class="chat-room dark-theme">
    <!-- هدر چت -->
    <div class="chat-room-header">
      <h3>{{ currentChat?.username || 'چت ناشناس' }}</h3>
    </div>
    <!-- محتوای چت -->
    <div v-if="currentChat" class="messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" :class="['message', isMyMessage(message) ? 'sent' : 'received']">
        <div class="message-content">
          <p>{{ message.text }}</p>
          <span class="message-time">{{ message.created_at }}</span>
          <span v-if="isMyMessage(message)" class="message-status">
            <span v-if="message.status === 0">🕓</span> <!-- ارسال شده -->
            <span v-else-if="message.status === 1">✓</span> <!-- تحویل داده شده -->
            <span v-else-if="message.status === 2">✓✓</span> <!-- خوانده شده -->
          </span>
        </div>
        <div v-if="isMyMessage(message)" class="message-actions">
          <button @click="editMessage(message)">ویرایش</button>
          <button @click="deleteMessage(message.id)">حذف</button>
        </div>
      </div>
    </div>
    <div v-else class="load">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
    <!-- کامپوننت ورودی پیام -->
    <MessageInput v-model="newMessage" @send="sendMessage"/>
    <!-- کامپوننت مودال ویرایش -->
    <EditMessageModal v-if="editingMessage" :message="editText" @save="updateMessage" @cancel="cancelEdit"/>
  </div>
</template>
<script setup>
import { setPageLayout } from '#app';
import { post } from '~/composables/post.js';
import MessageInput from '@/components/MessageInput.vue'
import EditMessageModal from '@/components/EditMessageModal.vue'

setPageLayout('chat');

const route = useRoute();
const hash  = route.params._hash;

const user = ref({
  hash: '', // این مقدار از پاسخ سرور پر می‌شود
  id: '',
  username: '',
  name: ''
});

const currentChat       = ref(null);
const messages          = ref([]);
const newMessage        = ref('');
const messagesContainer = ref(null);
let messageInterval     = null;

// تابع کمکی برای بررسی اینکه آیا پیام متعلق به کاربر جاری است
const isMyMessage = (message) => {
  return message.sender === user.value.hash;
};


const loadChatInfo = async () => {
  try {
    const response = await post('AllChats', { receiver: hash });

    // اطلاعات کاربر را از پاسخ سرور پر می‌کنیم
    if ( response.user ) {
      user.value = {
        hash: response.user.hash || '',
        id: response.user.id,
        username: response.user.username,
        name: response.user.name
      };
    }

    // اطلاعات چت جاری را پیدا می‌کنیم
    if ( response.chats ) {
      currentChat.value = response.chats.find(chat => chat.hash === hash) || null;
    }
  } catch ( error ) {
    console.error('خطا در دریافت اطلاعات چت:', error);
  }
};

const loadMessages = async () => {
  try {
    const response = await post('load', { receiver: hash });

    if ( response && Array.isArray(response) ) {
      const newMessages = response.filter(
          newMsg => !messages.value.some(existingMsg => existingMsg.id === newMsg.id)
      );

      if ( newMessages.length > 0 ) {
        messages.value.push(... newMessages);
        scrollToBottom();
      }
    }
  } catch ( error ) {
    console.error('خطا در دریافت پیام‌های جدید:', error);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if ( messagesContainer.value ) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if ( !newMessage.value.trim() ) return;
  await post('send', {
    receiver: hash,
    text: newMessage.value,
  });
  newMessage.value = '';
  await loadMessages();
};

const deleteMessage = async (id) => {
  await post('delete', { id });
  messages.value = messages.value.filter(msg => msg.id !== id);
};

onMounted(async () => {
  await Promise.all([ loadChatInfo(), loadMessages() ]);
  scrollToBottom();
  messageInterval = setInterval(loadMessages, 4000);
});

onBeforeUnmount(() => {
  clearInterval(messageInterval);
});
</script>
<style>
@import "@/assets/css/chat.css";
</style>