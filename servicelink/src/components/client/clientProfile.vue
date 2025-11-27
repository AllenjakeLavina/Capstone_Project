<template>
  <div class="client-profile">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="profile-layout">
      <!-- Left Sidebar -->
      <div class="profile-sidebar">
        <!-- Profile Info Card -->
        <div class="sidebar-card profile-info-card">
          <div class="profile-picture-wrapper">
            <div class="profile-picture-container large">
              <div v-if="user.profilePicture" class="profile-picture">
                <img :src="getFullFileUrl(user.profilePicture)" alt="Profile Picture" />
              </div>
              <div v-else class="profile-picture placeholder-img">
                <div class="profile-initials">{{ getUserInitials }}</div>
              </div>
              <div class="profile-picture-overlay" @click="triggerFileUpload">
                <i class="fas fa-camera"></i>
                <span>Change Photo</span>
              </div>
              <input 
                type="file" 
                ref="profileImageInput" 
                @change="handleProfileImageChange" 
                accept="image/*" 
                class="hidden-input" 
              />
              <div v-if="uploadingProfileImage" class="upload-progress">
                <div class="spinner"></div>
              </div>
            </div>
          </div>
          <div class="profile-info-content">
            <div class="profile-name-row">
              <h3>{{ user.firstName }} {{ user.lastName }}</h3>
              <div v-if="user.isVerified" class="verification-badge">
                <i class="fas fa-check-circle"></i>
                <span>Verified</span>
              </div>
            </div>
            <div class="profile-role">Client Account</div>
            <div class="profile-stats-mini">
              <div class="stat-mini">
                <i class="fas fa-calendar-check"></i>
                <span>{{ activityStats.totalBookings }}</span>
                <small>Bookings</small>
              </div>
              <div class="stat-mini">
                <i class="fas fa-check-circle"></i>
                <span>{{ activityStats.completedBookings }}</span>
                <small>Completed</small>
              </div>
            </div>
            <div class="profile-contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>{{ user.email }}</span>
              </div>
              <div v-if="user.phone" class="contact-item">
                <i class="fas fa-phone"></i>
                <span>{{ user.phone }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Joined {{ formatDate(user.createdAt) }}</span>
              </div>
            </div>
            <button class="edit-profile-btn-sidebar" @click="startEditProfile">
              <i class="fas fa-edit"></i> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="profile-main-content">
        <!-- Enhanced Banner Header -->
        <div class="profile-banner-wrapper">
          <div class="profile-banner-enhanced">
            <div class="banner-content">
              <h1>Welcome back, {{ user.firstName }}!</h1>
              <p>Manage your profile, addresses, and bookings</p>
            </div>
          </div>
        </div>

        <!-- Addresses Section -->
        <div class="section">
        <div class="addresses-section">
          <div class="section-header">
            <h2>My Addresses</h2>
            <button class="add-btn" @click="showAddAddressForm = true">Add Address</button>
          </div>
          <div v-if="addresses.length === 0" class="no-addresses">
            <p>You haven't added any addresses yet.</p>
          </div>
          <div v-else class="address-list">
            <div v-for="address in addresses" :key="address.id" class="address-card-modern" :class="{ 'default-address': address.isDefault }">
              <div class="address-card-header">
                <div class="address-type-icon">
                  <i :class="getAddressIcon(address.type)"></i>
                </div>
                <div class="address-header-info">
                  <div class="address-type-modern">{{ formatAddressType(address.type) }}</div>
                  <div v-if="address.isDefault" class="default-badge-modern">
                    <i class="fas fa-star"></i> Default
                  </div>
                </div>
              </div>
              <div class="address-content-modern">
                <div class="address-line">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ address.addressLine1 }}</span>
                </div>
                <div v-if="address.addressLine2" class="address-line">
                  <i class="fas fa-building"></i>
                  <span>{{ address.addressLine2 }}</span>
                </div>
              </div>
              <div class="address-actions-modern">
                <button class="action-btn edit-btn-modern" @click="editAddress(address)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  v-if="!address.isDefault" 
                  class="action-btn default-btn-modern" 
                  @click="setDefaultAddress(address.id)"
                  title="Set as Default"
                >
                  <i class="fas fa-star"></i>
                </button>
                <button class="action-btn delete-btn-modern" @click="deleteAddress(address.id)" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Right Sidebar - Activity Summary -->
      <div class="profile-right-sidebar">
        <div class="activity-summary">
          <h4>Activity Summary</h4>
          <div class="activity-cards">
            <div class="activity-card">
              <div class="activity-icon pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="activity-content">
                <div class="activity-number">{{ activityStats.pendingBookings }}</div>
                <div class="activity-label">Pending</div>
              </div>
            </div>
            <div class="activity-card">
              <div class="activity-icon confirmed">
                <i class="fas fa-check"></i>
              </div>
              <div class="activity-content">
                <div class="activity-number">{{ activityStats.confirmedBookings }}</div>
                <div class="activity-label">Confirmed</div>
              </div>
            </div>
            <div class="activity-card">
              <div class="activity-icon completed">
                <i class="fas fa-check-double"></i>
              </div>
              <div class="activity-content">
                <div class="activity-number">{{ activityStats.completedBookings }}</div>
                <div class="activity-label">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Add Address Modal -->
      <div v-if="showAddAddressForm" class="modal-overlay">
        <div class="modal-card">
          <span class="close-btn" @click="showAddAddressForm = false">&times;</span>
          <h2>Add New Address</h2>
          <form @submit.prevent="addAddress" class="address-form">
            <div class="form-group">
              <label for="addressType">Address Type</label>
              <select id="addressType" v-model="addressForm.type" required>
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="addressLine1">Street Address</label>
              <input id="addressLine1" v-model="addressForm.addressLine1" required />
            </div>
            <div class="form-group">
              <label for="addressLine2">Barangay</label>
              <input id="addressLine2" v-model="addressForm.addressLine2" />
            </div>
            <div class="form-group checkbox">
              <input id="isDefault" type="checkbox" v-model="addressForm.isDefault" />
              <label for="isDefault">Set as default address</label>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showAddAddressForm = false">Cancel</button>
              <button type="submit" class="save-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'Adding...' : 'Add Address' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Edit Address Modal -->
      <div v-if="showEditAddressForm" class="modal-overlay">
        <div class="modal-card">
          <span class="close-btn" @click="showEditAddressForm = false">&times;</span>
          <h2>Edit Address</h2>
          <form @submit.prevent="updateAddress" class="address-form">
            <div class="form-group">
              <label for="editAddressType">Address Type</label>
              <select id="editAddressType" v-model="editAddressForm.type" required>
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="editAddressLine1">Address Line 1*</label>
              <input id="editAddressLine1" v-model="editAddressForm.addressLine1" required />
            </div>
            <div class="form-group">
              <label for="editAddressLine2">Address Line 2</label>
              <input id="editAddressLine2" v-model="editAddressForm.addressLine2" />
            </div>
            <div class="form-group checkbox">
              <input id="editIsDefault" type="checkbox" v-model="editAddressForm.isDefault" />
              <label for="editIsDefault">Set as default address</label>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showEditAddressForm = false">Cancel</button>
              <button type="submit" class="save-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'Updating...' : 'Update Address' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Edit Profile Modal -->
      <div v-if="isEditingProfile" class="modal-overlay">
        <div class="modal-card">
          <span class="close-btn" @click="cancelEditProfile">&times;</span>
          <h2>Edit Profile</h2>
          <form @submit.prevent="updateProfile" class="edit-profile-form">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                id="firstName" 
                v-model="profileForm.firstName" 
                type="text" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                id="lastName" 
                v-model="profileForm.lastName" 
                type="text" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                id="phone" 
                v-model="profileForm.phone" 
                type="tel" 
              />
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="cancelEditProfile">Cancel</button>
              <button type="submit" class="save-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { clientService } from '../../services/apiService';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';

