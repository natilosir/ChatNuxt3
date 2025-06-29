<template>
  <div class="light-style layout-wide customizer-hide" dir="ltr" data-theme="theme-default">
    <div class="authentication-wrapper authentication-cover">
      <!-- کپی هدر و لوگو از صفحه لاگین -->

      <div class="authentication-inner row m-0">
        <!-- بخش تصویر (مشابه صفحه لاگین) -->

        <div class="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-5 px-4 py-4">
          <div class="w-px-400 mx-auto pt-5 pt-lg-0">
            <h4 class="mb-2">Forgot Password? 🔒</h4>
            <p class="mb-4">Enter your email and we'll send you instructions to reset your password</p>

            <form class="mb-3" @submit.prevent="handleForgotPassword">
              <div class="form-floating form-floating-outline mb-3">
                <input
                  type="email"
                  class="form-control"
                  v-model="email"
                  placeholder="Enter your email"
                />
                <label>Email</label>
              </div>

              <button class="btn btn-primary d-grid w-100">Send Reset Link</button>
            </form>

            <div class="text-center">
              <a href="/auth/login" class="d-flex align-items-center justify-content-center">
                <i class="mdi mdi-chevron-left scaleX-n1-rtl"></i>
                Back to login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: ''
    }
  },
  methods: {
    async handleForgotPassword() {
      try {
        await this.$axios.post('/api/auth/forgot-password', { email: this.email })
        this.$toast.success('Reset password link has been sent to your email')
      } catch (error) {
        this.$toast.error('Failed to send reset link')
      }
    }
  },
  // head و بقیه کدها مانند صفحه لاگین
}
</script>
