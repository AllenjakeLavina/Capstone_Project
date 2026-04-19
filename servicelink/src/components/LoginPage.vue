<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Left side -->
      <div class="login-form-side">
        <div class="company-name">ServiceLink</div>
        <h1 class="title">Sign in to Account</h1>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required
              placeholder="Your Email"
            />
          </div>
          
          <div class="form-group">
            <div class="password-input-container">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                required
                placeholder="Password"
              />
              <button 
                type="button" 
                class="password-toggle-btn" 
                @click="togglePasswordVisibility"
              >
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span>Remember me</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">Forgot Password?</router-link>
          </div>
          
          <button type="submit" class="sign-in-btn" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="footer-links">
          <a href="#" @click.prevent="showPrivacyModal = true" class="footer-link">Privacy Policy</a>
          <span class="dot">•</span>
          <a href="#" @click.prevent="showTermsModal = true" class="footer-link">Terms & Conditions</a>
        </div>
      </div>

      <!-- Right side -->
      <div class="welcome-side">
        <div class="welcome-content">
          <div class="welcome-logo">
            <img src="../assets/logo.png" alt="ServiceLink Logo" />
          </div>
          <h2>Hello, Friend!</h2>
          <p>Fill up personal information and start journey with us.</p>
          <router-link to="/register" class="sign-up-btn">Sign Up</router-link>
        </div>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div v-if="showPrivacyModal" class="modal-overlay" @click.self="showPrivacyModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Privacy Policy</h2>
          <button class="modal-close" @click="showPrivacyModal = false">&times;</button>
        </div>
        <div class="modal-content">
          <p class="last-updated">Last updated: January 2025</p>
          <div class="policy-content">
            <section class="policy-section">
              <h3>1. Introduction</h3>
              <p>ServiceLink ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.</p>
            </section>

            <section class="policy-section">
              <h3>2. Information We Collect</h3>
              <h4>2.1 Personal Information</h4>
              <p>We may collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li>Register for an account (name, email address, phone number, address)</li>
                <li>Create a profile (profile picture, bio, service descriptions)</li>
                <li>Book or provide services (booking details, service history)</li>
                <li>Communicate with other users through our platform</li>
                <li>Contact us for customer support</li>
              </ul>
              
              <h4>2.2 Verification Information</h4>
              <p>For service providers, we collect additional verification information including:</p>
              <ul>
                <li>Government-issued identification documents</li>
                <li>Professional credentials and certifications</li>
                <li>Background check information</li>
                <li>Portfolio and work samples</li>
              </ul>

              <h4>2.3 Payment Information</h4>
              <p>When you make or receive payments through our platform, we may collect:</p>
              <ul>
                <li>Payment method details (processed securely through third-party payment processors)</li>
                <li>Billing address and transaction history</li>
                <li>Tax identification information where required</li>
              </ul>

              <h4>2.4 Automatically Collected Information</h4>
              <p>We automatically collect certain information when you use our service:</p>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Location data (if you enable location services)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section class="policy-section">
              <h3>3. How We Use Your Information</h3>
              <p>We use the information we collect for various purposes:</p>
              <ul>
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our services</li>
                <li><strong>Account Management:</strong> To create and manage your account, verify your identity, and process transactions</li>
                <li><strong>Communication:</strong> To send you service-related notifications, updates, and promotional materials</li>
                <li><strong>Matching Services:</strong> To connect clients with appropriate service providers</li>
                <li><strong>Safety and Security:</strong> To detect, prevent, and address fraud, abuse, and security issues</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and respond to legal requests</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve user experience</li>
                <li><strong>Customer Support:</strong> To respond to your inquiries and provide customer support</li>
              </ul>
            </section>

            <section class="policy-section">
              <h3>4. Information Sharing and Disclosure</h3>
              <h4>4.1 With Other Users</h4>
              <p>We share certain information with other users to facilitate service connections:</p>
              <ul>
                <li>Profile information (name, photo, bio, ratings, reviews)</li>
                <li>Service listings and availability</li>
                <li>Public reviews and ratings</li>
                <li>Contact information (only when a booking is confirmed)</li>
              </ul>

              <h4>4.2 With Service Providers</h4>
              <p>We may share your information with third-party service providers who perform services on our behalf:</p>
              <ul>
                <li>Payment processors</li>
                <li>Cloud hosting services</li>
                <li>Email and messaging services</li>
                <li>Analytics providers</li>
                <li>Background check services (for provider verification)</li>
              </ul>

              <h4>4.3 Legal Requirements</h4>
              <p>We may disclose your information if required by law or in response to:</p>
              <ul>
                <li>Court orders or legal processes</li>
                <li>Government requests</li>
                <li>Enforcement of our Terms and Conditions</li>
                <li>Protection of rights, property, or safety</li>
              </ul>

              <h4>4.4 Business Transfers</h4>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
            </section>

            <section class="policy-section">
              <h3>5. Data Security</h3>
              <p>We implement appropriate technical and organizational security measures to protect your personal information:</p>
              <ul>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Secure payment processing through certified payment gateways</li>
              </ul>
              <p>However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
            </section>

            <section class="policy-section">
              <h3>6. Data Retention</h3>
              <p>We retain your personal information for as long as necessary to:</p>
              <ul>
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain security and prevent fraud</li>
              </ul>
              <p>When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.</p>
            </section>

            <section class="policy-section">
              <h3>7. Your Privacy Rights</h3>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p>To exercise these rights, please contact us using the contact information provided below.</p>
            </section>

            <section class="policy-section">
              <h3>8. Cookies and Tracking Technologies</h3>
              <p>We use cookies and similar tracking technologies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our service</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve security and prevent fraud</li>
              </ul>
              <p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our service.</p>
            </section>

            <section class="policy-section">
              <h3>9. Third-Party Links</h3>
              <p>Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party sites you visit.</p>
            </section>

            <section class="policy-section">
              <h3>10. Children's Privacy</h3>
              <p>Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.</p>
            </section>

            <section class="policy-section">
              <h3>11. International Data Transfers</h3>
              <p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our service, you consent to the transfer of your information to these countries.</p>
            </section>

            <section class="policy-section">
              <h3>12. Changes to This Privacy Policy</h3>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
              <ul>
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
                <li>Displaying a notice on our service</li>
              </ul>
              <p>Your continued use of our service after any changes constitutes acceptance of the updated Privacy Policy.</p>
            </section>

            <section class="policy-section">
              <h3>13. Contact Us</h3>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:</p>
              <ul>
                <li>Email: support@servicetogo.online</li>
                <li>Phone: 0915 066 4403</li>
                <li>Address: Irving Street, East Tapinac Olongapo City</li>
              </ul>
              <p>We will respond to your inquiry within a reasonable timeframe.</p>
            </section>
          </div>
        </div>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/apiService';
