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
        <h1 class="page-title" v-if="!selectedCategory">Service Categories</h1>
        
        <!-- Search and Filter Section - only show when NO category selected -->
        <div class="search-filter-section-fixed" v-if="!selectedCategory">
          <div class="search-filter-column">
            <div class="search-filter-row">
              <div class="search-container">
                <div class="search-input-wrapper">
                  <i class="fa fa-search search-icon"></i>
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Search categories by name or description..."
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
            </div>
            
            <!-- Tag Filter Chips -->
            <div class="tag-filter-chips">
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

        <!-- Nav Header: back arrow + category name -->
        <div class="category-nav-header">
          <button class="back-arrow-btn" @click="backToCategories">
            <i class="fa fa-arrow-left"></i>
          </button>
          <span class="category-nav-title">{{ selectedCategory.name }}</span>
        </div>

        <!-- Search Row: search input + filter button -->
        <div class="category-search-row">
          <div class="search-input-wrapper">
            <i class="fa fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search services..."
              class="search-input"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch" 
              class="clear-search-btn"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="filter-btn-wrapper">
            <button 
              @click="showFilters = !showFilters"
              class="filter-toggle-btn"
              :class="{ active: showFilters }"
            >
              <i class="fa fa-filter"></i>
            </button>

            <!-- Filter Dropdown — anchored to filter-btn-wrapper -->
            <div v-show="showFilters" class="filter-container">
              <div class="filter-group">
                <label for="sort-by">Sort by:</label>
                <select id="sort-by" v-model="sortBy" class="filter-select">
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label for="price-filter">Price Range:</label>
                <select id="price-filter" v-model="priceFilter" class="filter-select">
                  <option value="all">All Prices</option>
                  <option value="0-500">₱0 - ₱500</option>
                  <option value="500-1000">₱500 - ₱1,000</option>
                  <option value="1000-2000">₱1,000 - ₱2,000</option>
                  <option value="2000+">₱2,000+</option>
                </select>
              </div>
              
              <div class="filter-group">
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
                v-if="hasActiveFilters" 
                @click="clearFilters" 
                class="clear-filters-btn"
              >
                <i class="fa fa-times"></i> Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Services List -->
        <div class="services-list" v-if="selectedCategory.services.length > 0">
          <template v-if="filteredServices.length > 0">
            <div v-for="service in displayedFilteredServices" :key="service.id" class="service-card">
              <div class="service-image" v-if="service.imageUrls && service.imageUrls.length > 0">
                <img :src="service.imageUrls[0]" :alt="service.title" />
              </div>
              <div class="service-content">
                <h3 class="service-title">{{ service.title }}</h3>
                <p class="service-description">{{ truncateText(service.description, 150) }}</p>
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
                    <button class="btn btn-book" @click="bookService(service)">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="show-more-container" v-if="filteredServices.length > initialServiceCount">
              <button class="btn btn-show-more" @click="toggleShowMore">
                {{ showAllServices ? 'Show Less' : `Show More (${filteredServices.length - displayedFilteredServices.length} more)` }}
              </button>
            </div>
          </template>
          
          <div v-else class="no-results">
            <i class="fa fa-search"></i>
            <p>No services found matching your search criteria.</p>
            <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
          </div>
        </div>
        <div v-else class="no-services">No services available in this category</div>
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
                    <div v-for="day in availabilityByDay" :key="day.date || day.dayOfWeek" class="day-slot-group">
                      <h4 class="day-name">
                        {{ day.dayName }}
                        <span v-if="day.date" class="date-label">
                          ({{ new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }})
                        </span>
                      </h4>
                      <div class="time-slots-grid">
                        <button
                          v-for="slot in day.slots.filter(s => s.isAvailable !== false)"
                          :key="slot.id"
                          type="button"
                          class="time-slot-btn"
                          :class="{ active: bookingForm.selectedSlot?.id === slot.id }"
                          @click="bookingForm.selectedSlot = { ...slot, dayOfWeek: day.dayOfWeek, dayName: day.dayName, date: day.date || slot.actualDate || slot.date }"
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
                    <button type="button" class="add-address-btn" @click="showAddAddressModal = true" title="Add new address">
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

      <!-- Add Address Modal -->
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
  if (relativePath && (relativePath.startsWith('http://') || relativePath.startsWith('https://'))) return relativePath;
  if (relativePath && relativePath.startsWith('/')) return `${API_BASE_URL}${relativePath}`;
  return relativePath || '';
};

