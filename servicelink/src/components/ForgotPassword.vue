<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <img src="../assets/logo.png" alt="ServiceLink Logo" />
      </div>
      <h2>Forgot Password</h2>
      <p class="subtitle">Enter your email and we'll send you a reset code</p>
      
      <form @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-container">
            <span class="input-icon">✉️</span>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div class="info-message">
          <p><i class="fas fa-info-circle"></i> After submitting, you'll receive a 6-digit code in your email. You'll need this code to reset your password.</p>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="primary-btn" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send Reset Code' }}
          </button>
        </div>
      </form>
      
      <div class="auth-footer">
        <p>Already have a reset code? <router-link :to="{ path: '/reset-password' }">Reset your password</router-link></p>
        <p>Remembered your password? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { authService } from '../services/apiService';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

export default {
  name: 'ForgotPassword',
  setup() {
    const email = ref('');
    const loading = ref(false);
    const router = useRouter();

    const handleForgotPassword = async () => {
      loading.value = true;
      
      try {
        const response = await authService.forgotPassword(email.value);
        
        if (response.success) {
          Swal.fire({
            title: 'Email Sent!',
            text: 'Please check your email for a password reset code',
            icon: 'success',
            confirmButtonColor: '#27ae60',
            confirmButtonText: 'Go to Reset Password'
          }).then((result) => {
            if (result.isConfirmed) {
              // Navigate to reset password page with email prefilled
              router.push({
                path: '/reset-password',
                query: { email: email.value }
              });
            }
          });
          email.value = ''; // Clear the input field after success
        } else {
          Swal.fire({
            title: 'Error',
            text: response.message || 'Failed to send reset email',
            icon: 'error',
            confirmButtonColor: '#27ae60'
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'An error occurred',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      loading,
      handleForgotPassword
    };
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  overflow: hidden;
}

/* Reset any potential spacers or margins */
body, html {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Override any app-level padding */
#app {
  padding-top: 0 !important;
  margin-top: 0 !important;
}

/* Hide the navbar and all mobile navigation elements */
header, nav, .navbar, .nav-container, .navigation-container, 
.mobile-nav-layout, .mobile-top-navbar, .mobile-bottom-navbar, .mobile-top-spacer {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

.auth-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  opacity: 0.1;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  padding: 40px;
  position: relative;
  z-index: 1;
}

.logo {
  text-align: center;
  margin-bottom: 24px;
}

.logo img {
  max-width: 120px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
}

h2 {
  text-align: center;
  color: #106e40;
  font-size: 1.8rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 32px;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

label {
  display: block;
  text-align: left;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.95rem;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #38b676;
  box-shadow: 0 0 0 3px rgba(56, 182, 118, 0.1);
}

.form-actions {
  margin-top: 32px;
}

.primary-btn {
  width: 100%;
  padding: 14px;
  background-color: #106e40;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover:not(:disabled) {
  background-color: #0c5730;
  box-shadow: 0 4px 10px rgba(16, 110, 64, 0.2);
}

.primary-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 32px;
  color: #718096;
  font-size: 0.95rem;
}

.auth-footer a {
  color: #38b676;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.auth-footer a:hover {
  color: #106e40;
  text-decoration: underline;
}

.info-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  font-size: 0.9rem;
  border-left: 4px solid #27ae60;
}

.info-message i {
  margin-right: 8px;
  color: #27ae60;
}
</style>
