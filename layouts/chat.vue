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
        <ChatSidebar
            v-if="!isMobile || showSidebar"
            :chats="chats"
            :activeChat="activeChat"
            :isMobile="isMobile"
            @select-chat="selectChat"
            @close-sidebar="showSidebar = false"
        />
      </transition>
      <button v-if="isMobile" @click="toggleSidebar" class="sidebar-toggle-btn">
        <i class="bi" :class="showSidebar ? 'bi-x-lg' : 'bi-list'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const user = ref({
  username: '',
  hash: ''
});
const chats = ref([]);
const activeChat = ref(null);
const isMobile = ref(false);
const showSidebar = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
});

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const selectChat = (hash) => {
  activeChat.value = hash;
  navigateTo(`/chat/${hash}`);
  if (isMobile.value) showSidebar.value = false;
};

const logout = () => {
  navigateTo('/logout');
};
</script>

<style>
@import "@/assets/css/layoutChat.css";
</style>