export default {
  name: 'ClientServices',
  components: { ProviderDetailsModal, AddAddressModal },
  setup() {
    const router = useRouter();
    const categories = ref([]);
    const selectedCategory = ref(null);
    const loading = ref(true);
    const error = ref('');
    const addresses = ref([]);
    const showBookingModal = ref(false);
    const showBookingSuccess = ref(false);
    const selectedService = ref({});
    const isBookingSubmitting = ref(false);
    const bookingForm = ref({ selectedSlot: null, addressId: '', notes: '' });
    const providerAvailability = ref(null);
    const loadingAvailability = ref(false);
    const availabilityByDay = ref([]);
    const showProviderModal = ref(false);
    const selectedProvider = ref(null);
    const showAddAddressModal = ref(false);
    const currentDateTimeString = new Date().toISOString().slice(0, 16);

    const fetchCategories = async () => {
      loading.value = true;
      error.value = '';
      try {
        const response = await serviceService.getCategoriesWithServices();
        if (response.success) {
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

    const selectCategory = (category) => { selectedCategory.value = category; };
    const backToCategories = () => { selectedCategory.value = null; };

    const fetchAddresses = async () => {
      try {
        const response = await clientService.getClientProfile();
        if (response.success && response.data.client && response.data.client.addresses) {
          addresses.value = response.data.client.addresses;
        }
      } catch (err) { console.error('Error fetching addresses:', err); }
    };

    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode} ${address.isDefault ? '(Default)' : ''}`;
    };

    const formatPriceType = (type) => {
      switch (type) {
        case 'FIXED': return 'fixed';
        case 'DAILY': return 'day';
        case 'SESSION': return 'session';
        default: return (type || '').toLowerCase();
      }
    };

    const truncateText = (text, length) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const fetchProviderAvailability = async (providerId) => {
      if (!providerId) return;
      loadingAvailability.value = true;
      try {
        const response = await providerService.getProviderAvailability(providerId);
        if (response.success && response.data) {
          providerAvailability.value = response.data;
          let slots = [];
          if (response.data.slots && Array.isArray(response.data.slots)) {
            slots = response.data.slots;
          } else if (response.data.availabilityByDay && Array.isArray(response.data.availabilityByDay)) {
            slots = response.data.availabilityByDay.flatMap(day =>
              (day.slots || []).map(slot => ({ ...slot, dayOfWeek: day.dayOfWeek }))
            );
          }
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const futureSlots = slots.filter(slot => {
            if (slot.isAvailable === false) return false;
            if (slot.date) {
              const slotDate = new Date(slot.date);
              slotDate.setHours(0, 0, 0, 0);
              return slotDate >= now;
            }
            return true;
          });
          const slotsByDate = {};
          futureSlots.forEach(slot => {
            let dateKey;
            if (slot.date) {
              dateKey = new Date(slot.date).toISOString().split('T')[0];
            } else {
              dateKey = getNextDateForDay(slot.dayOfWeek).toISOString().split('T')[0];
            }
            if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
            slotsByDate[dateKey].push({ ...slot, actualDate: dateKey });
          });
          availabilityByDay.value = Object.keys(slotsByDate).sort().map(dateKey => {
            const date = new Date(dateKey);
            const dayOfWeek = date.getDay();
            const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            return {
              dayOfWeek, dayName: dayNames[dayOfWeek], date: dateKey,
              slots: slotsByDate[dateKey].sort((a, b) => a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0)
            };
          }).filter(day => day.slots && day.slots.length > 0);
        } else {
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

    const formatTime = (timeString) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const getNextDateForDay = (dayOfWeek) => {
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntil = dayOfWeek - currentDay;
      if (daysUntil < 0 || (daysUntil === 0 && today.getHours() >= 23)) daysUntil += 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate;
    };

    const bookService = async (service) => {
      const processedService = JSON.parse(JSON.stringify(service));
      if (processedService.provider?.profilePicture) processedService.provider.profilePicture = getFileUrl(processedService.provider.profilePicture);
      if (processedService.imageUrls) processedService.imageUrls = processedService.imageUrls.map(url => getFileUrl(url));
      selectedService.value = processedService;
      if (processedService.provider?.id) await fetchProviderAvailability(processedService.provider.id);
      showBookingModal.value = true;
    };

    const closeBookingModal = () => {
      showBookingModal.value = false;
      bookingForm.value = { selectedSlot: null, addressId: '', notes: '' };
      providerAvailability.value = null;
      availabilityByDay.value = [];
    };

    const closeSuccessModal = () => { showBookingSuccess.value = false; };
    const goToBookings = () => { router.push('/client/bookings'); showBookingSuccess.value = false; };

    const submitBooking = async () => {
      if (!bookingForm.value.selectedSlot || !bookingForm.value.addressId) {
        Swal.fire({ title: 'Incomplete Form', text: 'Please select an available time slot and an address.', icon: 'warning', confirmButtonColor: '#ff9800' });
        return;
      }
      let nextDate;
      if (bookingForm.value.selectedSlot.date || bookingForm.value.selectedSlot.actualDate) {
        nextDate = new Date(bookingForm.value.selectedSlot.date || bookingForm.value.selectedSlot.actualDate);
      } else if (bookingForm.value.selectedSlot.dayOfWeek !== undefined) {
        nextDate = getNextDateForDay(bookingForm.value.selectedSlot.dayOfWeek);
      } else {
        Swal.fire({ title: 'Invalid Time Slot', text: 'Please select a valid time slot.', icon: 'error', confirmButtonColor: '#f44336' });
        return;
      }
      const [hours, minutes] = bookingForm.value.selectedSlot.startTime.split(':');
      nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (nextDate.getTime() < new Date().getTime()) {
        Swal.fire({ title: 'Invalid Start Time', text: 'Please choose a future time slot.', icon: 'error', confirmButtonColor: '#f44336' });
        return;
      }
      isBookingSubmitting.value = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        const response = await clientService.bookService({
          serviceId: selectedService.value.id,
          startTime: nextDate.toISOString(),
          addressId: bookingForm.value.addressId,
          notes: bookingForm.value.notes || null
        });
        if (response.success) { closeBookingModal(); showBookingSuccess.value = true; }
        else Swal.fire({ title: 'Failed to create booking', text: response.message || 'Unknown error', icon: 'error', confirmButtonColor: '#f44336' });
      } catch (err) {
        const serverMessage = err?.response?.data?.message || err?.message || 'Please try again later.';
        Swal.fire({ title: 'Failed to create booking', text: serverMessage, icon: 'error', confirmButtonColor: '#f44336' });
      } finally { isBookingSubmitting.value = false; }
    };

    const viewProviderDetails = async (providerId) => {
      if (!providerId) return;
      try {
        loading.value = true;
        const response = await providerService.getProviderDetails(providerId);
        if (response.success) { selectedProvider.value = response.data; showProviderModal.value = true; }
        else error.value = 'Failed to load provider details. Please try again.';
      } catch (err) { error.value = 'An error occurred while loading provider details.'; }
      finally { loading.value = false; }
    };

    const closeProviderModal = () => { showProviderModal.value = false; selectedProvider.value = null; };
    const closeAddAddressModal = () => { showAddAddressModal.value = false; };
    const handleAddressAdded = async () => {
      await fetchAddresses();
      if (addresses.value.length > 0) bookingForm.value.addressId = addresses.value[addresses.value.length - 1].id;
    };

    onMounted(() => { fetchCategories(); fetchAddresses(); });

    const searchQuery = ref('');
    const sortBy = ref('default');
    const priceFilter = ref('all');
    const ratingFilter = ref('0');
    const initialServiceCount = 6;
    const showAllServices = ref(false);
    const showFilters = ref(false);
    const activeTag = ref('All');
    const filterTags = ['All', 'Home', 'Cleaning', 'Repair', 'Outdoor'];

    const categoriesWithTags = computed(() => {
      return categories.value.map(category => {
        const categoryName = (category.name || '').toLowerCase();
        let tags = [];
        if (categoryName.includes('home') || categoryName.includes('house') || categoryName.includes('residential') || categoryName.includes('interior')) tags.push('Home');
        if (categoryName.includes('clean') || categoryName.includes('cleaning') || categoryName.includes('maintenance')) tags.push('Cleaning');
        if (categoryName.includes('repair') || categoryName.includes('fix') || categoryName.includes('maintenance') || categoryName.includes('plumb') || categoryName.includes('electr')) tags.push('Repair');
        if (categoryName.includes('outdoor') || categoryName.includes('garden') || categoryName.includes('landscap') || categoryName.includes('yard')) tags.push('Outdoor');
        if (tags.length === 0) tags.push('Home');
        return { ...category, tags };
      });
    });

    const filteredCategories = computed(() => {
      if (!categoriesWithTags.value.length) return [];
      let filtered = categoriesWithTags.value.filter(c => activeTag.value === 'All' || c.tags.includes(activeTag.value));
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(c => c.name?.toLowerCase().includes(query) || c.description?.toLowerCase().includes(query));
      }
      if (sortBy.value === 'name') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return filtered;
    });

    const filteredServices = computed(() => {
      if (!selectedCategory.value) return [];
      let services = [...selectedCategory.value.services].filter(s => s.isApproved !== false);
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        services = services.filter(s => s.title?.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query) || s.provider?.name?.toLowerCase().includes(query));
      }
      if (priceFilter.value !== 'all') {
        services = services.filter(s => {
          const price = Number(s.pricing) || 0;
          switch (priceFilter.value) {
            case '0-500': return price >= 0 && price <= 500;
            case '500-1000': return price > 500 && price <= 1000;
            case '1000-2000': return price > 1000 && price <= 2000;
            case '2000+': return price > 2000;
            default: return true;
          }
        });
      }
      if (ratingFilter.value !== '0') {
        const minRating = Number(ratingFilter.value);
        services = services.filter(s => (s.provider?.rating || 0) >= minRating);
      }
      if (sortBy.value !== 'default') {
        services.sort((a, b) => {
          switch (sortBy.value) {
            case 'price-low': return (Number(a.pricing) || 0) - (Number(b.pricing) || 0);
            case 'price-high': return (Number(b.pricing) || 0) - (Number(a.pricing) || 0);
            case 'rating': return (b.provider?.rating || 0) - (a.provider?.rating || 0);
            case 'name': return (a.title || '').localeCompare(b.title || '');
            default: return 0;
          }
        });
      }
      return services;
    });

    const displayedFilteredServices = computed(() => {
      if (!filteredServices.value.length) return [];
      return showAllServices.value ? filteredServices.value : filteredServices.value.slice(0, initialServiceCount);
    });

    const hasActiveFilters = computed(() => {
      return searchQuery.value.trim() !== '' ||
        (!selectedCategory.value && activeTag.value !== 'All') ||
        (selectedCategory.value && sortBy.value !== 'default') ||
        (selectedCategory.value && priceFilter.value !== 'all') ||
        (selectedCategory.value && ratingFilter.value !== '0');
    });

    const clearSearch = () => { searchQuery.value = ''; };
    const clearFilters = () => { searchQuery.value = ''; activeTag.value = 'All'; sortBy.value = 'default'; priceFilter.value = 'all'; ratingFilter.value = '0'; showAllServices.value = false; };
    watch([searchQuery, sortBy, priceFilter, ratingFilter], () => { showAllServices.value = false; });
    const toggleShowMore = () => { showAllServices.value = !showAllServices.value; };
    const handleImageError = (event) => {
      event.target.style.display = 'none';
      const iconElement = document.createElement('i');
      iconElement.className = 'fa fa-briefcase category-icon';
      event.target.parentNode.appendChild(iconElement);
    };

    return {
      categories, selectedCategory, loading, error, addresses,
      showBookingModal, showBookingSuccess, selectedService, bookingForm, isBookingSubmitting,
      currentDateTimeString, providerAvailability, loadingAvailability, availabilityByDay,
      formatTime, getNextDateForDay, showProviderModal, selectedProvider, showAddAddressModal,
      selectCategory, backToCategories, formatAddress, formatPriceType, truncateText,
      bookService, closeBookingModal, closeSuccessModal, goToBookings, submitBooking,
      viewProviderDetails, closeProviderModal, displayedFilteredServices, filteredServices,
      filteredCategories, searchQuery, sortBy, priceFilter, ratingFilter, showFilters,
      hasActiveFilters, clearSearch, clearFilters, activeTag, filterTags, toggleShowMore,
      showAllServices, initialServiceCount, handleImageError, closeAddAddressModal, handleAddressAdded,
    };
  }
};
</script>

<style scoped>
:deep(body), :deep(html) { margin: 0; padding: 0; }

.client-services {
  width: 100%; max-width: 100%; margin: 0;
  padding: 20px 30px 20px 50px;
  background-color: #f5f5f5;
  min-height: calc(100dvh - 60px);
  min-height: calc(100vh - 60px);
  position: relative; box-sizing: border-box; overflow: hidden;
}
.client-services::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
  background: url("data:image/svg+xml,%3Csvg width='600' height='400' viewBox='0 0 600 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='120' cy='100' rx='100' ry='80' fill='%23106e40' fill-opacity='0.13'/%3E%3Crect x='400' y='220' width='160' height='120' rx='60' fill='%2338b676' fill-opacity='0.11'/%3E%3Cpolygon points='520,60 590,140 450,140' fill='%23106e40' fill-opacity='0.09'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-size: cover; pointer-events: none;
}
.client-services::after {
  content: ""; position: absolute; left: -50px; bottom: 0; width: 200px; height: 200px;
  background: radial-gradient(circle at 60% 40%, #38b67655 0%, transparent 80%);
  z-index: 0; pointer-events: none;
}

.services-container { position: relative; z-index: 1; min-height: 100%; overflow-y: visible; padding-right: 10px; box-sizing: border-box; }

/* PAGE TITLE */
.page-title {
  margin-bottom: 20px; color: #2c3e50; font-size: 2.2rem; font-weight: 700;
  border-left: 5px solid #3498db; padding-left: 15px;
  transition: all 0.3s ease; position: relative; z-index: 1;
}
.page-title:hover { transform: translateX(5px); }
.page-title::after {
  content: ''; position: absolute; bottom: -5px; left: 0; width: 100px; height: 3px;
  background: linear-gradient(90deg, #3498db, #2ecc71); border-radius: 2px;
}

/* LOADING */
.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; width: 100%; position: relative; z-index: 1; }
.spinner { border: 4px solid rgba(52,152,219,0.2); border-radius: 50%; border-top: 4px solid #3498db; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.error-container { display: flex; justify-content: center; margin: 30px 0; width: 100%; position: relative; z-index: 1; }
.error { color: #e74c3c; padding: 20px; border-radius: 8px; background-color: rgba(231,76,60,0.1); border-left: 4px solid #e74c3c; font-weight: 500; }

/* PAGE HEADER */
.page-header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; gap: 20px; position: relative; flex-wrap: wrap; }

/* CATEGORY GRID */
.categories-selection { margin: 0; padding: 0; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
.category-card-selection {
  background: linear-gradient(to bottom, #ffffff, #f9f9f9); border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08); overflow: hidden; cursor: pointer;
  transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.05); position: relative;
}
.category-card-selection::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 0; background: linear-gradient(to bottom, #3498db, #2ecc71); transition: height 0.3s ease; }
.category-card-selection:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }
.category-card-selection:hover::before { height: 100%; }
.category-card-selection .category-image { height: 200px; width: 100%; overflow: hidden; }
.category-card-selection .category-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.category-card-selection:hover .category-image img { transform: scale(1.1); }
.category-card-selection .category-info { padding: 20px; }
.category-name { margin: 0 0 15px 0; font-size: 1.8rem; color: #2c3e50; font-weight: 700; }
.category-description { margin: 0 0 15px 0; color: #555; line-height: 1.6; font-size: 1.05rem; }
.service-count { font-size: 0.95rem; color: #3498db; margin: 0; font-weight: 600; background-color: rgba(52,152,219,0.1); display: inline-block; padding: 8px 15px; border-radius: 50px; }

/* SEARCH FILTER (category list view) */
.search-filter-section-fixed { position: relative; width: 100%; max-width: 600px; flex-shrink: 0; background: transparent; padding: 0; border: none; box-shadow: none; align-self: flex-start; display: flex; flex-direction: column; align-items: flex-end; }
.search-filter-column { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; width: 100%; }
.search-filter-row { display: flex; gap: 12px; align-items: center; width: 100%; justify-content: flex-end; }
.search-container { flex: 1; }
.tag-filter-chips { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.tag-chip { padding: 6px 16px; border: 2px solid #0f9d58; border-radius: 20px; background: white; color: #0f9d58; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.tag-chip:hover { background: rgba(15,157,88,0.05); transform: translateY(-1px); }
.tag-chip.active { background: #0f9d58; color: white; border-color: #0f9d58; transform: translateY(-1px); }

/* SEARCH INPUT */
.search-input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
.search-icon { position: absolute; left: 18px; color: #27ae60; font-size: 1.1rem; z-index: 1; transition: all 0.3s ease; }
.search-input-wrapper:focus-within .search-icon { color: #219d55; transform: scale(1.1); }
.search-input {
  width: 100%; height: 45px; padding: 12px 45px 12px 45px;
  border: 2px solid rgba(39,174,96,0.2); border-radius: 10px; font-size: 0.95rem;
  transition: all 0.3s ease; background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 3px 10px rgba(0,0,0,0.06); box-sizing: border-box; color: #2c3e50; font-weight: 500;
}
.search-input::placeholder { color: #95a5a6; font-weight: 400; }
.search-input:focus { border-color: #27ae60; box-shadow: 0 6px 20px rgba(39,174,96,0.25); outline: none; background: #ffffff; }
.clear-search-btn { position: absolute; right: 12px; background: rgba(231,76,60,0.1); border: none; color: #e74c3c; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 24px; height: 24px; font-size: 0.75rem; }
.clear-search-btn:hover { background: rgba(231,76,60,0.2); color: #c0392b; transform: scale(1.1); }

/* FILTER TOGGLE BUTTON */
.filter-toggle-btn {
  width: 45px; height: 45px; padding: 0;
  border: 2px solid rgba(39,174,96,0.2); border-radius: 10px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  color: #2c3e50; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.3s ease; box-shadow: 0 3px 10px rgba(0,0,0,0.06); flex-shrink: 0;
}
.filter-toggle-btn:hover { border-color: #27ae60; box-shadow: 0 6px 20px rgba(39,174,96,0.25); transform: translateY(-2px); }
.filter-toggle-btn.active { border-color: #27ae60; background: linear-gradient(135deg, rgba(39,174,96,0.1), rgba(52,152,219,0.1)); color: #27ae60; }
.filter-toggle-btn i { font-size: 0.9rem; }

/* ===== KEY FIX: filter-btn-wrapper is the anchor for the dropdown ===== */
.filter-btn-wrapper {
  position: relative;
  flex-shrink: 0;
}

/* FILTER DROPDOWN — anchored to .filter-btn-wrapper */
.filter-container {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 260px;
  z-index: 9999;
  display: flex; flex-direction: column; gap: 10px;
  padding: 14px; background: #ffffff;
  border: 2px solid #e0e0e0; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  animation: slideDown 0.2s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.filter-group { display: flex; flex-direction: column; gap: 5px; width: 100%; }
.filter-group label { font-size: 0.75rem; font-weight: 700; color: #34495e; margin: 0; text-transform: uppercase; letter-spacing: 0.4px; }
.filter-select { padding: 9px 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 0.88rem; background: #ffffff; cursor: pointer; transition: all 0.3s ease; color: #2c3e50; font-weight: 500; }
.filter-select:hover { border-color: #27ae60; }
.filter-select:focus { border-color: #27ae60; box-shadow: 0 4px 12px rgba(39,174,96,0.15); outline: none; }
.clear-filters-btn { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; padding: 9px 14px; border-radius: 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; width: 100%; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.4px; }
.clear-filters-btn:hover { background: linear-gradient(135deg, #c0392b, #a93226); transform: translateY(-2px); }

/* CATEGORY NAV HEADER */
.category-nav-header { display: flex; align-items: center; gap: 15px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px 10px 0 0; padding: 14px 18px; margin-bottom: 0; }
.back-arrow-btn { background: none; border: none; cursor: pointer; color: #2c3e50; font-size: 1rem; padding: 0; display: flex; align-items: center; transition: transform 0.2s ease; }
.back-arrow-btn:hover { transform: translateX(-3px); color: #0f9d58; }
.category-nav-title { font-size: 1.1rem; font-weight: 600; color: #2c3e50; }

/* CATEGORY SEARCH ROW */
.category-search-row {
  display: flex; align-items: center; gap: 10px;
  background: #ffffff; border: 1px solid #e0e0e0; border-top: none;
  border-radius: 0 0 10px 10px; padding: 10px 18px; margin-bottom: 25px;
}
.category-search-row .search-input-wrapper { flex: 1; }

/* SERVICES LIST */
.services-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; width: 100%; position: relative; }
.service-card { background: linear-gradient(135deg, #ffffff, #f9f9f9); border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); overflow: hidden; transition: all 0.3s ease-in-out; border: 1px solid rgba(0,0,0,0.05); height: 100%; display: flex; flex-direction: column; animation: fadeInCard 0.5s ease-in-out; }
@keyframes fadeInCard { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.service-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
.service-image { height: 200px; overflow: hidden; position: relative; }
.service-image::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 50px; background: linear-gradient(to top, rgba(0,0,0,0.3), transparent); }
.service-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.service-card:hover .service-image img { transform: scale(1.1); }
.service-content { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
.service-title { margin: 0 0 15px 0; font-size: 1.4rem; color: #2c3e50; font-weight: 600; line-height: 1.3; }
.service-description { font-size: 0.95rem; color: #666; margin-bottom: 20px; line-height: 1.5; }
.service-provider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background-color: rgba(0,0,0,0.02); border-radius: 10px; }
.provider-image { width: 45px; height: 45px; border-radius: 50%; overflow: hidden; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.1); }
.provider-image img { width: 100%; height: 100%; object-fit: cover; }
.provider-name { font-size: 0.95rem; font-weight: 600; margin: 0 0 5px 0; color: #3498db; transition: all 0.2s ease; }
.provider-name:hover { color: #2980b9; text-decoration: underline; }
.rating { display: flex; align-items: center; gap: 6px; }
.stars { color: #f39c12; }
.rating-value { font-weight: 600; color: #333; }
.review-count { font-size: 0.8rem; color: #777; }
.service-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.05); }
.service-price { font-size: 1.2rem; }
.price { font-weight: 700; color: #2ecc71; }
.price-type { font-size: 0.8rem; color: #777; }
.service-actions { display: flex; gap: 10px; }
.no-services { text-align: center; padding: 60px 30px; color: #777; font-style: italic; background-color: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin: 20px 0; }
.no-results { text-align: center; padding: 60px 30px; color: #777; background-color: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin: 20px 0; }
.no-results i { font-size: 3rem; color: #ddd; margin-bottom: 20px; display: block; }
.no-results p { font-size: 1.1rem; margin-bottom: 20px; color: #555; }
.show-more-container { width: 100%; display: flex; justify-content: center; margin-top: 40px; grid-column: 1 / -1; }

/* BUTTONS */
.btn { padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; border: none; outline: none; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn-book { background: linear-gradient(135deg, #3498db, #2980b9); color: white; box-shadow: 0 4px 10px rgba(52,152,219,0.2); }
.btn-book:hover { background: linear-gradient(135deg, #2980b9, #2471a3); transform: translateY(-2px); }
.btn-cancel { background: linear-gradient(135deg, #ecf0f1, #e0e0e0); color: #555; }
.btn-cancel:hover { background: linear-gradient(135deg, #e0e0e0, #d5d5d5); transform: translateY(-2px); }
.btn-confirm { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; box-shadow: 0 4px 10px rgba(46,204,113,0.2); }
.btn-confirm:hover { background: linear-gradient(135deg, #27ae60, #219d55); transform: translateY(-2px); }
.btn-confirm:disabled { background: linear-gradient(135deg, #a5d6a7, #c8e6c9); cursor: not-allowed; transform: none; box-shadow: none; }
.btn-primary { background: linear-gradient(135deg, #3498db, #2980b9); color: white; box-shadow: 0 4px 10px rgba(52,152,219,0.2); }
.btn-primary:hover { background: linear-gradient(135deg, #2980b9, #2471a3); transform: translateY(-2px); }
.btn-secondary { background: linear-gradient(135deg, #ecf0f1, #e0e0e0); color: #555; }
.btn-secondary:hover { background: linear-gradient(135deg, #e0e0e0, #d5d5d5); transform: translateY(-2px); }
.btn-show-more { background: linear-gradient(135deg, #f8f9fa, #f1f1f1); color: #3498db; border: 2px solid #3498db; padding: 12px 25px; border-radius: 50px; font-weight: 600; transition: all 0.3s ease; min-width: 220px; }
.btn-show-more:hover { background: linear-gradient(135deg, #3498db, #2980b9); color: white; transform: translateY(-3px); }

/* ADDRESS */
.address-input-group { display: flex; align-items: center; gap: 10px; }
.add-address-btn { background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.add-address-btn:hover { background: linear-gradient(135deg, #2980b9, #2471a3); transform: translateY(-2px); }
.add-address-btn i { font-size: 1rem; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal { background-color: white; border-radius: 12px; width: 100%; max-width: 450px; max-height: 85dvh; max-height: 85vh; overflow-y: auto; box-shadow: 0 15px 30px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; -webkit-overflow-scrolling: touch; position: relative; z-index: 10001 !important; margin: auto; }
@keyframes slideIn { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #f8f9fa, #f1f1f1); border-top-left-radius: 12px; border-top-right-radius: 12px; }
.modal-header h2 { margin: 0; font-size: 1.3rem; color: #2c3e50; font-weight: 600; }
.modal-header.success { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; }
.close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: inherit; transition: all 0.2s ease; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.close-btn:hover { transform: rotate(90deg); background-color: rgba(0,0,0,0.1); }
.modal-body { padding: 20px; }
.booking-service-details { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
.booking-service-details h3 { margin: 0 0 10px 0; font-size: 1.2rem; color: #2c3e50; font-weight: 600; }
.modal-price { font-size: 1.1rem; color: #2ecc71; font-weight: 700; margin-bottom: 10px; background-color: rgba(46,204,113,0.1); padding: 8px 12px; border-radius: 6px; display: inline-block; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,0.2); outline: none; }
.form-group textarea { height: 80px; resize: vertical; }
.booking-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.success-modal { max-width: 400px; }
.success-icon { font-size: 4.5rem; color: #2ecc71; margin-bottom: 25px; animation: pulse 2s infinite; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
.text-center { text-align: center; }

/* AVAILABILITY */
.loading-availability { text-align: center; padding: 15px; color: #27ae60; font-size: 0.9rem; }
.loading-availability i { margin-right: 8px; }
.availability-slots { max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f9f9f9; }
.day-slot-group { margin-bottom: 20px; }
.day-slot-group:last-child { margin-bottom: 0; }
.day-name { font-size: 1rem; font-weight: 700; color: #27ae60; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #e0e0e0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.date-label { font-size: 0.85rem; font-weight: 500; color: #666; font-style: italic; }
.time-slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.time-slot-btn { padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; color: #2c3e50; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s ease; text-align: center; }
.time-slot-btn:hover { border-color: #27ae60; background: rgba(39,174,96,0.1); transform: translateY(-2px); }
.time-slot-btn.active { border-color: #27ae60; background: #27ae60; color: white; }
.no-availability { text-align: center; padding: 30px 20px; color: #777; background: #f9f9f9; border-radius: 10px; border: 2px dashed #e0e0e0; }
.no-availability i { font-size: 3rem; color: #ccc; margin-bottom: 15px; display: block; }
.no-availability p { margin: 8px 0; font-size: 0.95rem; }

/* RESPONSIVE */
@media screen and (max-width: 1600px) { .services-list { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } .category-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); } }
@media screen and (max-width: 1200px) { .services-list { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); } .category-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); } }

@media screen and (max-width: 768px) {
  .client-services { padding: 15px; }
  .page-header-section { flex-direction: column; align-items: stretch; }
  .page-title { font-size: 1.8rem; margin-bottom: 15px; }
  .search-filter-section-fixed { width: 100%; max-width: 100%; margin-bottom: 20px; align-items: stretch; }
  .search-filter-column { align-items: stretch; }
  .search-filter-row { flex-direction: row; align-items: center; }
  .search-container { flex: 1; }
  .tag-filter-chips { width: 100%; overflow-x: auto; overflow-y: hidden; padding-bottom: 5px; -webkit-overflow-scrolling: touch; scrollbar-width: thin; flex-wrap: nowrap; justify-content: flex-start; }
  .tag-chip { flex-shrink: 0; font-size: 0.8rem; padding: 5px 14px; }

  /* On mobile, filter dropdown stays anchored to filter-btn-wrapper — no override needed */
  .filter-container { width: 240px; }

  .services-list { grid-template-columns: 1fr; }
  .category-grid { grid-template-columns: 1fr; }
  .service-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
  .service-actions { flex-direction: column; align-items: stretch; width: 100%; }
  .btn { width: 100%; }
  .booking-actions { flex-direction: column; }
  .btn-cancel, .btn-confirm, .btn-primary, .btn-secondary { width: 100%; }
}

@media screen and (max-width: 480px) {
  .client-services { padding: 10px; }
  .modal { width: 95%; }
  .modal-body, .modal-header { padding: 15px; }
  .service-card { border-radius: 10px; }
  .service-image { height: 160px; }
  .service-title { font-size: 1.2rem; }
  .filter-container { width: calc(100vw - 40px); right: -10px; }
}
</style>