<template>
  <article class="message" :class="isOwn ? 'sent' : 'received'">
    <div v-if="isOwn && [1, 2].includes(Number(message.status))" class="message-actions" aria-label="عملیات پیام">
      <button
        type="button"
        class="action-btn"
        title="ویرایش پیام"
        aria-label="ویرایش پیام"
        @click="$emit('edit', message)"
      >
        <i class="bi bi-pencil" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        class="action-btn danger"
        title="حذف پیام"
        aria-label="حذف پیام"
        @click="$emit('delete', message.id)"
      >
        <i class="bi bi-trash3" aria-hidden="true"></i>
      </button>
    </div>

    <div class="message-content">
      <p class="message-text" dir="auto">{{ message.text }}</p>
      <div class="message-footer d-flex align-items-center justify-content-end gap-2">
        <span v-if="statusPresentation.kind === 'edited'" class="message-edited" :aria-label="statusPresentation.label" :title="statusPresentation.label">
          <i class="bi" :class="statusPresentation.icon" aria-hidden="true"></i>
          <span>{{ statusPresentation.label }}</span>
        </span>
        <span
          v-else-if="isOwn && statusPresentation.icon"
          class="message-status"
          :class="`is-${statusPresentation.kind}`"
          :aria-label="statusPresentation.label"
          :title="statusPresentation.label"
        >
          <i class="bi" :class="statusPresentation.icon" aria-hidden="true"></i>
        </span>
        <span class="message-time">{{ message.created_at }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { getMessageStatusPresentation } from '~/utils/chat/messageStatus.js';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isOwn: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['edit', 'delete']);

const statusPresentation = computed(() => getMessageStatusPresentation(props.message));
</script>
