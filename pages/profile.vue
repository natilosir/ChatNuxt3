<template>
  <AccountPageShell
    title="ویرایش پروفایل"
    subtitle="اطلاعات نمایشی حساب کاربری خود را مدیریت کنید."
    icon="bi bi-person-gear"
  >
    <div v-if="!profileEndpoint" class="account-notice" role="status">
      <i class="bi bi-info-circle" aria-hidden="true"></i>
      <div>
        <strong>اتصال ذخیره‌سازی پروفایل هنوز تنظیم نشده است.</strong>
        <p>مسیر API و ساختار Payload ویرایش پروفایل در فایل‌های پروژه یا مستندات بک‌اند ارائه نشده است. برای جلوگیری از ارسال درخواست حدسی، دکمه ذخیره تا زمان معرفی endpoint غیرفعال است.</p>
      </div>
    </div>

    <form class="account-form" @submit.prevent="saveProfile">
      <div class="account-form-grid">
        <div class="account-field">
          <label for="profile-name">نام نمایشی</label>
          <input id="profile-name" v-model.trim="form.name" class="form-control" autocomplete="name" :disabled="saving" />
        </div>
        <div class="account-field">
          <label for="profile-username">نام کاربری</label>
          <input id="profile-username" v-model.trim="form.username" class="form-control" autocomplete="username" :disabled="saving" />
        </div>
        <div class="account-field account-field-full">
          <label for="profile-email">ایمیل</label>
          <input id="profile-email" v-model.trim="form.email" class="form-control" type="email" autocomplete="email" :disabled="saving" />
        </div>
      </div>

      <div class="account-form-actions">
        <span class="account-form-hint">اطلاعات فعلی از سرویس احراز هویت خوانده می‌شوند.</span>
        <button class="account-primary-btn btn" type="submit" :disabled="saving || !profileEndpoint || !hasChanges">
          <span v-if="saving" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
          <i v-else class="bi bi-check2" aria-hidden="true"></i>
          ذخیره تغییرات
        </button>
      </div>
    </form>
  </AccountPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import AccountPageShell from '@/components/account/AccountPageShell.vue';
import { post } from '~/composables/api/post.ts';
import { Auth_user } from '~/composables/state/eventBus.js';

definePageMeta({ layout: 'chat', middleware: 'auth' });

useHead({ title: 'ویرایش پروفایل | چت‌لند' });

const runtimeConfig = useRuntimeConfig();
const profileEndpoint = String(runtimeConfig.public.profileUpdateEndpoint || '').trim();
const saving = ref(false);
const authState = useState('chatland:auth-state', () => ({ checked: false, isLoggedIn: false, user: null }));
const user = authState.value?.user || {};
onMounted(() => {
  Auth_user.value = { user };
});

const form = reactive({
  name: user.name || '',
  username: user.username || '',
  email: user.email || '',
});

const original = reactive({
  name: form.name,
  username: form.username,
  email: form.email,
});

const hasChanges = computed(() =>
  form.name !== original.name ||
  form.username !== original.username ||
  form.email !== original.email,
);

const saveProfile = async () => {
  if (!profileEndpoint || saving.value || !hasChanges.value) return;

  try {
    saving.value = true;
    const response = await post(profileEndpoint, {
      name: form.name,
      username: form.username,
      email: form.email,
    });

    if (response?.success === false) {
      throw new Error(response?.message || 'ذخیره پروفایل توسط سرور تأیید نشد.');
    }

    const updatedUser = response?.user || { ...user, ...form };
    Auth_user.value = { user: updatedUser };
    Object.assign(original, form);

    await Swal.fire({
      icon: 'success',
      title: 'پروفایل ذخیره شد',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1800,
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'ذخیره پروفایل انجام نشد',
      text: error?.data?.message || error?.message || 'لطفاً دوباره تلاش کنید.',
      confirmButtonColor: '#8f45d8',
    });
  } finally {
    saving.value = false;
  }
};
</script>