export default {
  name: 'ClientProfile',
  setup() {
    // State
    const user = ref({});
    const addresses = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const isEditingProfile = ref(false);
    const isSubmitting = ref(false);
    
    // Profile image upload state
    const profileImageInput = ref(null);
    const uploadingProfileImage = ref(false);
    
    // Address state
    const showAddAddressForm = ref(false);
    const showEditAddressForm = ref(false);
    const editingAddressId = ref(null);
    
    // Activity stats
    const activityStats = ref({
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0
    });
    
    // Form data
    const profileForm = reactive({
      firstName: '',
      lastName: '',
      phone: ''
    });
    
    const addressForm = reactive({
      type: 'HOME',
      addressLine1: '',
      addressLine2: '',
      isDefault: false
    });
    
    const editAddressForm = reactive({
      type: 'HOME',
      addressLine1: '',
      addressLine2: '',
      isDefault: false
    });
    
    // Computed
    const getUserInitials = computed(() => {
      if (user.value.firstName && user.value.lastName) {
        return `${user.value.firstName[0]}${user.value.lastName[0]}`;
      }
      return '';
    });
    
    // Methods
    const fetchClientProfile = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const response = await clientService.getClientProfile();
        
        if (response.success) {
          user.value = response.data;
          if (response.data.client && response.data.client.addresses) {
            addresses.value = response.data.client.addresses;
          } else {
            addresses.value = [];
          }
        } else {
          throw new Error('Failed to load profile data');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while loading your profile';
        console.error('Error fetching client profile:', err);
      } finally {
        loading.value = false;
      }
    };

    const fetchActivityStats = async () => {
      try {
        const response = await clientService.getBookings();
        if (response.success && response.data) {
          const bookings = response.data;
          activityStats.value = {
            totalBookings: bookings.length,
            pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
            confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
            completedBookings: bookings.filter(b => b.status === 'COMPLETED').length
          };
        }
      } catch (err) {
        console.error('Error fetching activity stats:', err);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    const getAddressIcon = (type) => {
      switch (type) {
        case 'HOME': return 'fas fa-home';
        case 'WORK': return 'fas fa-briefcase';
        case 'OTHER': return 'fas fa-map-marker-alt';
        default: return 'fas fa-map-marker-alt';
      }
    };
    
    // Profile image upload functions
    const triggerFileUpload = () => {
      profileImageInput.value.click();
    };

    const handleProfileImageChange = async (event) => {
      const file = event.target.files[0];
      console.log('File selected:', file);
      
      if (!file) {
        console.error('No file selected');
        return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
        error.value = 'Please select an image file';
        console.error('Invalid file type:', file.type);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'Image must be less than 5MB';
        console.error('File too large:', file.size);
        return;
      }
      
      try {
        uploadingProfileImage.value = true;
        error.value = null;
        
        // Use the uploadProfilePicture service
        const response = await apiService.uploadProfilePicture(file);
        
        if (response.success) {
          // Update local user data with the response
          user.value = response.data;
          console.log('Profile picture updated successfully');
          
          // Emit event to notify Navigation component
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: {
              firstName: user.value.firstName,
              lastName: user.value.lastName,
              profilePicture: user.value.profilePicture
            }
          }));
          
          // Show success notification
          await Swal.fire({
            title: 'Profile Picture Updated!',
            text: 'Your profile picture has been updated successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to update profile picture');
        }
      } catch (err) {
        console.error('Error in profile image upload:', err);
        error.value = err.message || 'Failed to upload profile picture';
        
        // Show error notification
        await Swal.fire({
          title: 'Upload Failed',
          text: err.message || 'Failed to upload profile picture. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        uploadingProfileImage.value = false;
        event.target.value = '';
      }
    };

    // Helper function to get full file URL
    const getFullFileUrl = (fileUrl) => {
      return apiService.getFileUrl(fileUrl);
    };
    
    const startEditProfile = () => {
      profileForm.firstName = user.value.firstName || '';
      profileForm.lastName = user.value.lastName || '';
      profileForm.phone = user.value.phone || '';
      isEditingProfile.value = true;
    };
    
    const cancelEditProfile = () => {
      isEditingProfile.value = false;
    };
    
    const updateProfile = async () => {
      try {
        isSubmitting.value = true;
        error.value = null;
        
        const response = await clientService.updateClientProfile(profileForm);
        
        if (response.success) {
          user.value = {
            ...user.value,
            ...profileForm
          };
          isEditingProfile.value = false;
          
          // Emit event to notify Navigation component
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: {
              firstName: profileForm.firstName,
              lastName: profileForm.lastName
            }
          }));
          
          // Show success notification
          await Swal.fire({
            title: 'Profile Updated!',
            text: 'Your profile has been updated successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to update profile');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while updating your profile';
        console.error('Error updating profile:', err);
        
        // Show error notification
        await Swal.fire({
          title: 'Update Failed',
          text: err.message || 'Failed to update profile. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const addAddress = async () => {
      try {
        isSubmitting.value = true;
        error.value = null;
        
        const response = await clientService.addAddress(addressForm);
        
        if (response.success) {
          // If this is set as default, update other addresses
          if (addressForm.isDefault) {
            addresses.value.forEach(addr => {
              addr.isDefault = false;
            });
          }
          
          // Add new address to the list
          addresses.value.push(response.data);
          
          // Reset form and close modal
          resetAddressForm();
          showAddAddressForm.value = false;
          
          // Show success notification
          await Swal.fire({
            title: 'Address Added!',
            text: 'Your address has been added successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to add address');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while adding the address';
        console.error('Error adding address:', err);
        
        // Show error notification
        await Swal.fire({
          title: 'Add Failed',
          text: err.message || 'Failed to add address. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const resetAddressForm = () => {
      addressForm.type = 'HOME';
      addressForm.addressLine1 = '';
      addressForm.addressLine2 = '';
      addressForm.isDefault = false;
    };
    
    const editAddress = (address) => {
      editingAddressId.value = address.id;
      editAddressForm.type = address.type;
      editAddressForm.addressLine1 = address.addressLine1;
      editAddressForm.addressLine2 = address.addressLine2 || '';
      editAddressForm.isDefault = address.isDefault;
      
      showEditAddressForm.value = true;
    };
    
    const updateAddress = async () => {
      try {
        isSubmitting.value = true;
        error.value = null;
        
        const response = await clientService.updateAddress(editingAddressId.value, editAddressForm);
        
        if (response.success) {
          // Update the address in the list
          const index = addresses.value.findIndex(addr => addr.id === editingAddressId.value);
          
          if (index !== -1) {
            // If this address is now default, update other addresses
            if (editAddressForm.isDefault) {
              addresses.value.forEach(addr => {
                addr.isDefault = (addr.id === editingAddressId.value);
              });
            }
            
            addresses.value[index] = response.data;
          }
          
          // Close modal
          showEditAddressForm.value = false;
          
          // Show success notification
          await Swal.fire({
            title: 'Address Updated!',
            text: 'Your address has been updated successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to update address');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while updating the address';
        console.error('Error updating address:', err);
        
        // Show error notification
        await Swal.fire({
          title: 'Update Failed',
          text: err.message || 'Failed to update address. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const deleteAddress = async (addressId) => {
      // Show confirmation dialog with SweetAlert
      const result = await Swal.fire({
        title: 'Delete Address?',
        text: 'Are you sure you want to delete this address? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#27ae60',
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        isSubmitting.value = true;
        error.value = null;
        
        const response = await clientService.deleteAddress(addressId);
        
        if (response.success) {
          // Remove the address from the list
          addresses.value = addresses.value.filter(addr => addr.id !== addressId);
          
          // Show success notification
          await Swal.fire({
            title: 'Address Deleted!',
            text: 'Your address has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to delete address');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while deleting the address';
        console.error('Error deleting address:', err);
        
        // Show error notification
        await Swal.fire({
          title: 'Delete Failed',
          text: err.message || 'Failed to delete address. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    
    
    const setDefaultAddress = async (addressId) => {
      try {
        isSubmitting.value = true;
        error.value = null;
        
        const response = await clientService.setDefaultAddress(addressId);
        
        if (response.success) {
          // Update all addresses in the list
          addresses.value.forEach(addr => {
            addr.isDefault = (addr.id === addressId);
          });
          
          // Show success notification
          await Swal.fire({
            title: 'Default Address Set!',
            text: 'This address has been set as your default address.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to set default address');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while setting default address';
        console.error('Error setting default address:', err);
        
        // Show error notification
        await Swal.fire({
          title: 'Update Failed',
          text: err.message || 'Failed to set default address. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const formatAddressType = (type) => {
      switch (type) {
        case 'HOME': return 'Home';
        case 'WORK': return 'Work';
        case 'OTHER': return 'Other';
        default: return type;
      }
    };
    
    // Initialize
    onMounted(() => {
      fetchClientProfile();
      fetchActivityStats();
    });
    
    const activeTab = ref('profile');
    
    return {
      user,
      addresses,
      loading,
      error,
      isEditingProfile,
      isSubmitting,
      profileForm,
      addressForm,
      editAddressForm,
      showAddAddressForm,
      showEditAddressForm,
      getUserInitials,
      startEditProfile,
      cancelEditProfile,
      updateProfile,
      addAddress,
      editAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      formatAddressType,
      // Profile image upload
      profileImageInput,
      uploadingProfileImage,
      triggerFileUpload,
      handleProfileImageChange,
      getFullFileUrl,
      activeTab,
      activityStats,
      formatDate,
      getAddressIcon
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.client-profile {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f7f9fc;
  min-height: 100vh;
  color: #2d3748;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Layout */
.profile-layout {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 20px;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  min-width: 0;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.profile-main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.profile-right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

/* Sidebar Cards */
.sidebar-card {
  margin-top: 10px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 35px;
  border: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.profile-info-card {
  text-align: center;
}

.profile-picture-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-info-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.profile-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-name-row h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  word-break: break-word;
  overflow-wrap: break-word;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.verification-badge i {
  font-size: 0.9rem;
}

.profile-role {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.profile-stats-mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
}

.stat-mini {
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-mini i {
  color: #27ae60;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.stat-mini span {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 5px 0;
}

.stat-mini small {
  display: block;
  color: #718096;
  font-size: 0.75rem;
}

.profile-contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #4a5568;
  word-break: break-word;
  overflow-wrap: break-word;
}

.contact-item i {
  color: #27ae60;
  width: 20px;
  flex-shrink: 0;
}

.contact-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-profile-btn-sidebar {
  width: 100%;
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
}

.edit-profile-btn-sidebar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.3);
}

/* Activity Summary */
.profile-right-sidebar .activity-summary {
  margin-top: 10px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 25px;
  border: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.activity-summary h4 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.activity-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.activity-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.activity-icon.pending {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.activity-icon.confirmed {
  background: linear-gradient(135deg, #2196F3, #1976d2);
}

.activity-icon.completed {
  background: linear-gradient(135deg, #27ae60, #219d55);
}

.activity-content {
  flex: 1;
}

.activity-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.activity-label {
  font-size: 0.85rem;
  color: #718096;
}

/* Enhanced Banner */
.profile-banner-wrapper {
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.profile-banner-enhanced {
  margin-top: 10px;
  position: relative;
  width: 100%;
  min-height: 20px;
  background: linear-gradient(135deg, #27ae60 0%, #219d55 50%, #00C853 100%);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 30px;
  box-sizing: border-box;
}

.profile-banner-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 1;
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  width: 100%;
  max-width: 800px;
}

.banner-content h1 {
  margin: 0 0 12px 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
  line-height: 1.2;
}

.banner-content p {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.2rem);
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* Modernized Address Cards */
.address-card-modern {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.address-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.address-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-color: #27ae60;
}

.address-card-modern:hover::before {
  background: linear-gradient(135deg, #27ae60, #219d55);
}

.address-card-modern.default-address {
  border-color: #27ae60;
  background: linear-gradient(to bottom right, #ffffff, #f0fff4);
}

.address-card-modern.default-address::before {
  background: linear-gradient(135deg, #27ae60, #219d55);
}

.address-card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.address-type-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #27ae60, #219d55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.address-header-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.address-type-modern {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.default-badge-modern {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.address-content-modern {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.address-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #4a5568;
  font-size: 0.95rem;
  word-break: break-word;
}

.address-line i {
  color: #27ae60;
  margin-top: 3px;
  width: 18px;
  flex-shrink: 0;
}

.address-line span {
  min-width: 0;
  flex: 1;
}

.address-actions-modern {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.edit-btn-modern {
  background: #e3f2fd;
  color: #2196F3;
}

.edit-btn-modern:hover {
  background: #2196F3;
  color: white;
  transform: translateY(-2px);
}

.default-btn-modern {
  background: #fff3e0;
  color: #ff9800;
}

.default-btn-modern:hover {
  background: #ff9800;
  color: white;
  transform: translateY(-2px);
}

.delete-btn-modern {
  background: #ffebee;
  color: #f44336;
}

.delete-btn-modern:hover {
  background: #f44336;
  color: white;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .profile-layout {
    grid-template-columns: 220px 1fr 220px;
    gap: 15px;
    padding: 15px;
  }
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 200px 1fr 200px;
    gap: 15px;
    padding: 15px;
  }
}

@media (max-width: 900px) {
  .client-profile {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: auto;
    min-height: 100vh;
  }

  .profile-layout {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: auto;
  }
  
  /* Reorder: Banner first, then sidebar, then rest of content */
  /* Extract banner from profile-main-content using display: contents */
  .profile-main-content {
    display: contents !important;
    width: 100%;
    overflow: visible;
  }
  
  /* Banner appears first */
  .profile-layout > .profile-banner-wrapper,
  .profile-main-content > .profile-banner-wrapper {
    order: 1 !important;
  }
  
  /* Sidebar appears after banner */
  .profile-sidebar {
    order: 2 !important;
    width: 100%;
  }
  
  /* Other sections in profile-main-content appear after sidebar */
  .profile-layout > .section,
  .profile-main-content > .section {
    order: 3 !important;
  }
  
  .profile-right-sidebar {
    order: 3;
    width: 100%;
  }
  
  .profile-stats-mini {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .activity-cards {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .activity-card {
    flex: 1;
    min-width: 150px;
  }
}

h1 {
  text-align: center;
  color: #4a5568;
  margin-bottom: 30px;
  font-weight: 800;
  font-size: 2.6rem;
  position: relative;
  padding-bottom: 0;
  letter-spacing: -0.02em;
}

h2 {
  color: #4a5568;
  font-weight: 700;
  font-size: 1.8rem;
  margin-top: 0;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  letter-spacing: -0.01em;
}

.profile-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
  border-bottom: none;
  overflow-x: auto;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
  padding: 10px;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  -ms-overflow-style: none;
  scrollbar-width: none;
  justify-content: center;
}

.tab {
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
  border-radius: 16px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  color: #4a5568;
  font-size: 0.95rem;
  border: 1px solid #e2e8f0;
}

.tab:hover {
  background-color: #f8fafc;
  color: #4a5568;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.tab.active {
  background: #27ae60;
  color: white;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(39, 174, 96, 0.15);
  transform: translateY(-2px);
  border-color: #27ae60;
}

.tab i {
  font-size: 18px;
  color: #718096;
}

.tab.active i {
  color: white;
}

.section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 35px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  min-height: 655px;
}

.section:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 20px;
}

.profile-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  align-items: center;
  position: relative;
  padding: 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.profile-picture-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0 auto;
}

.profile-picture {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.placeholder-img {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.profile-initials {
  font-size: 32px;
  font-weight: bold;
  color: #555;
}

.profile-picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.profile-picture-container:hover .profile-picture-overlay {
  opacity: 1;
}

.profile-picture-overlay i {
  font-size: 20px;
  margin-bottom: 5px;
}

.profile-picture-overlay span {
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

.hidden-input {
  display: none;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress .spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-name h3 {
  margin: 0 0 5px 0;
  font-size: 22px;
}

.profile-name p {
  margin: 0;
  color: #666;
}

.profile-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 40px;
}

.detail-item {
  padding: 25px;
  background: white;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.detail-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}

.actions {
  margin-top: 20px;
}

.edit-btn, .add-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
  font-size: 0.95rem;
}

.edit-btn:hover, .add-btn:hover {
  background: #219d55;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.2);
}

.save-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
  font-size: 0.95rem;
}

.save-btn:hover {
  background: #219d55;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.2);
}

.cancel-btn {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.cancel-btn:hover {
  background: #f8fafc;
  color: #27ae60;
  border-color: #27ae60;
  transform: translateY(-3px);
}

.edit-profile-form, .address-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 18px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #27ae60;
  font-size: 0.95rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  background-color: #f9f9f9;
  color: #333;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.form-group input:focus, .form-group select:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15);
  outline: none;
  background-color: #fff;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  width: auto;
  margin-right: 10px;
}

.checkbox label {
  display: inline;
  margin-bottom: 0;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
}

.address-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 30px;
  position: relative;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  overflow: hidden;
  box-sizing: border-box;
}

.address-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}

.default-address {
  border-color: #4caf50;
  background-color: #f8fff8;
}

.address-type {
  font-weight: bold;
  color: #555;
  margin-bottom: 10px;
}

.address-content p {
  margin: 5px 0;
}

.address-actions {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.default-badge {
  position: absolute;
  top: -10px;
  right: 10px;
  background-color: #4caf50;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #607d8b;
}

.error {
  text-align: center;
  padding: 20px;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #ffcdd2;
}

.no-addresses {
  color: #777;
  margin: 40px 0;
  text-align: center;
  padding: 50px 30px;
  background: linear-gradient(135deg, #f9f9f9, #f5f5f5);
  border-radius: 18px;
  border: 2px dashed rgba(39, 174, 96, 0.2);
  position: relative;
  overflow: hidden;
}

.no-addresses p {
  font-size: 1.2rem;
  margin-bottom: 15px;
  font-weight: 600;
  color: #27ae60;
}

.profile-header-card {
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  margin-bottom: 40px;
  position: relative;
  overflow: visible;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 20px;
  box-sizing: border-box;
}
.profile-banner {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  position: relative;
}
.profile-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.profile-header-content-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  margin-top: -70px;
  padding-left: 48px;
  padding-right: 32px;
  gap: 30px;
  box-sizing: border-box;
}
.profile-picture-outer {
  position: relative;
  z-index: 2;
  margin-right: 32px;
}
.profile-picture-container.large {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0;
}
.profile-picture-container.large .profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.profile-picture-container.large .profile-initials {
  font-size: 48px;
}
.profile-header-info {
  margin-top: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  gap: 10px;
  flex: 1;
}
.profile-header-name {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}
.profile-header-role {
  font-size: 2.1rem;
  color: #27ae60;
  font-weight: 600;
  margin-top: 20px;
}
.profile-header-meta {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f3fbf6;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 999px;
}

.meta-item i {
  color: #27ae60;
}

.meta-text {
  font-size: 0.95rem;
}
.profile-header-row {
  display: flex;
  align-items: center;
  gap: 18px;
}
.edit-profile-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
  transition: all 0.2s;
}
.edit-profile-btn:hover {
  background: #1976d2;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 30px 25px 25px 25px;
  min-width: 320px;
  max-width: 95vw;
  width: 420px;
  position: relative;
  animation: modalPop 0.2s cubic-bezier(.4,2,.6,1) 1;
}
@keyframes modalPop {
  0% { transform: scale(0.95) translateY(30px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.close-btn {
  position: absolute;
  top: 18px;
  right: 24px;
  font-size: 2rem;
  font-weight: 700;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
}
.close-btn:hover {
  color: #2196F3;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 20px;
}
.section-actions {
  display: flex;
  gap: 12px;
}
.edit-profile-desktop { display: inline-flex; }
.edit-profile-mobile { display: none; }
@media (max-width: 700px) {
  .edit-profile-desktop { display: none !important; }
  .edit-profile-mobile { display: inline-flex !important; width: 100%; margin-bottom: 10px; }
  .section-actions { flex-direction: column; gap: 10px; width: 100%; }
  .add-btn { width: 100%; }
}
.profile-btn-card {
  margin-top: 0;
  align-self: flex-end;
  margin-left: auto;
  background: linear-gradient(to right, #00C853, #009688);
  color: #fff;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(33,150,243,0.12);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  position: relative;
}
.profile-btn-card i {
  font-size: 1.2em;
}
.profile-btn-card:hover {
  background: #27ae60;
  box-shadow: 0 8px 24px rgba(33,150,243,0.18);
  transform: translateY(-2px) scale(1.03);
}
.profile-header-content-row > .profile-btn-card {
  margin-top: 0;
  margin-left: 0;
  align-self: flex-start;
}
@media (max-width: 900px) {
  .profile-header-content-row {
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    gap: 18px;
  }
  .profile-header-info {
    align-items: center;
    text-align: center;
  }
  .profile-btn-card {
    width: 100%;
    max-width: 240px;
    align-self: center;
    margin-top: 16px;
    justify-content: center;
  }
}
@media (max-width: 1100px) {
  .address-list {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}
@media (max-width: 700px) {
  .client-profile {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: auto;
    min-height: 100vh;
  }

  .profile-layout {
    padding: 15px;
    gap: 15px;
    display: flex;
    flex-direction: column;
    min-height: auto;
  }
  
  .address-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .address-card-modern {
    padding: 16px;
    min-width: 0;
  }
  
  .profile-header-content-row {
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .profile-banner-enhanced {
    min-height: 140px;
    padding: 30px 20px;
  }
  
  .sidebar-card {
    padding: 20px;
  }
  
  .profile-stats-mini {
    grid-template-columns: 1fr;
  }
  
  .activity-cards {
    flex-direction: column;
  }
  
  .section {
    padding: 20px;
    overflow: visible;
  }

  .profile-main-content {
    overflow: visible;
    min-height: auto;
  }
}
</style>
