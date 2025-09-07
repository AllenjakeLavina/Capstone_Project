<template>
  <div class="terms-text">
    <section class="terms-section">
      <h2>Frequently Asked Questions (FAQ)</h2>
      <h3>How to book a provider</h3>
      <p>Go to Services, pick your provider, choose an available slot, and confirm your booking. You'll receive a confirmation once the provider accepts.</p>
      
      <h3>How to cancel a booking</h3>
      <p>Open your Bookings, select the booking, then choose Cancel. Some providers may have cancellation windows or fees—check the booking details.</p>
      
      <h3>How are payments handled</h3>
      <p>Payments are made in cash directly to the service provider after the service is completed. No online payment is required.</p>
      
      <h3>What if provider doesn't show up</h3>
      <p>Mark the booking as No-Show in your booking details and contact support. We'll investigate and help you reschedule or process a refund when applicable.</p>
      
      <h3>How to trust providers</h3>
      <p>Providers undergo verification and are rated by clients. Review profiles, ratings, and completed jobs before booking.</p>
      
      <h3>What if I have a dispute</h3>
      <p>Submit a support ticket with complete details. Our team mediates disputes using chat logs, booking records, and evidence provided by both parties.</p>
    </section>

    <section class="terms-section">
      <h2>Contact Support</h2>
      <ul>
        <li><strong>Email:</strong> 202210416@gordoncollege.edu.ph</li>
        <li><strong>Phone:</strong> +63 915 066 4403</li>
      </ul>
    </section>

    <section class="terms-section">
      <h2>Support Form</h2>
      <form @submit.prevent="submit">
        <div class="form-grid">
          <div class="form-field">
            <label for="name">Name</label>
            <input id="name" v-model="form.name" type="text" placeholder="Your full name" required />
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" placeholder="you@example.com" required />
          </div>
        </div>
        <div class="form-field">
          <label for="issue">Issue/Concern</label>
          <input id="issue" v-model="form.issue" type="text" placeholder="Short summary of your concern" required />
        </div>
        <div class="form-field">
          <label for="details">Details</label>
          <textarea id="details" v-model="form.details" rows="5" placeholder="Provide clear details to help us assist you" required></textarea>
        </div>
        <button class="submit-btn" type="submit">Submit</button>
      </form>
    </section>
  </div>
</template>

<script>
export default {
  name: 'CustomerService',
  data() {
    return {
      form: { name: '', email: '', issue: '', details: '' }
    };
  },
  methods: {
    submit() {
      // Simple client-side acknowledgment; integrate API if needed
      alert('Thanks! Your support request has been recorded.');
      this.form = { name: '', email: '', issue: '', details: '' };
    }
  }
}
</script>

<style scoped>
/* Same styling as TermsText.vue */
.terms-section { margin-bottom: 3rem; scroll-margin-top: 120px; }
.terms-section:last-child { margin-bottom: 0; }
.terms-section h2 { color: #1e293b; font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; position: relative; padding-bottom: 0.75rem; }
.terms-section h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; height: 3px; background: linear-gradient(135deg, #00C853 0%, #009688 100%); border-radius: 2px; }
.terms-section h3 { color: #475569; font-size: 1.25rem; font-weight: 600; margin: 2rem 0 1rem 0; }
.terms-section p { color: #334155; font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem; text-align: justify; }
.terms-section ul { margin: 1.5rem 0; padding-left: 0; list-style: none; }
.terms-section li { color: #334155; font-size: 1rem; line-height: 1.7; margin-bottom: 0.75rem; padding-left: 2rem; position: relative; }
.terms-section li::before { content: '•'; color: #009688; font-size: 1.5rem; position: absolute; left: 0.5rem; top: -0.1rem; }
.terms-section strong { color: #1e293b; font-weight: 600; }

/* Form styling */
.form-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.form-field label { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
.form-field input, .form-field textarea { padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; }
.form-field input:focus, .form-field textarea:focus { border-color: #00C853; box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.15); }
.submit-btn { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; color: #ffffff; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #00C853 0%, #009688 100%); transition: filter 0.2s; }
.submit-btn:hover { filter: brightness(1.05); }

@media (min-width: 768px) {
  .form-grid { grid-template-columns: 1fr 1fr; }
}
</style>
