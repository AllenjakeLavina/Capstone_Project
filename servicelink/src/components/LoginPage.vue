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
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required
              placeholder="Password"
            />
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">Forgot Password?</router-link>
          </div>
          
          <button type="submit" class="sign-in-btn" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="footer-links">
          <span>Privacy Policy</span>
          <span class="dot">•</span>
          <span>Terms & Conditions</span>
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
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/apiService';
import Swal from 'sweetalert2';

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const loading = ref(false);

    const handleLogin = async () => {
      loading.value = true;
      
      try {
        const response = await authService.login(email.value, password.value);
        
        if (response.success) {
          // Store token in local storage
          localStorage.setItem('token', response.data.token);
          
          // Store user role in local storage
          localStorage.setItem('userRole', response.data.user.role);
          
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
            } else {
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

    return {
      email,
      password,
      loading,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
  overflow: hidden;
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
  left: -100px;
  bottom: -100px;
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
</style>
