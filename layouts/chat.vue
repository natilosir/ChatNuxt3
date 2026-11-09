<template>
  <div class="app-container" dir="rtl">
    <ChatHeader
      :is-mobile="isMobile"
      :is-sidebar-open="showSidebar"
      @logout="logout"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="main-content container-fluid">
      <Transition name="slide-fade">
        <main
          v-show="!isMobile || !showSidebar"
          class="chat-view"
          aria-label="محیط گفتگو"
        >
          <slot />
        </main>
      </Transition>

      <Transition name="slide-fade">
        <ChatSidebar
          v-if="!isMobile || showSidebar"
          :chats="chats"
          :active-chat="activeChat"
          :is-mobile="isMobile"
          :loading="isLoadingChats"
          @select-chat="selectChat"
          @chat-created="addChat"
          @close-sidebar="showSidebar = false"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ChatHeader from '@/components/chat/ChatHeader.vue';
import ChatSidebar from '@/components/chat/ChatSidebar.vue';
import { Auth_user, is_Mobile } from '~/composables/state/eventBus.js';
import { post } from '~/composables/api/post.ts';
import { isSameChatSelection } from '~/utils/chat/chatActions.js';

useHead({
  title: 'چت‌لند',
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content',
    },
  ],
});

const route = useRoute();
const chats = ref([]);
const activeChat = ref(route.params._hash || null);
const isMobile = ref(false);
const showSidebar = ref(false);
const isLoadingChats = ref(false);
let chatInterval = null;

const isAccountRoute = (path) => path === '/profile' || path === '/settings';

const shouldShowSidebarOnMobile = () =>
  isMobile.value && !route.params._hash && !isAccountRoute(route.path);

const checkMobile = () => {
  const nextIsMobile = window.innerWidth < 768;
  const breakpointChanged = nextIsMobile !== isMobile.value;

  isMobile.value = nextIsMobile;
  is_Mobile.value = nextIsMobile;

  if (breakpointChanged) {
    showSidebar.value = shouldShowSidebarOnMobile();
  }
};

const normalizeChat = (chat) => ({
  hash: chat.hash,
  username: chat.username,
  lastMessage: chat.last_message?.text || '',
  time: chat.last_message?.created_at || '',
});

const fetchChats = async () => {
  try {
    isLoadingChats.value = true;
    const response = await post('GetChatsData', {});
    Auth_user.value = response;

    if (Array.isArray(response?.chats)) {
      chats.value = response.chats.map(normalizeChat);
    }
  } catch (error) {
    console.error('خطا در دریافت گفتگوها:', error);
  } finally {
    isLoadingChats.value = false;
  }
};

const addChat = (chat) => {
  chats.value = [chat, ...chats.value.filter((item) => item.hash !== chat.hash)];
};

const toggleSidebar = () => {
  if (!isMobile.value) return;
  showSidebar.value = !showSidebar.value;
};

const selectChat = async (hash) => {
  if (!hash) return;

  // Re-selecting the open conversation only closes the mobile list.
  if (isSameChatSelection(route.params._hash, hash)) {
    activeChat.value = hash;
    if (isMobile.value) showSidebar.value = false;
    return;
  }

  activeChat.value = hash;
  if (isMobile.value) showSidebar.value = false;
  await navigateTo(`/chat/${hash}`);
};

const logout = () => navigateTo('/logout');

watch(
  () => [route.path, route.params._hash],
  ([, hash]) => {
    activeChat.value = hash || null;
    if (isMobile.value) showSidebar.value = shouldShowSidebarOnMobile();
  },
);

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile, { passive: true });
  fetchChats();
  chatInterval = window.setInterval(fetchChats, 90000);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
  if (chatInterval) window.clearInterval(chatInterval);
});

provide('chats', chats);
provide('activeChat', activeChat);
provide('selectChat', selectChat);
</script>

<style>
@import "@/assets/css/chat/chat-layout.css";
</style>
