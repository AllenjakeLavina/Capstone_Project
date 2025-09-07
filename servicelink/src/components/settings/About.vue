<template>
  <div class="terms-text">
    <section class="terms-section">
      <h2>About ServiceLink</h2>
      <p>ServiceLink is a digital platform that connects clients with trusted service providers in their local area. We aim to simplify the process of finding skilled workers—whether you need an electrician, plumber, painter, or other professionals—quickly and reliably.</p>
    </section>

    <section class="terms-section">
      <h2>Our Mission</h2>
      <p>To build trust between communities by providing a reliable, fast, and user-friendly platform that helps clients get quality services while giving providers fair job opportunities.</p>
    </section>

    <section class="terms-section">
      <h2>Our Vision</h2>
      <p>A community where every household and business has easy access to trusted service providers, and every skilled worker has the chance to showcase their expertise and grow their career.</p>
    </section>

    <section class="terms-section">
      <h2>What We Offer</h2>
      <h3>For Clients</h3>
      <p>A convenient way to search, compare, and book service providers anytime, anywhere.</p>
      
      <h3>For Providers</h3>
      <p>A platform to showcase skills, build credibility, and secure consistent job opportunities.</p>
      
      <h3>For Communities</h3>
      <p>A safer, transparent, and organized system for finding and offering services.</p>
    </section>

    <section class="terms-section">
      <h2>Why Choose ServiceLink?</h2>
      <ul>
        <li>Verified and trusted service providers</li>
        <li>Hassle-free booking process</li>
        <li>Honest ratings and reviews</li>
        <li>Safe, reliable, and community-driven</li>
      </ul>
    </section>

    <section class="terms-section">
      <h2>Our Story</h2>
      <p>ServiceLink was created out of a simple need: many residents struggle to find reliable services, while skilled workers often lack a steady platform to promote their skills. We bridge this gap—bringing together clients and providers in one trusted online space.</p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutSettings'
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
</style>

 