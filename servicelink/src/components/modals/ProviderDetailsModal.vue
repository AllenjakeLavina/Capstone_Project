<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal provider-details-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="provider-quick-info">
            <img 
              :src="getFileUrl(provider.profilePicture)" 
              :alt="provider.fullName"
              class="header-profile-pic"
            />
            <div class="provider-header-details">
              <h2>{{ provider.fullName }}</h2>
              <div class="rating-container">
                <div class="stars">
                  <i v-for="i in 5" :key="i" 
                     :class="['fa', i <= Math.round(provider.rating || 0) ? 'fa-star' : 'fa-star-o']">
                  </i>
                </div>
                <span class="rating-text">
                  {{ provider.rating ? provider.rating.toFixed(1) : 'No' }} 
                  ({{ provider.reviewCount || 0 }} reviews)
                </span>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
      </div>

      <div class="modal-body">
        <div class="tab-container">
          <div class="tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- About Tab -->
            <div v-if="activeTab === 'about'" class="tab-pane">
              <div class="info-section">
                <h3>Contact Information</h3>
                <div class="contact-info">
                  <p><i class="fa fa-envelope"></i> {{ provider.email }}</p>
                  <p><i class="fa fa-phone"></i> {{ provider.phone || 'No phone provided' }}</p>
                </div>
              </div>

              <div class="info-section">
                <h3>Professional Summary</h3>
                <p class="headline">{{ provider.headline || 'No headline provided' }}</p>
                <p class="bio">{{ provider.bio || 'No bio provided' }}</p>
              </div>

              <div class="info-section">
                <h3>Skills</h3>
                <div class="skills-list">
                  <span v-for="skill in provider.skills" 
                        :key="skill.id" 
                        class="skill-tag">
                    {{ skill.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Services Tab -->
            <div v-if="activeTab === 'services'" class="tab-pane">
              <div class="services-grid">
                <div v-for="service in provider.services" 
                     :key="service.id" 
                     class="service-card">
                  <div class="service-image" v-if="service.imageUrls?.length">
                    <img :src="getFileUrl(service.imageUrls[0])" :alt="service.title">
                  </div>
                  <div class="service-info">
                    <h4>{{ service.title }}</h4>
                    <p>{{ service.description }}</p>
                    <div class="service-footer">
                      <span class="price">₱{{ Number(service.pricing).toFixed(2) }}</span>
                      <span class="price-type">/ {{ formatPriceType(service.pricingType) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portfolio Tab -->
            <div v-if="activeTab === 'portfolio'" class="tab-pane">
              <div class="portfolio-grid">
                <div v-for="item in provider.portfolio" 
                     :key="item.id" 
                     class="portfolio-card">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="portfolio-files">
                    <a v-for="file in item.files" 
                       :key="file.id"
                       :href="getFileUrl(file.fileUrl)"
                       target="_blank"
                       class="file-link">
                      <i :class="getFileIcon(file.fileType)"></i>
                      {{ file.fileName }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews'" class="tab-pane">
              <div class="reviews-list">
                <div v-for="review in provider.reviews" 
                     :key="review.id" 
                     class="review-card">
                  <div class="review-header">
                    <img 
                      v-if="review.giver.profilePicture" 
                      :src="getFileUrl(review.giver.profilePicture)" 
                      :alt="review.giver.firstName"
                      class="reviewer-pic"
                    />
                    <div class="reviewer-info">
                      <span class="reviewer-name">
                        {{ review.giver.firstName }} {{ review.giver.lastName }}
                      </span>
                      <div class="review-rating">
                        <i v-for="i in 5" 
                           :key="i"
                           :class="['fa', i <= review.rating ? 'fa-star' : 'fa-star-o']">
                        </i>
                      </div>
                    </div>
                    <span class="review-date">
                      {{ formatDate(review.createdAt) }}
                    </span>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FILE_SERVER_URL } from '@/services/apiService';
import { ref } from 'vue';

export default {
  name: 'ProviderDetailsModal',
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    provider: {
      type: Object,
      required: true
    }
  },
  setup() {
    const activeTab = ref('about');
    
    const tabs = [
      { id: 'about', label: 'About', icon: 'fa fa-user' },
      { id: 'services', label: 'Services', icon: 'fa fa-briefcase' },
      { id: 'portfolio', label: 'Portfolio', icon: 'fa fa-folder-open' },
      { id: 'reviews', label: 'Reviews', icon: 'fa fa-star' }
    ];

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatPriceType = (type) => {
      const types = {
        HOURLY: 'hour',
        FIXED: 'fixed',
        DAILY: 'day',
        SESSION: 'session'
      };
      return types[type] || type.toLowerCase();
    };

    return {
      activeTab,
      tabs,
      formatDate,
      formatPriceType
    };
  },
  methods: {
    getFileUrl(relativePath) {
      if (!relativePath) return '';
      if (relativePath.startsWith('http')) return relativePath;
      return `${FILE_SERVER_URL}${relativePath}`;
    },
    getFileIcon(fileType) {
      const icons = {
        document: 'fa fa-file-text-o',
        image: 'fa fa-file-image-o',
        pdf: 'fa fa-file-pdf-o'
      };
      return icons[fileType] || 'fa fa-file-o';
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.provider-details-modal {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.provider-quick-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.provider-header-details h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.stars {
  color: #f1c40f;
}

.rating-text {
  color: #666;
  font-size: 0.9rem;
}

.tab-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
}

.tab-button {
  padding: 15px 25px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.tab-button i {
  font-size: 1.1rem;
}

.tab-button.active {
  color: #3498db;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #3498db;
}

.tab-content {
  padding: 20px;
  overflow-y: auto;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.contact-info {
  display: flex;
  gap: 20px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background: #e1f0ff;
  color: #3498db;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.service-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-image {
  height: 150px;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-info {
  padding: 15px;
}

.service-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.service-footer {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.price {
  color: #2ecc71;
  font-weight: 600;
  font-size: 1.1rem;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.portfolio-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3498db;
  text-decoration: none;
  padding: 5px 0;
}

.file-link:hover {
  text-decoration: underline;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.reviewer-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  display: block;
  font-weight: 500;
  color: #2c3e50;
}

.review-date {
  color: #666;
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .provider-details-modal {
    width: 95%;
    margin: 10px;
  }

  .tabs {
    overflow-x: auto;
    padding: 0 10px;
  }

  .tab-button {
    padding: 12px 15px;
    font-size: 0.9rem;
  }

  .services-grid,
  .portfolio-grid {
    grid-template-columns: 1fr;
  }

  .contact-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
