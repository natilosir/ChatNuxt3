import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useCookie } from '#app';
import Swal from 'sweetalert2';
import { post } from '~/composables/api/post.ts';
import { hashOpenChat, MessUser, responseSentChat, tempMessageSent } from '~/composables/state/eventBus.js';
import {
  buildDeleteMessagePayload,
  buildEditMessagePayload,
  createSingleFlightByKey,
} from '~/utils/chat/chatActions.js';
import {
  getNewMessages,
  hasMessageId,
  isOwnMessage as checkIsOwnMessage,
  mergeUniqueMessages,
  markMessageAsEdited,
  reconcileSentMessage,
} from '~/utils/chat/chatMessages.js';

// Share request locks across component instances so a duplicated mount cannot
// issue two identical history or polling requests for the same conversation.
const historyRequests = createSingleFlightByKey();
const pollingRequests = createSingleFlightByKey();

/** Owns the lifecycle and state of one chat conversation. */
export function useChatConversation(chatHash) {
  const displayedMessages = ref({ chats: [] });
  const editingMessage = ref(null);
  const messagesContainer = ref(null);
  const showScrollButton = ref(false);
  const isLoadingChat = ref(true);
  const lastHashCookie = useCookie('last_hash');
  const preferencesCookie = useCookie('chat_preferences');

  let messageInterval = null;
  let isRequestInProgress = false;
  let pollingHash = null;
  let loadedHistoryHash = null;
  let initialScrollHash = null;

  const messages = computed(() =>
    Array.isArray(displayedMessages.value?.chats) ? displayedMessages.value.chats : [],
  );

  const conversationUser = computed(() => displayedMessages.value?.user || null);
  const isOwnMessage = (message) => checkIsOwnMessage(message, chatHash.value);

  const isNearBottom = () => {
    const container = messagesContainer.value;
    if (!container) return true;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < 160;
  };

  const scrollToBottom = (behavior = 'smooth') => nextTick(() => {
    const container = messagesContainer.value;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: behavior === 'auto' ? 'auto' : 'smooth',
    });
    showScrollButton.value = false;
  });

  const checkScrollPosition = () => {
    const container = messagesContainer.value;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    showScrollButton.value = distanceFromBottom > 350;
  };

  const playIncomingSound = () => {
    if (!import.meta.client || preferencesCookie.value?.soundsEnabled === false) return;

    const audio = new Audio('/assets/sound_in.wav');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  const normalizeHistoryResponse = (response) => {
    if (!response || typeof response !== 'object') return { chats: [] };

    return {
      ...response,
      chats: Array.isArray(response.chats) ? response.chats : [],
    };
  };

  const loadChatInfo = async (requestedHash = chatHash.value) => {
    if (!requestedHash) return null;

    const requestKey = String(requestedHash);
    if (loadedHistoryHash === requestKey) return displayedMessages.value;

    try {
      isLoadingChat.value = true;
      const response = await historyRequests(requestedHash, () =>
        post('AllChats', { receiver: requestedHash }),
      );

      if (requestKey !== String(chatHash.value)) return null;

      displayedMessages.value = normalizeHistoryResponse(response);
      loadedHistoryHash = requestKey;
      MessUser.value = response;
      isLoadingChat.value = false;

      // The initial history has exactly one initial positioning operation.
      // Subsequent polling must not replay this scroll or reorder the history.
      if (initialScrollHash !== String(requestedHash)) {
        initialScrollHash = String(requestedHash);
        await nextTick();
        await scrollToBottom('auto');
      }

      return response;
    } catch (error) {
      if (String(requestedHash) === String(chatHash.value)) {
        console.error('خطا در دریافت اطلاعات گفتگو:', error);
        displayedMessages.value = { chats: [] };
      }
      return null;
    } finally {
      if (String(requestedHash) === String(chatHash.value)) {
        isLoadingChat.value = false;
      }
    }
  };

  const applyPolledMessages = async (requestedHash, incomingMessages, responseMetadata = {}) => {
    const newMessages = getNewMessages(messages.value, incomingMessages);
    const shouldKeepBottom = isNearBottom();

    displayedMessages.value = {
      ...displayedMessages.value,
      ...responseMetadata,
      chats: mergeUniqueMessages(messages.value, newMessages),
    };

    const hasIncomingMessage = newMessages.some(
      (message) => String(message?.sender ?? '') === String(requestedHash),
    );

    if (hasIncomingMessage) {
      playIncomingSound();

      if (shouldKeepBottom) {
        await scrollToBottom('auto');
      } else {
        await nextTick();
        checkScrollPosition();
      }
    }
  };

  const loadMessages = async () => {
    if (isRequestInProgress || !chatHash.value) return;

    const requestedHash = chatHash.value;

    try {
      isRequestInProgress = true;
      const response = await pollingRequests(requestedHash, () =>
        post('load', { receiver: requestedHash }),
      );

      if (String(requestedHash) !== String(chatHash.value)) return;

      if (Array.isArray(response)) {
        if (response.length === 0) {
          displayedMessages.value = {
            ...displayedMessages.value,
            chats: messages.value.map((message) =>
              message?.sender === 'me' ? { ...message, status: 1 } : message,
            ),
          };
          return;
        }

        if (response[0] === 'X') return;
        await applyPolledMessages(requestedHash, response);
        return;
      }

      if (Array.isArray(response?.chats)) {
        await applyPolledMessages(requestedHash, response.chats, {
          user: response.user ?? displayedMessages.value.user,
        });
      }
    } catch (error) {
      if (String(requestedHash) === String(chatHash.value)) {
        console.error('خطا در دریافت پیام‌های جدید:', error);
      }
    } finally {
      isRequestInProgress = false;
    }
  };

  const editMessage = (message) => {
    if (message?.id === undefined || message?.id === null || !chatHash.value) return;
    editingMessage.value = message;
  };

  const cancelEdit = () => {
    editingMessage.value = null;
  };

  const showActionError = (title, error) => {
    console.error(title, error);
    Swal.fire({
      icon: 'error',
      title: 'عملیات انجام نشد',
      text: error?.data?.message || error?.message || 'لطفاً دوباره تلاش کنید.',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true,
    });
  };

  const updateMessage = async (text) => {
    if (!editingMessage.value || !chatHash.value) return;

    try {
      const messageId = editingMessage.value.id;
      const payload = buildEditMessagePayload(messageId, text, chatHash.value);
      const response = await post('edit', payload);
      if (response?.success === false) {
        throw new Error(response?.message || 'ویرایش پیام توسط سرور تأیید نشد.');
      }

      displayedMessages.value = {
        ...displayedMessages.value,
        chats: markMessageAsEdited(messages.value, messageId, payload.text),
      };
      cancelEdit();
    } catch (error) {
      showActionError('خطا در ویرایش پیام:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!chatHash.value) return;

    try {
      const payload = buildDeleteMessagePayload(messageId, chatHash.value);
      const response = await post('delete', payload);
      if (response?.success === false) {
        throw new Error(response?.message || 'حذف پیام توسط سرور تأیید نشد.');
      }

      displayedMessages.value = {
        ...displayedMessages.value,
        chats: messages.value.filter((message) => !hasMessageId(message, messageId)),
      };
    } catch (error) {
      showActionError('خطا در حذف پیام:', error);
    }
  };

  const clearMessageInterval = () => {
    if (messageInterval) window.clearInterval(messageInterval);
    messageInterval = null;
    pollingHash = null;
  };

  const setupMessageInterval = (requestedHash = chatHash.value) => {
    if (!import.meta.client || !requestedHash) return;
    if (pollingHash === String(requestedHash) && messageInterval) return;

    clearMessageInterval();
    pollingHash = String(requestedHash);

    // Poll only while this tab is visible. This prevents hidden tabs from
    // continuing to produce repeated `load` requests in the network panel.
    messageInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && String(chatHash.value) === pollingHash) {
        loadMessages();
      }
    }, 4000);
  };

  watch(tempMessageSent, (newTempMessage) => {
    if (!newTempMessage?.id || String(newTempMessage.receiver) !== String(chatHash.value)) return;

    const currentMessages = [...messages.value];
    const existingIndex = currentMessages.findIndex((message) =>
      hasMessageId(message, newTempMessage.id),
    );

    if (existingIndex >= 0) {
      currentMessages[existingIndex] = { ...newTempMessage };
    } else {
      currentMessages.push({ ...newTempMessage });
    }

    displayedMessages.value = { ...displayedMessages.value, chats: currentMessages };
    scrollToBottom();
  }, { deep: true });

  watch(responseSentChat, (newResponse) => {
    if (!newResponse || String(newResponse.receiver) !== String(chatHash.value)) return;

    displayedMessages.value = {
      ...displayedMessages.value,
      chats: reconcileSentMessage(messages.value, newResponse),
    };
  }, { deep: true });

  watch(chatHash, async (newHash, previousHash) => {
    if (!newHash || String(newHash) === String(previousHash ?? '')) return;

    clearMessageInterval();
    hashOpenChat.value = newHash;
    lastHashCookie.value = newHash;
    displayedMessages.value = { chats: [] };
    editingMessage.value = null;
    isLoadingChat.value = true;
    loadedHistoryHash = null;
    initialScrollHash = null;

    const response = await loadChatInfo(newHash);
    if (response && String(newHash) === String(chatHash.value)) {
      setupMessageInterval(newHash);
    }
  });

  hashOpenChat.value = chatHash.value;
  lastHashCookie.value = chatHash.value;

  onMounted(async () => {
    const initialHash = chatHash.value;
    if (!initialHash) {
      isLoadingChat.value = false;
      return;
    }

    const response = await loadChatInfo(initialHash);
    if (response && String(initialHash) === String(chatHash.value)) {
      setupMessageInterval(initialHash);
    }
  });

  onBeforeUnmount(clearMessageInterval);

  return {
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
  };
}
