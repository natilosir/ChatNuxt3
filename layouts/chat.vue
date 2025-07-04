<template>
  <div class="app-container" :class="{ 'mobile-view': isMobile }">
    <ChatHeader :user="user" @logout="logout"/>
    <div class="main-content">
      <transition name="slide-fade">
        <main class="chat-view" v-if="!isMobile || !showSidebar">
          <slot/>
        </main>
      </transition>
      <transition name="slide-fade">
        <ChatSidebar v-if="!isMobile || showSidebar" :chats="chats" :activeChat="activeChat" :isMobile="isMobile" @select-chat="selectChat" @close-sidebar="showSidebar = false"/>
      </transition>
      <button v-if="isMobile" @click="toggleSidebar" class="sidebar-toggle-btn">
        <i class="bi" :class="showSidebar ? 'bi-x-lg' : 'bi-list'"></i>
      </button>
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

useHead({
  title: 'چت‌لند'
})
const user        = ref({
  username: '',
  hash: ''
});
const chats       = ref([]);
const activeChat  = ref(null);
const isMobile    = ref(false);
const showSidebar = ref(false);
let chatInterval  = null;

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const fetchChats = async () => {
  try {
    const response = await post('GetChatsData', {});
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
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchChats();
  chatInterval = setInterval(fetchChats, 40000);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
  clearInterval(chatInterval);
});

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const selectChat = (hash) => {
  activeChat.value = hash;
  navigateTo(`/chat/${ hash }`);
  if ( isMobile.value ) showSidebar.value = false;
};

const logout = () => {
  navigateTo('/logout');
};

// فراهم کردن داده‌ها برای کامپوننت‌های فرزند
provide('chats', chats);
provide('activeChat', activeChat);
provide('selectChat', selectChat);
</script>
<style>
@import "@/assets/css/layoutChat.css";
</style>