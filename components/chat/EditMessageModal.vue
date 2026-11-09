<template>
  <Transition name="message-sheet">
    <div
      v-if="message"
      class="message-modal-backdrop"
      role="presentation"
      @click.self="cancel"
      @keydown.esc="cancel"
    >
      <section
        class="message-modal card border-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-message-title"
      >
        <div class="message-modal-handle" aria-hidden="true"></div>
        <div class="card-body p-4">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <div>
              <span class="message-modal-kicker">مدیریت پیام</span>
              <h2 id="edit-message-title" class="h5 mb-0">ویرایش پیام</h2>
            </div>
            <button type="button" class="modal-close-btn btn" aria-label="بستن" @click="cancel">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <textarea
            v-model="editText"
            class="form-control message-edit-field"
            rows="4"
            dir="auto"
            maxlength="5000"
            autofocus
            placeholder="متن پیام را وارد کنید..."
            @keydown.ctrl.enter.prevent="save"
            @keydown.meta.enter.prevent="save"
          ></textarea>

          <div class="d-flex align-items-center justify-content-between gap-2 mt-3">
            <span class="message-edit-hint">برای ذخیره از Ctrl + Enter استفاده کنید</span>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-light" @click="cancel">انصراف</button>
              <button type="button" class="btn btn-primary save-message-btn" :disabled="!editText.trim()" @click="save">
                <i class="bi bi-check2 me-1" aria-hidden="true"></i>
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['save', 'cancel']);
const editText = ref('');

watch(
  () => props.message,
  (message) => {
    editText.value = message?.text || '';
  },
  { immediate: true },
);

const save = () => {
  const text = editText.value.trim();
  if (!text) return;
  emit('save', text);
};

const cancel = () => emit('cancel');
</script>

<style>
@import "@/assets/css/chat/edit-message-modal.css";
</style>
