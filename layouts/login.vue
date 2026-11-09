<template>
  <div class="authentication-wrapper" dir="rtl">
    <NuxtLink to="/" class="auth-logo d-inline-flex align-items-center gap-2" aria-label="صفحه اصلی چت‌لند">
      <span class="auth-logo-mark d-inline-flex align-items-center justify-content-center">
        <i class="bi bi-chat-heart-fill" aria-hidden="true"></i>
      </span>
      <span>چت‌لند</span>
    </NuxtLink>

    <div class="auth-glow auth-glow-one" aria-hidden="true"></div>
    <div class="auth-glow auth-glow-two" aria-hidden="true"></div>

    <main class="auth-container container">
      <section class="auth-showcase" aria-label="معرفی چت‌لند">
        <span class="auth-showcase-kicker d-inline-flex align-items-center gap-2">
          <i class="bi bi-stars" aria-hidden="true"></i>
          فضای گفتگوی شما
        </span>
        <h1>گفتگوهایت را<br /><span>ادامه بده.</span></h1>
        <p>به چت‌لند برگرد و مکالمه‌هایت را در یک فضای ساده و دلنشین دنبال کن.</p>

        <div class="auth-chat-preview" aria-hidden="true">
          <div class="preview-topbar d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <span class="preview-avatar">ر</span>
              <span>
                <strong class="d-block">گفتگوی دوستانه</strong>
                <small>همیشه در دسترس</small>
              </span>
            </div>
            <i class="bi bi-three-dots" aria-hidden="true"></i>
          </div>
          <div class="preview-messages">
            <span class="preview-bubble preview-bubble-received">سلام! حالت چطوره؟</span>
            <span class="preview-bubble preview-bubble-sent">خوبم، ممنون ازت ✨</span>
            <span class="preview-bubble preview-bubble-received">خوشحالم که برگشتی.</span>
          </div>
          <div class="preview-composer">
            <span>پیام خود را بنویسید...</span>
            <i class="bi bi-send-fill" aria-hidden="true"></i>
          </div>
        </div>
      </section>

      <section class="auth-card">
        <slot />
      </section>
    </main>

    <footer class="auth-page-footer">چت‌لند · گفتگو، ساده‌تر از همیشه</footer>
  </div>
</template>

<style>
@import "@/assets/css/auth/auth-style.css";
</style>
