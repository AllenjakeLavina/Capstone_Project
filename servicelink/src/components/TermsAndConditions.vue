<template>
  <div class="terms-container">
    <!-- Header Section -->
    <header class="terms-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Terms and Conditions</h1>
          <p class="last-updated">Last updated: {{ lastUpdated }}</p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="terms-main">
      <TermsText />
      <div class="auth-actions">
        <router-link to="/login" class="action-btn ghost">Back to Login</router-link>
        <router-link to="/register" class="action-btn solid">Go to Register</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import TermsText from './settings/TermsText.vue'
const lastUpdated = 'January 2025';
</script>

<style scoped>
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: #00C853; /* Green background para walang white space sa taas */
}

.terms-container {
  min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-y: auto;
}

/* Header Section */
.terms-header {
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
  padding: 1.2rem 0; /* Manipis na header */
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: space-between;
}

.header-text h1 {
  font-size: 2rem; /* Binawasan para mas manipis tingnan */
  font-weight: 800;
  margin-bottom: 0.3rem;
  background: linear-gradient(45deg, #ffffff, #e6fff0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.last-updated {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 400;
}

/* Main Content */
.terms-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.auth-actions {
  display: flex;
  gap: 12px;
  margin-top: 2rem;
}

.action-btn {
  text-decoration: none;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 999px;
}

.action-btn.ghost {
  border: 2px solid #00C853;
  color: #00A046;
}

.action-btn.solid {
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: #ffffff;
}

/* Sections */
.terms-section {
  margin-bottom: 3rem;
  scroll-margin-top: 120px;
}

.terms-section:last-child {
  margin-bottom: 0;
}

.terms-section h2 {
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.terms-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  border-radius: 2px;
}

.terms-section h3 {
  color: #475569;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
}

.terms-section p {
  color: #334155;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  text-align: justify;
}

.terms-section ul {
  margin: 1.5rem 0;
  padding-left: 0;
  list-style: none;
}

.terms-section li {
  color: #334155;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 0.75rem;
  padding-left: 2rem;
  position: relative;
}

.terms-section li::before {
  content: '•';
  color: #009688;
  font-size: 1.5rem;
  position: absolute;
  left: 0.5rem;
  top: -0.1rem;
}

.terms-section strong {
  color: #1e293b;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .terms-main {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1.5rem;
    gap: 1rem;
  }

  .header-text h1 {
    font-size: 1.8rem;
  }

  .terms-main {
    padding: 2rem 1rem;
    padding-bottom: 6rem;
    overflow: visible;
  }

  .terms-section h2 {
    font-size: 1.5rem;
  }

  .terms-section h3 {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 1.5rem;
  }

  .terms-section {
    margin-bottom: 2rem;
  }

  .terms-section h2 {
    font-size: 1.25rem;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Selection styles */
::selection {
  background: rgba(79, 70, 229, 0.2);
  color: #1e293b;
}
</style>
