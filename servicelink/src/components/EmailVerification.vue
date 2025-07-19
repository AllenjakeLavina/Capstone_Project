<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <img src="../assets/logo.png" alt="ServiceLink Logo" />
      </div>
      <h2>Verify Your Email</h2>
      <p class="subtitle">Please enter the verification code sent to your email</p>
      
      <form @submit.prevent="handleVerification" v-if="!isVerified">
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>
        
        <div class="form-group">
          <label for="code">Verification Code</label>
          <input 
            type="text" 
            id="code" 
            v-model="verificationCode" 
            required
            placeholder="Enter 6-digit code"
            maxlength="6"
            pattern="[0-9]{6}"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="primary-btn" :disabled="loading">
            {{ loading ? 'Verifying...' : 'Verify Email' }}
          </button>
        </div>
        
        <div class="resend-code">
          <p>
            Didn't receive the code? 
            <button 
              type="button" 
              class="link-btn" 
              @click="handleResendCode" 
              :disabled="resendLoading || resendTimer > 0"
            >
              {{ resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code' }}
            </button>
          </p>
        </div>
      </form>
      
      <!-- Verification Success UI -->
      <div v-if="isVerified" class="verification-success">
        <div class="success-icon">✓</div>
        <h3>Email Verified Successfully!</h3>
        <p>Your email has been verified. You can now log in to access your account.</p>
        <div class="form-actions">
          <button class="primary-btn" @click="navigateToLogin">
            Continue to Login
          </button>
        </div>
      </div>
      
      <div class="auth-footer">
        <p>Already verified? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '../services/apiService';

export default {
  name: 'EmailVerification',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const verificationCode = ref('');
    const email = ref(route.query.email || '');
    const error = ref('');
    const success = ref('');
    const loading = ref(false);
    const resendLoading = ref(false);
    const resendTimer = ref(0);
    const isVerified = ref(false);
    let timerInterval;

    const startResendTimer = () => {
      resendTimer.value = 60; // 60 seconds cooldown
      timerInterval = setInterval(() => {
        if (resendTimer.value > 0) {
          resendTimer.value--;
        } else {
          clearInterval(timerInterval);
        }
      }, 1000);
    };

    const navigateToLogin = () => {
      router.push('/login');
    };

    const handleVerification = async () => {
      if (!email.value) {
        error.value = 'Email address is missing. Please try registering again.';
        return;
      }

      error.value = '';
      success.value = '';
      loading.value = true;

      try {
        // First verify the email
        const verifyResponse = await authService.verifyEmail(email.value, verificationCode.value);
        
        if (verifyResponse.success) {
          // After successful verification, show success UI
          isVerified.value = true;
          success.value = 'Email verified successfully!';
          
          // Try to login in the background (optional)
          try {
            // Get password from route query params (passed from registration)
            const password = route.query.password;
            if (password) {
              const loginResponse = await authService.login(email.value, password);
              if (loginResponse.success) {
                // Store the token
                localStorage.setItem('token', loginResponse.data.token);
                localStorage.setItem('userRole', loginResponse.data.user.role);
              }
            }
          } catch (loginErr) {
            console.log('Auto login failed, user will need to login manually');
          }
        } else {
          error.value = verifyResponse.message || 'Verification failed';
        }
      } catch (err) {
        error.value = err.message || 'An error occurred during verification';
      } finally {
        loading.value = false;
      }
    };

    const handleResendCode = async () => {
      if (!email.value) {
        error.value = 'Email address is missing. Please try registering again.';
        return;
      }

      error.value = '';
      resendLoading.value = true;

      try {
        const response = await authService.resendVerification(email.value);
        
        if (response.success) {
          success.value = 'Verification code resent successfully!';
          startResendTimer();
        } else {
          error.value = response.message || 'Failed to resend verification code';
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while resending the code';
      } finally {
        resendLoading.value = false;
      }
    };

    onMounted(() => {
      if (!email.value) {
        error.value = 'Email address is missing. Please try registering again.';
      }
      startResendTimer();
    });

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    });

    return {
      verificationCode,
      error,
      success,
      loading,
      resendLoading,
      resendTimer,
      isVerified,
      handleVerification,
      handleResendCode,
      navigateToLogin
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo {
  text-align: center;
  margin-bottom: 24px;
}

.logo img {
  width: 120px;
  height: auto;
}

h2 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.error-message {
  background-color: #fff5f5;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.success-message {
  background-color: #f0fff4;
  color: #2f855a;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 32px;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.primary-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.resend-code {
  text-align: center;
  margin-top: 24px;
}

.link-btn {
  background: none;
  border: none;
  color: #4299e1;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.link-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.link-btn:disabled {
  color: #a0aec0;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 32px;
  color: #718096;
}

.auth-footer a {
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Success verification styles */
.verification-success {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
}

.verification-success h3 {
  color: #2f855a;
  margin-bottom: 16px;
  font-size: 1.5rem;
}

.verification-success p {
  color: #4a5568;
  margin-bottom: 24px;
  line-height: 1.6;
}
</style> 