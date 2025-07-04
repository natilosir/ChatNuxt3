<template>
  <div v-if="editingMessage" class="edit-modal">
    <div class="modal-content">
      <h3>ویرایش پیام</h3>
      <textarea v-model="editText"></textarea>
      <div class="modal-actions">
        <button @click="updateMessage">ذخیره</button>
        <button @click="cancelEdit">انصراف</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { post } from "~/composables/post.js";

const editingMessage = ref(null);
const editText       = ref('');

const editMessage = (message) => {
  editingMessage.value = message;
  editText.value       = message.text;
};

const updateMessage = async () => {
  if ( !editingMessage.value ) return;
  await post('edit', {
    id: editingMessage.value.id,
    text: editText.value,
  });
  editingMessage.value = null;
  editText.value       = '';
  await loadMessages();
};

const cancelEdit = () => {
  editingMessage.value = null;
  editText.value       = '';
};
</script>