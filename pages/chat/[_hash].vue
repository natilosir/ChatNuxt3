<template>
  <section class="chat-room dark-theme">
    <ChatConversationHeader :user="conversationUser" />

    <button
      v-if="showScrollButton"
      type="button"
      class="scroll-to-bottom-btn btn"
      title="رفتن به آخرین پیام"
      aria-label="رفتن به آخرین پیام"
      @click.stop="scrollToBottom()"
    >
      <i class="bi bi-chevron-down" aria-hidden="true"></i>
    </button>

    <ChatLoading v-if="isLoadingChat" overlay label="در حال بارگذاری پیام‌ها" />

    <div
      v-else
      ref="messagesContainer"
      class="messages"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      @scroll="checkScrollPosition"
    >
      <template v-if="messages.length">
        <ChatMessageItem
          v-for="(message, index) in messages"
          :key="message.id ?? index"
          :message="message"
          :is-own="isOwnMessage(message)"
          @edit="editMessage"
          @delete="deleteMessage"
        />
      </template>

      <div v-else class="messages-empty">
        <i class="bi bi-chat-heart" aria-hidden="true"></i>
        <strong class="d-block mb-1">شروع یک گفتگوی تازه</strong>
        <span>اولین پیام این گفتگو را بنویسید.</span>
      </div>
    </div>

    <MessageInput />

    <EditMessageModal
      :message="editingMessage"
      @save="updateMessage"
      @cancel="cancelEdit"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useChatConversation } from '~/composables/chat/useChatConversation.js';
import ChatConversationHeader from '@/components/chat/ChatConversationHeader.vue';
import ChatLoading from '@/components/chat/ChatLoading.vue';
import ChatMessageItem from '@/components/chat/ChatMessageItem.vue';
import MessageInput from '@/components/chat/MessageInput.vue';
import EditMessageModal from '@/components/chat/EditMessageModal.vue';

definePageMeta({ layout: 'chat', middleware: 'auth' });


const route = useRoute();
const chatHash = computed(() => route.params._hash);

const {
  messages,
  conversationUser,
  editingMessage,
  messagesContainer,
  showScrollButton,
  isLoadingChat,
  isOwnMessage,
  scrollToBottom,
  checkScrollPosition,
  editMessage,
  cancelEdit,
  updateMessage,
  deleteMessage,
} = useChatConversation(chatHash);
</script>

<style>
@import "@/assets/css/chat/conversation.css";
</style>
