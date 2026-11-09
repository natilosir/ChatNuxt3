<template>
  <div
    class="sidebar-layer"
    :class="{ 'sidebar-layer-mobile': isMobile }"
    @click.self="closeSidebar"
  >
    <aside class="app-sidebar d-flex flex-column" aria-label="فهرست گفتگوها">
      <div class="sidebar-heading d-flex align-items-center justify-content-between gap-2">
        <div>
          <h2 class="sidebar-title mb-1">گفتگوها</h2>
          <p class="sidebar-subtitle mb-0">ارتباط‌های اخیر شما</p>
        </div>
        <button
          v-if="isMobile"
          type="button"
          class="sidebar-icon-btn btn"
          aria-label="بستن فهرست گفتگوها"
          @click="closeSidebar"
        >
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>

      <div class="search-container d-flex align-items-center gap-2">
        <label class="search-box d-flex align-items-center flex-grow-1">
          <i class="bi bi-search" aria-hidden="true"></i>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="form-control"
            placeholder="جستجوی گفتگو یا نام کاربر..."
            aria-label="جستجوی گفتگوها"
            @keyup.enter="handleSearchEnter"
          />
        </label>
        <button
          type="button"
          class="new-chat-btn btn d-inline-flex align-items-center justify-content-center"
          :disabled="!searchQuery || isBusy"
          aria-label="ایجاد گفتگوی جدید با نام وارد شده"
          title="گفتگوی جدید"
          @click="createNewChat"
        >
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
        </button>
      </div>

      <div class="chat-list-heading d-flex align-items-center justify-content-between">
        <span>پیام‌ها</span>
        <span class="chat-count">{{ filteredChats.length }}</span>
      </div>

      <ChatLoading v-if="isBusy && !chats.length" label="در حال بارگذاری گفتگوها" />

      <div v-else-if="filteredChats.length" class="chat-list flex-grow-1">
        <button
          v-for="chat in filteredChats"
          :key="chat.hash"
          type="button"
          class="chat-item d-flex align-items-center gap-3 w-100 text-start"
          :class="{ active: activeChat === chat.hash }"
          @click="selectChat(chat.hash)"
        >
          <span class="chat-avatar d-inline-flex align-items-center justify-content-center flex-shrink-0">
            {{ getInitials(chat.username) }}
          </span>
          <span class="chat-info d-flex flex-column flex-grow-1 text-truncate">
            <span class="chat-name text-truncate">{{ chat.username || 'کاربر' }}</span>
            <span class="chat-last-msg text-truncate">{{ chat.lastMessage || 'هنوز پیامی ارسال نشده است' }}</span>
          </span>
          <span class="chat-time flex-shrink-0">{{ formatChatTime(chat.time) }}</span>
        </button>
      </div>

      <div v-else class="sidebar-empty d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center">
        <span class="empty-icon d-inline-flex align-items-center justify-content-center mb-3">
          <i class="bi bi-chat-square-dots" aria-hidden="true"></i>
        </span>
        <strong>{{ searchQuery ? 'گفتگویی پیدا نشد' : 'هنوز گفتگویی ندارید' }}</strong>
        <span class="small mt-1">{{ searchQuery ? 'برای شروع، دکمه + را بزنید.' : 'نام کاربر را جستجو کنید و گفتگوی جدید بسازید.' }}</span>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { post } from '~/composables/api/post.ts';
import ChatLoading from '@/components/chat/ChatLoading.vue';
import Swal from 'sweetalert2';

const props = defineProps({
  chats: {
    type: Array,
    default: () => [],
  },
  activeChat: {
    type: String,
    default: null,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select-chat', 'close-sidebar', 'chat-created']);

const searchQuery = ref('');
const isCreatingChat = ref(false);
const isBusy = computed(() => props.loading || isCreatingChat.value);

const filteredChats = computed(() => {
  const query = searchQuery.value.toLocaleLowerCase('fa');
  if (!query) return props.chats;

  return props.chats.filter((chat) =>
    String(chat.username || '').toLocaleLowerCase('fa').includes(query),
  );
});

const getInitials = (username) => String(username || 'چ').trim().charAt(0).toUpperCase();

const formatChatTime = (value) => {
  if (!value) return '';
  const rawValue = String(value);
  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) return rawValue;
  if (!rawValue.includes('T') && !rawValue.includes('-')) return rawValue;

  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

const closeSidebar = () => emit('close-sidebar');

const handleSearchEnter = () => {
  if (!searchQuery.value) return;
  const matchingChat = filteredChats.value[0];
  if (matchingChat) {
    selectChat(matchingChat.hash);
    searchQuery.value = '';
    return;
  }
  createNewChat();
};

const selectChat = (hash) => {
  emit('select-chat', hash);
  if (props.isMobile) closeSidebar();
};

const createNewChat = async () => {
  const username = searchQuery.value.trim();
  if (!username || isCreatingChat.value) return;

  try {
    isCreatingChat.value = true;
    const response = await post('CreateChat', { username });

    if (!response?.hash) {
      throw new Error('پاسخ سرور برای ایجاد گفتگو معتبر نیست.');
    }

    emit('chat-created', {
      hash: response.hash,
      username,
      lastMessage: '',
      time: response.updated_at || new Date().toISOString(),
    });
    searchQuery.value = '';
    selectChat(response.hash);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: `خطای ${error?.status || ''}`,
      text: error?.data?.error || error?.message || 'ایجاد گفتگو انجام نشد.',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  } finally {
    isCreatingChat.value = false;
  }
};
</script>

<style>
@import "@/assets/css/chat/chat-sidebar.css";
</style>
