<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <img src="../assets/logo.png" alt="ServiceLink Logo" />
      </div>
      <h2>Register as Client</h2>
      <p class="subtitle">Create an account to find and book services</p>
      
      <div v-if="showVerification" class="verification-section" key="verification">
        <h3>Verify Your Email</h3>
        <p>Please verify your email address to complete registration</p>
        <EmailVerificationInput 
          :email="formData.email"
          @verification-success="handleVerificationSuccess"
          @verification-error="handleVerificationError"
        />
      </div>

      <form v-else @submit.prevent="handleRegister" key="registration-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name <span class="required">*</span></label>
            <div class="input-container">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                id="firstName" 
                v-model="formData.firstName" 
                required
                placeholder="Enter your first name"
                minlength="2"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name <span class="required">*</span></label>
            <div class="input-container">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                id="lastName" 
                v-model="formData.lastName" 
                required
                placeholder="Enter your last name"
                minlength="2"
              />
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Email <span class="required">*</span></label>
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
          <label for="phone">Contact Number <span class="required">*</span></label>
          <div class="input-container">
            <span class="input-icon">📱</span>
            <input 
              type="tel" 
              id="phone" 
              v-model="formData.phone" 
              required
              placeholder="e.g., 09123456789 or +639123456789"
            />
          </div>
          <small class="input-hint">Enter a valid Philippine phone number</small>
        </div>

        <div class="form-group">
          <label for="addressLine1">Address <span class="required">*</span></label>
          <div class="input-container">
            <span class="input-icon">📍</span>
            <input 
              type="text" 
              id="addressLine1" 
              v-model="formData.addressLine1" 
              required
              placeholder="Street address, Building number "
              minlength="5"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="addressLine2">Address Line 2</label>
          <div class="input-container">
            <span class="input-icon">📍</span>
            <input 
              type="text" 
              id="addressLine2" 
              v-model="formData.addressLine2" 
              placeholder="Barangay"
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
              :class="{ 'input-error': !isPasswordValid && formData.password.length > 0 }"
            />
          </div>
          <div v-if="formData.password.length > 0" class="password-checklist">
            <div class="password-requirement" :class="{ 'valid': hasMinLength, 'invalid': !hasMinLength }">
              <span class="check-icon">{{ hasMinLength ? '✓' : '✗' }}</span>
              <span>8 characters</span>
            </div>
            <div class="password-requirement" :class="{ 'valid': hasUppercase, 'invalid': !hasUppercase }">
              <span class="check-icon">{{ hasUppercase ? '✓' : '✗' }}</span>
              <span>1 uppercase</span>
            </div>
            <div class="password-requirement" :class="{ 'valid': hasLowercase, 'invalid': !hasLowercase }">
              <span class="check-icon">{{ hasLowercase ? '✓' : '✗' }}</span>
              <span>1 lowercase</span>
            </div>
            <div class="password-requirement" :class="{ 'valid': hasNumber, 'invalid': !hasNumber }">
              <span class="check-icon">{{ hasNumber ? '✓' : '✗' }}</span>
              <span>1 number</span>
            </div>
            <div class="password-requirement" :class="{ 'valid': hasSpecialChar, 'invalid': !hasSpecialChar }">
              <span class="check-icon">{{ hasSpecialChar ? '✓' : '✗' }}</span>
              <span>1 special character</span>
            </div>
          </div>
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
              :class="{ 'input-error': confirmPasswordError && confirmPassword.length > 0 }"
            />
          </div>
          <div v-if="confirmPasswordError && confirmPassword.length > 0" class="error-message">
            {{ confirmPasswordError }}
          </div>
        </div>
        
        <div class="form-group form-checkbox">
          <input 
            type="checkbox" 
            id="terms" 
            v-model="acceptTerms" 
            required
          />
          <label for="terms">I agree to the <a href="#" @click.prevent="showTermsModal = true" class="terms-link">Terms and Conditions</a></label>
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

    <!-- Terms & Conditions Modal -->
    <div v-if="showTermsModal" class="modal-overlay" @click.self="showTermsModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Terms and Conditions</h2>
          <button class="modal-close" @click="showTermsModal = false">&times;</button>
        </div>
        <div class="modal-content">
          <p class="last-updated">Last updated: January 2025</p>
          <TermsText />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { clientService, authService } from '../services/apiService';
import EmailVerificationInput from './EmailVerificationInput.vue';
import TermsText from './settings/TermsText.vue';

