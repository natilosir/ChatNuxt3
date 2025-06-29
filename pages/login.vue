<template>
  <div class="authentication-wrapper">
    <!-- لوگو -->
    <NuxtLink to="/" class="auth-logo">
      <span style="color: #FF5555">چت‌لند</span>
    </NuxtLink>
    <!-- محتوای اصلی -->
    <div class="auth-container">
      <!-- تصویر و آمار (سمت چپ) -->
      <div class="auth-illustration">
        <img src="~/assets/img/illustrations/auth-login-illustration-dark.png" alt="تصویر چت" class="illustration-img"/>
        <div class="stats">
          <div class="stat-card">
            <span class="stat-icon">💬</span>
            <p>۸۹.۳۴ هزار <br/> گفت‌وگوهای فعال <br/> در یک سال اخیر</p>
            <span class="stat-growth" style="color: #FF5555">+۱۲٪</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📈</span>
            <p>۲۴.۶ هزار <br/> کاربران جدید <br/> ۱۲٪ رشد</p>
            <span class="stat-progress" style="background: conic-gradient(#00FF00 12%, #444 0deg)"></span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🌐</span>
            <p>۴۸.۲ هزار <br/> پیام‌های ارسالی <br/> +۲۲.۵٪</p>
          </div>
        </div>
        <div class="cube"></div>
      </div>
      <!-- فرم ثبت‌نام (سمت راست) -->
      <div class="auth-form">
        <h2>به چت‌لند خوش آمدید! <span style="color: #FF5555">🚀</span></h2>
        <p>ثبت‌نام کنید و به دنیای گفت‌وگو بپیوندید!</p>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <input type="text" v-model="form.username" placeholder="نام کاربری"/>
          </div>
          <div class="form-group">
            <input type="email" v-model="form.email" placeholder="ایمیل"/>
          </div>
          <div class="form-group">
            <input type="password" v-model="form.password" placeholder="رمز عبور"/>
          </div>
          <button type="submit" :disabled="loading">ثبت‌نام</button>
          <p class="text-center mt-3">
            قبلاً حساب دارید؟
            <NuxtLink to="/login">وارد شوید</NuxtLink>
          </p>
          <p class="text-center">
            رمز عبور خود را فراموش کرده‌اید؟
            <NuxtLink to="/forgot-password">بازیابی رمز</NuxtLink>
          </p>
          <div class="social-login">
            <a href="/api/auth/facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="/api/auth/twitter"><i class="fab fa-twitter"></i></a>
            <a href="/api/auth/github"><i class="fab fa-github"></i></a>
            <a href="/api/auth/google"><i class="fab fa-google"></i></a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import Post from '~/composables/Post'

export default {
  data () {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        agree: false,
      },
      loading: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;

      try {
        console.log(this.apiBaseUrl)
        response = await Post('login', {
          name: 'John Doe',
          email: 'john@example.com'
        });

        const data = await response.json();

        if (data.success && data.token) {
          // ذخیره توکن در کوکی با مدت 1 ماه
          this.$cookies.set('auth_token', data.token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 1 ماه به ثانیه
            sameSite: 'lax'
          });

          // هدایت کاربر به صفحه مورد نظر پس از لاگین موفق
          this.$router.push('/dashboard');
        } else {
          // نمایش خطا با SweetAlert
          this.$swal.fire({
            icon: 'error',
            title: 'خطا در ورود',
            text: data.message || 'نام کاربری یا رمز عبور اشتباه است',
            confirmButtonText: 'متوجه شدم'
          });
        }
      } catch (error) {
        console.error('Error during login:', error);
        this.$swal.fire({
          icon: 'error',
          title: 'خطای ارتباط',
          text: 'مشکلی در ارتباط با سرور پیش آمده است',
          confirmButtonText: 'متوجه شدم'
        });
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>
<style scoped>
@import "@/assets/css/auth-style.css";

:global(body) {
  margin: 0;
  padding: 0;
}
</style>
