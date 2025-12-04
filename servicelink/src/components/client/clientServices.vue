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
      <!-- Header with Title and Search/Filter -->
      <div class="page-header-section">
        <h1 class="page-title">Service Categories</h1>
        
        <!-- Search and Filter Section - Enhanced design -->
        <div class="search-filter-section-fixed">
          <div class="search-filter-column">
            <div class="search-filter-row">
              <div class="search-container">
                <div class="search-input-wrapper">
                  <i class="fa fa-search search-icon"></i>
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    :placeholder="selectedCategory ? 'Search services by title, description, or provider name...' : 'Search categories by name or description...'"
                    class="search-input"
                  />
                  <button 
                    v-if="searchQuery" 
                    @click="clearSearch" 
                    class="clear-search-btn"
                    title="Clear search"
                  >
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </div>
              
              <!-- Filter Button (only show when inside a category) -->
              <button 
                v-if="selectedCategory"
                @click="showFilters = !showFilters"
                class="filter-toggle-btn"
                :class="{ active: showFilters }"
                title="Toggle filters"
              >
                <i class="fa fa-filter"></i>
              </button>

            </div>
            
            <!-- Tag Filter Chips (only show when viewing categories) -->
            <div v-if="!selectedCategory" class="tag-filter-chips">
              <button
                v-for="tag in filterTags"
                :key="tag"
                @click="activeTag = tag"
                class="tag-chip"
                :class="{ active: activeTag === tag }"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          
          <!-- Collapsible Filter Panel -->
          <div v-show="showFilters" class="filter-container">
          <div class="filter-group" v-if="selectedCategory">
            <label for="sort-by">Sort by:</label>
            <select id="sort-by" v-model="sortBy" class="filter-select">
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
          
          <div class="filter-group" v-if="selectedCategory">
            <label for="price-filter">Price Range:</label>
            <select id="price-filter" v-model="priceFilter" class="filter-select">
              <option value="all">All Prices</option>
              <option value="0-500">₱0 - ₱500</option>
              <option value="500-1000">₱500 - ₱1,000</option>
              <option value="1000-2000">₱1,000 - ₱2,000</option>
              <option value="2000+">₱2,000+</option>
            </select>
          </div>
          
          <div class="filter-group" v-if="selectedCategory">
            <label for="rating-filter">Minimum Rating:</label>
            <select id="rating-filter" v-model="ratingFilter" class="filter-select">
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Star</option>
            </select>
          </div>
          
          <button 
            v-if="selectedCategory && hasActiveFilters" 
            @click="clearFilters" 
            class="clear-filters-btn"
          >
            <i class="fa fa-times"></i> Clear Filters
          </button>
        </div>
        
        </div>
      </div>

      <!-- Category Selection List -->
      <div class="categories-selection" v-if="!selectedCategory">
        <div class="category-grid">
          <div v-for="category in filteredCategories" :key="category.id" 
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
          <template v-if="filteredServices.length > 0">
            <div v-for="service in displayedFilteredServices" :key="service.id" class="service-card">
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
            <div class="show-more-container" v-if="filteredServices.length > initialServiceCount">
              <button 
                class="btn btn-show-more" 
                @click="toggleShowMore"
              >
                {{ showAllServices ? 'Show Less' : `Show More (${filteredServices.length - displayedFilteredServices.length} more)` }}
              </button>
            </div>
          </template>
          
          <!-- No results message -->
          <div v-else class="no-results">
            <i class="fa fa-search"></i>
            <p>No services found matching your search criteria.</p>
            <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
          </div>
        </div>
        <div v-else class="no-services">
          No services available in this category
        </div>
      </div>

      <!-- Booking Modal -->
      <Teleport to="body">
        <div v-if="showBookingModal" class="modal-overlay" @click.self="closeBookingModal">
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
                  <label>Select Available Time Slot</label>
                  
                  <div v-if="loadingAvailability" class="loading-availability">
                    <i class="fa fa-spinner fa-spin"></i> Loading availability...
                  </div>
                  
                  <div v-else-if="availabilityByDay.length === 0" class="no-availability">
                    <i class="fa fa-calendar-times"></i>
                    <p>No available time slots set by this provider.</p>
                    <p>Please contact the provider for booking options.</p>
                  </div>
                  
                  <div v-else class="availability-slots">
                    <div 
                      v-for="day in availabilityByDay" 
                      :key="day.dayOfWeek" 
                      class="day-slot-group"
                    >
                      <h4 class="day-name">{{ day.dayName }}</h4>
                      <div class="time-slots-grid">
                        <button
                          v-for="slot in day.slots.filter(s => s.isAvailable !== false)"
                          :key="slot.id"
                          type="button"
                          class="time-slot-btn"
                          :class="{ active: bookingForm.selectedSlot?.id === slot.id }"
                          @click="bookingForm.selectedSlot = { ...slot, dayOfWeek: day.dayOfWeek, dayName: day.dayName }"
                        >
                          {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="booking-address">Address</label>
                  <div class="address-input-group">
                    <select id="booking-address" v-model="bookingForm.addressId" required>
                      <option value="">-- Select an address --</option>
                      <option v-for="address in addresses" :key="address.id" :value="address.id">
                        {{ formatAddress(address) }}
                      </option>
                    </select>
                    <button 
                      type="button" 
                      class="add-address-btn" 
                      @click="showAddAddressModal = true"
                      title="Add new address"
                    >
                      <i class="fa fa-plus"></i>
                    </button>
                  </div>
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
      </Teleport>

      <!-- Booking Success Modal -->
      <Teleport to="body">
        <div v-if="showBookingSuccess" class="modal-overlay" @click.self="closeSuccessModal">
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
      </Teleport>

      <!-- Booking Add Address Modal (separate overlay at root) -->
      <Teleport to="body">
        <add-address-modal
          v-if="showAddAddressModal"
          :showModal="showAddAddressModal"
          @close="closeAddAddressModal"
          @addressAdded="handleAddressAdded"
        />
      </Teleport>

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
import { ref, onMounted, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import ProviderDetailsModal from '@/components/modals/ProviderDetailsModal.vue';
import AddAddressModal from '@/components/modals/AddAddressModal.vue';

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
    ProviderDetailsModal,
    AddAddressModal
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
      selectedSlot: null, // { dayOfWeek, startTime, endTime, dayName }
      addressId: '',
      notes: ''
    });
    
    // Provider availability state
    const providerAvailability = ref(null);
    const loadingAvailability = ref(false);
    const availabilityByDay = ref([]);

    // Provider details modal state
    const showProviderModal = ref(false);
    const selectedProvider = ref(null);

    // Add Address modal state
    const showAddAddressModal = ref(false);

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
        case 'FIXED': return 'fixed';
        case 'DAILY': return 'day';
        case 'SESSION': return 'session';
        default: return (type || '').toLowerCase();
      }
    };
    
    // Truncate text for display
    const truncateText = (text, length) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    };
    
    // Fetch provider availability
    const fetchProviderAvailability = async (providerId) => {
      if (!providerId) return;
      
      loadingAvailability.value = true;
      try {
        const response = await providerService.getProviderAvailability(providerId);
        if (response.success && response.data) {
          providerAvailability.value = response.data;
          // Process availability by day - only show days with available slots
          availabilityByDay.value = (response.data.availabilityByDay || []).filter(day => {
            return day.slots && day.slots.length > 0 && 
                   day.slots.some(slot => slot.isAvailable !== false);
          });
        } else {
          console.error('Failed to fetch availability:', response.message);
          providerAvailability.value = null;
          availabilityByDay.value = [];
        }
      } catch (err) {
        console.error('Error fetching provider availability:', err);
        providerAvailability.value = null;
        availabilityByDay.value = [];
      } finally {
        loadingAvailability.value = false;
      }
    };
    
    // Format time helper
    const formatTime = (timeString) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    // Get next occurrence of a day of week
    const getNextDateForDay = (dayOfWeek) => {
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntil = dayOfWeek - currentDay;
      
      // If the day has passed this week or is today, get next week's occurrence
      if (daysUntil < 0 || (daysUntil === 0 && today.getHours() >= 23)) {
        daysUntil += 7;
      }
      
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      nextDate.setHours(0, 0, 0, 0);
      
      return nextDate;
    };
    
    // Open booking modal
    const bookService = async (service) => {
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
      
      // Fetch provider availability
      if (processedService.provider && processedService.provider.id) {
        await fetchProviderAvailability(processedService.provider.id);
      }
      
      showBookingModal.value = true;
    };
    
    // Close booking modal
    const closeBookingModal = () => {
      showBookingModal.value = false;
      // Reset form
      bookingForm.value = {
        selectedSlot: null,
        addressId: '',
        notes: ''
      };
      providerAvailability.value = null;
      availabilityByDay.value = [];
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
      if (!bookingForm.value.selectedSlot || !bookingForm.value.addressId) {
        Swal.fire({
          title: 'Incomplete Form',
          text: 'Please select an available time slot and an address.',
          icon: 'warning',
          confirmButtonColor: '#ff9800'
        });
        return;
      }

      // Calculate the actual date for the selected day and time
      const nextDate = getNextDateForDay(bookingForm.value.selectedSlot.dayOfWeek);
      const [hours, minutes] = bookingForm.value.selectedSlot.startTime.split(':');
      nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const now = new Date();
      
      // Guard: prevent past date/time
      if (nextDate.getTime() < now.getTime()) {
        Swal.fire({
          title: 'Invalid Start Time',
          text: 'Please choose a future time slot.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
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
          startTime: nextDate.toISOString(),
          addressId: bookingForm.value.addressId,
          notes: bookingForm.value.notes || null
        };
        
        const response = await clientService.bookService(bookingData);
        
        if (response.success) {
          closeBookingModal();
          showBookingSuccess.value = true;
        } else {
          Swal.fire({
            title: 'Failed to create booking',
            text: response.message || 'Unknown error',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error creating booking:', err);
        const serverMessage = err?.response?.data?.message || err?.message || 'Please try again later.';
        Swal.fire({
          title: 'Failed to create booking',
          text: serverMessage,
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
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

    // Close add address modal
    const closeAddAddressModal = () => {
      showAddAddressModal.value = false;
    };

    // Handle address added
    const handleAddressAdded = async () => {
      await fetchAddresses();
      // Auto-select the newly added address (assuming it's the last one)
      if (addresses.value.length > 0) {
        bookingForm.value.addressId = addresses.value[addresses.value.length - 1].id;
      }
    };
    
    // Load data on component mount
    onMounted(() => {
      fetchCategories();
      fetchAddresses();
    });
    
    // Search and filter refs
    const searchQuery = ref('');
    const sortBy = ref('default');
    const priceFilter = ref('all');
    const ratingFilter = ref('0');
    const initialServiceCount = 6; // Number of services to show initially
    const showAllServices = ref(false);
    const showFilters = ref(false);
    const activeTag = ref('All');
    
    // Tag filter options
    const filterTags = ['All', 'Home', 'Cleaning', 'Repair', 'Outdoor'];
    
    // Manually assign tags to categories (frontend only)
    const categoriesWithTags = computed(() => {
      return categories.value.map(category => {
        // Manually assign tags based on category - you can customize this mapping
        const categoryName = (category.name || '').toLowerCase();
        let tags = [];
        
        // Example tag assignments - customize based on your actual categories
        // You can match by ID, name, or any other property
        if (categoryName.includes('home') || categoryName.includes('house') || categoryName.includes('residential') || categoryName.includes('interior')) {
          tags.push('Home');
        }
        if (categoryName.includes('clean') || categoryName.includes('cleaning') || categoryName.includes('maintenance')) {
          tags.push('Cleaning');
        }
        if (categoryName.includes('repair') || categoryName.includes('fix') || categoryName.includes('maintenance') || categoryName.includes('plumb') || categoryName.includes('electr')) {
          tags.push('Repair');
        }
        if (categoryName.includes('outdoor') || categoryName.includes('garden') || categoryName.includes('landscap') || categoryName.includes('yard')) {
          tags.push('Outdoor');
        }
        
        // Default to 'Home' if no tags matched
        if (tags.length === 0) {
          tags.push('Home');
        }
        
        return {
          ...category,
          tags: tags
        };
      });
    });
    
    // Computed property for filtered categories (when no category selected)
    const filteredCategories = computed(() => {
      if (!categoriesWithTags.value.length) return [];
      
      // Apply tag filter first
      let filtered = categoriesWithTags.value.filter(c => {
        return activeTag.value === 'All' || c.tags.includes(activeTag.value);
      });
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(category => {
          const nameMatch = category.name?.toLowerCase().includes(query);
          const descMatch = category.description?.toLowerCase().includes(query);
          return nameMatch || descMatch;
        });
      }
      
      // Apply sorting
      if (sortBy.value === 'name') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
      
      return filtered;
    });
    
    // Computed property for filtered services
    const filteredServices = computed(() => {
      if (!selectedCategory.value) return [];
      
      // Filter out unapproved services (extra safety check)
      let services = [...selectedCategory.value.services].filter(service => {
        // Only show approved services (isApproved should be true or undefined for legacy services)
        return service.isApproved !== false;
      });
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        services = services.filter(service => {
          const titleMatch = service.title?.toLowerCase().includes(query);
          const descMatch = service.description?.toLowerCase().includes(query);
          const providerMatch = service.provider?.name?.toLowerCase().includes(query);
          return titleMatch || descMatch || providerMatch;
        });
      }
      
      // Apply price filter
      if (priceFilter.value !== 'all') {
        services = services.filter(service => {
          const price = Number(service.pricing) || 0;
          switch (priceFilter.value) {
            case '0-500': return price >= 0 && price <= 500;
            case '500-1000': return price > 500 && price <= 1000;
            case '1000+': return price > 1000;
            default: return true;
          }
        });
      }
      
      // Apply rating filter
      if (ratingFilter.value !== '0') {
        const minRating = Number(ratingFilter.value);
        services = services.filter(service => {
          const rating = service.provider?.rating || 0;
          return rating >= minRating;
        });
      }
      
      // Apply sorting
      if (sortBy.value !== 'default') {
        services.sort((a, b) => {
          switch (sortBy.value) {
            case 'price-low':
              return (Number(a.pricing) || 0) - (Number(b.pricing) || 0);
            case 'price-high':
              return (Number(b.pricing) || 0) - (Number(a.pricing) || 0);
            case 'rating':
              return (b.provider?.rating || 0) - (a.provider?.rating || 0);
            case 'most-booked': {
              // Sort by booking count (if available) or rating as fallback
              const aBookings = a.bookingCount || 0;
              const bBookings = b.bookingCount || 0;
              if (aBookings !== bBookings) {
                return bBookings - aBookings;
              }
              return (b.provider?.rating || 0) - (a.provider?.rating || 0);
            }
            case 'name':
              return (a.title || '').localeCompare(b.title || '');
            default:
              return 0;
          }
        });
      }
      
      return services;
    });
    
    // Computed property for displayed services (with show more/less)
    const displayedFilteredServices = computed(() => {
      if (!filteredServices.value.length) return [];
      return showAllServices.value 
        ? filteredServices.value 
        : filteredServices.value.slice(0, initialServiceCount);
    });
    
    // Check if any filters are active
    const hasActiveFilters = computed(() => {
      const hasSearch = searchQuery.value.trim() !== '';
      const hasTagFilter = !selectedCategory.value && activeTag.value !== 'All';
      const hasSort = selectedCategory.value && sortBy.value !== 'default';
      const hasPriceFilter = selectedCategory.value && priceFilter.value !== 'all';
      const hasRatingFilter = selectedCategory.value && ratingFilter.value !== '0';
      return hasSearch || hasTagFilter || hasSort || hasPriceFilter || hasRatingFilter;
    });
    
    // Clear search
    const clearSearch = () => {
      searchQuery.value = '';
    };
    
    // Clear all filters
    const clearFilters = () => {
      searchQuery.value = '';
      activeTag.value = 'All';
      sortBy.value = 'default';
      priceFilter.value = 'all';
      ratingFilter.value = '0';
      showAllServices.value = false;
    };
    
    // Reset show all when filters change
    watch([searchQuery, sortBy, priceFilter, ratingFilter], () => {
      showAllServices.value = false;
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
      providerAvailability,
      loadingAvailability,
      availabilityByDay,
      formatTime,
      getNextDateForDay,
      showProviderModal,
      selectedProvider,
      showAddAddressModal,
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
      displayedFilteredServices,
      filteredServices,
      filteredCategories,
      searchQuery,
      sortBy,
      priceFilter,
      ratingFilter,
      showFilters,
      hasActiveFilters,
      clearSearch,
      clearFilters,
      activeTag,
      filterTags,
      toggleShowMore,
      showAllServices,
      initialServiceCount,
      handleImageError,
      closeAddAddressModal,
      handleAddressAdded,
    };
  }
};
</script>

<style scoped>
/* Global reset for this component */
:deep(body), :deep(html) {
  margin: 0;
  padding: 0;
}

.client-services {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 20px 30px 0 50px;
  background-color: #f5f5f5;
  min-height: calc(100dvh - 60px);
  min-height: calc(100vh - 60px); /* Fallback for older browsers */
  position: relative;
  box-sizing: border-box;
  padding-bottom: 20px;
}

.client-services::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: url("data:image/svg+xml,%3Csvg width='600' height='400' viewBox='0 0 600 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='120' cy='100' rx='100' ry='80' fill='%23106e40' fill-opacity='0.13'/%3E%3Crect x='400' y='220' width='160' height='120' rx='60' fill='%2338b676' fill-opacity='0.11'/%3E%3Cpolygon points='520,60 590,140 450,140' fill='%23106e40' fill-opacity='0.09'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
}

.client-services::after {
  content: "";
  position: absolute;
  left: -50px;
  bottom: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at 60% 40%, #38b67655 0%, transparent 80%);
  z-index: 0;
  pointer-events: none;
}

.page-title {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: 700;
  border-left: 5px solid #3498db;
  padding-left: 15px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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

.services-container {
  position: relative;
  z-index: 1;
  min-height: 100%;
  overflow-y: visible;
  padding-right: 10px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.categories-selection {
  margin: 0;
  padding: 0;
}

/* Categories Selection Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 0;
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
  width: fit-content;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  box-sizing: border-box;
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
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  max-height: 85dvh;
  max-height: 85vh; /* Fallback for older browsers */
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  position: relative;
  z-index: 10001 !important;
  margin: auto;
}

@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa, #f1f1f1);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
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
  padding: 20px;
}

.booking-service-details {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.booking-service-details h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 600;
}

.modal-price {
  font-size: 1.1rem;
  color: #2ecc71;
  font-weight: 700;
  margin-bottom: 10px;
  background-color: rgba(46, 204, 113, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

.form-group {
  margin-bottom: 15px;
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
  height: 80px;
  resize: vertical;
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #e74c3c;
  font-size: 0.85rem;
  font-style: italic;
}

.time-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-select:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15);
  outline: none;
}

.loading-availability {
  text-align: center;
  padding: 15px;
  color: #27ae60;
  font-size: 0.9rem;
}

.loading-availability i {
  margin-right: 8px;
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  padding: 4px 10px;
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.availability-badge i {
  font-size: 0.75rem;
}

.availability-slots {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #f9f9f9;
}

.day-slot-group {
  margin-bottom: 20px;
}

.day-slot-group:last-child {
  margin-bottom: 0;
}

.day-name {
  font-size: 1rem;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.time-slot-btn {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.time-slot-btn:hover {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.2);
}

.time-slot-btn.active {
  border-color: #27ae60;
  background: #27ae60;
  color: white;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.no-availability {
  text-align: center;
  padding: 30px 20px;
  color: #777;
  background: #f9f9f9;
  border-radius: 10px;
  border: 2px dashed #e0e0e0;
}

.no-availability i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 15px;
  display: block;
}

.no-availability p {
  margin: 8px 0;
  font-size: 0.95rem;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
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
  max-width: 400px;
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

.address-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-address-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.add-address-btn:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

  .add-address-btn i {
    font-size: 1rem;
  }

/* Page Header Section */
.page-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  gap: 20px;
  position: relative;
  flex-wrap: wrap;
}

/* Search and Filter Styles - Enhanced design */
.search-filter-section-fixed {
  position: relative;
  width: 100%;
  max-width: 600px;
  flex-shrink: 0;
  background: transparent;
  padding: 0;
  border: none;
  box-shadow: none;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.search-filter-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
}

.search-filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-end;
}

/* Tag Filter Chips */
.tag-filter-chips {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tag-chip {
  padding: 6px 16px;
  border: 2px solid #0f9d58;
  border-radius: 20px;
  background: white;
  color: #0f9d58;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(15, 157, 88, 0.1);
}

.tag-chip:hover {
  background: rgba(15, 157, 88, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(15, 157, 88, 0.15);
}

.tag-chip.active {
  background: #0f9d58;
  color: white;
  border-color: #0f9d58;
  box-shadow: 0 3px 8px rgba(15, 157, 88, 0.25);
  transform: translateY(-1px);
}

.search-container {
  flex: 1;
  margin-bottom: 0;
}

.filter-toggle-btn {
  width: 55px;
  height: 55px;
  padding: 0;
  border: 2px solid rgba(39, 174, 96, 0.2);
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.filter-toggle-btn:hover {
  border-color: #27ae60;
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.25);
  transform: translateY(-2px);
  background: #ffffff;
}

.filter-toggle-btn.active {
  border-color: #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(52, 152, 219, 0.1));
  color: #27ae60;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.filter-toggle-btn i {
  font-size: 0.9rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 18px;
  color: #27ae60;
  font-size: 1.1rem;
  z-index: 1;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within .search-icon {
  color: #219d55;
  transform: scale(1.1);
}

.search-input {
  width: 100%;
  height: 55px;
  padding: 14px 50px 14px 50px;
  border: 2px solid rgba(39, 174, 96, 0.2);
  border-radius: 14px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06), inset 0 1px 3px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  color: #2c3e50;
  font-weight: 500;
}

.search-input::placeholder {
  color: #95a5a6;
  font-weight: 400;
}

.search-input:focus {
  border-color: #27ae60;
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.25), inset 0 1px 3px rgba(39, 174, 96, 0.1);
  outline: none;
  background: #ffffff;
  transform: translateY(-1px);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: rgba(231, 76, 60, 0.1);
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

.clear-search-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  color: #c0392b;
  transform: scale(1.1);
}

.filter-container {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #34495e;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.filter-select {
  padding: 9px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.88rem;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #2c3e50;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.filter-select:hover {
  border-color: #27ae60;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.1);
}

.filter-select:focus {
  border-color: #27ae60;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
  outline: none;
}

.clear-filters-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 9px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 8px;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.clear-filters-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.35);
}

.results-info-standalone {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.08), rgba(52, 152, 219, 0.08));
  border-radius: 10px;
  color: #27ae60;
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(39, 174, 96, 0.15);
}

.results-info-standalone i {
  font-size: 0.9rem;
}

.no-results {
  text-align: center;
  padding: 60px 30px;
  color: #777;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
}

.no-results i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 20px;
  display: block;
}

.no-results p {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #555;
}

@media screen and (max-width: 768px) {
  .search-filter-section-fixed {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    max-width: 100%;
    max-height: none;
    margin-bottom: 20px;
    align-items: stretch;
  }
  
  .search-filter-column {
    align-items: stretch;
  }
  
  .search-filter-row {
    flex-direction: row;
    align-items: stretch;
    justify-content: stretch;
  }
  
  .search-container {
    flex: 1;
  }
  
  .tag-filter-chips {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 5px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }
  
  .tag-filter-chips::-webkit-scrollbar {
    height: 4px;
  }
  
  .tag-filter-chips::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  .tag-filter-chips::-webkit-scrollbar-thumb {
    background: rgba(15, 157, 88, 0.3);
    border-radius: 10px;
  }
  
  .tag-chip {
    flex-shrink: 0;
    font-size: 0.8rem;
    padding: 5px 14px;
  }
  
  .filter-container {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .clear-filters-btn {
    width: 100%;
    justify-content: center;
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
  
  .page-header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 15px;
  }
  
  .search-filter-section-fixed {
    width: 100%;
    margin-bottom: 15px;
    align-items: stretch;
  }
  
  .search-filter-column {
    align-items: stretch;
  }
  
  .search-filter-row {
    justify-content: stretch;
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
