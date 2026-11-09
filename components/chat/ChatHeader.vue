<template>
  <header class="app-header container-fluid px-3 px-lg-4">
    <div class="header-content d-flex align-items-center justify-content-between gap-3">
      <NuxtLink to="/" class="logo d-inline-flex align-items-center gap-2" aria-label="صفحه اصلی چت‌لند">
        <span class="logo-mark d-inline-flex align-items-center justify-content-center">
          <i class="bi bi-chat-heart-fill" aria-hidden="true"></i>
        </span>
        <span class="logo-name">ChatLand</span>
      </NuxtLink>

      <div class="header-right d-flex align-items-center gap-2 gap-md-3">
        <button
          v-if="isMobile"
          type="button"
          class="header-chat-toggle btn d-inline-flex align-items-center justify-content-center"
          :aria-expanded="isSidebarOpen"
          :aria-label="isSidebarOpen ? 'بستن فهرست گفتگوها' : 'نمایش فهرست گفتگوها'"
          @click="emit('toggle-sidebar')"
        >
          <i :class="isSidebarOpen ? 'bi bi-x-lg' : 'bi bi-chat-left-text'" aria-hidden="true"></i>
        </button>

        <div ref="profileMenuRef" class="profile-menu position-relative">
          <button
            type="button"
            class="user-info btn d-flex align-items-center gap-2"
            :aria-expanded="isMenuOpen"
            aria-haspopup="true"
            @click.stop="toggleMenu"
          >
            <span class="avatar d-inline-flex align-items-center justify-content-center">
              {{ userInitials }}
            </span>
            <span class="profile-copy text-end">
              <span class="username d-block">{{ profileName }}</span>
              <span class="profile-caption d-block">حساب کاربری</span>
            </span>
            <i class="bi bi-chevron-down menu-icon" :class="{ 'rotate-180': isMenuOpen }" aria-hidden="true"></i>
          </button>

          <Transition name="menu-fade">
            <div v-if="isMenuOpen" class="profile-dropdown dropdown-menu show">
              <div class="menu-header d-flex align-items-center gap-3">
                <span class="avatar large d-inline-flex align-items-center justify-content-center">{{ userInitials }}</span>
                <span class="user-details text-truncate">
                  <strong class="d-block text-truncate">{{ profileName }}</strong>
                  <small class="d-block text-truncate">{{ profileEmail || 'حساب کاربری چت‌لند' }}</small>
                </span>
              </div>
              <NuxtLink to="/profile" class="menu-item dropdown-item" @click="isMenuOpen = false">
                <i class="bi bi-person-gear" aria-hidden="true"></i>
                ویرایش پروفایل
              </NuxtLink>
              <NuxtLink to="/settings" class="menu-item dropdown-item" @click="isMenuOpen = false">
                <i class="bi bi-gear" aria-hidden="true"></i>
                تنظیمات حساب
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <button type="button" class="logout-btn btn d-inline-flex align-items-center gap-2" @click="emit('logout')">
          <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
          <span class="logout-text">خروج</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Auth_user } from '~/composables/state/eventBus.js';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['logout', 'toggle-sidebar']);

const isMenuOpen = ref(false);
const profileMenuRef = ref(null);

const profile = computed(() => {
  const source = Auth_user.value?.user ?? Auth_user.value ?? props.user ?? {};
  return source?.user ?? source;
});

const profileName = computed(() =>
  profile.value?.name || profile.value?.username || 'کاربر چت‌لند',
);

const profileEmail = computed(() => profile.value?.email || '');

const userInitials = computed(() => profileName.value.trim().charAt(0).toUpperCase() || 'چ');

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenuOnOutsideClick = (event) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', closeMenuOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', closeMenuOnOutsideClick));
</script>

<style>
@import "@/assets/css/chat/chat-header.css";
</style>
