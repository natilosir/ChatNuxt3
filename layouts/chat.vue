<template>
  <div class="chat-layout">
    <!-- هدر -->
    <header class="chat-header">
      <NuxtLink to="/" class="logo">
        <span style="color: #FF5555">Chat App</span>
      </NuxtLink>
      <div class="user-info">
        <span>{{ user?.username }}</span>
        <button @click="logout">خروج</button>
      </div>
    </header>

    <div class="chat-container">
      <!-- سایدبار -->
      <aside class="chat-sidebar">
        <div class="search-box">
          <input
              v-model="searchQuery"
              placeholder="جستجوی کاربران..."
              @keyup.enter="searchUsers"
          />
          <button @click="createNewChat">چت جدید</button>
        </div>
        <div class="chat-list">
          <div
              v-for="chat in chats"
              :key="chat.hash"
              :class="['chat-item', { active: activeChat === chat.hash }]"
              @click="selectChat(chat.hash)"
          >
            <span>{{ chat.username }}</span>
          </div>
        </div>
      </aside>

      <!-- محتوای اصلی چت -->
      <main class="chat-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const user = ref({
  username: '',
  hash: ''
});
const chats = ref([]);
const activeChat = ref(null);
const searchQuery = ref('');

const { data: userData } = await useFetch('/api/user');
user.value = userData.value;

const { data: chatsData } = await useFetch('/api/chats');
chats.value = chatsData.value;

const selectChat = (hash) => {
  activeChat.value = hash;
  navigateTo(`/chat/${hash}`);
};

const searchUsers = async () => {
  const { data } = await useFetch('/api/search', {
    params: { q: searchQuery.value }
  });
  // نمایش نتایج جستجو
};

const createNewChat = async () => {
  if (!searchQuery.value) return;

  const { data } = await useFetch('/api/CreateChat', {
    method: 'POST',
    body: { username: searchQuery.value }
  });

  if (data.value.success) {
    chats.value.unshift({
      username: searchQuery.value,
      hash: data.value.hash
    });
    selectChat(data.value.hash);
  }
};

const logout = () => {
  // عملیات logout
  navigateTo('/logout');
};
</script>

<style>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.chat-container {
  display: flex;
  flex: 1;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.chat-item:hover {
  background-color: #f8f9fa;
}

.chat-item.active {
  background-color: #e9ecef;
}
</style>