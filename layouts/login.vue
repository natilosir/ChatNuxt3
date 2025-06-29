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
      <slot />
    </div>
  </div>
</template>
<style>
@import "@/assets/css/auth-style.css";

:global(body) {
  margin: 0;
  padding: 0;
}
</style>