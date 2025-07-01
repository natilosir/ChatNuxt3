<!-- pages/auth/register.vue -->
<template>
  <div class="auth-form">
    <h2>به چت‌لند خوش آمدید <span style="color: #FF5555">🎉</span></h2>
    <p>مشخصات حساب کاربری خود را وارد کنید</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <input type="text" v-model="form.username" placeholder="نام کاربری"/>
      </div>
      <div class="form-group">
        <input type="password" v-model="form.password" placeholder="رمز عبور"/>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '... در حال ورود' : 'ورود' }}
      </button>
      <p class="text-center mt-3">
        حساب کاربری ندارید؟
        <NuxtLink to="/register"> ثبت نام کنید</NuxtLink>
      </p>
      <p class="text-center">
        رمز عبور خود را فراموش کرده‌اید؟
        <NuxtLink to="/forgot-password">بازیابی رمز</NuxtLink>
      </p>
    </form>
  </div>
</template>
<script setup>
import { setPageLayout, useRouter } from '#app';
import { post } from '~/composables/post.js';
import { ref } from 'vue';

setPageLayout('login');
import { check } from '~/utils/check.js';
import Swal from 'sweetalert2';

const router  = useRouter();
const loading = ref(false);
const form    = ref({
  username: '',
  password: '',
});

const auth = await check();

if ( auth.isLoggedIn === true ) {
  navigateTo('/');
}


const handleSubmit = async () => {
  loading.value = true;

  try {
    const response = await post('login', {
      username: form.value.username,
      password: form.value.password
    });

    if ( response.user.username ) {
      setCookie('hash', response.user.hash, 365);
      await Swal.fire({
        title: 'ورود موفق',
        text: `${ response.user.name } عزیز خوش آمدید `,
        icon: 'success',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: 'small-swal'
        }
      });
      navigateTo('/');
    }

  } catch ( { data, status } ) {

    Swal.fire({
      icon: 'error',
      title: ` خطای${ status }`,
      text: data.message,
      confirmButtonText: 'متوجه شدم'
    });
  } finally {
    loading.value = false;
  }
};
</script>