<template>
  <AccountPageShell
    title="تنظیمات حساب"
    subtitle="ترجیحات پیام‌رسان و امنیت حساب خود را مدیریت کنید."
    icon="bi bi-sliders"
  >
    <section class="account-settings-section">
      <div class="account-section-heading">
        <h2>اعلان‌ها و تجربه گفتگو</h2>
        <p>این ترجیحات روی همین مرورگر ذخیره می‌شوند.</p>
      </div>

      <label class="account-setting-row">
        <span class="account-setting-copy">
          <strong>صدای پیام‌ها</strong>
          <small>پخش صدای ارسال، دریافت و خطای پیام</small>
        </span>
        <input v-model="preferences.soundsEnabled" class="form-check-input" type="checkbox" />
      </label>

      <div class="account-form-actions">
        <span class="account-form-hint">ذخیره محلی در مرورگر</span>
        <button class="account-primary-btn btn" type="button" @click="savePreferences">
          <i class="bi bi-check2" aria-hidden="true"></i>
          ذخیره ترجیحات
        </button>
      </div>
    </section>

    <section class="account-settings-section account-settings-security">
      <div class="account-section-heading">
        <h2>امنیت حساب</h2>
        <p>تغییر رمز عبور باید از طریق endpoint رسمی بک‌اند انجام شود.</p>
      </div>

      <div v-if="!settingsEndpoint" class="account-notice" role="status">
        <i class="bi bi-shield-lock" aria-hidden="true"></i>
        <div>
          <strong>مسیر تغییر تنظیمات حساب مشخص نشده است.</strong>
          <p>در ZIP ارسالی، کد بک‌اند و API تغییر رمز یا تنظیمات حساب وجود ندارد. برای جلوگیری از درخواست نامعتبر، فرم تغییر رمز پس از دریافت endpoint و Payload واقعی فعال می‌شود.</p>
        </div>
      </div>

      <form class="account-form" @submit.prevent="saveSecuritySettings">
        <div class="account-form-grid">
          <div class="account-field account-field-full">
            <label for="current-password">رمز عبور فعلی</label>
            <input id="current-password" v-model="passwordForm.currentPassword" class="form-control" type="password" autocomplete="current-password" :disabled="!settingsEndpoint || savingSecurity" />
          </div>
          <div class="account-field">
            <label for="new-password">رمز عبور جدید</label>
            <input id="new-password" v-model="passwordForm.newPassword" class="form-control" type="password" autocomplete="new-password" :disabled="!settingsEndpoint || savingSecurity" />
          </div>
          <div class="account-field">
            <label for="confirm-password">تکرار رمز عبور جدید</label>
            <input id="confirm-password" v-model="passwordForm.confirmPassword" class="form-control" type="password" autocomplete="new-password" :disabled="!settingsEndpoint || savingSecurity" />
          </div>
        </div>

        <div class="account-form-actions">
          <span class="account-form-hint">رمز عبور خود را در اختیار دیگران قرار ندهید.</span>
          <button class="account-primary-btn btn" type="submit" :disabled="!settingsEndpoint || savingSecurity || !canSubmitPassword">
            <span v-if="savingSecurity" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="bi bi-shield-check" aria-hidden="true"></i>
            تغییر رمز عبور
          </button>
        </div>
      </form>
    </section>
  </AccountPageShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import AccountPageShell from '@/components/account/AccountPageShell.vue';
import { post } from '~/composables/api/post.ts';

definePageMeta({ layout: 'chat', middleware: 'auth' });

useHead({ title: 'تنظیمات حساب | چت‌لند' });


const runtimeConfig = useRuntimeConfig();
const settingsEndpoint = String(runtimeConfig.public.accountSettingsUpdateEndpoint || '').trim();
const preferencesCookie = useCookie('chat_preferences', {
  default: () => ({ soundsEnabled: true }),
  maxAge: 60 * 60 * 24 * 365,
});
const preferences = reactive({
  soundsEnabled: preferencesCookie.value?.soundsEnabled !== false,
});
const savingSecurity = ref(false);
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const canSubmitPassword = computed(() =>
  Boolean(passwordForm.currentPassword && passwordForm.newPassword) &&
  passwordForm.newPassword === passwordForm.confirmPassword,
);

const savePreferences = async () => {
  preferencesCookie.value = { ...preferences };
  await Swal.fire({
    icon: 'success',
    title: 'ترجیحات ذخیره شد',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1600,
  });
};

const saveSecuritySettings = async () => {
  if (!settingsEndpoint || !canSubmitPassword.value || savingSecurity.value) return;

  try {
    savingSecurity.value = true;
    const response = await post(settingsEndpoint, {
      current_password: passwordForm.currentPassword,
      password: passwordForm.newPassword,
      password_confirmation: passwordForm.confirmPassword,
    });

    if (response?.success === false) {
      throw new Error(response?.message || 'تغییر رمز عبور توسط سرور تأیید نشد.');
    }

    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    await Swal.fire({
      icon: 'success',
      title: 'رمز عبور تغییر کرد',
      confirmButtonColor: '#8f45d8',
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'تغییر رمز عبور انجام نشد',
      text: error?.data?.message || error?.message || 'لطفاً دوباره تلاش کنید.',
      confirmButtonColor: '#8f45d8',
    });
  } finally {
    savingSecurity.value = false;
  }
};
</script>
