<template>
  <section class="account-page" dir="rtl">
    <div class="account-card">
      <header class="account-page-header">
        <NuxtLink to="/" class="account-back-link">
          <i class="bi bi-arrow-right" aria-hidden="true"></i>
          بازگشت به گفتگوها
        </NuxtLink>
        <div class="account-heading d-flex align-items-center gap-3">
          <span class="account-heading-icon d-inline-flex align-items-center justify-content-center">
            <i :class="icon" aria-hidden="true"></i>
          </span>
          <div class="min-w-0">
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
          </div>
        </div>
      </header>

      <div class="account-page-content">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  icon: { type: String, default: 'bi bi-person-gear' },
});
</script>

<style>
@import "@/assets/css/account/account-pages.css";
</style>
