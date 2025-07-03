<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <h3>مکالمات</h3>
      <button v-if="isMobile" @click="$emit('close-sidebar')" class="close-btn">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div class="search-container">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input v-model="searchQuery" @keyup.enter="createNewChat" type="text" placeholder="جستجوی کاربران"/>
      </div>
      <button @click="createNewChat" class="new-chat-btn">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>
    <div class="chat-list">
      <div v-for="chat in chats" :key="chat.hash" :class="['chat-item', { active: activeChat === chat.hash }]" @click="selectChat(chat.hash)">
        <div class="chat-avatar">
          {{ getInitials(chat.username) }}
        </div>
        <div class="chat-info">
          <span class="chat-name">{{ chat.username }}</span>
          <span class="chat-last-msg">{{ chat.lastMessage || 'آخرین پیام...' }}</span>
        </div>
        <div class="chat-time">{{ chat.time || '12:30' }}</div>
      </div>
    </div>
  </aside>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { post } from '~/composables/post.js';
import { Auth_user } from '~/composables/eventBus';

const props = defineProps({
  activeChat: {
    type: String,
    default: null
  },
  isMobile: {
    type: Boolean,
    default: false
  }
});

const emit           = defineEmits([ 'select-chat', 'close-sidebar' ]);
const searchQuery    = ref('');
const chats          = ref([]);
const username_login = ref(null);

const fetchChats = async () => {
  try {
    const response = await post('GetChats', {});

    Auth_user.value = response;

    if ( response?.chats && Array.isArray(response.chats) ) {
      chats.value = response.chats.map(chat => ({
        hash: chat.hash,
        username: chat.username,
        lastMessage: '',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      }));

    }
  } catch ( error ) {
    console.error('خطا در دریافت چت‌ها:', error);
    chats.value = [];
  }
};

// گرفتن حروف ابتدایی نام
const getInitials = (name) => {
  if ( !name ) return '';
  return name.substring(0, 1).toUpperCase();
};

// انتخاب چت
const selectChat = (hash) => {
  emit('select-chat', hash);
  if ( props.isMobile ) {
    emit('close-sidebar');
  }
};

// ایجاد چت جدید
const createNewChat = async () => {
  if ( !searchQuery.value ) return;

  try {
    const response = await post('CreateChat', {
      username: searchQuery.value
    });

    if ( response?.hash ) {
      chats.value.unshift({
        hash: response.hash,
        username: searchQuery.value,
        lastMessage: '',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      });
      selectChat(response.hash);
      searchQuery.value = '';
    } else {
      console.error('پاسخ نامعتبر از API ایجاد چت');
    }
  } catch ( error ) {
    console.error('خطا در ایجاد چت:', error);
  }
};

// بارگذاری اولیه چت‌ها
onMounted(() => {
  fetchChats();
});
</script>
<style scoped>
@import "@/assets/css/ChatSidebar.css";
</style>