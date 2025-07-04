<template>
  <div class="chat-room dark-theme">
    <!-- هدر چت -->
    <div class="chat-room-header">
      <h3>{{ messages?.username || 'چت ناشناس' }}</h3>
    </div>
    <!-- محتوای چت -->
    <div v-if="messages" class="chat-room">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in displayedMessages.chats" :key="index" :class="['message', isMyMessage(message) ? 'sent' : 'received']">
          <div v-if="isMyMessage(message)" class="message-actions">
            <button @click.stop="editMessage(message)" class="action-btn">✏️</button>
            <button @click.stop="deleteMessage(message.id)" class="action-btn">🗑️</button>
          </div>
          <div class="message-content">
            <p class="message-text">{{ message.text }}</p>
            <div class="message-footer">
              <span class="message-time">{{ message.created_at }}</span>
              <span v-if="isMyMessage(message)" class="message-status">
            <span v-if="message.status === 0">🕓</span>
            <span v-else-if="message.status === 1">✓</span>
            <span v-else-if="message.status === 2">✓✓</span>
          </span>
            </div>
          </div>
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
import { MessUser } from '~/composables/eventBus';
import MessageInput from '@/components/MessageInput.vue'
import EditMessageModal from '@/components/EditMessageModal.vue'

setPageLayout('chat');

const route          = useRoute();
const hash           = route.params._hash;
const editingMessage = ref(null);
const editText       = ref('');
let messages         = ref([]);

const displayedMessages = ref([]);
const newMessage        = ref('');
const messagesContainer = ref(null);
let messageInterval     = null;

const isMyMessage = (message) => {
  return message.sender !== hash;
};

const cancelEdit = () => {
  editingMessage.value = null;
  editText.value       = '';
};

const editMessage = (message) => {
  editingMessage.value = message;
  editText.value       = message.text;
};


const loadChatInfo = async () => {
  try {
    let response;
    response = await post('AllChats', { receiver: hash });
    displayedMessages.value = response
    MessUser.value = response;

  } catch ( error ) {
    console.error('خطا در دریافت اطلاعات چت:', error);
  }
};


onMounted(() => {
  loadChatInfo();
});


const loadMessages = async () => {
  // try {
  //   const response = await post('load', { receiver: hash });
  //
  //   if ( response && Array.isArray(response) ) {
  //     const newMessages = response.filter(
  //         newMsg => !messages.value.some(existingMsg => existingMsg.id === newMsg.id)
  //     );
  //
  //     if ( newMessages.length > 0 ) {
  //       messages.value.push(... newMessages);
  //       scrollToBottom();
  //     }
  //   }
  // } catch ( error ) {
  //   console.error('خطا در دریافت پیام‌های جدید:', error);
  // }
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
  await Promise.all([ loadMessages() ]);
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