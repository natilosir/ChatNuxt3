<template>
  <div class="chat-room">
    <!-- هدر چت -->
    <div class="chat-room-header">
      <h3>{{ currentChat.username }}</h3>
    </div>

    <!-- پیام‌ها -->
    <div class="messages" ref="messagesContainer">
      <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.sender === user.hash ? 'sent' : 'received']"
      >
        <div class="message-content">
          <p>{{ message.text }}</p>
          <span class="message-time">{{ message.created_at }}</span>
          <span
              v-if="message.sender === user.hash && message.status === 2"
              class="message-status edited"
          >(ویرایش شده)</span>
        </div>
        <div
            v-if="message.sender === user.hash"
            class="message-actions"
        >
          <button @click="editMessage(message)">ویرایش</button>
          <button @click="deleteMessage(message.id)">حذف</button>
        </div>
      </div>
    </div>

    <!-- ورودی پیام -->
    <div class="message-input">
      <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="پیام خود را بنویسید..."
      />
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
const route = useRoute();
const hash = route.params.hash;

const user = ref({});
const currentChat = ref({});
const messages = ref([]);
const newMessage = ref('');
const editingMessage = ref(null);
const editText = ref('');
const messagesContainer = ref(null);

// دریافت اطلاعات کاربر و چت
const { data: userData } = await useFetch('/api/user');
user.value = userData.value;

const { data: chatData } = await useFetch(`/api/chat-info/${hash}`);
currentChat.value = chatData.value;

// بارگذاری پیام‌ها
const loadMessages = async () => {
  const { data } = await useFetch('/api/chats', {
    method: 'POST',
    body: { receiver: hash }
  });
  messages.value = data.value;
};

await loadMessages();

// ارسال پیام جدید
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const { data } = await useFetch('/api/send', {
    method: 'POST',
    body: {
      receiver: hash,
      text: newMessage.value
    }
  });

  if (data.value.success) {
    newMessage.value = '';
    await loadMessages();
    scrollToBottom();
  }
};

// ویرایش پیام
const editMessage = (message) => {
  editingMessage.value = message.id;
  editText.value = message.text;
};

const updateMessage = async () => {
  const { data } = await useFetch('/api/edit', {
    method: 'POST',
    body: {
      id: editingMessage.value,
      text: editText.value
    }
  });

  if (data.value.success) {
    editingMessage.value = null;
    await loadMessages();
  }
};

const cancelEdit = () => {
  editingMessage.value = null;
};

// حذف پیام (در صورت نیاز می‌توانید پیاده‌سازی کنید)
const deleteMessage = (id) => {
  // عملیات حذف پیام
};

// اسکرول به پایین
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// بارگذاری خودکار پیام‌های جدید
onMounted(() => {
  scrollToBottom();

  // پولینگ برای پیام‌های جدید
  setInterval(async () => {
    const { data } = await useFetch('/api/load', {
      method: 'POST',
      body: { receiver: hash }
    });

    if (data.value && data.value.length > 0) {
      messages.value.push(...data.value);
      scrollToBottom();
    }
  }, 5000);
});
</script>

<style>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-room-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border-radius: 1rem 1rem 0 1rem;
  padding: 0.5rem 1rem;
}

.message.received {
  align-self: flex-start;
  background-color: #f8f9fa;
  border-radius: 1rem 1rem 1rem 0;
  padding: 0.5rem 1rem;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-status.edited {
  font-size: 0.75rem;
  font-style: italic;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.message-actions button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.message-input {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.message-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.message-input button {
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 80%;
  max-width: 500px;
}

.modal-content textarea {
  width: 100%;
  min-height: 100px;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>