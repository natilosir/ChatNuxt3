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
        <NuxtLink to="/">بازیابی رمز</NuxtLink>
      </p>
    </form>
  </div>
</template>
<script setup>
import {post} from '~/composables/Post';
import {ref} from 'vue';
import {setPageLayout, useRouter} from '#app';
import Swal from 'sweetalert2';

const router = useRouter();
const loading = ref(false);
const form = ref({
  username: '',
  password: '',
});

setPageLayout('login');

const handleSubmit = async () => {
  loading.value = true;

  try {
    const response = await post('login', {
      username: form.value.username,
      password: form.value.password
    });

    if (response.token) {
      await Swal.fire({
        icon: 'success',
        title: 'ورود موفق',
        text: 'شما با موفقیت وارد شدید!',
        confirmButtonText: 'ادامه',
        timer: 3000
      });
      await router.push('/dashboard');
    }
  } catch ({data, status}) {

    Swal.fire({
      icon: 'error',
      title: ` خطای${status}`,
      text: data.message,
      confirmButtonText: 'متوجه شدم'
    });
  } finally {
    loading.value = false;
  }
};
</script>