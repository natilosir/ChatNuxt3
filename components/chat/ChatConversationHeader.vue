<template>
  <header class="conversation-header d-flex align-items-center justify-content-between gap-3">
    <div class="conversation-person d-flex align-items-center gap-3 min-w-0">
      <span class="conversation-avatar d-inline-flex align-items-center justify-content-center flex-shrink-0">
        {{ initials }}
      </span>
      <div class="conversation-copy min-w-0">
        <h1 class="conversation-name text-truncate mb-1">{{ displayName }}</h1>
        <span class="conversation-status d-inline-flex align-items-center gap-2">
          <span class="status-dot" :class="{ online: isOnline }" aria-hidden="true"></span>
          {{ isOnline ? 'آنلاین' : 'گفتگو' }}
        </span>
      </div>
    </div>
    <span class="conversation-label d-none d-sm-inline-flex align-items-center gap-2">
      <i class="bi bi-shield-check" aria-hidden="true"></i>
      گفتگوی خصوصی
    </span>
  </header>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
});

const displayName = computed(() =>
  props.user?.name || props.user?.username || 'گفتگو',
);
const initials = computed(() => displayName.value.trim().charAt(0).toUpperCase() || 'چ');
const isOnline = computed(() => Boolean(props.user?.is_online ?? props.user?.online));
</script>
