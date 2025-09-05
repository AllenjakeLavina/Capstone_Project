<template>
  <div class="terms-container">
    <div class="terms-content">
      <div class="terms-header">
        <h1>Terms and Conditions</h1>
        <p class="last-updated">Last updated: {{ lastUpdated }}</p>
      </div>

      <div class="terms-body">
        <section class="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using ServiceLink ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section class="terms-section">
          <h2>2. Description of Service</h2>
          <p>ServiceLink is a platform that connects service providers with clients seeking various services. We facilitate the connection between users but do not provide the services directly.</p>
        </section>

        <section class="terms-section">
          <h2>3. User Accounts</h2>
          <h3>3.1 Account Creation</h3>
          <p>To use our service, you must create an account. You are responsible for:</p>
          <ul>
            <li>Providing accurate and complete information</li>
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>

          <h3>3.2 Account Types</h3>
          <p>We offer two types of accounts:</p>
          <ul>
            <li><strong>Client Accounts:</strong> For users seeking services</li>
            <li><strong>Provider Accounts:</strong> For users offering services (requires verification)</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>4. Service Provider Verification</h2>
          <p>Service providers must undergo verification before offering services. This includes:</p>
          <ul>
            <li>Identity verification through government-issued ID</li>
            <li>Background checks where applicable</li>
            <li>Skill and qualification verification</li>
            <li>Portfolio and reference checks</li>
          </ul>
          <p>We reserve the right to reject or suspend provider accounts that do not meet our verification standards.</p>
        </section>

        <section class="terms-section">
          <h2>5. User Conduct</h2>
          <p>Users agree to:</p>
          <ul>
            <li>Use the service only for lawful purposes</li>
            <li>Not engage in fraudulent, abusive, or illegal activities</li>
            <li>Respect other users and maintain professional conduct</li>
            <li>Not attempt to circumvent our verification processes</li>
            <li>Provide honest and accurate information in profiles and communications</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>6. Booking and Payment</h2>
          <h3>6.1 Booking Process</h3>
          <p>Clients can book services through our platform. All bookings are subject to provider availability and approval.</p>

          <h3>6.2 Payment Terms</h3>
          <p>Payment terms will be agreed upon between clients and providers. ServiceLink may facilitate payment processing but is not responsible for payment disputes between users.</p>

          <h3>6.3 Cancellation Policy</h3>
          <p>Cancellation policies are set by individual service providers. Users should review these policies before booking.</p>
        </section>

        <section class="terms-section">
          <h2>7. Privacy and Data Protection</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.</p>
        </section>

        <section class="terms-section">
          <h2>8. Intellectual Property</h2>
          <p>The service and its original content, features, and functionality are and will remain the exclusive property of ServiceLink and its licensors. The service is protected by copyright, trademark, and other laws.</p>
        </section>

        <section class="terms-section">
          <h2>9. Limitation of Liability</h2>
          <p>ServiceLink acts as an intermediary platform. We are not responsible for:</p>
          <ul>
            <li>The quality of services provided by service providers</li>
            <li>Disputes between clients and providers</li>
            <li>Any damages resulting from the use of services booked through our platform</li>
            <li>Technical issues or service interruptions</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>10. Account Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </section>

        <section class="terms-section">
          <h2>11. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
        </section>

        <section class="terms-section">
          <h2>12. Contact Information</h2>
          <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
          <ul>
            <li>Email: support@servicetogo.online</li>
            <li>Phone: 0915 066 4403</li>
            <li>Address: De Aro Street, Mabayuan Olongapo City</li>
          </ul>
        </section>
      </div>

      <div class="terms-footer">
        <button @click="goBack" class="back-btn">
          <i class="fa fa-arrow-left"></i> Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const lastUpdated = 'January 2025';

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.terms-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.terms-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  margin: 20px 0;
  overflow: hidden;
}

.terms-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.terms-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.last-updated {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.terms-body {
  padding: 40px;
  line-height: 1.8;
  color: #333;
}

.terms-section {
  margin-bottom: 30px;
}

.terms-section h2 {
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.terms-section h3 {
  color: #764ba2;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 20px 0 10px 0;
}

.terms-section p {
  margin-bottom: 15px;
  text-align: justify;
}

.terms-section ul {
  margin: 15px 0;
  padding-left: 20px;
}

.terms-section li {
  margin-bottom: 8px;
}

.terms-footer {
  background: #f8f9fa;
  padding: 20px 40px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .terms-container {
    padding: 10px;
  }
  
  .terms-content {
    margin: 10px 0;
  }
  
  .terms-header {
    padding: 30px 20px;
  }
  
  .terms-header h1 {
    font-size: 2rem;
  }
  
  .terms-body {
    padding: 30px 20px;
  }
  
  .terms-footer {
    padding: 20px;
  }
}
</style>
