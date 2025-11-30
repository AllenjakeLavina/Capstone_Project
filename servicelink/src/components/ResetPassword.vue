<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <img src="../assets/logo.png" alt="ServiceLink Logo" />
      </div>
      <h2>Reset Password</h2>
      <p class="subtitle">Enter the code sent to your email and your new password</p>
      
      <form @submit.prevent="handleResetPassword">
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
        
        <div class="form-group">
          <label for="reset-code">Reset Code</label>
          <div class="input-container">
            <span class="input-icon">🔑</span>
            <input 
              type="text" 
              id="reset-code" 
              v-model="token" 
              required
              placeholder="Enter 6-digit code"
              minlength="6"
              maxlength="6"
              pattern="[0-9]{6}"
              inputmode="numeric"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="new-password">New Password</label>
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password" 
              id="new-password" 
              v-model="newPassword" 
              required
              placeholder="Enter new password"
              minlength="8"
            />
          </div>
          <div v-if="newPassword && newPassword.length < 8" class="error-message">
            Password must be at least 8 characters long
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password" 
              id="confirm-password" 
              v-model="confirmPassword" 
              required
              placeholder="Confirm new password"
              minlength="8"
            />
          </div>
          <div v-if="!passwordMatch && confirmPassword" class="error-message">
            Passwords do not match
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="primary-btn" :disabled="loading || !passwordMatch || !isFormValid">
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </div>
      </form>
      
      <div class="auth-footer">
        <p>Didn't receive the code? <router-link to="/forgot-password">Request again</router-link></p>
        <p>Remembered your password? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '../services/apiService';
import Swal from 'sweetalert2';

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const email = ref('');
    const token = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);

    // Set email from query parameter if available
    onMounted(() => {
      if (route.query.email) {
        email.value = route.query.email;
      }
    });

    const passwordMatch = computed(() => {
      if (!confirmPassword.value) return true;
      return newPassword.value === confirmPassword.value;
    });
    
    const isFormValid = computed(() => {
      return email.value && 
             token.value && 
             token.value.length === 6 && 
             newPassword.value && 
             newPassword.value.length >= 8 && 
             passwordMatch.value;
    });

    const handleResetPassword = async () => {
      if (!isFormValid.value) {
        return;
      }
      
      loading.value = true;
      
      try {
        const response = await authService.resetPassword(email.value, token.value, newPassword.value);
        
        if (response.success) {
          Swal.fire({
            title: 'Success!',
            text: 'Your password has been reset successfully',
            icon: 'success',
            confirmButtonColor: '#27ae60'
          }).then(() => {
            router.push('/login');
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: response.message || 'Failed to reset password',
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
      token,
      newPassword,
      confirmPassword,
      passwordMatch,
      loading,
      isFormValid,
      handleResetPassword
    };
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  padding: 20px;
  position: relative;
  width: 100%;
  overflow-x: hidden;
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
  max-width: 380px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  padding: 32px 28px;
  position: relative;
  z-index: 1;
}

.logo {
  text-align: center;
  margin-bottom: 20px;
}

.logo img {
  max-width: 100px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
}

h2 {
  text-align: center;
  color: #106e40;
  font-size: 1.6rem;
  margin-bottom: 6px;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 28px;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 20px;
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

.error-message {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.error-message::before {
  content: "⚠️";
  margin-right: 5px;
}

.form-actions {
  margin-top: 28px;
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
  margin-top: 28px;
  color: #718096;
  font-size: 0.9rem;
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

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    max-width: 100%;
    padding: 24px 20px;
  }
  
  .logo img {
    max-width: 80px;
  }
  
  h2 {
    font-size: 1.4rem;
  }
  
  .subtitle {
    font-size: 0.85rem;
    margin-bottom: 24px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-actions {
    margin-top: 24px;
  }
  
  .auth-footer {
    margin-top: 24px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 12px;
  }
  
  .auth-card {
    padding: 20px 16px;
  }
  
  .logo {
    margin-bottom: 16px;
  }
  
  .logo img {
    max-width: 70px;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .subtitle {
    font-size: 0.8rem;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-actions {
    margin-top: 20px;
  }
  
  .auth-footer {
    margin-top: 20px;
    font-size: 0.8rem;
  }
}

/* For very small screens */
@media (max-height: 700px) {
  .auth-container {
    padding: 10px;
  }
  
  .auth-card {
    padding: 20px 16px;
  }
  
  .logo {
    margin-bottom: 12px;
  }
  
  .logo img {
    max-width: 60px;
  }
  
  h2 {
    font-size: 1.2rem;
    margin-bottom: 4px;
  }
  
  .subtitle {
    font-size: 0.8rem;
    margin-bottom: 16px;
  }
  
  .form-group {
    margin-bottom: 14px;
  }
  
  .form-actions {
    margin-top: 16px;
  }
  
  .auth-footer {
    margin-top: 16px;
    font-size: 0.8rem;
  }
}
</style> 