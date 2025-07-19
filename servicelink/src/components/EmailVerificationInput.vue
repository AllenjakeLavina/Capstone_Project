<template>
  <div class="verification-input-container">
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>
    
    <div v-if="!isVerified" class="form-group">
      <label for="verificationCode">Verification Code</label>
      <div class="code-input-container">
        <input 
          type="text" 
          id="verificationCode" 
          v-model="code" 
          required
          placeholder="Enter 6-digit code"
          maxlength="6"
          pattern="[0-9]{6}"
        />
        <button 
          type="button" 
          class="resend-btn" 
          @click="handleResend" 
          :disabled="resendLoading || resendTimer > 0"
        >
          {{ resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code' }}
        </button>
      </div>
      <small class="input-hint">Enter the 6-digit code sent to your email</small>
      <div class="verify-button-container">
        <button 
          type="button" 
          class="verify-btn" 
          @click="verifyCode"
          :disabled="code.length !== 6 || verifyLoading"
        >
          {{ verifyLoading ? 'Verifying...' : 'Verify Code' }}
        </button>
      </div>
    </div>
    
    <div v-else class="verification-success">
      <div class="success-icon">✓</div>
      <h3>Email Verified Successfully!</h3>
      <p>Your email has been verified. You can now continue.</p>
      <button class="continue-btn" @click="handleContinue">Continue</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { authService } from '../services/apiService';

export default {
  name: 'EmailVerificationInput',
  props: {
    email: {
      type: String,
      required: true
    }
  },
  emits: ['verification-success', 'verification-error'],
  setup(props, { emit }) {
    const code = ref('');
    const error = ref('');
    const success = ref('');
    const resendLoading = ref(false);
    const verifyLoading = ref(false);
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

    const handleContinue = () => {
      emit('verification-success', code.value);
    };

    const verifyCode = async () => {
      if (code.value.length !== 6) return;
      
      error.value = '';
      success.value = '';
      verifyLoading.value = true;
      
      try {
        const response = await authService.verifyEmail(props.email, code.value);
        
        if (response.success) {
          success.value = 'Verification successful!';
          isVerified.value = true;
          // Don't emit success yet - wait for the user to click continue
        } else {
          error.value = response.message || 'Verification failed';
          emit('verification-error', response.message);
        }
      } catch (err) {
        error.value = err.message || 'An error occurred during verification';
        emit('verification-error', err.message);
      } finally {
        verifyLoading.value = false;
      }
    };

    const handleResend = async () => {
      if (resendTimer.value > 0) return;

      error.value = '';
      success.value = '';
      resendLoading.value = true;

      try {
        const response = await authService.resendVerification(props.email);
        
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
      startResendTimer();
    });

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    });

    return {
      code,
      error,
      success,
      resendLoading,
      verifyLoading,
      resendTimer,
      isVerified,
      verifyCode,
      handleResend,
      handleContinue
    };
  }
};
</script>

<style scoped>
.verification-input-container {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
}

.code-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  letter-spacing: 2px;
  text-align: center;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.resend-btn {
  padding: 12px 20px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.resend-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.resend-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.input-hint {
  display: block;
  margin-top: 6px;
  color: #718096;
  font-size: 0.875rem;
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

.verify-button-container {
  margin-top: 16px;
}

.verify-btn {
  width: 100%;
  padding: 12px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.verify-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.verify-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
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

.continue-btn {
  padding: 12px 24px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continue-btn:hover {
  background-color: #3182ce;
}
</style> 