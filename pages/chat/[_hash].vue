<!--[_hash].vue-->
<template><NuxtPage keepalive />
  <div class="chat-room dark-theme" ref="chatRoomRef">
    <button v-if="showScrollButton" @click.stop="scrollToBottom" class="scroll-to-bottom-btn" title="اسکرول به پایین">↓</button>
    <div v-if="displayedMessages.chats" class="chat-room">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in displayedMessages.chats" :key="index" :class="['message', isMyMessage(message) ? 'sent' : 'received']">
          <div v-if="isMyMessage(message) && message.status === 1" class="message-actions">
            <button @click.stop="editMessage(message)" class="action-btn">✏️</button>
            <button @click.stop="deleteMessage(message.id)" class="action-btn">🗑️</button>
          </div>
          <div class="message-content">
            <p class="message-text">{{ message.text }}</p>
            <div class="message-footer">
              <span class="message-time">{{ message.created_at }}</span>
              <span v-if="isMyMessage(message)" class="message-status">
                <span v-if="message.status === null">🕓</span>
                <span v-else-if="message.status === 0">✔</span>
                <span v-else-if="message.status === 1">✓✓</span>
                <span v-else-if="message.status === 2" class="error">✘</span>
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
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { setPageLayout, useCookie } from '#app';
import { post } from '~/composables/post.js';
import { hashOpenChat, MessUser, responseSentChat, tempMessageSent } from '~/composables/eventBus';
import MessageInput from '@/components/MessageInput.vue';
import EditMessageModal from '@/components/EditMessageModal.vue';
import { check } from "~/utils/check.js";

let auth = await check();

if ( Boolean(auth.isLoggedIn) === false ) {
  navigateTo('/login');
}
setPageLayout('chat');

const route             = useRoute();
const chatRoomRef       = ref(null);
const showScrollButton  = ref(false);
const hash              = route.params._hash;
const editingMessage    = ref(null);
const editText          = ref('');
const messages          = ref([]);
const displayedMessages = ref([]);
const newMessage        = ref('');
const messagesContainer = ref(null);
let messageInterval     = null;
const currentChatHash   = ref(hash);
let isRequestInProgress = false;

hashOpenChat.value = hash;


// اضافه کردن یک واچر برای پیام‌های موقت
// واچر برای tempMessageSent
watch(tempMessageSent, (newTempMessage) => {
  if ( !newTempMessage?.id || typeof newTempMessage.id !== 'string' ) {
    console.error('Invalid temp message format', newTempMessage);
    return;
  }

  if ( !displayedMessages.value?.chats ) {
    displayedMessages.value = { chats: [] };
  }

  const existingIndex = displayedMessages.value.chats.findIndex(
      m => m.id === newTempMessage.id
  );

  if ( existingIndex !== -1 ) {
    // به‌روزرسانی پیام موجود
    displayedMessages.value.chats[existingIndex] = { ... newTempMessage };
  } else {
    // اضافه کردن پیام جدید
    displayedMessages.value.chats.push({ ... newTempMessage });
  }

  scrollToBottom();
}, { deep: true });

// واچر برای responseSentChat
watch(responseSentChat, (newResponse) => {
  if ( !newResponse ) return;

  if ( !displayedMessages.value?.chats ) {
    displayedMessages.value = { chats: [] };
  }

  // اضافه کردن بررسی‌های ایمنی
  const tempIndex = displayedMessages.value.chats.findIndex(m => {
    // بررسی وجود id و text
    if ( !m?.id || !m?.text || !newResponse?.text ) return false;

    // بررسی نوع id و امکان استفاده از startsWith
    if ( typeof m.id !== 'string' ) return false;

    // مقایسه متن پیام و بررسی id موقت
    return m.text === newResponse.text && m.id.startsWith('temp-');
  });

  if ( tempIndex !== -1 ) {
    // جایگزینی پیام موقت
    displayedMessages.value.chats[tempIndex] = { ... newResponse };
  } else {
    // اضافه کردن پیام جدید
    displayedMessages.value.chats.push({ ... newResponse });
  }

  scrollToBottom();
}, { deep: true });

useCookie('last_hash').value = hash



watch(() => displayedMessages.value?.chats, (newMessages, oldMessages) => {
  if ( newMessages && newMessages.length !== (oldMessages?.length || 0) ) {
    scrollToBottom();
  }
}, { deep: true });


