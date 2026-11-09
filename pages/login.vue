<template>
  <div class="auth-form login-form">
    <div class="auth-form-heading">
      <span class="auth-form-icon d-inline-flex align-items-center justify-content-center">
        <i class="bi bi-person-lock" aria-hidden="true"></i>
      </span>
      <span class="auth-form-kicker">خوش برگشتی</span>
      <h2>ورود به حساب کاربری</h2>
      <p>برای ادامه گفتگوهایت وارد چت‌لند شو.</p>
    </div>

    <form class="auth-login-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="login-username">نام کاربری</label>
        <div class="auth-input-wrap">
          <i class="bi bi-person" aria-hidden="true"></i>
          <input
            id="login-username"
            v-model.trim="form.username"
            class="form-control"
            type="text"
            placeholder="نام کاربری خود را وارد کنید"
            autocomplete="username"
            required
            :disabled="loading"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="login-password">رمز عبور</label>
        <div class="auth-input-wrap">
          <i class="bi bi-lock" aria-hidden="true"></i>
          <input
            id="login-password"
            v-model="form.password"
            class="form-control"
            :type="showPassword ? 'text' : 'password'"
            placeholder="رمز عبور خود را وارد کنید"
            autocomplete="current-password"
            required
            :disabled="loading"
          />
          <button
            type="button"
            class="password-visibility btn"
            :aria-label="showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="auth-form-options d-flex justify-content-end">
        <NuxtLink to="/forgot-password">رمز عبور را فراموش کرده‌اید؟</NuxtLink>
      </div>

      <button class="auth-submit btn w-100" type="submit" :disabled="loading || !form.username || !form.password">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <template v-else>
          ورود به چت‌لند
          <i class="bi bi-arrow-left-short" aria-hidden="true"></i>
        </template>
      </button>

      <p class="auth-register-link mb-0">
        هنوز حساب کاربری نداری؟
        <NuxtLink to="/register">ثبت‌نام کن</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { post, setCookie } from '~/composables/api/post.ts';
import { updateAuthSnapshot, createUncheckedAuthSnapshot } from '~/utils/auth/authState.js';
import Swal from 'sweetalert2';

definePageMeta({ layout: 'login', middleware: 'guest' });

useHead({ title: 'ورود به چت‌لند' });

const routeAuthState = useState('chatland:auth-state', createUncheckedAuthSnapshot);

const loading = ref(false);
const showPassword = ref(false);
const form = ref({
  username: '',
  password: '',
});


const handleSubmit = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await post('login', {
      username: form.value.username.trim(),
      password: form.value.password,
    });

    if (!response?.access_token || !response?.user?.hash) {
      throw new Error(response?.message || 'اطلاعات ورود از سرور کامل دریافت نشد.');
    }

    // Keep the existing one-year client cookie policy; token validity is controlled by the API.
    setCookie('token', response.access_token, 365);
    setCookie('hash', response.user.hash, 365);
    updateAuthSnapshot(routeAuthState, response.user);

    await Swal.fire({
      title: 'ورود موفق',
      text: `${response.user.name || response.user.username} عزیز، خوش آمدید`,
      icon: 'success',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
      customClass: { popup: 'small-swal' },
    });

    await navigateTo('/');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: `خطای ${error?.status || ''}`,
      text: error?.data?.message || error?.message || 'ورود انجام نشد. دوباره تلاش کنید.',
      confirmButtonText: 'متوجه شدم',
      confirmButtonColor: '#8f45d8',
    });
  } finally {
    loading.value = false;
  }
};
</script>
