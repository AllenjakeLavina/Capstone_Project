<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <img src="../assets/logo.png" alt="ServiceLink Logo" />
      </div>
      <h2>Register as Client</h2>
      <p class="subtitle">Create an account to find and book services</p>
      
      <div v-if="showVerification" class="verification-section">
        <h3>Verify Your Email</h3>
        <p>Please verify your email address to complete registration</p>
        <EmailVerificationInput 
          :email="formData.email"
          @verification-success="handleVerificationSuccess"
          @verification-error="handleVerificationError"
        />
      </div>

      <form v-else @submit.prevent="handleRegister">
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>
        <div v-if="success" class="success-message">
          <span class="success-icon">✓</span>
          {{ success }}
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <div class="input-container">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                id="firstName" 
                v-model="formData.firstName" 
                required
                placeholder="Enter your first name"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <div class="input-container">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                id="lastName" 
                v-model="formData.lastName" 
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-container">
            <span class="input-icon">✉️</span>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              required
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <div class="input-container">
            <span class="input-icon">📱</span>
            <input 
              type="tel" 
              id="phone" 
              v-model="formData.phone" 
              placeholder="Enter your phone number (optional)"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password" 
              id="password" 
              v-model="formData.password" 
              required
              placeholder="Create a password"
              minlength="8"
            />
          </div>
          <small class="password-hint">Password must be at least 8 characters long</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required
              placeholder="Confirm your password"
              minlength="8"
            />
          </div>
        </div>
        
        <div class="form-group form-checkbox">
          <input 
            type="checkbox" 
            id="terms" 
            v-model="acceptTerms" 
            required
          />
          <label for="terms">I agree to the <a href="/terms" target="_blank">Terms and Conditions</a></label>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="primary-btn client-btn" :disabled="loading || !acceptTerms">
            {{ loading ? 'Registering...' : 'Register as Client' }}
          </button>
        </div>
      </form>
      
      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
        <p>Want to register as a provider? <router-link to="/register/provider">Provider Registration</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { clientService, authService } from '../services/apiService';
import EmailVerificationInput from './EmailVerificationInput.vue';

export default {
  name: 'RegisterClientPage',
  components: {
    EmailVerificationInput
  },
  setup() {
    const router = useRouter();
    const formData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    });
    const confirmPassword = ref('');
    const acceptTerms = ref(false);
    const error = ref('');
    const success = ref('');
    const loading = ref(false);
    const showVerification = ref(false);

    const handleRegister = async () => {
      // Reset messages
      error.value = '';
      success.value = '';
      
      // Validate passwords match
      if (formData.password !== confirmPassword.value) {
        error.value = 'Passwords do not match';
        return;
      }

      loading.value = true;
      
      try {
        const response = await clientService.registerClient({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        });
        
        if (response.success) {
          success.value = 'Registration successful! Please verify your email.';
          showVerification.value = true;
        } else {
          error.value = response.message || 'Registration failed';
        }
      } catch (err) {
        error.value = err.message || 'An error occurred during registration';
      } finally {
        loading.value = false;
      }
    };

    const handleVerificationSuccess = async () => {
      try {
        // Attempt to login after successful verification
        const loginResponse = await authService.login(formData.email, formData.password);
        if (loginResponse.success) {
          // Store the token
          localStorage.setItem('token', loginResponse.data.token);
          // Redirect to home page
          router.push('/');
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Auto-login failed:', err);
        router.push('/login');
      }
    };

    const handleVerificationError = (errorMessage) => {
      error.value = errorMessage;
    };

    return {
      formData,
      confirmPassword,
      acceptTerms,
      error,
      success,
      loading,
      showVerification,
      handleRegister,
      handleVerificationSuccess,
      handleVerificationError
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
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: url("data:image/svg+xml,%3Csvg width='600' height='400' viewBox='0 0 600 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='120' cy='100' rx='100' ry='80' fill='%23106e40' fill-opacity='0.13'/%3E%3Crect x='400' y='220' width='160' height='120' rx='60' fill='%2338b676' fill-opacity='0.11'/%3E%3Cpolygon points='520,60 590,140 450,140' fill='%23106e40' fill-opacity='0.09'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
}

.auth-container::after {
  content: "";
  position: absolute;
  left: -100px;
  bottom: -100px;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle at 60% 40%, #38b67655 0%, transparent 80%);
  z-index: 0;
  pointer-events: none;
}

.auth-card {
  width: 100%;
  max-width: 600px;
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

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
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
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #8cc63f;
  box-shadow: 0 0 0 3px rgba(140, 198, 63, 0.1);
}

input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
  padding: 0;
}

.form-checkbox {
  display: flex;
  align-items: center;
}

.form-checkbox input {
  width: auto;
  margin-right: 10px;
  margin-top: 0;
}

.form-checkbox label {
  font-weight: normal;
  margin-bottom: 0;
}

.form-checkbox a {
  color: #38b676;
  text-decoration: none;
  font-weight: 500;
}

.form-checkbox a:hover {
  color: #106e40;
  text-decoration: underline;
}

.password-hint {
  display: block;
  margin-top: 8px;
  color: #718096;
  font-size: 0.85rem;
  margin-left: 4px;
}

.form-actions {
  margin-top: 32px;
}

.primary-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  background-color: #106e40;
}

.client-btn {
  background-color: #8cc63f;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.client-btn:hover:not(:disabled) {
  background-color: #7db32f;
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

.error-message {
  background-color: #fff5f5;
  color: #e53e3e;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.error-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

.success-message {
  background-color: #f0fff4;
  color: #2f855a;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.success-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

.verification-section {
  text-align: center;
  padding: 20px 0;
}

.verification-section h3 {
  margin-bottom: 10px;
  color: #106e40;
  font-weight: 600;
}

.verification-section p {
  color: #718096;
  margin-bottom: 20px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .auth-card {
    padding: 30px 20px;
  }
}
</style>