// واچر برای تغییر هش چت
watch(() => route.params._hash, (newHash) => {
  currentChatHash.value = newHash;
  hashOpenChat.value    = newHash;

  // بارگیری اطلاعات چت جدید
  loadChatInfo();

  // تنظیم مجدد اینتروال
  setupMessageInterval();
});

const isMyMessage = (message) => {
  return message.sender !== hash || message.sender === 'me';
};

const cancelEdit = () => {
  editingMessage.value = null;
  editText.value       = '';
};

const editMessage = (message) => {
  editingMessage.value = message;
  editText.value       = message.text;
};

// بارگیری اطلاعات چت
const loadChatInfo = async () => {
  try {
    const response          = await post('AllChats', { receiver: currentChatHash.value });
    displayedMessages.value = response;
    MessUser.value          = response;
    scrollToBottom('auto');
  } catch ( error ) {
    console.error('خطا در دریافت اطلاعات چت:', error);
  }
};

const loadMessages = async () => {
  if ( isRequestInProgress || !currentChatHash.value ) return;

  try {
    isRequestInProgress = true;
    const response      = await post('load', { receiver: currentChatHash.value });
    if ( Array.isArray(response) ) {
      if ( response.length === 0 ) {
        // فقط وضعیت پیام‌ها را به‌روزرسانی کن
        if ( displayedMessages.value?.chats ) {
          displayedMessages.value.chats.forEach(message => {
            message.status = 1;
          });
        }
      } else {
        if ( response[0] === "X" ) return;
        // پیام‌های جدید را به لیست موجود اضافه کن
        const audio  = new Audio('/assets/sound_in.wav');
        audio.volume = 0.7;
        audio.play().catch(e => console.error('خطا در پخش صدا:', e));
        if ( !displayedMessages.value?.chats ) {
          displayedMessages.value = { chats: [] };
        }

        // فقط پیام‌هایی که قبلاً وجود نداشته‌اند را اضافه کن
        response.forEach(newMessage => {
          const exists = displayedMessages.value.chats.some(
              msg => msg.id === newMessage.id
          );
          if ( !exists ) {

            displayedMessages.value.chats.push(newMessage);
          }
        });
        scrollToBottom('auto');
      }
    } else if ( response?.chats ) {
      // اگر ساختار پاسخ {chats: [...]} بود
      if ( !displayedMessages.value?.chats ) {

        displayedMessages.value = response;
      } else {
        response.chats.forEach(newMessage => {
          const exists = displayedMessages.value.chats.some(
              msg => msg.id === newMessage.id
          );
          if ( !exists ) {

            displayedMessages.value.chats.push(newMessage);
          }
        });
      }
    }

  } catch ( error ) {
    console.error('خطا در دریافت پیام‌های جدید:', error);
  } finally {
    isRequestInProgress = false;
  }
};

// تابع اسکرول به پایین با انیمیشن
const scrollToBottom = (behavior = 'smooth') => {
  const validBehavior = behavior === 'auto' ? 'auto' : 'smooth';

  nextTick(() => {
    const container = chatRoomRef.value?.querySelector('.messages');
    if ( container ) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: validBehavior
      });
    }
  });
};

// بررسی موقعیت اسکرول
const checkScrollPosition = () => {
  const container = chatRoomRef.value?.querySelector('.messages');
  if ( container ) {
    const { scrollTop, scrollHeight, clientHeight } = container;
    showScrollButton.value                          = scrollHeight - (scrollTop + clientHeight) > 350;
  }
};


const deleteMessage = async (id) => {
  await post('delete', { id });
  messages.value = messages.value.filter(msg => msg.id !== id);
};


const setupMessageInterval = () => {
  clearMessageInterval(); // پاک کردن اینتروال قبلی

  messageInterval = setInterval(async () => {
    await loadMessages();
  }, 4000);
};

// پاک کردن اینتروال
const clearMessageInterval = () => {
  if ( messageInterval ) {
    clearInterval(messageInterval);
    messageInterval = null;
  }
};

onMounted(async () => {
  await loadChatInfo();
  scrollToBottom('auto');
  setupMessageInterval(); // شروع اینتروال پس از mount

  if ( messagesContainer.value ) {
    messagesContainer.value.addEventListener('scroll', checkScrollPosition);
  }
});

onBeforeUnmount(() => {
  clearMessageInterval(); // پاک کردن اینتروال هنگام unmount

  if ( messagesContainer.value ) {
    messagesContainer.value.removeEventListener('scroll', checkScrollPosition);
  }
});
</script>
<style>
@import "@/assets/css/chat.css";
</style>