import Swal from 'sweetalert2';
import TermsText from './settings/TermsText.vue';

export default {
  name: 'LoginPage',
  components: {
    TermsText
  },
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const showPassword = ref(false);
    const rememberMe = ref(false);
    const showPrivacyModal = ref(false);
    const showTermsModal = ref(false);

    // Load saved credentials on component mount
    const loadSavedCredentials = () => {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const savedPassword = localStorage.getItem('rememberedPassword');
      const savedRememberMe = localStorage.getItem('rememberMe');
      
      if (savedEmail && savedPassword && savedRememberMe === 'true') {
        email.value = savedEmail;
        password.value = savedPassword;
        rememberMe.value = true;
      }
    };

    // Save credentials if "Remember Me" is checked
    const saveCredentials = () => {
      if (rememberMe.value) {
        localStorage.setItem('rememberedEmail', email.value);
        localStorage.setItem('rememberedPassword', password.value);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const handleLogin = async () => {
      loading.value = true;
      
      try {
        const response = await authService.login(email.value, password.value);
        
        if (response.success) {
          // Store token in local storage
          localStorage.setItem('token', response.data.token);
          
          // Store user role in local storage
          localStorage.setItem('userRole', response.data.user.role);
          
          // Save credentials if "Remember Me" is checked
          saveCredentials();
          
          // Show success message
          Swal.fire({
            title: 'Login Successful!',
            text: `Welcome back, ${response.data.user.firstName || 'User'}!`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
          
          // Redirect based on user role after short delay to show the message
          setTimeout(() => {
            if (response.data.user.role === 'CLIENT') {
              router.push('/client/services');
            } else if (response.data.user.role === 'PROVIDER') {
              router.push('/provider/services');
            } else if (response.data.user.role === 'ADMIN') {
              router.push('/admin/dashboard');
            }
          }, 1000);
        } else {
          // Show error with SweetAlert2
          Swal.fire({
            title: 'Login Failed',
            text: response.message || 'Invalid email or password',
            icon: 'error',
            confirmButtonColor: '#106e40'
          });
        }
      } catch (err) {
        // Show error with SweetAlert2
        Swal.fire({
          title: 'Error',
          text: err.message || 'An error occurred during login',
          icon: 'error',
          confirmButtonColor: '#106e40'
        });
      } finally {
        loading.value = false;
      }
    };

    // Load saved credentials when component mounts
    loadSavedCredentials();

    return {
      email,
      password,
      loading,
      handleLogin,
      showPassword,
      togglePasswordVisibility,
      rememberMe,
      showPrivacyModal,
      showTermsModal
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.login-container::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: url("data:image/svg+xml,%3Csvg width='600' height='400' viewBox='0 0 600 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='120' cy='100' rx='100' ry='80' fill='%23106e40' fill-opacity='0.13'/%3E%3Crect x='400' y='220' width='160' height='120' rx='60' fill='%2338b676' fill-opacity='0.11'/%3E%3Cpolygon points='520,60 590,140 450,140' fill='%23106e40' fill-opacity='0.09'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
}

.login-container::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle at 60% 40%, #38b67655 0%, transparent 80%);
  z-index: 0;
  pointer-events: none;
}

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.login-form-side {
  flex: 1;
  padding: 40px;
}

.company-name {
  font-size: 1.9rem;
  display: flex;
  color: #106e40;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 80px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}



.divider span {
  background: white;
  padding: 0 15px;
  color: #666;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #106e40;
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 110, 64, 0.1);
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  width: 100%;
  padding-right: 50px;
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle-btn:hover {
  color: #106e40;
}

.password-toggle-btn:focus {
  outline: none;
  color: #106e40;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.forgot-link {
  color: #106e40;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.sign-in-btn {
  width: 100%;
  padding: 12px;
  background: #106e40;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sign-in-btn:hover:not(:disabled) {
  background: #0c5730;
  transform: translateY(-2px);
}

.sign-in-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.footer-links {
  margin-top: 30px;
  text-align: center;
  color: #666;
  font-size: 0.85rem;
}

.footer-links .dot {
  margin: 0 8px;
}

.footer-link {
  color: #106e40;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #0c5730;
  text-decoration: underline;
}

.welcome-side {
  flex: 1;
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.welcome-content {
  max-width: 300px;
}

.welcome-content h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: white;
}

.welcome-content p {
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.sign-up-btn {
  display: inline-block;
  padding: 12px 40px;
  border: 2px solid white;
  border-radius: 25px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.sign-up-btn:hover {
  background: white;
  color: #106e40;
}

.welcome-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
}

.welcome-logo img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(16, 110, 64, 0.10);
}

@media (max-width: 768px) {
  .login-card {
    flex-direction: column-reverse;
  }

  .welcome-side {
    padding: 40px 20px;
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

.policy-content {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.policy-section {
  margin-bottom: 2.5rem;
}

.policy-section:last-child {
  margin-bottom: 0;
}

.policy-section h3 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.policy-section h4 {
  color: #475569;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
}

.policy-section p {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 1rem;
  text-align: justify;
}

.policy-section ul {
  margin: 1rem 0;
  padding-left: 0;
  list-style: none;
}

.policy-section li {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.policy-section li::before {
  content: '•';
  color: #38b676;
  font-size: 1.2rem;
  position: absolute;
  left: 0.5rem;
  top: -0.1rem;
}

.policy-section strong {
  color: #1e293b;
  font-weight: 600;
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

  .policy-section h3 {
    font-size: 1.1rem;
  }

  .policy-section h4 {
    font-size: 1rem;
  }

  .policy-section p,
  .policy-section li {
    font-size: 0.9rem;
  }
}
</style>
