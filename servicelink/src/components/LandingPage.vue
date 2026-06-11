<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="hero-content">
        <img
          src="../assets/logo.png"
          alt="ServiceLink Logo"
          class="hero-logo"
        />
        <h1 class="hero-title">ServiceLink</h1>
        <p class="hero-tagline">
          Connect with top-rated professionals in your area
        </p>
        <p class="hero-description">
          Find service providers in Olongapo. Connect with verified
          professionals for your home, business, or personal needs.
        </p>
        <div class="hero-actions">
          <router-link to="/login" class="primary-btn">
            <i class="fa fa-search"></i> Find Services
          </router-link>
          <router-link to="/register" class="outline-btn">
            <i class="fa fa-user-plus"></i> Join Us
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>Why Choose ServiceLink?</h2>
          <p class="section-subtitle">
            Connecting you with trusted service providers in Olongapo
          </p>
        </div>
        <div class="features-grid">
          <div
            class="feature-card"
            v-for="(feature, index) in features"
            :key="index"
          >
            <div class="feature-icon-wrapper" :class="feature.shapeClass">
              <i :class="feature.icon"></i>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories">
      <div class="container">
        <div class="section-header">
          <h2>Explore Our Services</h2>
          <p class="section-subtitle">
            Discover professionals across various categories
          </p>
        </div>
        <div class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.name"
            class="category-card"
          >
            <div class="category-icon-wrapper" :class="category.shapeClass">
              <i :class="category.icon"></i>
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            <router-link to="/login" class="category-link"
              >Explore →</router-link
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Providers Section -->
    <section class="featured-providers">
      <div class="container">
        <div class="section-header">
          <h2>Featured Professionals</h2>
          <p class="section-subtitle">Browse our verified service providers</p>
        </div>
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else class="providers-grid">
          <div
            v-for="provider in providers"
            :key="provider.id"
            class="provider-card"
          >
            <div class="provider-image">
              <img
                :src="getProfileImage(provider.profilePicture)"
                :alt="provider.name"
              />
            </div>
            <div class="provider-info">
              <h3>{{ provider.name }}</h3>
              <p class="provider-headline">
                {{ provider.headline || "Professional Service Provider" }}
              </p>
              <div class="provider-skills">
                <span
                  v-for="(skill, index) in provider.skills.slice(0, 3)"
                  :key="index"
                  class="skill-tag"
                >
                  {{ skill.name }}
                </span>
              </div>
              <div class="provider-footer">
                <div class="rating">
                  <span class="stars"
                    >★ {{ provider.rating?.toFixed(1) || "0.0" }}</span
                  >
                  <span class="review-count"
                    >({{ provider.reviewCount || "0" }} reviews)</span
                  >
                </div>
                <button @click="handleViewProfile()" class="view-profile">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-wrapper">
          <div class="contact-info">
            <h2>Get in Touch</h2>
            <p>Need help? Contact us through email, phone, or Facebook.</p>
            <div class="contact-details">
              <div class="contact-item">
                <div class="contact-icon gmail-icon">
                  <i class="fab fa-google"></i>
                </div>
                <div class="contact-text">
                  <h4>Email</h4>
                  <a href="mailto:servicelinkolongapo@gmail.com"
                    >servicelinkolongapo@gmail.com</a
                  >
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="contact-text">
                  <h4>Phone</h4>
                  <a href="tel:09150664403">09150664403</a>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon facebook-icon">
                  <i class="fab fa-facebook-f"></i>
                </div>
                <div class="contact-text">
                  <h4>Facebook</h4>
                  <a
                    href="https://www.facebook.com/profile.php?id=61584255115576"
                    target="_blank"
                    rel="noopener noreferrer"
                    >Service Link</a
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="contact-visual">
            <div class="contact-card">
              <i class="fa fa-comments"></i>
              <p>We're here to help!</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo-box">
              <img
                :src="logoImage"
                alt="ServiceLink Logo"
                class="footer-logo"
              />
            </div>
            <p class="footer-description">
              Connecting Olongapo with trusted service providers. Your one-stop
              platform for all service needs.
            </p>
            <div class="social-links">
              <a
                href="https://www.facebook.com/profile.php?id=61584255115576"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link facebook"
                aria-label="Facebook"
              >
                <i class="fab fa-facebook-f"></i>
              </a>
              <a
                href="mailto:servicelinkolongapo@gmail.com"
                class="social-link email"
                aria-label="Email"
              >
                <i class="fab fa-google"></i>
              </a>
              <a
                href="tel:09150664403"
                class="social-link phone"
                aria-label="Phone"
              >
                <i class="fas fa-phone"></i>
              </a>
            </div>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><router-link to="/login">Find Services</router-link></li>
              <li>
                <router-link to="/register">Register as Provider</router-link>
              </li>
              <li>
                <router-link to="/register/client"
                  >Register as Client</router-link
                >
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact Us</h4>
            <ul class="footer-links">
              <li>
                <i class="fab fa-google"></i>
                <a href="mailto:servicelinkolongapo@gmail.com"
                  >servicelinkolongapo@gmail.com</a
                >
              </li>
              <li>
                <i class="fas fa-phone"></i>
                <a href="tel:09150664403">09150664403</a>
              </li>
              <li>
                <i class="fab fa-facebook-f"></i>
                <a
                  href="https://www.facebook.com/profile.php?id=61584255115576"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Service Link</a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>
            &copy; {{ currentYear }} ServiceLink - Mabayuan Olongapo City,
            Zambales. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import apiService, {
  providerService,
  adminService,
} from "../services/apiService";
import { useRouter } from "vue-router";
import logoImage from "../assets/logo.png";

