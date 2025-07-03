<template>
  <div class="chat-room">
    <!-- هدر چت -->
    <div class="chat-room-header">
      <h3>{{ currentChat?.username || 'چت ناشناس' }}</h3>
    </div>
    <div v-if="currentChat" class="chat-room">
      <!-- محتوای چت -->
    </div>
    <div v-else>
      در حال بارگذاری...
    </div>
    <!-- پیام‌ها -->
    <div class="messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" :class="['message', message.sender === user.hash ? 'sent' : 'received']">
        <div class="message-content">
          <p>{{ message.text }}</p>
          <span class="message-time">{{ message.date }}</span>
          <span v-if="message.sender === user.hash && message.status === 2" class="message-status edited">(ویرایش شده)</span>
        </div>
        <div v-if="message.sender === user.hash" class="message-actions">
          <button @click="editMessage(message)">ویرایش</button>
          <button @click="deleteMessage(message.id)">حذف</button>
        </div>
      </div>
    </div>
    <!-- ورودی پیام -->
    <div class="message-input">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="پیام خود را بنویسید..."/>
      <button @click="sendMessage">ارسال</button>
    </div>
    <!-- مودال ویرایش پیام -->
    <div v-if="editingMessage" class="edit-modal">
      <div class="modal-content">
        <h3>ویرایش پیام</h3>
        <textarea v-model="editText"></textarea>
        <div class="modal-actions">
          <button @click="updateMessage">ذخیره</button>
          <button @click="cancelEdit">انصراف</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { setPageLayout } from "#app";
import { post } from '~/composables/post.js';

const route = useRoute();
const hash  = route.params.hash;
setPageLayout('chat');

const user              = ref({});
const currentChat       = ref(null);
const messages          = ref([]);
const newMessage        = ref('');
const editingMessage    = ref(null);
const editText          = ref('');
const messagesContainer = ref(null);

defineProps({
  currentChat: {
    type: Object,
    default: () => null
  }
})



const loadChatInfo = async () => {
  try {
    const response    = await post('AllChats/',{
      receiver : hash
    });
    currentChat.value = response.data;
  } catch ( error ) {
    console.error('خطا در دریافت اطلاعات چت:', error);
    // مدیریت خطا (مثلاً ریدایرکت یا نمایش پیغام)
  }
};



Promise.all([ loadChatInfo() ]).then(() => {
  scrollToBottom();
});

// ارسال پیام جدید
const sendMessage = async () => {
  if ( !newMessage.value.trim() ) return;

  try {
    const response = await post('send', {
      receiver: hash,
      text: newMessage.value
    });

    if ( response.success ) {
      newMessage.value = '';
      await loadMessages();
      scrollToBottom();
    }
  } catch ( error ) {
    console.error('خطا در ارسال پیام:', error);
  }
};

// ویرایش پیام
const editMessage = (message) => {
  editingMessage.value = message.id;
  editText.value       = message.text;
};

const updateMessage = async () => {
  try {
    const response = await post('edit', {
      id: editingMessage.value,
      text: editText.value
    });

    if ( response.success ) {
      editingMessage.value = null;
      await loadMessages();
    }
  } catch ( error ) {
    console.error('خطا در ویرایش پیام:', error);
  }
};

const cancelEdit = () => {
  editingMessage.value = null;
};

// حذف پیام
const deleteMessage = async (id) => {
  try {
    const response = await post('delete', {
      id: id
    });

    if ( response.success ) {
      await loadMessages();
    }
  } catch ( error ) {
    console.error('خطا در حذف پیام:', error);
  }
};

// اسکرول به پایین
const scrollToBottom = () => {
  nextTick(() => {
    if ( messagesContainer.value ) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// بارگذاری خودکار پیام‌های جدید
onMounted(() => {
  scrollToBottom();

  setInterval(async () => {
    try {
      const response = await post('load', {
        receiver: hash
      });

      if ( response && response.length > 0 ) {
        const newMessages = response.filter(newMsg =>
            !messages.value.some(existingMsg => existingMsg.id === newMsg.id)
        );

        if ( newMessages.length > 0 ) {
          messages.value.push(... newMessages);
          scrollToBottom();
        }
      }
    } catch ( error ) {
      console.error('خطا در دریافت پیام‌های جدید:', error);
    }
  }, 5000);
});
</script>
<style>
@import "@/assets/css/chat.css";
</style>