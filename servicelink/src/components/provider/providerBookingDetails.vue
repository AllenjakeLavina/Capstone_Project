<template>
  <div class="booking-details-page">
    <div class="container">
      <div class="back-nav">
        <button class="back-btn" @click="goBack">
          <i class="fa fa-arrow-left"></i> Back to Bookings
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading booking details...</p>
      </div>

      <div v-else-if="error" class="error-card">
        <div class="error">{{ error }}</div>
      </div>

      <div v-else class="details-section">
        <div class="main-card">
          <div class="card-header">
            <h1>Booking Details</h1>
            <div class="status-badge" :class="booking.status.toLowerCase()">
              {{ formatStatus(booking.status) }}
            </div>
          </div>
          
          <div class="service-info">
            <h2>{{ booking.title || booking.service.title }}</h2>
            <div class="info-row">
              <div class="info-label"><i class="fa fa-calendar"></i> Date:</div>
              <div class="info-value">{{ formatDate(booking.startTime) }}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fa fa-user"></i> Client:</div>
              <div class="info-value">{{ getClientName(booking) }}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fa fa-tag"></i> Amount:</div>
              <div class="info-value">₱{{ Number(booking.totalAmount || booking.service.pricing).toFixed(2) }}</div>
            </div>
          </div>

          <div v-if="booking.address" class="card-section">
            <h3>Service Location</h3>
            <p>{{ formatAddress(booking.address) }}</p>
          </div>

          <div v-if="booking.notes" class="card-section">
            <h3>Additional Notes</h3>
            <p>{{ booking.notes }}</p>
          </div>

          <div v-if="booking.payment" class="card-section">
            <h3>Payment Information</h3>
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="info-value status" :class="booking.payment.status.toLowerCase()">
                {{ booking.payment.status }}
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">Amount:</div>
              <div class="info-value">₱{{ Number(booking.payment.amount).toFixed(2) }}</div>
            </div>
            <div v-if="booking.payment.paymentMethod" class="info-row">
              <div class="info-label">Method:</div>
              <div class="info-value">{{ booking.payment.paymentMethod }}</div>
            </div>
          </div>

          <div v-if="booking.payment && booking.payment.paymentProofUrl" class="card-section">
            <h3>Payment Proof</h3>
            <div class="payment-proof">
              <img 
                :src="getPaymentProofUrl(booking)" 
                alt="Payment Proof"
                @click="openImageInNewTab(getPaymentProofUrl(booking))"
              />
            </div>
          </div>

          <div class="actions-section">
            <template v-if="booking.status === 'PENDING'">
              <button class="btn btn-accept" @click="confirmAcceptBooking">Accept</button>
              <button class="btn btn-decline" @click="confirmDeclineBooking">Decline</button>
            </template>
            
            <button 
              v-if="booking.status === 'CONFIRMED'"
              class="btn btn-start" 
              @click="confirmStartService">
              Start Service
            </button>
            
            <button 
              v-if="booking.status === 'IN_PROGRESS'"
              class="btn btn-complete" 
              @click="confirmCompleteService">
              Complete Service
            </button>

            <button 
              v-if="booking.status === 'COMPLETED' && booking.payment && booking.payment.status === 'PENDING'"
              class="btn btn-payment" 
              @click="confirmMarkPaymentCompleted">
              Mark Payment Received
            </button>
            
            <button 
              v-if="booking.status === 'COMPLETED' && !isBookingRated"
              class="btn btn-rate" 
              @click="openRatingModal">
              Rate Client
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { providerService } from '@/services/apiService';

const API_BASE_URL = 'http://localhost:5500';

const getFileUrl = (relativePath) => {
  if (!relativePath) return '';
  
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  if (relativePath.startsWith('/')) {
    return `${API_BASE_URL}${relativePath}`;
  }
  
  return relativePath;
};