export default {
  name: "LandingPage",
  setup() {
    const router = useRouter();
    const categories = ref([
      {
        name: "Tutoring & Education",
        shapeClass: "shape-ring",
        icon: "fa fa-graduation-cap",
        description: "Find qualified tutors and educators for various subjects",
      },
      {
        name: "Home Services",
        shapeClass: "shape-square",
        icon: "fa fa-home",
        description: "Home maintenance, cleaning, and improvement services",
      },
      {
        name: "Handyman Services",
        shapeClass: "shape-block",
        icon: "fa fa-wrench",
        description: "Repair and installation services for your home",
      },
      {
        name: "Professional Services",
        shapeClass: "shape-circle",
        icon: "fa fa-briefcase",
        description: "Business consulting and professional advice",
      },
      {
        name: "IT & Tech Support",
        shapeClass: "shape-ring",
        icon: "fa fa-laptop",
        description: "Computer repair and technical assistance",
      },
      {
        name: "Delivery & Errands",
        shapeClass: "shape-square",
        icon: "fa fa-truck",
        description: "Local delivery and personal errand services",
      },
    ]);

    const features = ref([
      {
        shapeClass: "shape-circle",
        icon: "fa fa-check-circle",
        title: "Verified Providers",
        description: "All service providers undergo verification process",
      },
      {
        shapeClass: "shape-square",
        icon: "fas fa-coins",
        title: "Transparent Pricing",
        description: "Clear pricing with no hidden charges",
      },
      {
        shapeClass: "shape-ring",
        icon: "fa fa-star",
        title: "Customer Reviews",
        description: "Read authentic reviews from previous customers",
      },
      {
        shapeClass: "shape-block",
        icon: "fa fa-calendar-check",
        title: "Easy Booking",
        description: "Simple and straightforward booking process",
      },
      {
        shapeClass: "shape-circle",
        icon: "fa fa-shield-alt",
        title: "Secure Platform",
        description: "Your data and transactions are secure",
      },
      {
        shapeClass: "shape-square",
        icon: "fa fa-map-marker-alt",
        title: "Local Services",
        description: "Find services available in Olongapo area",
      },
    ]);

    const providers = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentYear = computed(() => new Date().getFullYear());

    const DEFAULT_AVATAR =
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'><rect width='128' height='128' fill='%23e0e0e0'/><circle cx='64' cy='50' r='26' fill='%239e9e9e'/><rect x='24' y='84' width='80' height='28' rx='14' fill='%239e9e9e'/></svg>";

    const getProfileImage = (profilePicture) => {
      if (!profilePicture) {
        return DEFAULT_AVATAR;
      }
      return apiService.getFileUrl(profilePicture);
    };

    const handleViewProfile = () => {
      router.push("/login");
    };

    const fetchProviders = async () => {
      try {
        loading.value = true;
        const response = await providerService.searchProviders(
          {},
          { limit: 5, sortBy: "rating", sortOrder: "desc" },
        );
        if (response.success) {
          providers.value = response.data.providers
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5);
        } else {
          error.value = response.message || "Failed to load providers";
        }
      } catch (err) {
        error.value = "An error occurred while loading providers";
        console.error("Error fetching providers:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchProviders();
      adminService.incrementWebsiteViews().catch(() => {});
    });

    return {
      providers,
      loading,
      error,
      categories,
      features,
      currentYear,
      handleViewProfile,
      getProfileImage,
      logoImage,
    };
  },
};
</script>

