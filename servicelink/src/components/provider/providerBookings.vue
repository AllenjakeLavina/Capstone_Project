<template>
  <div class="provider-bookings">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading bookings...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error">{{ error }}</div>
    </div>

    <div v-else class="bookings-container">
      <h1 class="page-title">My Bookings</h1>

      <!-- Status filter -->
      <div class="filter-container">
        <div class="filter-label">Filter by status:</div>
        <div class="filter-options">
          <button 
            v-for="status in statusOptions" 
            :key="status.value" 
            @click="filterByStatus(status.value)"
            :class="['filter-btn', currentFilter === status.value ? 'active' : '']">
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Bookings list -->
      <div v-if="bookings.length > 0" class="bookings-list">
        <div v-for="booking in bookings" :key="booking.id" class="booking-card">
          <div class="booking-status" :class="booking.status.toLowerCase()">
            {{ formatStatus(booking.status) }}
          </div>
          
          <div class="booking-header">
            <div class="booking-image" v-if="getServiceImage(booking)">
              <img :src="getServiceImage(booking)" :alt="booking.service.title" />
            </div>
            <div class="booking-info">
              <h3 class="booking-title">{{ booking.title || booking.service.title }}</h3>
              <p class="booking-date">
                <i class="fa fa-calendar"></i> 
                {{ formatDate(booking.startTime) }}
              </p>
              <p class="booking-client">
                <i class="fa fa-user"></i> 
                {{ getClientName(booking) }}
              </p>
              <p class="booking-price">
                <i class="fa fa-tag"></i> 
                ₱{{ Number(booking.totalAmount || booking.service.pricing).toFixed(2) }}
              </p>
            </div>
          </div>

          <div class="booking-address" v-if="booking.address">
            <i class="fa fa-map-marker"></i> {{ formatAddress(booking.address) }}
          </div>

          <div class="booking-notes" v-if="booking.notes">
            <h4>Notes:</h4>
            <p>{{ booking.notes }}</p>
          </div>
          
          <div class="booking-actions">
            <button class="btn btn-details" @click="viewBookingDetails(booking.id)">
              View Details
            </button>
            
            <template v-if="booking.status === 'PENDING'">
              <button class="btn btn-accept" @click="confirmAcceptBooking(booking)">
                Accept
              </button>
              <button class="btn btn-decline" @click="confirmDeclineBooking(booking)">
                Decline
              </button>
            </template>
            
            <button 
              v-if="booking.status === 'CONFIRMED'"
              class="btn btn-start" 
              @click="confirmStartService(booking)">
              Start Service
            </button>
            
            <button 
              v-if="booking.status === 'IN_PROGRESS'"
              class="btn btn-complete" 
              @click="confirmCompleteService(booking)">
              Complete Service
            </button>

            <button 
              v-if="booking.status === 'COMPLETED' && booking.payment && booking.payment.status === 'PENDING'"
              class="btn btn-payment" 
              @click="confirmMarkPaymentCompleted(booking)">
              Mark Payment Received
            </button>
            
            <button
              v-if="booking.status === 'COMPLETED' && booking.payment && booking.payment.paymentProofUrl"
              class="btn btn-view-proof"
              @click="viewPaymentProof(booking)">
              View Payment Proof
            </button>
            
            <button 
              v-if="booking.status === 'COMPLETED' && !isBookingRated(booking)"
              class="btn btn-rate" 
              @click="openRatingModal(booking)">
              Rate Client
            </button>
            
            <div v-if="booking.status === 'COMPLETED' && isBookingRated(booking)" class="rating-info">
              <span>Rated: {{ getBookingRating(booking) }} stars</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-bookings">
        <div class="empty-state">
          <i class="fa fa-calendar-o empty-icon"></i>
          <h3>No bookings found</h3>
          <p>You don't have any {{ currentFilter === 'ALL' ? '' : formatStatus(currentFilter).toLowerCase() }} bookings yet.</p>
        </div>
      </div>

      <!-- Accept Booking Modal -->
      <div v-if="showAcceptModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Accept Booking</h2>
            <button class="close-btn" @click="showAcceptModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to accept this booking?</p>
            
            <div class="booking-summary">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Client: {{ getClientName(selectedBooking) }}</p>
              <p>Amount: ₱{{ Number(selectedBooking?.totalAmount || selectedBooking?.service.pricing).toFixed(2) }}</p>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showAcceptModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="acceptBooking()" 
                :disabled="isProcessing">
                {{ isProcessing ? 'Processing...' : 'Accept Booking' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Decline Booking Modal -->
      <div v-if="showDeclineModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header warning">
            <h2>Decline Booking</h2>
            <button class="close-btn" @click="showDeclineModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to decline this booking?</p>
            
            <div class="booking-summary">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Client: {{ getClientName(selectedBooking) }}</p>
            </div>

            <div class="form-group">
              <label for="declineReason">Reason for declining (optional):</label>
              <textarea 
                id="declineReason"
                v-model="declineReason"
                placeholder="Please provide a reason for declining this booking"
                rows="3"
                class="form-control"
              ></textarea>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showDeclineModal = false">Cancel</button>
              <button 
                class="btn btn-danger" 
                @click="declineBooking()" 
                :disabled="isProcessing">
                {{ isProcessing ? 'Processing...' : 'Decline Booking' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Service Modal -->
      <div v-if="showStartModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Start Service</h2>
            <button class="close-btn" @click="showStartModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you ready to start this service? This will notify the client that the service is in progress.</p>
            
            <div class="booking-summary">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Client: {{ getClientName(selectedBooking) }}</p>
              <p>Address: {{ selectedBooking?.address ? formatAddress(selectedBooking?.address) : 'No address provided' }}</p>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showStartModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="startService()" 
                :disabled="isProcessing">
                {{ isProcessing ? 'Processing...' : 'Start Service' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Complete Service Modal -->
      <div v-if="showCompleteModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Complete Service</h2>
            <button class="close-btn" @click="showCompleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to mark this service as completed?</p>
            
            <div class="booking-summary">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Client: {{ getClientName(selectedBooking) }}</p>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showCompleteModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="completeService()" 
                :disabled="isProcessing">
                {{ isProcessing ? 'Processing...' : 'Complete Service' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mark Payment Received Modal -->
      <div v-if="showPaymentReceivedModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Mark Payment Received</h2>
            <button class="close-btn" @click="showPaymentReceivedModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Please confirm that you have received the payment for this service:</p>
            
            <div class="payment-details">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p class="payment-amount">₱{{ Number(selectedBooking?.totalAmount || selectedBooking?.service.pricing).toFixed(2) }}</p>
              <p>Client: {{ getClientName(selectedBooking) }}</p>
              <p>Payment Method: {{ selectedBooking?.payment?.paymentMethod || 'Cash' }}</p>
              
              <!-- Payment proof section -->
              <div v-if="hasPaymentProof" class="payment-proof">
                <h5>Payment Proof</h5>
                <div class="payment-proof-image">
                  <img :src="getPaymentProofUrl(selectedBooking)" alt="Payment Proof" @click="openImageInNewTab(getPaymentProofUrl(selectedBooking))" />
                </div>
                <p class="proof-help-text">Click on image to view in full size</p>
              </div>
              <div v-else class="no-payment-proof">
                <p>No payment proof image was provided by the client.</p>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showPaymentReceivedModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="markPaymentCompleted()" 
                :disabled="isProcessing">
                {{ isProcessing ? 'Processing...' : 'Confirm Payment Received' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Modal -->
      <div v-if="showRatingModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Rate the Client</h2>
            <button class="close-btn" @click="showRatingModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Please rate your experience with this client:</p>
            
            <div class="booking-summary">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p>Client: {{ getClientName(selectedBooking) }}</p>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Amount: ₱{{ Number(selectedBooking?.totalAmount || selectedBooking?.service.pricing).toFixed(2) }}</p>
            </div>
            
            <div class="rating-container">
              <div class="star-rating">
                <template v-for="star in 5" :key="star">
                  <span 
                    class="star" 
                    :class="{ active: star <= rating }"
                    @click="rating = star">
                    ★
                  </span>
                </template>
              </div>
              <div class="rating-text">{{ ratingText }}</div>
            </div>
            
            <div class="form-group">
              <label for="ratingComment">Comment (optional):</label>
              <textarea 
                id="ratingComment"
                v-model="ratingComment"
                placeholder="Share your experience working with this client"
                rows="3"
                class="form-control"
              ></textarea>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showRatingModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="submitRating()" 
                :disabled="!rating || isProcessing">
                {{ isProcessing ? 'Processing...' : 'Submit Rating' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { providerService } from '@/services/apiService';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5500';

// Helper function to get file URL
const getFileUrl = (relativePath) => {
  if (!relativePath) return '';
  
  if (relativePath && (relativePath.startsWith('http://') || relativePath.startsWith('https://'))) {
    return relativePath;
  }
  
  if (relativePath && relativePath.startsWith('/')) {
    return `${API_BASE_URL}${relativePath}`;
  }
  
  return relativePath;
};

export default {
  name: 'ProviderBookings',
  setup() {
    const router = useRouter();
    const bookings = ref([]);
    const loading = ref(true);
    const error = ref('');
    const currentFilter = ref('ALL');
    
    // Modal states
    const showAcceptModal = ref(false);
    const showDeclineModal = ref(false);
    const showStartModal = ref(false);
    const showCompleteModal = ref(false);
    const showPaymentReceivedModal = ref(false);
    const showRatingModal = ref(false);
    const selectedBooking = ref(null);
    const isProcessing = ref(false);
    const declineReason = ref('');
    
    // Rating state
    const rating = ref(0);
    const ratingComment = ref('');
    const bookingRatings = ref({});
    
    const ratingText = computed(() => {
      switch (rating.value) {
        case 1: return 'Poor';
        case 2: return 'Fair';
        case 3: return 'Good';
        case 4: return 'Very Good';
        case 5: return 'Excellent';
        default: return 'Select a rating';
      }
    });

    // Computed property to check if payment proof exists
    const hasPaymentProof = computed(() => {
      return selectedBooking.value && 
             selectedBooking.value.payment && 
             selectedBooking.value.payment.paymentProofUrl;
    });

    // Status options for filtering
    const statusOptions = [
      { label: 'All', value: 'ALL' },
      { label: 'Pending', value: 'PENDING' },
      { label: 'Confirmed', value: 'CONFIRMED' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Cancelled', value: 'CANCELLED' }
    ];

    // Fetch all bookings
    const fetchBookings = async (status = null) => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await providerService.getProviderBookings(status);
        
        if (response.success) {
          console.log('Bookings:', response.data);
          
          // Debug payment information
          const bookingsWithPayment = response.data.filter(booking => booking.payment);
          console.log('Bookings with payment:', bookingsWithPayment);
          
          // Check for confirmed bookings
          const confirmedBookings = response.data.filter(booking => booking.status === 'CONFIRMED');
          console.log('Confirmed bookings:', confirmedBookings);
          
          if (bookingsWithPayment.length > 0) {
            console.log('Payment data example:', bookingsWithPayment[0].payment);
            if (bookingsWithPayment[0].payment.paymentProofUrl) {
              console.log('Payment proof URL:', bookingsWithPayment[0].payment.paymentProofUrl);
              console.log('Formatted URL:', getFileUrl(bookingsWithPayment[0].payment.paymentProofUrl));
            }
          }
          
          bookings.value = response.data;
        } else {
          error.value = response.message || 'Failed to load bookings';
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        error.value = 'Unable to load your bookings. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    // Filter bookings by status
    const filterByStatus = (status) => {
      currentFilter.value = status;
      fetchBookings(status === 'ALL' ? null : status);
    };

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    };

    // Format booking status
    const formatStatus = (status) => {
      if (!status) return '';
      
      switch (status) {
        case 'PENDING': return 'Pending';
        case 'CONFIRMED': return 'Confirmed';
        case 'IN_PROGRESS': return 'In Progress';
        case 'COMPLETED': return 'Completed';
        case 'CANCELLED': return 'Cancelled';
        case 'DISPUTED': return 'Disputed';
        default: return status;
      }
    };

    // Format address
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;
    };

    // Get client name
    const getClientName = (booking) => {
      if (!booking || !booking.client || !booking.client.user) {
        return 'Unknown Client';
      }
      
      const { firstName, lastName } = booking.client.user;
      return `${firstName} ${lastName}`;
    };

    // Get service image
    const getServiceImage = (booking) => {
      if (!booking || !booking.service || !booking.service.imageUrls) {
        return '';
      }
      
      try {
        // If imageUrls is a JSON string, parse it
        let imageUrls = booking.service.imageUrls;
        if (typeof imageUrls === 'string') {
          imageUrls = JSON.parse(imageUrls);
        }
        
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
          return getFileUrl(imageUrls[0]);
        }
      } catch (err) {
        console.error('Error parsing image URLs:', err);
      }
      
      return '';
    };

    // View booking details
    const viewBookingDetails = (bookingId) => {
      router.push(`/provider/booking/${bookingId}`);
    };

    // Show accept booking confirmation
    const confirmAcceptBooking = (booking) => {
      selectedBooking.value = booking;
      showAcceptModal.value = true;
    };

    // Accept booking
    const acceptBooking = async () => {
      if (!selectedBooking.value) return;
      
      isProcessing.value = true;
      
      try {
        const response = await providerService.acceptBooking(selectedBooking.value.id);
        
        if (response.success) {
          // Close modal
          showAcceptModal.value = false;
          // Update the status locally
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            bookings.value[index].status = 'CONFIRMED';
          }
          
          // Show success message
          Swal.fire({
            title: 'Booking Accepted!',
            text: 'You have successfully accepted the booking request',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // If filtering, we may need to refetch
          if (currentFilter.value !== 'ALL' && currentFilter.value !== 'CONFIRMED') {
            fetchBookings(currentFilter.value);
          }
        } else {
          // Show error message
          Swal.fire({
            title: 'Failed to Accept Booking',
            text: response.message || 'Failed to accept booking',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error accepting booking:', err);
        // Show error message
        Swal.fire({
          title: 'Error',
          text: 'Unable to accept booking. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Show decline booking confirmation
    const confirmDeclineBooking = (booking) => {
      selectedBooking.value = booking;
      declineReason.value = '';
      showDeclineModal.value = true;
    };

    // Decline booking
    const declineBooking = async () => {
      if (!selectedBooking.value) return;
      
      isProcessing.value = true;
      
      try {
        const response = await providerService.declineBooking(selectedBooking.value.id, declineReason.value);
        
        if (response.success) {
          // Close modal
          showDeclineModal.value = false;
          // Update the status locally
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            bookings.value[index].status = 'CANCELLED';
          }
          
          // Show success message
          Swal.fire({
            title: 'Booking Declined',
            text: 'You have successfully declined the booking request',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // If filtering, we may need to refetch
          if (currentFilter.value !== 'ALL' && currentFilter.value !== 'CANCELLED') {
            fetchBookings(currentFilter.value);
          }
        } else {
          // Show error message
          Swal.fire({
            title: 'Failed to Decline Booking',
            text: response.message || 'Failed to decline booking',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error declining booking:', err);
        // Show error message
        Swal.fire({
          title: 'Error',
          text: 'Unable to decline booking. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Show start service confirmation
    const confirmStartService = (booking) => {
      selectedBooking.value = booking;
      showStartModal.value = true;
    };

    // Start service
    const startService = async () => {
      if (!selectedBooking.value) return;
      
      isProcessing.value = true;
      
      try {
        const response = await providerService.startService(selectedBooking.value.id);
        
        if (response.success) {
          // Close modal
          showStartModal.value = false;
          // Update the status locally
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            bookings.value[index].status = 'IN_PROGRESS';
          }
          
          // Show success message
          Swal.fire({
            title: 'Service Started!',
            text: 'You have successfully started the service',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // If filtering, we may need to refetch
          if (currentFilter.value !== 'ALL' && currentFilter.value !== 'IN_PROGRESS') {
            fetchBookings(currentFilter.value);
          }
        } else {
          // Show error message
          Swal.fire({
            title: 'Failed to Start Service',
            text: response.message || 'Failed to start service',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error starting service:', err);
        // Show error message
        Swal.fire({
          title: 'Error',
          text: 'Unable to start service. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Show complete service confirmation
    const confirmCompleteService = (booking) => {
      selectedBooking.value = booking;
      showCompleteModal.value = true;
    };

    // Complete service
    const completeService = async () => {
      if (!selectedBooking.value) return;
      
      isProcessing.value = true;
      
      try {
        console.log('Completing service for booking:', selectedBooking.value.id);
        const response = await providerService.completeService(selectedBooking.value.id);
        
        if (response.success) {
          console.log('Service completed successfully:', response.data);
          // Close modal
          showCompleteModal.value = false;
          // Update the status locally
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            bookings.value[index].status = 'COMPLETED';
            console.log('Updated booking status to COMPLETED locally');
          }
          
          // Show success message
          Swal.fire({
            title: 'Service Completed!',
            text: 'The service has been marked as completed successfully',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // If filtering, we may need to refetch
          if (currentFilter.value !== 'ALL' && currentFilter.value !== 'COMPLETED') {
            fetchBookings(currentFilter.value);
          }
        } else {
          console.error('Failed to complete service:', response.message);
          // Close the modal
          showCompleteModal.value = false;
          
          // Show error message
          Swal.fire({
            title: 'Failed to Complete Service',
            text: response.message || 'Failed to complete service',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error completing service:', err);
        showCompleteModal.value = false;
        
        // Show error message
        Swal.fire({
          title: 'Error',
          text: 'Unable to complete service. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Show payment received confirmation
    const confirmMarkPaymentCompleted = (booking) => {
      selectedBooking.value = booking;
      showPaymentReceivedModal.value = true;
    };

    // Mark payment completed
    const markPaymentCompleted = async () => {
      if (!selectedBooking.value) return;
      
      isProcessing.value = true;
      
      try {
        console.log('Marking payment completed for booking:', selectedBooking.value.id);
        const response = await providerService.markPaymentReceived(selectedBooking.value.id);
        
        if (response.success) {
          console.log('Payment marked as completed:', response.data);
          // Close modal
          showPaymentReceivedModal.value = false;
          
          // Update the booking locally to reflect payment status change
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            // Make sure that only the payment status changes
            if (bookings.value[index].payment) {
              bookings.value[index].payment.status = 'COMPLETED';
              console.log('Updated payment status to COMPLETED');
            } else {
              console.log('Creating payment object in booking');
              // Create payment object if it doesn't exist
              bookings.value[index].payment = {
                id: response.data?.id || 'temp-id',
                status: 'COMPLETED',
                amount: bookings.value[index].totalAmount || bookings.value[index].service.pricing,
                serviceBookingId: bookings.value[index].id
              };
            }
            
            // Ensure the booking status remains COMPLETED (not CONFIRMED)
            if (bookings.value[index].status !== 'COMPLETED') {
              bookings.value[index].status = 'COMPLETED';
            }
            console.log('Ensuring booking status is COMPLETED:', bookings.value[index].status);
            
            // Log the updated booking for debugging
            console.log('Updated booking after payment completion:', bookings.value[index]);
          }
          
          // Show success message with SweetAlert2
          Swal.fire({
            title: 'Payment Marked as Received!',
            text: 'The payment has been successfully marked as received',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // Refresh bookings after a short delay to ensure UI updates first
          setTimeout(() => {
            fetchBookings(currentFilter.value === 'ALL' ? null : currentFilter.value);
          }, 500);
        } else {
          // Error message with SweetAlert2
          Swal.fire({
            title: 'Failed to Mark Payment',
            text: response.message || 'Failed to mark payment as completed',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error marking payment completed:', err);
        // Error message with SweetAlert2
        Swal.fire({
          title: 'Error',
          text: 'Unable to mark payment as completed. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Get payment proof URL with proper formatting
    const getPaymentProofUrl = (booking) => {
      if (booking && booking.payment && booking.payment.paymentProofUrl) {
        return getFileUrl(booking.payment.paymentProofUrl);
      }
      return '';
    };
    
    // Open image in new tab for better viewing
    const openImageInNewTab = (imageUrl) => {
      if (imageUrl) {
        window.open(imageUrl, '_blank');
      }
    };
    
    // View payment proof directly
    const viewPaymentProof = (booking) => {
      if (booking && booking.payment && booking.payment.paymentProofUrl) {
        openImageInNewTab(getFileUrl(booking.payment.paymentProofUrl));
      }
    };

    // Check if booking has been rated
    const isBookingRated = (booking) => {
      // Check if this specific booking has a review
      return bookingRatings.value[booking.id] !== undefined;
    };
    
    // Get rating for a booking
    const getBookingRating = (booking) => {
      return bookingRatings.value[booking.id] || 0;
    };
    
    // Open rating modal
    const openRatingModal = (booking) => {
      selectedBooking.value = booking;
      rating.value = 0;
      ratingComment.value = '';
      showRatingModal.value = true;
    };
    
    // Submit rating
    const submitRating = async () => {
      if (!selectedBooking.value) {
        Swal.fire({
          title: 'Error',
          text: 'No booking selected',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
        return;
      }
      
      if (!rating.value) {
        Swal.fire({
          title: 'Rating Required',
          text: 'Please provide a rating before submitting',
          icon: 'warning',
          confirmButtonColor: '#ff9800'
        });
        return;
      }
      
      isProcessing.value = true;
      
      try {
        const response = await providerService.createReview(
          selectedBooking.value.id,
          {
            rating: rating.value,
            comment: ratingComment.value
          }
        );
        
        if (response.success) {
          // Store the rating locally
          bookingRatings.value = {
            ...bookingRatings.value,
            [selectedBooking.value.id]: rating.value
          };
          
          // Close the modal
          showRatingModal.value = false;
          
          // Show success message
          Swal.fire({
            title: 'Rating Submitted!',
            text: 'Thank you for providing your feedback',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
        } else {
          Swal.fire({
            title: 'Submission Failed',
            text: response.message || 'Failed to submit rating',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error submitting rating:', err);
        Swal.fire({
          title: 'Error',
          text: 'Unable to submit rating. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Fetch ratings for bookings
    const fetchRatings = async () => {
      try {
        // Get reviews that the provider has given
        const response = await providerService.getReviewsGiven();
        
        if (response.success) {
          // Create a map of booking IDs to ratings
          const ratings = {};
          
          response.data.forEach(review => {
            // Only add reviews that have a serviceBookingId
            if (review.serviceBookingId) {
              ratings[review.serviceBookingId] = review.rating;
            }
          });
          
          bookingRatings.value = ratings;
          console.log('Fetched reviews for bookings:', ratings);
        }
      } catch (err) {
        console.error('Error fetching ratings:', err);
      }
    };

    // Load data on component mount
    onMounted(() => {
      fetchBookings();
      fetchRatings();
    });
    
    return {
      bookings,
      loading,
      error,
      currentFilter,
      statusOptions,
      showAcceptModal,
      showDeclineModal,
      showStartModal,
      showCompleteModal,
      showPaymentReceivedModal,
      showRatingModal,
      selectedBooking,
      isProcessing,
      declineReason,
      rating,
      ratingComment,
      ratingText,
      hasPaymentProof,
      fetchBookings,
      filterByStatus,
      formatDate,
      formatStatus,
      formatAddress,
      getClientName,
      getServiceImage,
      viewBookingDetails,
      confirmAcceptBooking,
      acceptBooking,
      confirmDeclineBooking,
      declineBooking,
      confirmStartService,
      startService,
      confirmCompleteService,
      completeService,
      confirmMarkPaymentCompleted,
      markPaymentCompleted,
      getPaymentProofUrl,
      openImageInNewTab,
      viewPaymentProof,
      isBookingRated,
      getBookingRating,
      openRatingModal,
      submitRating
    };
  }
};
</script>

<style scoped>
.provider-bookings {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 20px 30px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

.page-title {
  margin-bottom: 30px;
  color: #4a5568;
  font-size: 2.6rem;
  font-weight: 800;
  border-left: 5px solid #27ae60;
  padding-left: 15px;
  transition: all 0.3s ease;
}

.page-title:hover {
  transform: translateX(5px);
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
  border: 4px solid rgba(39, 174, 96, 0.2);
  border-radius: 50%;
  border-top: 4px solid #27ae60;
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

.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 12px;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.filter-label {
  font-weight: 600;
  margin-right: 15px;
  color: #2c3e50;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  background-color: #f1f1f1;
  border: none;
  padding: 10px 18px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-btn:hover {
  background-color: #e1e1e1;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);
}

.bookings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
  width: 100%;
}

.booking-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #edf2f7;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.booking-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.booking-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 16px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 30px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.booking-status.pending {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.booking-status.confirmed {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.booking-status.in_progress {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.booking-status.completed {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.booking-status.cancelled {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.booking-status.disputed {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.booking-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.booking-image {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  transition: all 0.3s ease;
}

.booking-image:hover {
  transform: scale(1.05);
}

.booking-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-info {
  flex-grow: 1;
}

.booking-title {
  margin: 0 0 12px 0;
  font-size: 1.4rem;
  color: #2c3e50;
  padding-right: 100px; /* Space for status badge */
  font-weight: 600;
  line-height: 1.3;
}

.booking-date, .booking-client, .booking-price {
  margin: 8px 0;
  font-size: 0.95rem;
  color: #505a68;
  display: flex;
  align-items: center;
}

.booking-date i, .booking-client i, .booking-price i {
  width: 24px;
  color: #27ae60;
  margin-right: 6px;
  font-size: 1rem;
}

.booking-price {
  font-weight: 600;
  color: #2ecc71;
}

.booking-address {
  margin: 15px 0;
  font-size: 0.95rem;
  color: #505a68;
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
}

.booking-notes {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 0 0 20px 0;
  border-left: 3px solid #27ae60;
}

.booking-notes h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.booking-notes p {
  margin: 0;
  color: #505a68;
  line-height: 1.5;
}

.booking-address i {
  width: 24px;
  color: #27ae60;
  margin-right: 6px;
  font-size: 1rem;
  margin-top: 3px;
}

.booking-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: auto;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-details {
  background-color: #f8f9fa;
  color: #505a68;
  border: 1px solid #e1e4e8;
}

.btn-details:hover {
  background-color: #e9ecef;
  color: #2c3e50;
}

.btn-accept {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-accept:hover {
  background: linear-gradient(135deg, #27ae60, #219d55);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-decline, .btn-cancel {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-decline:hover, .btn-cancel:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-start {
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
}

.btn-start:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-complete {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-complete:hover {
  background: linear-gradient(135deg, #27ae60, #219d55);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-payment {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-payment:hover {
  background: linear-gradient(135deg, #e67e22, #d35400);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-view-proof {
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
}

.btn-view-proof:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-rate {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.btn-rate:hover {
  background: linear-gradient(135deg, #8e44ad, #703688);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #219d55, #1e8449);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #505a68;
  border: 1px solid #e1e4e8;
}

.btn-secondary:hover {
  background-color: #e9ecef;
  color: #2c3e50;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.no-bookings {
  display: flex;
  justify-content: center;
  padding: 80px 0;
  width: 100%;
}

.empty-state {
  text-align: center;
  max-width: 400px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-icon {
  font-size: 5rem;
  color: #bdc3c7;
  margin-bottom: 25px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.empty-state h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* Modal styles */
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
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.modal-header.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: inherit;
  transition: transform 0.2s ease;
  width: 30px;
  height: 30px;
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

.modal-body p {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.05rem;
  color: #505a68;
  line-height: 1.5;
}

.warning-text {
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 20px;
  padding: 12px 15px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
}

.booking-summary {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  border: 1px solid #e1e4e8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.booking-summary h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 600;
}

.booking-summary p {
  margin: 10px 0;
  font-size: 0.95rem;
  color: #505a68;
}

.payment-details {
  margin-bottom: 25px;
}

.payment-details h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 600;
}

.payment-amount {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2ecc71;
  margin-bottom: 20px;
  background-color: rgba(46, 204, 113, 0.1);
  padding: 10px 15px;
  border-radius: 8px;
  display: inline-block;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-control:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2);
  outline: none;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
}

.rating-info {
  display: inline-flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #505a68;
  border: 1px solid #e1e4e8;
}

.rating-container {
  margin: 25px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.star-rating {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.star {
  font-size: 2.2rem;
  color: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.star:hover {
  transform: scale(1.2);
}

.star.active {
  color: #f39c12;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.rating-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-top: 15px;
}

.payment-proof {
  margin: 25px 0;
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  padding: 20px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.payment-proof h5 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.payment-proof-image {
  margin-bottom: 15px;
  text-align: center;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.payment-proof-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.payment-proof-image img:hover {
  transform: scale(1.05);
}

.proof-help-text {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-align: center;
  margin: 10px 0 0 0;
}

.no-payment-proof {
  margin: 25px 0;
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 10px;
  color: #7f8c8d;
  text-align: center;
  border: 1px dashed #ddd;
}

@media screen and (max-width: 1600px) {
  .bookings-list {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media screen and (max-width: 1200px) {
  .bookings-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .provider-bookings {
    padding: 15px;
  }
  
  .booking-header {
    flex-direction: column;
  }
  
  .booking-image {
    width: 100%;
    height: 180px;
    margin-bottom: 15px;
  }
  
  .booking-title {
    padding-right: 0;
    margin-top: 10px;
  }
  
  .booking-status {
    position: static;
    display: inline-block;
    margin-bottom: 15px;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    padding: 12px;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-options {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 10px;
    flex-wrap: nowrap;
  }
  
  .filter-btn {
    white-space: nowrap;
  }
  
  .bookings-list {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 90%;
    max-height: 80vh;
  }
  
  .star-rating {
    gap: 8px;
  }
  
  .star {
    font-size: 2rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}

@media screen and (max-width: 480px) {
  .provider-bookings {
    padding: 10px;
  }
  
  .modal-body, .modal-header {
    padding: 15px;
  }
  
  .booking-card {
    padding: 20px;
  }
  
  .booking-title {
    font-size: 1.2rem;
  }
}
</style>
