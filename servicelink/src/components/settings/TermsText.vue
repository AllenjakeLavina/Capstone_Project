<template>
  <div class="terms-text">
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
        <li>Email: servicelinkolongapo@gmail.com</li>
        <li>Phone: 0915 066 4403</li>
        <li>Address: Mabayuan Olongapo City, Zambales</li>
      </ul>
    </section>
  </div>
</template>

<script>
export default { name: 'TermsText' }
</script>

<style scoped>
.terms-section { margin-bottom: 3rem; scroll-margin-top: 120px; }
.terms-section:last-child { margin-bottom: 0; }
.terms-section h2 { color: #1e293b; font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; position: relative; padding-bottom: 0.75rem; }
.terms-section h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; height: 3px; background: linear-gradient(135deg, #00C853 0%, #009688 100%); border-radius: 2px; }
.terms-section h3 { color: #475569; font-size: 1.25rem; font-weight: 600; margin: 2rem 0 1rem 0; }
.terms-section p { color: #334155; font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem; text-align: justify; }
.terms-section ul { margin: 1.5rem 0; padding-left: 0; list-style: none; }
.terms-section li { color: #334155; font-size: 1rem; line-height: 1.7; margin-bottom: 0.75rem; padding-left: 2rem; position: relative; }
.terms-section li::before { content: '•'; color: #009688; font-size: 1.5rem; position: absolute; left: 0.5rem; top: -0.1rem; }
</style>

