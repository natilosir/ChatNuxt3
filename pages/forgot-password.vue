<template>
  <div class="auth-form">
    <h2>بازیابی رمز عبور <span style="color: #FF5555">🔑</span></h2>
    <p>اطلاعات حساب خود را برای بازیابی رمز عبور وارد کنید</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <input v-model="form.email" type="email" placeholder="ایمیل شما" required>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی' }}
      </button>
      <p class="auth-footer">
        به یاد آوردید؟
        <NuxtLink to="/login">ورود به حساب</NuxtLink>
      </p>
      <p class="auth-footer">
        حساب ندارید؟
        <NuxtLink to="/register">ثبت‌نام</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { post } from '~/composables/Post';
import { ref } from 'vue';
import { setPageLayout, useRouter } from '#app';
import Swal from 'sweetalert2';

const router = useRouter();
const loading = ref(false);
const form = ref({
  email: ''
});

setPageLayout('login');

// تابع برای نمایش پیام‌های خطا
const showErrorMessages = (errorData: Record<string, string[]>) => {
  const errorMessages = Object.values(errorData).flat();
  const firstErrorMessage = errorMessages[0] || 'خطایی رخ داده است';

  Swal.fire({
    icon: 'error',
    title: 'خطا',
    text: firstErrorMessage,
    confirmButtonText: 'متوجه شدم'
  });
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    const response = await post('password/forgot', {
      email: form.value.email
    });

    await Swal.fire({
      icon: 'success',
      title: 'ارسال موفق',
      text: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد',
      confirmButtonText: 'متوجه شدم',
      timer: 3000
    });

    await router.push('/login');

  } catch (error) {
    console.log(error);

    if (error.response?.data) {
      // اگر خطاهای فیلدها وجود دارد
      if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
        showErrorMessages(error.response.data);
      } else {
        // برای خطاهای عمومی
        Swal.fire({
          icon: 'error',
          title: 'خطا',
          text: error.response.data?.message || error.message || 'خطایی در ارسال لینک بازیابی رخ داده است',
          confirmButtonText: 'متوجه شدم'
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: error.message || 'خطایی در ارسال لینک بازیابی رخ داده است',
        confirmButtonText: 'متوجه شدم'
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>