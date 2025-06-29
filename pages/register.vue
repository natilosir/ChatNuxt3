<template>
  <div class="light-style layout-wide customizer-hide" dir="ltr" data-theme="theme-default">
    <div class="authentication-wrapper authentication-cover">
      <!-- کپی هدر و لوگو از صفحه لاگین -->

      <div class="authentication-inner row m-0">
        <!-- بخش تصویر (مشابه صفحه لاگین) -->

        <div class="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-5 px-4 py-4">
          <div class="w-px-400 mx-auto pt-5 pt-lg-0">
            <h4 class="mb-2">Create your account</h4>
            <p class="mb-4">Make your app management easy and fun!</p>

            <form class="mb-3" @submit.prevent="handleRegister">
              <div class="form-floating form-floating-outline mb-3">
                <input
                  type="text"
                  class="form-control"
                  v-model="form.username"
                  placeholder="Enter your username"
                />
                <label>Username</label>
              </div>

              <div class="form-floating form-floating-outline mb-3">
                <input
                  type="email"
                  class="form-control"
                  v-model="form.email"
                  placeholder="Enter your email"
                />
                <label>Email</label>
              </div>

              <div class="mb-3">
                <div class="form-password-toggle">
                  <div class="input-group input-group-merge">
                    <div class="form-floating form-floating-outline">
                      <input
                        type="password"
                        class="form-control"
                        v-model="form.password"
                        placeholder="············"
                      />
                      <label>Password</label>
                    </div>
                    <span class="input-group-text cursor-pointer"><i class="mdi mdi-eye-off-outline"></i></span>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="terms" v-model="form.agreeTerms" />
                  <label class="form-check-label" for="terms">
                    I agree to <a href="javascript:void(0);">privacy policy & terms</a>
                  </label>
                </div>
              </div>

              <button class="btn btn-primary d-grid w-100">Sign up</button>
            </form>

            <p class="text-center">
              <span>Already have an account?</span>
              <a href="/auth/login">Sign in instead</a>
            </p>
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
      form: {
        username: '',
        email: '',
        password: '',
        agreeTerms: false
      }
    }
  },
  methods: {
    async handleRegister() {
      try {
        // ثبت‌نام کاربر
        await this.$axios.post('/api/auth/register', this.form)
        // لاگین خودکار بعد از ثبت‌نام
        await this.$auth.loginWith('local', {
          data: {
            email: this.form.email,
            password: this.form.password
          }
        })
        // ریدایرکت به صفحه اصلی
        this.$router.push('/')
      } catch (error) {
        console.error('Registration failed:', error)
      }
    }
  },
  // head و بقیه کدها مانند صفحه لاگین
}
</script>