export default {
  name: 'ProviderBookingDetails',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const booking = ref(null);
    const loading = ref(true);
    const error = ref('');
    const isBookingRated = ref(false);

    const fetchBookingDetails = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await providerService.getProviderBookingDetails(route.params.bookingId);
        if (response.success) {
          booking.value = response.data;
          // Check if booking is rated
          await checkBookingRating();
        } else {
          error.value = response.message || 'Failed to load booking details';
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        error.value = 'Unable to load booking details. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    const checkBookingRating = async () => {
      try {
        const response = await providerService.getReviewsGiven();
        if (response.success) {
          isBookingRated.value = response.data.some(
            review => review.serviceBookingId === route.params.bookingId
          );
        }
      } catch (err) {
        console.error('Error checking booking rating:', err);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatStatus = (status) => {
      if (!status) return '';
      return status.charAt(0) + status.slice(1).toLowerCase();
    };

    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;
    };

    const getClientName = (booking) => {
      if (!booking?.client?.user) return 'Unknown Client';
      const { firstName, lastName } = booking.client.user;
      return `${firstName} ${lastName}`;
    };

    const getServiceImage = (booking) => {
      if (!booking?.service?.imageUrls) return '';
      
      try {
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

    const getPaymentProofUrl = (booking) => {
      if (booking?.payment?.paymentProofUrl) {
        return getFileUrl(booking.payment.paymentProofUrl);
      }
      return '';
    };

    const openImageInNewTab = (imageUrl) => {
      if (imageUrl) {
        window.open(imageUrl, '_blank');
      }
    };

    const goBack = () => {
      router.push('/provider/bookings');
    };

    const confirmAcceptBooking = async () => {
      if (confirm('Are you sure you want to accept this booking?')) {
        try {
          const response = await providerService.acceptBooking(booking.value.id);
          if (response.success) {
            booking.value.status = 'CONFIRMED';
          } else {
            error.value = response.message || 'Failed to accept booking';
          }
        } catch (err) {
          console.error('Error accepting booking:', err);
          error.value = 'Unable to accept booking. Please try again later.';
        }
      }
    };

    const confirmDeclineBooking = async () => {
      const reason = prompt('Please provide a reason for declining (optional):');
      if (reason !== null) {
        try {
          const response = await providerService.declineBooking(booking.value.id, reason);
          if (response.success) {
            booking.value.status = 'CANCELLED';
          } else {
            error.value = response.message || 'Failed to decline booking';
          }
        } catch (err) {
          console.error('Error declining booking:', err);
          error.value = 'Unable to decline booking. Please try again later.';
        }
      }
    };

    const confirmStartService = async () => {
      if (confirm('Are you ready to start this service?')) {
        try {
          const response = await providerService.startService(booking.value.id);
          if (response.success) {
            booking.value.status = 'IN_PROGRESS';
          } else {
            error.value = response.message || 'Failed to start service';
          }
        } catch (err) {
          console.error('Error starting service:', err);
          error.value = 'Unable to start service. Please try again later.';
        }
      }
    };

    const confirmCompleteService = async () => {
      if (confirm('Are you sure you want to mark this service as completed?')) {
        try {
          const response = await providerService.completeService(booking.value.id);
          if (response.success) {
            booking.value.status = 'COMPLETED';
          } else {
            error.value = response.message || 'Failed to complete service';
          }
        } catch (err) {
          console.error('Error completing service:', err);
          error.value = 'Unable to complete service. Please try again later.';
        }
      }
    };

    const confirmMarkPaymentCompleted = async () => {
      if (confirm('Are you sure you want to mark the payment as received?')) {
        try {
          const response = await providerService.markPaymentReceived(booking.value.id);
          if (response.success) {
            if (booking.value.payment) {
              booking.value.payment.status = 'COMPLETED';
            }
          } else {
            error.value = response.message || 'Failed to mark payment as received';
          }
        } catch (err) {
          console.error('Error marking payment as received:', err);
          error.value = 'Unable to mark payment as received. Please try again later.';
        }
      }
    };

    const openRatingModal = () => {
      router.push({
        name: 'ProviderBookings',
        query: { openRating: 'true', bookingId: booking.value.id }
      });
    };

    onMounted(() => {
      fetchBookingDetails();
    });

    return {
      booking,
      loading,
      error,
      isBookingRated,
      formatDate,
      formatStatus,
      formatAddress,
      getClientName,
      getServiceImage,
      getPaymentProofUrl,
      openImageInNewTab,
      goBack,
      confirmAcceptBooking,
      confirmDeclineBooking,
      confirmStartService,
      confirmCompleteService,
      confirmMarkPaymentCompleted,
      openRatingModal
    };
  }
};
</script>

<style scoped>
.booking-details-page {
  background-color: #f5f7f9;
  min-height: calc(100vh - 80px);
  padding: 30px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-nav {
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #00A046;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #007f36;
  text-decoration: underline;
}

.main-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.status-badge.pending { background-color: #f39c12; }
.status-badge.confirmed { background-color: #3498db; }
.status-badge.in_progress { background-color: #9b59b6; }
.status-badge.completed { background-color: #2ecc71; }
.status-badge.cancelled { background-color: #e74c3c; }

.service-info {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.service-info h2 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.card-section {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.card-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #666;
  font-weight: 600;
}

.card-section p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  min-width: 120px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.info-value.status.completed {
  color: #2ecc71;
  font-weight: 600;
}

.info-value.status.pending {
  color: #f39c12;
  font-weight: 600;
}

.payment-proof {
  margin-top: 10px;
}

.payment-proof img {
  max-width: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.payment-proof img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.actions-section {
  padding: 25px 30px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-accept {
  background-color: #2ecc71;
  color: white;
}

.btn-decline {
  background-color: #e74c3c;
  color: white;
}

.btn-start {
  background-color: #3498db;
  color: white;
}

.btn-complete {
  background-color: #2ecc71;
  color: white;
}

.btn-payment {
  background-color: #f39c12;
  color: white;
}

.btn-rate {
  background-color: #9b59b6;
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.spinner {
  border: 3px solid rgba(0, 160, 70, 0.2);
  border-radius: 50%;
  border-top: 3px solid #00A046;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-card {
  padding: 25px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.error {
  color: #e74c3c;
  text-align: center;
}

@media (max-width: 600px) {
  .booking-details-page {
    padding: 15px 0;
  }
  
  .container {
    padding: 0 15px;
  }
  
  .card-header {
    padding: 15px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .service-info, .card-section, .actions-section {
    padding: 15px 20px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .info-label {
    min-width: auto;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 