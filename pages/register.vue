<template>
  <div class="auth-form">
    <h2>ورود در چت‌لند <span style="color: #FF5555">🚀</span></h2>
    <p>مشخصات حساب کاربری خود را وارد کنید</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <input v-model="form.name" placeholder="نام شما">
      </div>
      <div class="form-group">
        <input v-model="form.username" placeholder="نام کاربری">
      </div>
      <div class="form-group">
        <input v-model="form.password" type="password" placeholder="رمز عبور">
      </div>
      <div class="form-group">
        <input v-model="form.password_confirmation" type="password" placeholder="تکرار رمز عبور">
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'در حال ثبت...' : 'ثبت‌نام' }}
      </button>
      <p class="auth-footer">
        قبلاً حساب دارید؟
        <NuxtLink to="/login">ورود</NuxtLink>
      </p>
    </form>
  </div>
</template>
<script setup>
import { post } from '~/composables/Post';
import { ref } from 'vue';
import { setPageLayout, useRouter } from '#app';
import Swal from 'sweetalert2';

const router  = useRouter();
const loading = ref(false);
const form    = ref({
  name: '',
  username: '',
  password: '',
  password_confirmation: '',
});

setPageLayout('login');

const handleSubmit = async () => {
  loading.value = true;

  try {
    const response = await post('register', {
      name: form.value.name,
      username: form.value.username,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    });
    console.log(response)
    if ( response.user.username ) {
      setCookie('hash', response.user.hash, 365);

      await Swal.fire({
        title: 'ورود موفق',
        text: `${ response.user.name } عزیز خوش آمدید `,
        icon: 'success',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'small-swal'
        }
      });
      await router.push('/');
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