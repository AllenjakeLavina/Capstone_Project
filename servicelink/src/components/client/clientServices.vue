<template>
  <div class="client-services">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading services...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error">{{ error }}</div>
    </div>

    <div v-else class="services-container">
      <h1 class="page-title">Service Categories</h1>

      <!-- Category Selection List -->
      <div class="categories-selection" v-if="!selectedCategory">
        <div class="category-grid">
          <div v-for="category in categories" :key="category.id" 
               class="category-card-selection" 
               @click="selectCategory(category)">
            <div class="category-image">
              <img v-if="category.imageUrl" 
                   :src="category.imageUrl" 
                   :alt="category.name"
                   @error="handleImageError" />
              <i v-else class="fa fa-briefcase category-icon"></i>
            </div>
            <div class="category-info">
              <h2 class="category-name">{{ category.name }}</h2>
              <p class="category-description">{{ truncateText(category.description || 'No description available', 100) }}</p>
              <p class="service-count">{{ category.serviceCount }} services available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Category and Services -->
      <div v-if="selectedCategory" class="selected-category">
        <div class="back-button-container">
          <button class="btn btn-back" @click="backToCategories">
            <i class="fa fa-arrow-left"></i> Back to Categories
          </button>
        </div>

        <div class="category-header">
          <div class="category-image">
            <img v-if="selectedCategory.imageUrl" 
                 :src="selectedCategory.imageUrl" 
                 :alt="selectedCategory.name"
                 @error="handleImageError" />
            <i v-else class="fa fa-briefcase category-icon"></i>
          </div>
          <div class="category-info">
            <h2 class="category-name">{{ selectedCategory.name }}</h2>
            <p class="category-description">{{ selectedCategory.description }}</p>
            <p class="service-count">{{ selectedCategory.serviceCount }} services available</p>
          </div>
        </div>

        <!-- Services for this category -->
        <div class="services-list" v-if="selectedCategory.services.length > 0">
          <div v-for="service in displayedServices" :key="service.id" class="service-card">
            <div class="service-image" v-if="service.imageUrls && service.imageUrls.length > 0">
              <img :src="service.imageUrls[0]" :alt="service.title" />
            </div>
            <div class="service-content">
              <h3 class="service-title">{{ service.title }}</h3>
              <p class="service-description">
                {{ truncateText(service.description, 150) }}
              </p>
              <div class="service-provider">
                <div class="provider-image" v-if="service.provider.profilePicture">
                  <img :src="service.provider.profilePicture" :alt="service.provider.name" />
                </div>
                <div class="provider-info">
                  <p class="provider-name" 
                     @click="viewProviderDetails(service.provider.id)"
                     style="cursor: pointer; color: #3498db;">
                    {{ service.provider.name }}
                  </p>
                  <div class="rating" v-if="service.provider.rating">
                    <span class="stars">
                      <i v-for="i in 5" :key="i" 
                        :class="['fa', i <= Math.round(service.provider.rating) ? 'fa-star' : 'fa-star-o']"></i>
                    </span>
                    <span class="rating-value">{{ service.provider.rating.toFixed(1) }}</span>
                    <span class="review-count">({{ service.provider.reviewCount }})</span>
                  </div>
                </div>
              </div>
              <div class="service-footer">
                <div class="service-price">
                  <span class="price">₱{{ Number(service.pricing).toFixed(2) }}</span>
                  <span class="price-type">/ {{ formatPriceType(service.pricingType) }}</span>
                </div>
                <div class="service-actions">
                
                  <button class="btn btn-book" @click="bookService(service)">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Show More/Less button -->
          <div class="show-more-container" v-if="selectedCategory.services.length > initialServiceCount">
            <button 
              class="btn btn-show-more" 
              @click="toggleShowMore"
            >
              {{ showAllServices ? 'Show Less' : `Show More (${selectedCategory.services.length - displayedServices.length} more)` }}
            </button>
          </div>
        </div>
        <div v-else class="no-services">
          No services available in this category
        </div>
      </div>

      <!-- Booking Modal -->
      <div v-if="showBookingModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Book Service</h2>
            <button class="close-btn" @click="closeBookingModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="booking-service-details">
              <h3>{{ selectedService.title }}</h3>
              <p class="modal-price">₱{{ Number(selectedService.pricing).toFixed(2) }} / {{ formatPriceType(selectedService.pricingType) }}</p>
              <p>Provider: {{ selectedService.provider.name }}</p>
            </div>
            
            <form @submit.prevent="submitBooking">
              <div class="form-group">
                <label for="booking-date">Date & Time</label>
                <input 
                  type="datetime-local" 
                  id="booking-date" 
                  v-model="bookingForm.dateTime" 
                  required
                  :min="currentDateTimeString"
                />
              </div>
              
              <div class="form-group">
                <label for="booking-address">Address</label>
                <select id="booking-address" v-model="bookingForm.addressId" required>
                  <option value="">-- Select an address --</option>
                  <option v-for="address in addresses" :key="address.id" :value="address.id">
                    {{ formatAddress(address) }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="booking-notes">Additional Notes</label>
                <textarea id="booking-notes" v-model="bookingForm.notes"></textarea>
              </div>
              
              <div class="booking-actions">
                <button type="button" class="btn btn-cancel" @click="closeBookingModal">Cancel</button>
                <button type="submit" class="btn btn-confirm" :disabled="isBookingSubmitting">
                  {{ isBookingSubmitting ? 'Processing...' : 'Confirm Booking' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Booking Success Modal -->
      <div v-if="showBookingSuccess" class="modal-overlay">
        <div class="modal success-modal">
          <div class="modal-header success">
            <h2>Booking Successful!</h2>
            <button class="close-btn" @click="closeSuccessModal">&times;</button>
          </div>
          <div class="modal-body text-center">
            <div class="success-icon">
              <i class="fa fa-check-circle"></i>
            </div>
            <p>Your booking has been successfully created.</p>
            <p>The service provider will be notified and will confirm your booking.</p>
            <div class="booking-actions">
              <button class="btn btn-primary" @click="goToBookings">View My Bookings</button>
              <button class="btn btn-secondary" @click="closeSuccessModal">Continue Browsing</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Provider Details Modal -->
      <provider-details-modal
        v-if="selectedProvider"
        :showModal="showProviderModal"
        :provider="selectedProvider"
        @close="closeProviderModal"
      />
    </div>
  </div>
</template>

<script>
import { FILE_SERVER_URL, serviceService, clientService, providerService } from '@/services/apiService';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import ProviderDetailsModal from '@/components/modals/ProviderDetailsModal.vue';

const API_BASE_URL = FILE_SERVER_URL;
const getFileUrl = (relativePath) => {
  if (relativePath && (relativePath.startsWith('http://') || relativePath.startsWith('https://'))) {
    return relativePath;
  }
  
  if (relativePath && relativePath.startsWith('/')) {
    return `${API_BASE_URL}${relativePath}`;
  }
  
  return relativePath || '';
};

export default {
  name: 'ClientServices',
  components: {
    ProviderDetailsModal
  },
  setup() {
    const router = useRouter();
    const categories = ref([]);
    const selectedCategory = ref(null);
    const loading = ref(true);
    const error = ref('');
    const addresses = ref([]);

    // Booking modal state
    const showBookingModal = ref(false);
    const showBookingSuccess = ref(false);
    const selectedService = ref({});
    const isBookingSubmitting = ref(false);
    const bookingForm = ref({
      dateTime: '',
      addressId: '',
      notes: ''
    });

    // Provider details modal state
    const showProviderModal = ref(false);
    const selectedProvider = ref(null);

    // Get current date and time in ISO format for min attribute
    const currentDateTimeString = new Date().toISOString().slice(0, 16);
    
    // Fetch categories with services
    const fetchCategories = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await serviceService.getCategoriesWithServices();
        
        if (response.success) {
          // The category image URLs are already processed in the API service
          // so we can use the data directly
          categories.value = response.data;
        } else {
          error.value = response.message || 'Failed to load service categories';
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        error.value = 'Unable to load service categories. Please try again later.';
      } finally {
        loading.value = false;
      }
    };
    
    // Select a category to view its services
    const selectCategory = (category) => {
      selectedCategory.value = category;
    };
    
    // Go back to categories list
    const backToCategories = () => {
      selectedCategory.value = null;
    };
    
    // Fetch user addresses
    const fetchAddresses = async () => {
      try {
        const response = await clientService.getClientProfile();
        if (response.success && response.data.client && response.data.client.addresses) {
          addresses.value = response.data.client.addresses;
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      }
    };
    
    // Format address for display
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode} ${address.isDefault ? '(Default)' : ''}`;
    };

    // Format pricing type for display
    const formatPriceType = (type) => {
      switch (type) {
        case 'HOURLY': return 'hour';
        case 'FIXED': return 'fixed';
        case 'DAILY': return 'day';
        case 'SESSION': return 'session';
        default: return type.toLowerCase();
      }
    };
    
    // Truncate text for display
    const truncateText = (text, length) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    };
    
    // Open booking modal
    const bookService = (service) => {
      // Create a deep copy of the service and process its image URLs
      const processedService = JSON.parse(JSON.stringify(service));
      
      // Make sure the provider profile picture is processed correctly
      if (processedService.provider && processedService.provider.profilePicture) {
        processedService.provider.profilePicture = getFileUrl(processedService.provider.profilePicture);
      }
      
      // Process service image URLs if any
      if (processedService.imageUrls && Array.isArray(processedService.imageUrls)) {
        processedService.imageUrls = processedService.imageUrls.map(url => getFileUrl(url));
      }
      
      selectedService.value = processedService;
      showBookingModal.value = true;
    };
    
    // Close booking modal
    const closeBookingModal = () => {
      showBookingModal.value = false;
      // Reset form
      bookingForm.value = {
        dateTime: '',
        addressId: '',
        notes: ''
      };
    };
    
    // Close success modal
    const closeSuccessModal = () => {
      showBookingSuccess.value = false;
    };
    
    // Navigate to bookings page
    const goToBookings = () => {
      router.push('/client/bookings');
      showBookingSuccess.value = false;
    };
    
    // Submit booking
    const submitBooking = async () => {
      if (!bookingForm.value.dateTime || !bookingForm.value.addressId) {
        alert('Please fill in all required fields');
        return;
      }
      
      isBookingSubmitting.value = true;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const bookingData = {
          serviceId: selectedService.value.id,
          startTime: new Date(bookingForm.value.dateTime).toISOString(),
          addressId: bookingForm.value.addressId,
          notes: bookingForm.value.notes || null
        };
        
        const response = await clientService.bookService(bookingData);
        
        if (response.success) {
          closeBookingModal();
          showBookingSuccess.value = true;
        } else {
          alert('Failed to create booking: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error creating booking:', err);
        alert('Failed to create booking. Please try again later.');
      } finally {
        isBookingSubmitting.value = false;
      }
    };
    
    // View provider details
    const viewProviderDetails = async (providerId) => {
      if (!providerId) {
        console.error('Provider ID is undefined');
        return;
      }
      
      try {
        loading.value = true;
        const response = await providerService.getProviderDetails(providerId);
        if (response.success) {
          selectedProvider.value = response.data;
          showProviderModal.value = true;
        } else {
          console.error('Failed to load provider details:', response.message);
          error.value = 'Failed to load provider details. Please try again.';
        }
      } catch (err) {
        console.error('Error loading provider details:', err);
        error.value = 'An error occurred while loading provider details.';
      } finally {
        loading.value = false;
      }
    };
    
    // Close provider details modal
    const closeProviderModal = () => {
      showProviderModal.value = false;
      selectedProvider.value = null;
    };
    
    // Load data on component mount
    onMounted(() => {
      fetchCategories();
      fetchAddresses();
    });
    
    // Add these new refs
    const initialServiceCount = 6; // Number of services to show initially
    const showAllServices = ref(false);
    
    // Computed property for displayed services
    const displayedServices = computed(() => {
      if (!selectedCategory.value) return [];
      return showAllServices.value 
        ? selectedCategory.value.services 
        : selectedCategory.value.services.slice(0, initialServiceCount);
    });

    // Toggle show more/less
    const toggleShowMore = () => {
      showAllServices.value = !showAllServices.value;
    };

    // Handle image loading errors
    const handleImageError = (event) => {
      // Log the error for debugging
      console.warn('Failed to load image:', event.target.src);
      
      // Hide the broken image
      event.target.style.display = 'none';
      
      // Add an icon instead
      const iconElement = document.createElement('i');
      iconElement.className = 'fa fa-briefcase category-icon';
      event.target.parentNode.appendChild(iconElement);
    };

    return {
      categories,
      selectedCategory,
      loading,
      error,
      addresses,
      showBookingModal,
      showBookingSuccess,
      selectedService,
      bookingForm,
      isBookingSubmitting,
      currentDateTimeString,
      showProviderModal,
      selectedProvider,
      selectCategory,
      backToCategories,
      formatAddress,
      formatPriceType,
      truncateText,
      
      bookService,
      closeBookingModal,
      closeSuccessModal,
      goToBookings,
      submitBooking,
      viewProviderDetails,
      closeProviderModal,
      displayedServices,
      toggleShowMore,
      showAllServices,
      initialServiceCount,
      handleImageError,
    };
  }
};
</script>

<style scoped>
.client-services {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 20px 30px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
}

.page-title {
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: 700;
  border-left: 5px solid #3498db;
  padding-left: 15px;
  transition: all 0.3s ease;
  position: relative;
}

.page-title:hover {
  transform: translateX(5px);
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 2px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  width: 100%;
}

.spinner {
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
  width: 100%;
}

.error {
  color: #e74c3c;
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 4px solid #e74c3c;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Categories Selection Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.category-card-selection {
  background: linear-gradient(to bottom, #ffffff, #f9f9f9);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.category-card-selection::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background: linear-gradient(to bottom, #3498db, #2ecc71);
  transition: height 0.3s ease;
}

.category-card-selection:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-card-selection:hover::before {
  height: 100%;
}

.category-card-selection .category-image {
  height: 200px;
  width: 100%;
  overflow: hidden;
}

.category-card-selection .category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-card-selection:hover .category-image img {
  transform: scale(1.1);
}

.category-card-selection .category-info {
  padding: 20px;
}

/* Selected Category Display */
.back-button-container {
  margin-bottom: 25px;
}

.btn-back {
  background: linear-gradient(135deg, #f1f1f1, #e0e0e0);
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.btn-back:hover {
  background: linear-gradient(135deg, #e0e0e0, #d5d5d5);
  transform: translateX(-5px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.category-image {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-image:hover img {
  transform: scale(1.1);
}

.category-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-name {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  color: #2c3e50;
  font-weight: 700;
}

.category-description {
  margin: 0 0 15px 0;
  color: #555;
  line-height: 1.6;
  font-size: 1.05rem;
}

.service-count {
  font-size: 0.95rem;
  color: #3498db;
  margin: 0;
  font-weight: 600;
  background-color: rgba(52, 152, 219, 0.1);
  display: inline-block;
  padding: 8px 15px;
  border-radius: 50px;
}

.services-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  width: 100%;
}

.service-card {
  background: linear-gradient(135deg, #ffffff, #f9f9f9);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.service-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.service-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.service-card:hover .service-image img {
  transform: scale(1.1);
}

.service-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.service-title {
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 600;
  line-height: 1.3;
}

.service-description {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.service-provider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
}

.provider-image {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.provider-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.provider-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #3498db;
  transition: all 0.2s ease;
}

.provider-name:hover {
  color: #2980b9;
  text-decoration: underline;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #f39c12;
}

.rating-value {
  font-weight: 600;
  color: #333;
}

.review-count {
  font-size: 0.8rem;
  color: #777;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.service-price {
  font-size: 1.2rem;
}

.price {
  font-weight: 700;
  color: #2ecc71;
}

.price-type {
  font-size: 0.8rem;
  color: #777;
}

.service-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-details {
  background: linear-gradient(135deg, #ecf0f1, #e0e0e0);
  color: #555;
}

.btn-book {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2);
}

.btn-details:hover {
  background: linear-gradient(135deg, #e0e0e0, #d5d5d5);
  transform: translateY(-2px);
}

.btn-book:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.3);
}

.no-services {
  text-align: center;
  padding: 60px 30px;
  color: #777;
  font-style: italic;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background-color: white;
  border-radius: 15px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa, #f1f1f1);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.modal-header.success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: inherit;
  transition: all 0.2s ease;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  transform: rotate(90deg);
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 25px;
}

.booking-service-details {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.booking-service-details h3 {
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 600;
}

.modal-price {
  font-size: 1.3rem;
  color: #2ecc71;
  font-weight: 700;
  margin-bottom: 15px;
  background-color: rgba(46, 204, 113, 0.1);
  padding: 10px 15px;
  border-radius: 8px;
  display: inline-block;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

.btn-cancel {
  background: linear-gradient(135deg, #ecf0f1, #e0e0e0);
  color: #555;
}

.btn-confirm {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.2);
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e0e0e0, #d5d5d5);
  transform: translateY(-2px);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #27ae60, #219d55);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(46, 204, 113, 0.3);
}

.btn-confirm:disabled {
  background: linear-gradient(135deg, #a5d6a7, #c8e6c9);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success-modal {
  max-width: 450px;
}

.success-icon {
  font-size: 4.5rem;
  color: #2ecc71;
  margin-bottom: 25px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.text-center {
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2);
}

.btn-secondary {
  background: linear-gradient(135deg, #ecf0f1, #e0e0e0);
  color: #555;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e0e0e0, #d5d5d5);
  transform: translateY(-2px);
}

.show-more-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
  grid-column: 1 / -1; /* Spans full width in grid */
}

.btn-show-more {
  background: linear-gradient(135deg, #f8f9fa, #f1f1f1);
  color: #3498db;
  border: 2px solid #3498db;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 220px;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.1);
}

.btn-show-more:hover {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(52, 152, 219, 0.2);
}

/* Add transition for services */
.services-list {
  position: relative;
}

.service-card {
  transition: all 0.3s ease-in-out;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media screen and (max-width: 1600px) {
  .services-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media screen and (max-width: 1200px) {
  .services-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .client-services {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .category-header {
    flex-direction: column;
  }
  
  .category-image {
    width: 100%;
    height: 180px;
    margin-bottom: 15px;
  }
  
  .services-list {
    grid-template-columns: 1fr;
  }
  
  .service-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .btn {
    width: 100%;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .service-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-confirm, .btn-primary, .btn-secondary {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {
  .client-services {
    padding: 10px;
  }
  
  .modal {
    width: 95%;
  }
  
  .modal-body, .modal-header {
    padding: 15px;
  }
  
  .service-card {
    border-radius: 10px;
  }
  
  .service-image {
    height: 160px;
  }
  
  .service-title {
    font-size: 1.2rem;
  }
}
</style>
