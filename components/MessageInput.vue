<template>
  <!-- ورودی پیام -->
  <div class="message-input">
    <input v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="پیام خود را بنویسید..."/>
    <button @click="sendMessage">
      ارسال
    </button>
  </div>
</template>
<script setup>
// ارسال پیام جدید
const sendMessage = async () => {
  if ( !newMessage.value.trim() ) return;

  try {
    const response = await post('send', {
      receiver: hash,
      text: newMessage.value
    });

    if ( response.success ) {
      newMessage.value = '';
      await loadMessages();
      scrollToBottom();
    }
  } catch ( error ) {
    console.error('خطا در ارسال پیام:', error);
  }
};
</script>