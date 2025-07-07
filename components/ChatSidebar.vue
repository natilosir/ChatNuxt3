<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
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

    <div v-if="loading" class="load">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>

    <div v-else-if="chats" class="chat-room">
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
    </div>
    <div v-else class="load">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { post } from '~/composables/post.js';
import { Auth_user } from '~/composables/eventBus';
import Swal from "sweetalert2";

const props = defineProps({
  activeChat: { type: String, default: null },
  isMobile: { type: Boolean, default: false }
});
const emit = defineEmits(['select-chat', 'close-sidebar']);
const searchQuery = ref('');
const chats = ref([]);
const loading = ref(false);

const throttledFetchChats = async () => {
  try {
    loading.value = true;
    const response = await post('GetChatsData', {});
    Auth_user.value = response;

    if (response?.chats && Array.isArray(response.chats)) {
      chats.value = response.chats.map(chat => ({
        hash: chat.hash,
        username: chat.username,
        lastMessage: chat.last_message.text,
        time: chat.last_message.created_at,
      }));
    }
  } catch (error) {
    console.error('خطا در دریافت چت‌ها:', error);
    chats.value = [];
  } finally {
    loading.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return '';
  return name.substring(0, 1).toUpperCase();
};

const selectChat = (hash) => {
  emit('select-chat', hash);
  if (props.isMobile) {
    emit('close-sidebar');
  }
};

const createNewChat = async () => {
  if (!searchQuery.value) return;

  try {
    loading.value = true;
    const response = await post('CreateChat', {
      username: searchQuery.value
    });

    if (response?.hash) {
      chats.value.unshift({
        hash: response.hash,
        username: searchQuery.value,
        lastMessage: '',
        time: chat.updated_at,
      });
      selectChat(response.hash);
      searchQuery.value = '';
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: `خطای ${error.status}`,
      text: error.data.error,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  throttledFetchChats();
});
</script>

<style scoped>
@import "@/assets/css/ChatSidebar.css";
</style>