export default {
  name: 'RegisterClientPage',
  components: {
    EmailVerificationInput,
    TermsText
  },
  setup() {
    const router = useRouter();
    const formData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      addressLine1: '',
      addressLine2: ''
    });
    const confirmPassword = ref('');
    const acceptTerms = ref(false);
    const loading = ref(false);
    const showVerification = ref(false);
    const showTermsModal = ref(false);

    // Validation functions
    const validateFullName = () => {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      
      if (!firstName || !lastName) {
        return 'First name and last name are required';
      }
      
      if (firstName.length < 2) {
        return 'First name must be at least 2 characters long';
      }
      
      if (lastName.length < 2) {
        return 'Last name must be at least 2 characters long';
      }
      
      // Check for valid characters (letters, spaces, hyphens, apostrophes)
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(firstName)) {
        return 'First name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed';
      }
      
      if (!nameRegex.test(lastName)) {
        return 'Last name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed';
      }
      
      return null;
    };

    const validateContactNumber = () => {
      const phone = formData.phone.trim();
      
      if (!phone) {
        return 'Contact number is required';
      }
      
      // Remove spaces, dashes, and parentheses for validation
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      
      // Philippine phone number format: +63XXXXXXXXXX or 09XXXXXXXXX or 0XXXXXXXXX
      // Also accept international formats
      const phoneRegex = /^(\+63|63|0)?[9]\d{9}$|^(\+?\d{10,15})$/;
      
      if (!phoneRegex.test(cleanPhone)) {
        return 'Please enter a valid contact number (e.g., 09123456789 or +639123456789)';
      }
      
      return null;
    };

    const validateAddress = () => {
      if (!formData.addressLine1.trim()) {
        return 'Address is required';
      }
      
      if (formData.addressLine1.trim().length < 5) {
        return 'Address must be at least 5 characters long';
      }
      
      return null;
    };

    // Password validation function
    const validatePassword = (password) => {
      const errors = [];

      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }

      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter (a-z)');
      }

      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter (A-Z)');
      }

      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number (0-9)');
      }

      if (!/[^a-zA-Z\d]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
      }

      return errors;
    };

    // Computed properties for individual password requirements
    const hasMinLength = computed(() => formData.password.length >= 8);
    const hasUppercase = computed(() => /[A-Z]/.test(formData.password));
    const hasLowercase = computed(() => /[a-z]/.test(formData.password));
    const hasNumber = computed(() => /\d/.test(formData.password));
    const hasSpecialChar = computed(() => /[^a-zA-Z\d]/.test(formData.password));
    const isPasswordValid = computed(() => {
      return hasMinLength.value && hasUppercase.value && hasLowercase.value && hasNumber.value && hasSpecialChar.value;
    });

    const confirmPasswordError = computed(() => {
      if (confirmPassword.value.length === 0) {
        return '';
      }
      if (formData.password !== confirmPassword.value) {
        return 'Passwords do not match';
      }
      return '';
    });

    const handleRegister = async () => {
      // Validate full name
      const nameError = validateFullName();
      if (nameError) {
        await Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: nameError,
          confirmButtonColor: '#106e40'
        });
        return;
      }

      // Validate contact number
      const phoneError = validateContactNumber();
      if (phoneError) {
        await Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: phoneError,
          confirmButtonColor: '#106e40'
        });
        return;
      }

      // Validate address
      const addressError = validateAddress();
      if (addressError) {
        await Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: addressError,
          confirmButtonColor: '#106e40'
        });
        return;
      }
      
      // Validate password strength
      const passwordValidationErrors = validatePassword(formData.password);
      if (passwordValidationErrors.length > 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Weak Password',
          text: passwordValidationErrors.join(', '),
          confirmButtonColor: '#106e40'
        });
        return;
      }

      // Validate passwords match
      if (formData.password !== confirmPassword.value) {
        await Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'Passwords do not match',
          confirmButtonColor: '#106e40'
        });
        return;
      }

      loading.value = true;
      
      try {
        const response = await clientService.registerClient({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          address: {
            addressLine1: formData.addressLine1.trim(),
            addressLine2: formData.addressLine2?.trim() || ''
            // No default values - only save what user entered
          }
        });
        
        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Please verify your email to complete registration.',
            confirmButtonColor: '#8cc63f'
          });
          showVerification.value = true;
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: response.message || 'Registration failed. Please try again.',
            confirmButtonColor: '#106e40'
          });
        }
      } catch (err) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'An error occurred during registration',
          confirmButtonColor: '#106e40'
        });
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

    const handleVerificationError = async (errorMessage) => {
      await Swal.fire({
        icon: 'error',
        title: 'Verification Error',
        text: errorMessage,
        confirmButtonColor: '#106e40'
      });
    };

    return {
      formData,
      confirmPassword,
      acceptTerms,
      loading,
      showVerification,
      showTermsModal,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      isPasswordValid,
      confirmPasswordError,
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
  min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  width: 100%;
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

.form-checkbox a,
.terms-link {
  color: #38b676;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.form-checkbox a:hover,
.terms-link:hover {
  color: #106e40;
  text-decoration: underline;
}

.password-hint, .input-hint {
  display: block;
  margin-top: 8px;
  color: #718096;
  font-size: 0.85rem;
  margin-left: 4px;
}

.password-checklist {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-requirement {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  gap: 8px;
}

.password-requirement .check-icon {
  font-weight: bold;
  font-size: 1rem;
  min-width: 16px;
  text-align: center;
}

.password-requirement.valid {
  color: #38b676;
}

.password-requirement.invalid {
  color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 4px;
  margin-left: 4px;
}

.input-error {
  border-color: #e53e3e !important;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1) !important;
}

.required {
  color: #e53e3e;
  font-weight: bold;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90dvh;
  max-height: 90vh; /* Fallback for older browsers */
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
  padding: 0;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-content {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.modal-content .last-updated {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
  font-style: italic;
}

@media (max-width: 768px) {
  .modal-card {
    max-height: 95vh;
    border-radius: 15px;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>
