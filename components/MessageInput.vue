<template>
  <!-- ورودی پیام -->
  <div class="message-input">
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="پیام خود را بنویسید..."/>
    <button @click="sendMessage">
      ارسال
    </button>
  </div>
</template>
<script>

</script>