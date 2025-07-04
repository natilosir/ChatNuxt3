<template>
  <header class="app-header">
    <div class="header-content">
      <NuxtLink to="/" class="logo">
        <i class="bi bi-chat-dots-fill"></i> <span>ChatLand</span>
      </NuxtLink>
      <div class="header-right">
        <div v-if="SelectChat" class="select-chat">
          {{ SelectChat?.username }} -
          {{ SelectChat?.name }}
        </div>
        <div class="profile-menu" @click.stop="toggleMenu">
          <div class="user-info">
            <div class="avatar">
              {{ getInitials(name?.user.username) }}
            </div>
            <span class="username">{{ name?.user.name }}</span>
            <i class="bi bi-chevron-down menu-icon" :class="{ 'rotate-180': isMenuOpen }"></i>
          </div>
          <transition name="slide-fade">
            <div v-if="isMenuOpen" class="dropdown-menu" @click.stop>
              <div class="menu-header">
                <div class="avatar large">
                  {{ userInitials }}
                </div>
                <div class="user-details">
                  <h4>{{ user?.username }}</h4>
                  <p>{{ user?.email }}</p>
                </div>
              </div>
              <hr>
              <NuxtLink to="/profile" class="menu-item" @click="isMenuOpen = false">
                <i class="bi bi-pencil-square"></i> ویرایش پروفایل
              </NuxtLink>
              <NuxtLink to="/settings" class="menu-item" @click="isMenuOpen = false">
                <i class="bi bi-gear"></i> تنظیمات حساب
              </NuxtLink>
            </div>
          </transition>
        </div>
        <button @click="$emit('logout')" class="logout-btn">
          <i class="bi bi-box-arrow-right"></i> <span class="logout-text">خروج</span>
        </button>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ref, watch } from 'vue';
import { Auth_user, MessUser } from '~/composables/eventBus';


const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

const isMenuOpen = ref(false);

const name       = ref(null);
const SelectChat = ref(null);

watch(Auth_user, (newVal) => {name.value = newVal}, { immediate: false });
watch(MessUser, (newVal) => {SelectChat.value = newVal.user}, { immediate: false });


defineEmits([ 'logout' ]);


const getInitials = (name) => {
  if ( !name ) return '';
  return name.substring(0, 1).toUpperCase();
};


const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};


const handleClickOutside = (event) => {
  if ( isMenuOpen.value ) {
    const profileMenu = document.querySelector('.profile-menu');
    if ( profileMenu && !profileMenu.contains(event.target) ) {
      isMenuOpen.value = false;
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
<style>
@import "@/assets/css/ChatHeadeer.css";
</style>