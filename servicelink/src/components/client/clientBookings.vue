<template>
  <div class="client-bookings">
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
              <p class="booking-provider">
                <i class="fa fa-user"></i> 
                {{ getProviderName(booking) }}
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
          
          <div class="booking-actions">
            <button class="btn btn-details" @click="viewBookingDetails(booking.id)">
              View Details
            </button>
            
            <button 
              v-if="booking.status === 'PENDING'"
              class="btn btn-cancel" 
              @click="confirmCancelBooking(booking)">
              Cancel Booking
            </button>
            
            <button 
              v-if="booking.status === 'COMPLETED' && (!booking.payment || booking.payment.status === 'PENDING')"
              class="btn btn-payment" 
              @click="openPaymentModal(booking)">
              Process Payment
            </button>

            <button 
              v-if="booking.status === 'COMPLETED' && !hasReviewed(booking)"
              class="btn btn-review" 
              @click="openReviewModal(booking)">
              Write Review
            </button>
          </div>
        </div>
      </div>

      <div v-else class="no-bookings">
        <div class="empty-state">
          <i class="fa fa-calendar-o empty-icon"></i>
          <h3>No bookings found</h3>
          <p>You don't have any {{ currentFilter === 'ALL' ? '' : formatStatus(currentFilter).toLowerCase() }} bookings yet.</p>
          <button class="btn btn-primary" @click="goToServices">Browse Services</button>
        </div>
      </div>

      <!-- Cancel Confirmation Modal -->
      <div v-if="showCancelModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header warning">
            <h2>Cancel Booking</h2>
            <button class="close-btn" @click="showCancelModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to cancel this booking?</p>
            <p class="warning-text">This action cannot be undone.</p>
            
            <div class="booking-summary">
              <h4>{{ selectedBooking?.title || selectedBooking?.service.title }}</h4>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Provider: {{ getProviderName(selectedBooking) }}</p>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showCancelModal = false">No, Keep It</button>
              <button 
                class="btn btn-danger" 
                @click="cancelBooking()" 
                :disabled="isCancelling">
                {{ isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Confirmation Modal -->
      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Process Payment</h2>
            <button class="close-btn" @click="showPaymentModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="payment-details">
              <h3>{{ selectedBooking?.title || selectedBooking?.service.title }}</h3>
              <p class="payment-amount">
                Amount Due: ₱{{ Number(selectedBooking?.totalAmount || selectedBooking?.service.pricing).toFixed(2) }}
              </p>
              <p>Date: {{ formatDate(selectedBooking?.startTime) }}</p>
              <p>Provider: {{ getProviderName(selectedBooking) }}</p>
            </div>
            
            <div class="payment-method">
              <p class="payment-note">
                <i class="fa fa-info-circle"></i> 
                Payment will be collected in cash when the service is provided.
              </p>
              
              <div class="file-upload">
                <label for="paymentProof">Upload Payment Proof (optional):</label>
                <input 
                  type="file" 
                  id="paymentProof" 
                  ref="paymentProofInput"
                  @change="handlePaymentProofUpload"
                  accept="image/*"
                  class="form-control"
                />
                <p class="file-hint">Supported formats: JPG, PNG, GIF (max 5MB)</p>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showPaymentModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="confirmPayment()" 
                :disabled="isProcessingPayment">
                {{ isProcessingPayment ? 'Processing...' : 'Confirm Booking' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Modal -->
      <div v-if="showReviewModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Write a Review</h2>
            <button class="close-btn" @click="showReviewModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="review-form">
              <div class="rating-input">
                <label>Rating:</label>
                <div class="star-rating">
                  <button 
                    v-for="star in 5" 
                    :key="star"
                    @click="setRating(star)"
                    :class="['star-btn', star <= reviewData.rating ? 'active' : '']"
                    type="button">
                    <i class="fa fa-star"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="reviewComment">Comment:</label>
                <textarea 
                  id="reviewComment"
                  v-model="reviewData.comment"
                  placeholder="Share your experience..."
                  rows="4"
                  class="form-control"
                ></textarea>
              </div>

              <div class="file-upload">
                <label>Add Photos (optional):</label>
                <input 
                  type="file" 
                  ref="reviewImagesInput"
                  @change="handleReviewImagesUpload"
                  accept="image/*"
                  multiple
                  class="form-control"
                />
                <p class="file-hint">You can upload up to 5 images (JPG, PNG, GIF - max 5MB each)</p>
                
                <div v-if="selectedImages.length > 0" class="selected-images">
                  <div v-for="(image, index) in selectedImages" :key="index" class="image-preview">
                    <img :src="image.preview" :alt="'Selected image ' + (index + 1)" />
                    <button class="remove-image" @click="removeImage(index)">&times;</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showReviewModal = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                @click="submitReview()" 
                :disabled="isSubmittingReview || !reviewData.rating">
                {{ isSubmittingReview ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { clientService } from '@/services/apiService';
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
  name: 'ClientBookings',
  setup() {
    const router = useRouter();
    const bookings = ref([]);
    const loading = ref(true);
    const error = ref('');
    const currentFilter = ref('ALL');
    const userReviews = ref([]);
    
    // Modal states
    const showCancelModal = ref(false);
    const showPaymentModal = ref(false);
    const selectedBooking = ref(null);
    const isCancelling = ref(false);
    const isProcessingPayment = ref(false);

    // Payment related refs
    const paymentProofInput = ref(null);
    const paymentProofFile = ref(null);
    
    // Review related refs
    const showReviewModal = ref(false);
    const reviewImagesInput = ref(null);
    const selectedImages = ref([]);
    const reviewData = ref({
      rating: 0,
      comment: ''
    });
    const isSubmittingReview = ref(false);

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
        const response = await clientService.getBookings(status);
        
        if (response.success) {
          console.log('Bookings:', response.data);
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

    // Get provider name
    const getProviderName = (booking) => {
      if (!booking || !booking.serviceProvider || !booking.serviceProvider.user) {
        return 'Unknown Provider';
      }
      
      const { firstName, lastName } = booking.serviceProvider.user;
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
      router.push(`/client/booking/${bookingId}`);
    };

    // Go to services page
    const goToServices = () => {
      router.push('/client/services');
    };

    // Show cancel booking confirmation
    const confirmCancelBooking = (booking) => {
      selectedBooking.value = booking;
      showCancelModal.value = true;
    };

    // Cancel booking
    const cancelBooking = async () => {
      if (!selectedBooking.value) return;
      
      isCancelling.value = true;
      
      try {
        const response = await clientService.cancelBooking(selectedBooking.value.id);
        
        if (response.success) {
          // Close modal and refresh bookings
          showCancelModal.value = false;
          // Update the status locally to avoid a full refresh
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            bookings.value[index].status = 'CANCELLED';
          }
          
          // Show success message
          Swal.fire({
            title: 'Booking Cancelled',
            text: 'Your booking has been successfully cancelled',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // If filtering, we may need to refetch
          if (currentFilter.value !== 'ALL' && currentFilter.value !== 'CANCELLED') {
            fetchBookings(currentFilter.value);
          }
        } else {
          Swal.fire({
            title: 'Cancellation Failed',
            text: response.message || 'Failed to cancel booking',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (err) {
        console.error('Error cancelling booking:', err);
        Swal.fire({
          title: 'Error',
          text: 'Unable to cancel booking. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isCancelling.value = false;
      }
    };

    // Show payment processing modal
    const processPayment = (booking) => {
      selectedBooking.value = booking;
      showPaymentModal.value = true;
    };

    // File handling methods
    const handlePaymentProofUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          Swal.fire({
            title: 'File Too Large',
            text: 'File size should not exceed 5MB',
            icon: 'warning',
            confirmButtonColor: '#ff9800'
          });
          event.target.value = '';
          return;
        }
        paymentProofFile.value = file;
      }
    };

    const handleReviewImagesUpload = (event) => {
      const files = Array.from(event.target.files);
      
      // Validate number of files
      if (selectedImages.value.length + files.length > 5) {
        Swal.fire({
          title: 'Too Many Files',
          text: 'You can upload a maximum of 5 images',
          icon: 'warning',
          confirmButtonColor: '#ff9800'
        });
        event.target.value = '';
        return;
      }

      // Validate file sizes and create previews
      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          Swal.fire({
            title: 'File Too Large',
            text: `File ${file.name} exceeds 5MB limit`,
            icon: 'warning',
            confirmButtonColor: '#ff9800'
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          selectedImages.value.push({
            file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });
    };

    const removeImage = (index) => {
      selectedImages.value.splice(index, 1);
    };

    // Payment confirmation
    const confirmPayment = async () => {
      try {
        // Check if payment is already completed
        if (selectedBooking.value.payment && selectedBooking.value.payment.status === 'COMPLETED') {
          Swal.fire({
            title: 'Payment Failed',
            text: 'Payment has already been processed for this booking',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
          isProcessingPayment.value = false;
          return;
        }
        
        isProcessingPayment.value = true;
        const result = await clientService.processPayment(
          selectedBooking.value.id,
          paymentProofFile.value
        );

        if (result.success) {
          showPaymentModal.value = false;
          
          // Update the booking locally to maintain COMPLETED status
          const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
          if (index !== -1) {
            // Create payment object in local booking data with COMPLETED status
            bookings.value[index].payment = {
              ...result.data,
              status: 'COMPLETED'
            };
            
            // Ensure the status remains COMPLETED
            if (bookings.value[index].status !== 'COMPLETED') {
              bookings.value[index].status = 'COMPLETED';
            }
            
            console.log('Updated booking after payment processing:', bookings.value[index]);
          }
          
          // Show success message with SweetAlert2
          Swal.fire({
            title: 'Payment Processed!',
            text: 'Your payment has been successfully processed',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          
          // Force UI to update immediately
          bookings.value = [...bookings.value];
        } else {
          // Error message with SweetAlert2
          Swal.fire({
            title: 'Payment Failed',
            text: result.message || 'Failed to process payment',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (error) {
        console.error('Payment error:', error);
        // Error message with SweetAlert2
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while processing payment',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isProcessingPayment.value = false;
        paymentProofFile.value = null;
        if (paymentProofInput.value) {
          paymentProofInput.value.value = '';
        }
      }
    };

    // Function to handle star rating click
    const setRating = (value) => {
      reviewData.value.rating = Number(value);
    };

    // Review submission
    const submitReview = async () => {
      if (!reviewData.value.rating) {
        Swal.fire({
          title: 'Rating Required',
          text: 'Please provide a rating before submitting',
          icon: 'warning',
          confirmButtonColor: '#ff9800'
        });
        return;
      }

      try {
        isSubmittingReview.value = true;
        const imageFiles = selectedImages.value.map(img => img.file);
        
        const result = await clientService.submitReview(
          selectedBooking.value.id,
          {
            rating: parseFloat(reviewData.value.rating), // Ensure it's a float
            comment: reviewData.value.comment
          },
          imageFiles
        );

        if (result.success) {
          showReviewModal.value = false;
          // Show success message
          Swal.fire({
            title: 'Review Submitted!',
            text: 'Thank you for your feedback',
            icon: 'success',
            confirmButtonColor: '#4CAF50',
            timer: 3000
          });
          // Refresh bookings list
          await fetchBookings();
        } else {
          Swal.fire({
            title: 'Submission Failed',
            text: result.message || 'Failed to submit review',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
        }
      } catch (error) {
        console.error('Review submission error:', error);
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while submitting the review',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        isSubmittingReview.value = false;
        reviewData.value = { rating: 0, comment: '' };
        selectedImages.value = [];
        if (reviewImagesInput.value) {
          reviewImagesInput.value.value = '';
        }
      }
    };

    // Function to check if user has already reviewed
    const hasReviewed = (booking) => {
      if (!booking || !userReviews.value.length) return false;
      
      // Only check for reviews linked directly to this booking
      return userReviews.value.some(review => 
        review.serviceBooking && review.serviceBooking.id === booking.id
      );
    };

    // Function to check if payment is completed
    const hasCompletedPayment = (booking) => {
      return booking && booking.payment && booking.payment.status === 'COMPLETED';
    };
    
    // Function to open payment modal
    const openPaymentModal = (booking) => {
      // Check if payment is already completed
      if (booking.payment && booking.payment.status === 'COMPLETED') {
        Swal.fire({
          title: 'Payment Failed',
          text: 'Payment has already been processed for this booking',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
        return;
      }
      
      selectedBooking.value = booking;
      showPaymentModal.value = true;
    };

    // Function to open review modal
    const openReviewModal = (booking) => {
      selectedBooking.value = booking;
      reviewData.value = { rating: 0, comment: '' };
      selectedImages.value = [];
      showReviewModal.value = true;
    };

    // Load data on component mount
    onMounted(() => {
      fetchBookings();
      fetchUserReviews();
    });
    
    // Add function to fetch user reviews
    const fetchUserReviews = async () => {
      try {
        const response = await clientService.getReviewsGiven();
        if (response.success) {
          userReviews.value = response.data;
        }
      } catch (err) {
        console.error('Error fetching user reviews:', err);
      }
    };
    
    return {
      bookings,
      loading,
      error,
      currentFilter,
      statusOptions,
      showCancelModal,
      showPaymentModal,
      selectedBooking,
      isCancelling,
      isProcessingPayment,
      paymentProofInput,
      handlePaymentProofUpload,
      showReviewModal,
      reviewImagesInput,
      selectedImages,
      reviewData,
      isSubmittingReview,
      handleReviewImagesUpload,
      removeImage,
      submitReview,
      fetchBookings,
      filterByStatus,
      formatDate,
      formatStatus,
      formatAddress,
      getProviderName,
      getServiceImage,
      viewBookingDetails,
      goToServices,
      confirmCancelBooking,
      cancelBooking,
      processPayment,
      confirmPayment,
      hasReviewed,
      openPaymentModal,
      openReviewModal,
      setRating,
      userReviews,
      hasCompletedPayment,
    };
  }
};
</script>

<style scoped>
.client-bookings {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 20px 30px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

.page-title {
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: 700;
  border-left: 5px solid #27ae60;
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
  background: linear-gradient(90deg, #27ae60, #2ecc71);
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
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(135deg, #f1f1f1, #e0e0e0);
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
  background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.filter-btn.active {
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);
  font-weight: 600;
}

.bookings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
  width: 100%;
}

.booking-card {
  background: linear-gradient(135deg, #ffffff, #f9f9f9);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.booking-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.booking-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.booking-card:hover::before {
  transform: scaleX(1);
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
  z-index: 1;
}

.booking-status.pending {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.booking-status.confirmed {
  background: linear-gradient(135deg, #27ae60, #219d55);
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
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  transition: all 0.3s ease;
}

.booking-image:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.booking-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.booking-image:hover img {
  transform: scale(1.1);
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

.booking-date, .booking-provider, .booking-price {
  margin: 8px 0;
  font-size: 0.95rem;
  color: #505a68;
  display: flex;
  align-items: center;
}

.booking-date i, .booking-provider i, .booking-price i {
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
  background: linear-gradient(135deg, #f5f7fa, #f0f2f5);
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  border-left: 3px solid #e0e0e0;
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
  border-radius: 50px;
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
  gap: 6px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn i {
  font-size: 1rem;
}

.btn-details {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #505a68;
  border: 1px solid #e1e4e8;
}

.btn-details:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  color: #2c3e50;
}

.btn-cancel {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-payment {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-payment:hover {
  background: linear-gradient(135deg, #27ae60, #219d55);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-review {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.btn-review:hover {
  background: linear-gradient(135deg, #8e44ad, #703688);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  box-shadow: 0 4px 10px rgba(39, 174, 96, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #219d55, #1e8449);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #505a68;
  border: 1px solid #e1e4e8;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
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
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
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
  font-weight: 600;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 25px;
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
  backdrop-filter: blur(5px);
  animation: fadeIn 0.2s ease;
}

.modal {
  background-color: white;
  border-radius: 15px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
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
  background: linear-gradient(135deg, #f8f9fa, #f1f1f1);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.modal-header.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.modal-header.success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
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
  background: linear-gradient(135deg, #f8f9fa, #f5f5f5);
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

.payment-details h3 {
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

.payment-method {
  background: linear-gradient(135deg, #f8f9fa, #f5f5f5);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  border: 1px solid #e1e4e8;
}

.payment-note {
  margin: 0;
  color: #27ae60;
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-note i {
  color: #27ae60;
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
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
  outline: none;
  border-color: #38b676;
  box-shadow: 0 0 0 3px rgba(56, 182, 118, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.file-upload {
  margin: 20px 0;
}

.file-hint {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 8px;
}

.selected-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid white;
}

.image-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.remove-image:hover {
  transform: scale(1.1);
  background: linear-gradient(135deg, #c0392b, #a93226);
}

.star-rating {
  display: flex;
  gap: 12px;
  margin: 15px 0;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  color: #ddd;
  transition: all 0.3s ease;
  padding: 5px;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.active {
  color: #f39c12;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.rating-input {
  margin-bottom: 20px;
}

.rating-input label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  display: block;
}

.review-form {
  background: linear-gradient(135deg, #f8f9fa, #f5f5f5);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #e1e4e8;
}

@media screen and (max-width: 1600px) {
  .bookings-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media screen and (max-width: 1200px) {
  .bookings-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .client-bookings {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
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
  
  .star-btn {
    font-size: 1.8rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .selected-images {
    justify-content: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {
  .client-bookings {
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
  
  .star-btn {
    font-size: 1.5rem;
  }
  
  .booking-status {
    font-size: 0.7rem;
    padding: 5px 12px;
  }
}
</style>
