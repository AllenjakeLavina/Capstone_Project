<template>
  <div class="pending-services-container">
    <div class="pending-services">
      <div class="page-header">
        <h2 class="page-title">Service Approval Management</h2>
        <button class="refresh-btn" @click="fetchPendingServices" :disabled="loading">
          <i class="fa fa-refresh" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: filterStatus === 'all' }"
          @click="filterStatus = 'all'"
        >
          All Services ({{ allServices.length }})
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filterStatus === 'pending' }"
          @click="filterStatus = 'pending'"
        >
          Pending ({{ pendingCount }})
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filterStatus === 'approved' }"
          @click="filterStatus = 'approved'"
        >
          Approved ({{ approvedCount }})
        </button>
      </div>
      
      <div v-if="loading" class="loading">Loading services...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="filteredServices.length === 0" class="no-services">
          <i class="fas fa-check-circle"></i>
          <p>{{ filterStatus === 'pending' ? 'No services pending approval' : filterStatus === 'approved' ? 'No approved services' : 'No services found' }}</p>
        </div>
        <div v-else class="services-grid">
          <div v-for="service in filteredServices" :key="service.id" class="service-card" :class="{ 'approved': service.isApproved }">
            <div class="service-header">
              <div class="title-section">
                <h3 class="service-title">{{ service.title }}</h3>
                <span class="status-badge" :class="service.isApproved ? 'approved-badge' : 'pending-badge'">
                  <i :class="service.isApproved ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                  {{ service.isApproved ? 'Approved' : 'Pending' }}
                </span>
              </div>
              <span class="service-category">{{ service.category?.name || 'Uncategorized' }}</span>
            </div>
            
            <div class="service-images" v-if="service.imageUrls && service.imageUrls.length > 0">
              <img 
                v-for="(img, idx) in service.imageUrls.slice(0, 3)" 
                :key="idx" 
                :src="getFileUrl(img)" 
                :alt="service.title"
                class="service-image"
              />
            </div>
            <div v-else class="no-image">
              <i class="fas fa-image"></i>
              <span>No images</span>
            </div>
            
            <div class="service-details">
              <p class="service-description">{{ truncateText(service.description, 150) }}</p>
              
              <div class="service-info">
                <div class="info-item">
                  <i class="fas fa-tag"></i>
                  <span>Rate: ₱{{ service.pricing }} / {{ service.pricingType?.toLowerCase() || 'fixed' }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-user"></i>
                  <span>{{ service.provider?.name || 'Unknown Provider' }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(service.createdAt) }}</span>
                </div>
              </div>
              
              <div class="service-skills" v-if="service.skills && service.skills.length > 0">
                <span 
                  v-for="skill in service.skills" 
                  :key="skill.id" 
                  class="skill-tag"
                >
                  {{ skill.name }}
                </span>
              </div>
            </div>
            
            <div class="service-actions">
              <button 
                v-if="!service.isApproved"
                class="approve-btn" 
                @click="approveService(service.id)"
                :disabled="processing === service.id"
              >
                <i class="fas fa-check"></i>
                {{ processing === service.id ? 'Approving...' : 'Approve' }}
              </button>
              <button 
                v-if="!service.isApproved"
                class="reject-btn" 
                @click="openRejectModal(service)"
                :disabled="processing === service.id"
              >
                <i class="fas fa-times"></i>
                Decline
              </button>
              <button 
                class="view-details-btn" 
                @click="viewServiceDetails(service)"
              >
                <i class="fas fa-eye"></i>
                View Details
              </button>
              <span v-if="service.isApproved" class="approved-label">
                <i class="fas fa-check-circle"></i>
                Approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decline Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Decline Service</h3>
          <button class="close-btn" @click="closeRejectModal">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-service-title">Service: <strong>{{ selectedService?.title }}</strong></p>
          <div class="form-group">
            <label for="rejectReason">Decline Reason <span class="required">*</span></label>
            <textarea
              id="rejectReason"
              v-model="rejectReason"
              placeholder="Please provide a reason for declining this service..."
              rows="4"
              class="form-control"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeRejectModal">Cancel</button>
          <button 
            class="btn-reject" 
            @click="confirmReject"
            :disabled="!rejectReason.trim() || processing === selectedService?.id"
          >
            {{ processing === selectedService?.id ? 'Declining...' : 'Confirm Decline' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Service Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-container large-modal">
        <div class="modal-header">
          <h3>Service Details</h3>
          <button class="close-btn" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedService">
          <div class="details-section">
            <h4>Basic Information</h4>
            <div class="details-grid">
              <div><strong>Title:</strong> {{ selectedService.title }}</div>
              <div><strong>Category:</strong> {{ selectedService.category?.name || 'N/A' }}</div>
              <div><strong>Rate:</strong> ₱{{ selectedService.pricing }} / {{ selectedService.pricingType?.toLowerCase() || 'fixed' }}</div>
              <div><strong>Provider:</strong> {{ selectedService.provider?.name || 'Unknown' }}</div>
              <div><strong>Email:</strong> {{ selectedService.provider?.email || 'N/A' }}</div>
              <div><strong>Created:</strong> {{ formatDate(selectedService.createdAt) }}</div>
            </div>
          </div>
          
          <div class="details-section">
            <h4>Description</h4>
            <p class="description-text">{{ selectedService.description }}</p>
          </div>
          
          <div class="details-section" v-if="selectedService.imageUrls && selectedService.imageUrls.length > 0">
            <h4>Images ({{ selectedService.imageUrls.length }})</h4>
            <div class="images-grid">
              <img 
                v-for="(img, idx) in selectedService.imageUrls" 
                :key="idx" 
                :src="getFileUrl(img)" 
                :alt="selectedService.title"
                class="detail-image"
              />
            </div>
          </div>
          
          <div class="details-section" v-if="selectedService.skills && selectedService.skills.length > 0">
            <h4>Skills</h4>
            <div class="skills-list">
              <span 
                v-for="skill in selectedService.skills" 
                :key="skill.id" 
                class="skill-tag"
              >
                {{ skill.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" @click="closeDetailsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { adminService } from '../../services/apiService';
import { getFileUrl } from '../../services/apiService';
import Swal from 'sweetalert2';

export default {
  name: 'PendingServices',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const allServices = ref([]);
    const filterStatus = ref('all'); // 'all', 'pending', 'approved'
    const processing = ref(null);
    const showRejectModal = ref(false);
    const showDetailsModal = ref(false);
    const selectedService = ref(null);
    const rejectReason = ref('');

    // Computed properties
    const pendingCount = computed(() => {
      return allServices.value.filter(s => !s.isApproved).length;
    });

    const approvedCount = computed(() => {
      return allServices.value.filter(s => s.isApproved).length;
    });

    const filteredServices = computed(() => {
      if (filterStatus.value === 'pending') {
        return allServices.value.filter(s => !s.isApproved);
      } else if (filterStatus.value === 'approved') {
        return allServices.value.filter(s => s.isApproved);
      }
      return allServices.value;
    });

    const fetchPendingServices = async () => {
      loading.value = true;
      error.value = '';
      try {
        const response = await adminService.getPendingServices();
        if (response.success) {
          allServices.value = response.data || [];
        } else {
          error.value = response.message || 'Failed to load services';
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        error.value = 'Unable to load services. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const approveService = async (serviceId) => {
      const result = await Swal.fire({
        title: 'Approve Service?',
        text: 'Are you sure you want to approve this service? It will become visible to clients.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#00C853',
        cancelButtonColor: '#666',
        confirmButtonText: 'Yes, Approve',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (!result.isConfirmed) {
        return;
      }

      processing.value = serviceId;
      try {
        const response = await adminService.approveService(serviceId);
        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Service Approved!',
            text: 'The service has been approved and is now visible to clients.',
            confirmButtonColor: '#00C853',
            timer: 2000,
            showConfirmButton: true
          });
          // Update service status in the list
          const serviceIndex = allServices.value.findIndex(s => s.id === serviceId);
          if (serviceIndex !== -1) {
            allServices.value[serviceIndex].isApproved = true;
          }
        } else {
          throw new Error(response.message || 'Failed to approve service');
        }
      } catch (err) {
        console.error('Error approving service:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Approval Failed',
          text: err.message || 'Failed to approve service. Please try again.',
          confirmButtonColor: '#00C853'
        });
      } finally {
        processing.value = null;
      }
    };

    const openRejectModal = (service) => {
      selectedService.value = service;
      rejectReason.value = '';
      showRejectModal.value = true;
    };

    const closeRejectModal = () => {
      showRejectModal.value = false;
      selectedService.value = null;
      rejectReason.value = '';
    };

    const confirmReject = async () => {
      if (!rejectReason.value.trim()) {
        await Swal.fire({
          icon: 'warning',
          title: 'Reason Required',
          text: 'Please provide a reason for declining this service.',
          confirmButtonColor: '#00C853'
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Decline Service?',
        text: 'Are you sure you want to decline this service? The provider will be notified.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f44336',
        cancelButtonColor: '#666',
        confirmButtonText: 'Yes, Decline',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (!result.isConfirmed) {
        return;
      }

      processing.value = selectedService.value.id;
      try {
        const response = await adminService.rejectService(
          selectedService.value.id,
          rejectReason.value
        );
        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Service Declined',
            text: 'The service has been declined and the provider has been notified.',
            confirmButtonColor: '#00C853',
            timer: 2000,
            showConfirmButton: true
          });
          // Update service status in the list (mark as declined/inactive)
          const serviceIndex = allServices.value.findIndex(s => s.id === selectedService.value.id);
          if (serviceIndex !== -1) {
            allServices.value[serviceIndex].isApproved = false;
            allServices.value[serviceIndex].isActive = false;
          }
          closeRejectModal();
        } else {
          throw new Error(response.message || 'Failed to decline service');
        }
      } catch (err) {
        console.error('Error declining service:', err);
        Swal.fire({
          icon: 'error',
          title: 'Decline Failed',
          text: err.message || 'Failed to decline service. Please try again.'
        });
      } finally {
        processing.value = null;
      }
    };

    const viewServiceDetails = (service) => {
      selectedService.value = service;
      showDetailsModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedService.value = null;
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      fetchPendingServices();
    });

    return {
      loading,
      error,
      allServices,
      filterStatus,
      filteredServices,
      pendingCount,
      approvedCount,
      processing,
      showRejectModal,
      showDetailsModal,
      selectedService,
      rejectReason,
      fetchPendingServices,
      approveService,
      openRejectModal,
      closeRejectModal,
      confirmReject,
      viewServiceDetails,
      closeDetailsModal,
      truncateText,
      formatDate,
      getFileUrl
    };
  }
};
</script>

<style scoped>
.pending-services-container {
  width: 100%;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 20px 30px;
  border: none;
  min-height: calc(100vh - 80px);
}

.pending-services {
  width: 100%;
  margin: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-title {
  color: #4a5568;
  margin: 0;
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  position: relative;
  padding-bottom: 15px;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #00C853, #009688);
  border-radius: 2px;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.filter-tab {
  padding: 10px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
  bottom: -1px;
  border-radius: 6px 6px 0 0;
}

.filter-tab:hover {
  color: #00C853;
  background: rgba(0, 200, 83, 0.05);
}

.filter-tab.active {
  color: #00C853;
  border-bottom-color: #00C853;
  font-weight: 600;
  background: rgba(0, 200, 83, 0.08);
}

.refresh-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 200, 83, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #666;
}

.error {
  color: #d32f2f;
}

.no-services {
  text-align: center;
  padding: 80px 20px;
  color: #666;
  background: white;
  border-radius: 12px;
  border: 1px solid #ececec;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
}

.no-services i {
  font-size: 64px;
  color: #00C853;
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-services p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .services-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.service-card {
  border: 1px solid #ececec;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.1);
}

.service-card.approved {
  border-left: 4px solid #00C853;
}

.service-header {
  padding: 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #ececec;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 12px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.pending-badge {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  color: #856404;
  box-shadow: 0 2px 4px rgba(133, 100, 4, 0.1);
}

.approved-badge {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  box-shadow: 0 2px 4px rgba(21, 87, 36, 0.1);
}

.service-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.service-category {
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 600;
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0, 200, 83, 0.2);
}

.service-images {
  display: flex;
  gap: 4px;
  padding: 10px;
  background: #f8f9fa;
  max-height: 120px;
  overflow: hidden;
}

.service-image {
  flex: 1;
  object-fit: cover;
  height: 100px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.no-image {
  padding: 30px 15px;
  text-align: center;
  color: #999;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.no-image i {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.4;
}

.no-image span {
  font-size: 12px;
  font-weight: 500;
  color: #999;
}

.service-details {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.service-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
  flex: 1;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ececec;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

.info-item i {
  color: #00C853;
  width: 16px;
  text-align: center;
  font-size: 13px;
}

.service-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.skill-tag {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.service-actions {
  padding: 12px 14px;
  border-top: 1px solid #ececec;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  background: #fafafa;
}

.service-actions button {
  flex: 1;
  min-width: 90px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.approve-btn {
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
}

.approve-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 200, 83, 0.3);
}

.reject-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.reject-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.view-details-btn {
  background: linear-gradient(135deg, #2196F3 0%, #1976d2 100%);
  color: white;
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.service-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.approved-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #00C853;
  font-weight: 600;
  font-size: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 6px;
  flex: 1;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid rgba(0, 200, 83, 0.2);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  border: 1px solid #ececec;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #ececec;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #4a5568;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-service-title {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.modal-service-title strong {
  color: #333;
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.required {
  color: #f44336;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ececec;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-control:focus {
  outline: none;
  border-color: #00C853;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #ececec;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.btn-cancel, .btn-reject, .btn-close {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-cancel, .btn-close {
  background: #e0e0e0;
  color: #4a5568;
}

.btn-cancel:hover, .btn-close:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-reject {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.btn-reject:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.btn-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.details-section {
  margin-bottom: 28px;
}

.details-section h4 {
  margin-bottom: 18px;
  color: #4a5568;
  font-size: 1.3rem;
  font-weight: 700;
  border-bottom: 2px solid #ececec;
  padding-bottom: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.details-grid div {
  padding: 14px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ececec;
  font-size: 14px;
  color: #4a5568;
}

.details-grid div strong {
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.description-text {
  line-height: 1.7;
  color: #666;
  padding: 18px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ececec;
  font-size: 14px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.detail-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #ececec;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>

