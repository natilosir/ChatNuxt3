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
        <input v-model="searchQuery" @keyup.enter="searchUsers" type="text" placeholder="جستجوی کاربران..."/>
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
          <span class="chat-last-msg">آخرین پیام...</span>
        </div>
        <div class="chat-time">12:30</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { post } from '~/composables/post.js';

const props = defineProps({
  chats: {
    type: Array,
    required: true
  },
  activeChat: {
    type: String,
    default: null
  },
  isMobile: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select-chat', 'close-sidebar']);
const searchQuery = ref('');

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const selectChat = (hash) => {
  emit('select-chat', hash);
};

const searchUsers = async () => {
  try {
    const response = await post('search', { q: searchQuery.value });
    // پردازش پاسخ
    console.log('Search results:', response);
  } catch (error) {
    console.error('Search error:', error);
  }
};

const createNewChat = async () => {
  if (!searchQuery.value) return;

  try {
    const response = await post('CreateChat', { username: searchQuery.value });

    if (response?.success) {
      props.chats.unshift({
        username: searchQuery.value,
        hash: response.hash
      });
      selectChat(response.hash);
    }
  } catch (error) {
    console.error('Create chat error:', error);
  }
};
</script>

<style scoped>
@import "@/assets/css/ChatSidebar.css";
</style>