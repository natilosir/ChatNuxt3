<template>
  <div class="authentication-wrapper">
    <!-- Logo -->
    <nuxt-link to="/" class="auth-logo">
      <span style="color: #6B48FF">Materialize</span>
    </nuxt-link>

    <!-- Main Content -->
    <div class="auth-container">
      <!-- Login Form (Left Side) -->
      <div class="auth-form">
        <h2>Adventure starts here! <span style="color: #FF4444">🚀</span></h2>
        <p>Make your app management easy and fun!</p>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <input type="text" v-model="form.username" placeholder="Enter your username" />
          </div>
          <div class="form-group">
            <input type="email" v-model="form.email" placeholder="Email" />
          </div>
          <div class="form-group">
            <input type="password" v-model="form.password" placeholder="Password" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.agree" /> I agree to privacy policy & terms
            </label>
          </div>
          <button type="submit" :disabled="loading">SIGN UP</button>
          <p class="text-center mt-3">Already have an account? <nuxt-link to="/login">Sign in instead</nuxt-link></p>
          <div class="social-login">
            <a href="/api/auth/facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="/api/auth/twitter"><i class="fab fa-twitter"></i></a>
            <a href="/api/auth/github"><i class="fab fa-github"></i></a>
            <a href="/api/auth/google"><i class="fab fa-google"></i></a>
          </div>
        </form>
      </div>

      <!-- Illustration (Right Side) -->
      <div class="auth-illustration">
        <img src="~/assets/img/illustrations/auth-login-illustration-dark.png" alt="Illustration" class="illustration-img" />
        <div class="stats">
          <div class="stat-card">
            <span class="stat-icon">💰</span>
            <p>$89.34K <br /> Total Profit <br /> Last One Year</p>
            <span class="stat-growth" style="color: #FF4444">+12%</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📈</span>
            <p>24.6K <br /> Total Growth <br /> 12%</p>
            <span class="stat-progress" style="background: conic-gradient(#00FF00 12%, #444 0deg)"></span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">💸</span>
            <p>$48.2K <br /> Total Revenue <br /> +22.5%</p>
          </div>
        </div>
        <div class="cube"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LoginPage',
  setup() {
    const form = ref({
      username: '',
      email: '',
      password: '',
      agree: false,
    });
    const loading = ref(false);

    const handleSubmit = async () => {
      if (loading.value) return;
      loading.value = true;
      // Add your login logic here
      setTimeout(() => {
        loading.value = false;
      }, 1000); // Simulated delay
    };

    return { form, loading, handleSubmit };
  },
};
</script>

<style scoped>
@import "@/assets/css/auth-style.css";
</style>