<style scoped>
.landing-page {
  background-color: #f8fafc;
  min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  width: 100%;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  position: relative;
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.hero-content {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  color: white;
  z-index: 2;
}

.hero-logo {
  width: 150px;
  margin-bottom: 30px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: fadeInDown 1s ease;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  color: white;
  animation: fadeInDown 1s ease 0.2s both;
}

.hero-tagline {
  font-size: 1.75rem;
  margin-bottom: 16px;
  opacity: 0.95;
  font-weight: 500;
  animation: fadeInDown 1s ease 0.4s both;
}

.hero-description {
  font-size: 1.1rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInDown 1s ease 0.6s both;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 60px;
  animation: fadeInUp 1s ease 0.8s both;
}

.primary-btn,
.outline-btn {
  padding: 16px 40px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.primary-btn {
  background-color: #ffffff;
  color: #106e40;
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background-color: #f0f0f0;
}

.outline-btn {
  border: 2px solid #ffffff;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.outline-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Features Section */
.features {
  padding: 100px 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #106e40, #38b676);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon-wrapper,
.category-icon-wrapper {
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.feature-icon-wrapper i,
.category-icon-wrapper i {
  font-size: 2rem;
  color: #106e40;
  z-index: 1;
  transition: all 0.3s ease;
}

/* Geometric Shapes - Used in both features and categories */
.shape-circle {
  width: 80px;
  height: 80px;
  background: rgba(16, 110, 64, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.shape-square {
  width: 80px;
  height: 80px;
  background: rgba(56, 182, 118, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.shape-ring {
  width: 80px;
  height: 80px;
  border: 3px solid rgba(16, 110, 64, 0.25);
  border-radius: 50%;
  background: rgba(16, 110, 64, 0.05);
  transition: all 0.3s ease;
}

.shape-block {
  width: 80px;
  height: 80px;
  background: rgba(56, 182, 118, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover .shape-circle,
.category-card:hover .shape-circle {
  background: rgba(16, 110, 64, 0.2);
  transform: scale(1.1);
}

.feature-card:hover .shape-square,
.category-card:hover .shape-square {
  background: rgba(56, 182, 118, 0.25);
  transform: scale(1.1);
}

.feature-card:hover .shape-ring,
.category-card:hover .shape-ring {
  border-color: rgba(16, 110, 64, 0.4);
  background: rgba(16, 110, 64, 0.1);
  transform: scale(1.1);
}

.feature-card:hover .shape-block,
.category-card:hover .shape-block {
  background: rgba(56, 182, 118, 0.2);
  transform: scale(1.1);
}

.feature-card:hover .feature-icon-wrapper i,
.category-card:hover .category-icon-wrapper i {
  color: #38b676;
  transform: scale(1.1);
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-bottom: 16px;
  color: #106e40;
  font-weight: 600;
}

.feature-card p {
  color: #4a5568;
  line-height: 1.6;
  font-size: 1rem;
}

/* Sections Common Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.8rem;
  font-weight: 700;
  color: #106e40;
  margin-bottom: 16px;
  position: relative;
  display: inline-block;
}

.section-header h2::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #106e40, #38b676);
  transform: translateX(-50%);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #4a5568;
  margin-top: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Categories Section */
.categories {
  padding: 100px 0;
  background-color: white;
  position: relative;
  overflow: hidden;
}

.categories::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #106e40, #38b676, #8cc63f);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.category-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.category-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #8cc63f;
  z-index: 2;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card h3 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #106e40;
  font-weight: 600;
}

.category-card p {
  color: #4a5568;
  margin-bottom: 24px;
  line-height: 1.6;
}

.category-link {
  color: #38b676;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
  display: inline-block;
  padding: 8px 0;
  position: relative;
}

.category-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #8cc63f;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.category-link:hover {
  color: #106e40;
}

.category-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* Featured Providers Section */
.featured-providers {
  padding: 100px 0;
  background-color: #f8fafc;
  position: relative;
}

.featured-providers::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(16, 110, 64, 0.2),
    transparent
  );
}

.providers-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.provider-card {
  width: calc(20% - 16px);
  min-width: 200px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.provider-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.provider-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  position: relative;
}

.provider-image::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
}

.provider-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.provider-card:hover .provider-image img {
  transform: scale(1.05);
}

.provider-info {
  padding: 24px;
}

.provider-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #106e40;
  margin-bottom: 8px;
}

.provider-headline {
  color: #4a5568;
  margin-bottom: 16px;
  line-height: 1.5;
}

.provider-skills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.skill-tag {
  background-color: #f0fff4;
  color: #38b676;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.skill-tag:hover {
  background-color: #38b676;
  color: white;
}

.provider-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #8cc63f;
  font-weight: 600;
}

.review-count {
  color: #718096;
  font-size: 0.9rem;
}

.view-profile {
  color: #38b676;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: none;
  cursor: pointer;
}

.view-profile:hover {
  color: white;
  background-color: #38b676;
}

/* Contact Section */
.contact-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #106e40 0%, #38b676 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.contact-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
}

.contact-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.contact-info h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.contact-info > p {
  font-size: 1.1rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.contact-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-icon:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.contact-icon.facebook-icon {
  background: rgba(24, 119, 242, 0.5) !important;
  border-color: rgba(24, 119, 242, 0.8) !important;
}

.contact-icon.facebook-icon:hover {
  background: #1877f2 !important;
  transform: translateY(-2px) scale(1.05);
}

.contact-icon.facebook-icon i {
  color: white !important;
  font-size: 2.5rem !important;
  font-weight: normal;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: block;
  line-height: 1;
}

.contact-icon.gmail-icon {
  background: rgba(234, 67, 53, 0.5) !important;
  border-color: rgba(234, 67, 53, 0.8) !important;
}

.contact-icon.gmail-icon:hover {
  background: #ea4335 !important;
  transform: translateY(-2px) scale(1.05);
}

.contact-icon.gmail-icon i {
  color: white !important;
  font-size: 2.5rem !important;
  font-weight: normal;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: block;
  line-height: 1;
}

.contact-icon i {
  display: block;
}

.contact-text h4 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.contact-text a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.contact-text a:hover {
  opacity: 1;
  text-decoration: underline;
}

.contact-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.contact-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 60px;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-card i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.9;
  color: white;
}

.contact-card p {
  font-size: 1.2rem;
  font-weight: 500;
  color: white;
}

/* Footer */
.footer {
  background: #1a1a1a;
  color: #ffffff;
  padding: 60px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  width: 180px;
  height: auto;
  margin-bottom: 20px;
  display: block;
  filter: none;
  opacity: 1;
}

.footer-description {
  color: #b0b0b0;
  line-height: 1.6;
  margin-bottom: 30px;
  max-width: 350px;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-link {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.social-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.social-link.facebook {
  background: rgba(24, 119, 242, 0.2);
  border: 2px solid rgba(24, 119, 242, 0.4);
}

.social-link.facebook:hover {
  background: #1877f2;
  transform: translateY(-3px) scale(1.1);
}

.social-link.email {
  background: rgba(234, 67, 53, 0.2);
  border: 2px solid rgba(234, 67, 53, 0.4);
}

.social-link.email:hover {
  background: #ea4335;
  transform: translateY(-3px) scale(1.1);
}

.social-link.phone:hover {
  background: #38b676;
}

.footer-section h4 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: white;
  font-weight: 600;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.footer-links a:hover {
  color: #38b676;
}

.footer-links i {
  width: 20px;
  text-align: center;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #b0b0b0;
  font-size: 0.9rem;
}

/* Loading and Error States */
.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #38b676;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.error-message {
  text-align: center;
  color: #e53e3e;
  padding: 40px;
  background-color: #fff5f5;
  border-radius: 12px;
  margin: 20px 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 968px) {
  .contact-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-tagline {
    font-size: 1.3rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 16px;
  }

  .primary-btn,
  .outline-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .categories-grid,
  .providers-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .category-card,
  .provider-card,
  .feature-card {
    margin: 0;
  }

  .contact-info h2 {
    font-size: 2rem;
  }
}
</style>
