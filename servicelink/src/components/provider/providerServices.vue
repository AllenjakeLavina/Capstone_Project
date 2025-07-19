<template>
  <div class="provider-services-container">
    <div class="provider-services">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading services...</p>
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <h1 class="page-title">My Services</h1>

        <!-- Verification Status Alert -->
        <div v-if="verificationStatus && !verificationStatus.isVerified" class="verification-alert">
          <i class="fa fa-exclamation-triangle alert-icon"></i>
          <div class="alert-content">
            <p v-if="verificationStatus.pendingVerification">
              <strong>Your account is pending verification.</strong> You can create services, but they won't be visible to clients until your account is verified.
            </p>
            <p v-else>
              <strong>Your account is not verified.</strong> Please upload your identification documents to start the verification process.
            </p>
          </div>
        </div>

        <!-- Create New Service Button -->
        <div class="action-buttons">
          <button class="primary-btn" @click="showCreateForm = true">
            <i class="fa fa-plus-circle"></i> Create New Service
          </button>
        </div>

        <!-- Service List -->
        <div v-if="myServices && myServices.length > 0" class="service-list">
          <div v-for="service in myServices" :key="service.id" class="service-card">
            <div class="service-header">
              <h3>{{ service.title }}</h3>
              <span :class="['status-badge', service.isActive ? 'active' : 'inactive']">
                {{ service.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            
            <div class="service-details">
              <p class="category"><i class="fa fa-folder"></i> <strong>Category:</strong> {{ service.category.name }}</p>
              <p class="pricing"><i class="fa fa-tag"></i> <strong>Pricing:</strong> ${{ service.pricing }} / {{ formatPricingType(service.pricingType) }}</p>
              <p class="description">{{ truncateText(service.description, 150) }}</p>
              
              <div class="service-skills" v-if="service.skills && service.skills.length > 0">
                <strong><i class="fa fa-wrench"></i> Skills:</strong>
                <div class="skills-list">
                  <span v-for="skill in service.skills" :key="skill.id" class="skill-tag">{{ skill.name }}</span>
                </div>
              </div>
            </div>
            
            <div class="service-actions">
              <button class="edit-btn" @click="editService(service)">
                <i class="fa fa-pencil"></i> Edit
              </button>
              <button class="toggle-btn" @click="toggleServiceStatus(service)">
                <i :class="service.isActive ? 'fa fa-power-off' : 'fa fa-check'"></i>
                {{ service.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-services">
          <i class="fa fa-briefcase empty-icon"></i>
          <p>You haven't created any services yet.</p>
          <button class="primary-btn" @click="showCreateForm = true">
            <i class="fa fa-plus-circle"></i> Create Your First Service
          </button>
        </div>

        <!-- Create Service Modal -->
        <div v-if="showCreateForm" class="modal">
          <div class="modal-content">
            <span class="close-btn" @click="showCreateForm = false">&times;</span>
            <h2>Create New Service</h2>
            
            <form @submit.prevent="createService" class="service-form">
              <div class="form-group">
                <label for="title">Service Title*</label>
                <input id="title" v-model="serviceForm.title" required />
              </div>
              
              <div class="form-group">
                <label for="category">Category*</label>
                <select id="category" v-model="serviceForm.categoryId" required>
                  <option value="">Select a category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group pricing-group">
                <div class="price-input">
                  <label for="pricing">Price*</label>
                  <input id="pricing" type="number" v-model="serviceForm.pricing" min="0" step="0.01" required />
                </div>
                
                <div class="price-type">
                  <label for="pricingType">Price Type*</label>
                  <select id="pricingType" v-model="serviceForm.pricingType" required>
                    <option value="HOURLY">Per Hour</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="DAILY">Per Day</option>
                    <option value="SESSION">Per Session</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label for="description">Description*</label>
                <textarea id="description" v-model="serviceForm.description" rows="4" required></textarea>
              </div>
              
              <div class="form-group">
                <label for="imageUrls">Image URLs (One per line)</label>
                <textarea id="imageUrls" v-model="imageUrlsText" rows="3" placeholder="http://example.com/image1.jpg&#10;http://example.com/image2.jpg"></textarea>
                <small>Enter each image URL on a new line</small>
              </div>
              
              <div class="form-group">
                <label>Skills</label>
                <div class="skills-selection">
                  <div v-if="selectedSkills.length > 0" class="selected-skills">
                    <span v-for="(skill, index) in selectedSkills" :key="index" class="selected-skill">
                      {{ skill }}
                      <button type="button" @click="removeSkill(index)" class="remove-skill">×</button>
                    </span>
                  </div>
                  <div class="skill-input">
                    <input v-model="skillInput" placeholder="Add a skill" @keyup.enter="addSkillToSelection" />
                    <button type="button" @click="addSkillToSelection" class="add-skill-btn">Add</button>
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="showCreateForm = false">Cancel</button>
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Creating...' : 'Create Service' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Service Modal -->
        <div v-if="showEditForm" class="modal">
          <div class="modal-content">
            <span class="close-btn" @click="showEditForm = false">&times;</span>
            <h2>Edit Service</h2>
            
            <form @submit.prevent="updateService" class="service-form">
              <div class="form-group">
                <label for="edit-title">Service Title*</label>
                <input id="edit-title" v-model="editServiceForm.title" required />
              </div>
              
              <div class="form-group">
                <label for="edit-category">Category*</label>
                <select id="edit-category" v-model="editServiceForm.categoryId" required>
                  <option value="">Select a category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group pricing-group">
                <div class="price-input">
                  <label for="edit-pricing">Price*</label>
                  <input id="edit-pricing" type="number" v-model="editServiceForm.pricing" min="0" step="0.01" required />
                </div>
                
                <div class="price-type">
                  <label for="edit-pricingType">Price Type*</label>
                  <select id="edit-pricingType" v-model="editServiceForm.pricingType" required>
                    <option value="HOURLY">Per Hour</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="DAILY">Per Day</option>
                    <option value="SESSION">Per Session</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label for="edit-description">Description*</label>
                <textarea id="edit-description" v-model="editServiceForm.description" rows="4" required></textarea>
              </div>
              
              <div class="form-group">
                <label for="edit-imageUrls">Image URLs (One per line)</label>
                <textarea id="edit-imageUrls" v-model="editImageUrlsText" rows="3" placeholder="http://example.com/image1.jpg&#10;http://example.com/image2.jpg"></textarea>
                <small>Enter each image URL on a new line</small>
              </div>
              
              <div class="form-group">
                <label>Skills</label>
                <div class="skills-selection">
                  <div v-if="editSelectedSkills.length > 0" class="selected-skills">
                    <span v-for="(skill, index) in editSelectedSkills" :key="index" class="selected-skill">
                      {{ skill }}
                      <button type="button" @click="removeEditSkill(index)" class="remove-skill">×</button>
                    </span>
                  </div>
                  <div class="skill-input">
                    <input v-model="editSkillInput" placeholder="Add a skill" @keyup.enter="addEditSkillToSelection" />
                    <button type="button" @click="addEditSkillToSelection" class="add-skill-btn">Add</button>
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="showEditForm = false">Cancel</button>
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Updating...' : 'Update Service' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { providerService } from '../../services/apiService';

export default {
  name: 'ProviderServices',
  setup() {
    // State
    const myServices = ref([]);
    const categories = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const verificationStatus = ref(null);
    const showCreateForm = ref(false);
    const showEditForm = ref(false);
    const isSubmitting = ref(false);
    const currentServiceId = ref(null);

    // Form data
    const serviceForm = reactive({
      title: '',
      description: '',
      categoryId: '',
      pricing: 0,
      pricingType: 'HOURLY',
      imageUrls: [],
      skillIds: []
    });

    const editServiceForm = reactive({
      title: '',
      description: '',
      categoryId: '',
      pricing: 0,
      pricingType: 'HOURLY',
      imageUrls: [],
      skillIds: []
    });

    // Skills handling
    const skillInput = ref('');
    const selectedSkills = ref([]);
    const editSkillInput = ref('');
    const editSelectedSkills = ref([]);

    // Computed properties for image URLs
    const imageUrlsText = computed({
      get: () => serviceForm.imageUrls.join('\n'),
      set: (val) => {
        serviceForm.imageUrls = val.split('\n').filter(url => url.trim() !== '');
      }
    });

    const editImageUrlsText = computed({
      get: () => editServiceForm.imageUrls.join('\n'),
      set: (val) => {
        editServiceForm.imageUrls = val.split('\n').filter(url => url.trim() !== '');
      }
    });

    // Fetch data
    const fetchServices = async () => {
      try {
        const response = await providerService.getProviderServices();
        if (response.success) {
          myServices.value = response.data;
        } else {
          console.warn('Could not load services:', response.message);
          myServices.value = [];
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        myServices.value = [];
        error.value = 'Could not connect to the service. Please try again later.';
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await providerService.getCategories();
        if (response.success) {
          categories.value = response.data;
        } else {
          throw new Error('Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        error.value = err.message || 'Failed to load categories';
      }
    };

    const fetchVerificationStatus = async () => {
      try {
        const response = await providerService.getVerificationStatus();
        if (response.success) {
          verificationStatus.value = response.data;
        } else {
          throw new Error('Failed to load verification status');
        }
      } catch (err) {
        console.error('Error fetching verification status:', err);
      }
    };

    // Initialize data
    const initData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        await Promise.all([
          fetchServices(),
          fetchCategories(),
          fetchVerificationStatus()
        ]);
      } catch (err) {
        error.value = 'Failed to initialize data';
      } finally {
        loading.value = false;
      }
    };

    // Form handlers
    const addSkillToSelection = () => {
      if (skillInput.value.trim()) {
        selectedSkills.value.push(skillInput.value.trim());
        skillInput.value = '';
      }
    };

    const removeSkill = (index) => {
      selectedSkills.value.splice(index, 1);
    };

    const addEditSkillToSelection = () => {
      if (editSkillInput.value.trim()) {
        editSelectedSkills.value.push(editSkillInput.value.trim());
        editSkillInput.value = '';
      }
    };

    const removeEditSkill = (index) => {
      editSelectedSkills.value.splice(index, 1);
    };

    const createService = async () => {
      try {
        isSubmitting.value = true;
        
        // Convert skills to skill IDs (simplified - in real app would match against existing skills)
        // Here we're just sending the skill names, backend will handle creating/matching skills
        
        const serviceData = {
          ...serviceForm,
          skillNames: selectedSkills.value // Backend should handle mapping these to IDs
        };
        
        const response = await providerService.createService(serviceData);
        
        if (response.success) {
          showCreateForm.value = false;
          resetServiceForm();
          await fetchServices();
        } else {
          throw new Error(response.message || 'Failed to create service');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isSubmitting.value = false;
      }
    };

    const resetServiceForm = () => {
      serviceForm.title = '';
      serviceForm.description = '';
      serviceForm.categoryId = '';
      serviceForm.pricing = 0;
      serviceForm.pricingType = 'HOURLY';
      serviceForm.imageUrls = [];
      selectedSkills.value = [];
    };

    const editService = (service) => {
      currentServiceId.value = service.id;
      
      // Populate edit form
      editServiceForm.title = service.title;
      editServiceForm.description = service.description;
      editServiceForm.categoryId = service.categoryId;
      editServiceForm.pricing = parseFloat(service.pricing);
      editServiceForm.pricingType = service.pricingType;
      
      // Handle image URLs
      if (service.imageUrls) {
        try {
          const urls = typeof service.imageUrls === 'string' 
            ? JSON.parse(service.imageUrls) 
            : service.imageUrls;
          editServiceForm.imageUrls = Array.isArray(urls) ? urls : [];
        } catch (err) {
          editServiceForm.imageUrls = [];
        }
      } else {
        editServiceForm.imageUrls = [];
      }
      
      // Handle skills
      editSelectedSkills.value = service.skills ? service.skills.map(skill => skill.name) : [];
      
      showEditForm.value = true;
    };

    const updateService = async () => {
      try {
        isSubmitting.value = true;
        
        const serviceData = {
          title: editServiceForm.title,
          description: editServiceForm.description,
          categoryId: editServiceForm.categoryId,
          pricing: parseFloat(editServiceForm.pricing),
          pricingType: editServiceForm.pricingType,
          imageUrls: editServiceForm.imageUrls,
          skillIds: [] // In a real implementation, we'd fetch skill IDs here
        };
        
        const response = await providerService.updateProviderService(currentServiceId.value, serviceData);
        
        if (response.success) {
          showEditForm.value = false;
          await fetchServices();
        } else {
          throw new Error(response.message || 'Failed to update service');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isSubmitting.value = false;
      }
    };

    const toggleServiceStatus = async (service) => {
      try {
        const response = await providerService.updateProviderService(service.id, {
          isActive: !service.isActive
        });
        
        if (response.success) {
          await fetchServices();
        } else {
          throw new Error(response.message || 'Failed to update service status');
        }
      } catch (err) {
        error.value = err.message;
      }
    };

    // Helper functions
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + '...';
    };

    const formatPricingType = (type) => {
      switch (type) {
        case 'HOURLY': return 'Hour';
        case 'FIXED': return 'Fixed Price';
        case 'DAILY': return 'Day';
        case 'SESSION': return 'Session';
        default: return type;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      initData();
    });

    return {
      myServices,
      categories,
      loading,
      error,
      verificationStatus,
      showCreateForm,
      showEditForm,
      isSubmitting,
      serviceForm,
      editServiceForm,
      skillInput,
      selectedSkills,
      editSkillInput,
      editSelectedSkills,
      imageUrlsText,
      editImageUrlsText,
      addSkillToSelection,
      removeSkill,
      addEditSkillToSelection,
      removeEditSkill,
      createService,
      editService,
      updateService,
      toggleServiceStatus,
      truncateText,
      formatPricingType
    };
  }
};
</script>

<style scoped>
.provider-services-container {
  width: 100%;
  padding: 0;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

.provider-services {
  width: 100%;
  margin: 0;
  padding: 20px 30px;
}

.page-title {
  text-align: center;
  color: #4a5568;
  margin-bottom: 30px;
  font-size: 2.6rem;
  font-weight: 800;
  position: relative;
  padding-bottom: 15px;
  letter-spacing: -0.02em;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
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

.verification-alert {
  background: linear-gradient(to right, rgba(243, 156, 18, 0.1), rgba(241, 196, 15, 0.1));
  color: #d35400;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 10px;
  border-left: 5px solid #f39c12;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.alert-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #f39c12;
}

.alert-content {
  flex: 1;
}

.action-buttons {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  background: linear-gradient(135deg, #4caf50, #2e8b57);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #2e8b57, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.3);
}

.service-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.service-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  margin-bottom: 25px;
  padding: 25px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f1f1;
  padding-bottom: 15px;
}

.service-header h3 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.3rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-badge.active {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
}

.status-badge.inactive {
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  color: #757575;
}

.service-details {
  margin-bottom: 25px;
}

.service-details p {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}

.service-details p i {
  margin-right: 8px;
  margin-top: 4px;
  color: #3498db;
}

.description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 15px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #e0e0e0;
}

.service-skills {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.skill-tag {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  color: #0288d1;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.skill-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(2, 136, 209, 0.2);
}

.service-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .toggle-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  flex: 1;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.edit-btn:hover {
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(33, 150, 243, 0.3);
}

.toggle-btn {
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  color: #757575;
  flex: 1;
  justify-content: center;
}

.toggle-btn:hover {
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.no-services {
  text-align: center;
  padding: 60px 0;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.empty-icon {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.no-services p {
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close-btn {
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  transform: rotate(90deg);
}

.service-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.pricing-group {
  display: flex;
  gap: 20px;
}

.price-input, .price-type {
  flex: 1;
}

.skills-selection {
  margin-top: 15px;
}

.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.selected-skill {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  color: #0288d1;
  padding: 8px 12px;
  border-radius: 50px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.selected-skill:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(2, 136, 209, 0.2);
}

.remove-skill {
  background: none;
  border: none;
  color: #0288d1;
  margin-left: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  padding: 0 3px;
  transition: all 0.2s ease;
}

.remove-skill:hover {
  color: #e74c3c;
  transform: scale(1.2);
}

.skill-input {
  display: flex;
  gap: 10px;
}

.skill-input input {
  flex: 1;
}

.add-skill-btn {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  color: #0288d1;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-skill-btn:hover {
  background: linear-gradient(135deg, #b3e5fc, #81d4fa);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(2, 136, 209, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn {
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  color: #757575;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  transform: translateY(-2px);
}

.submit-btn {
  background: linear-gradient(135deg, #4caf50, #2e8b57);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}

.submit-btn:hover:not([disabled]) {
  background: linear-gradient(135deg, #2e8b57, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.3);
}

.submit-btn:disabled {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error {
  text-align: center;
  padding: 25px;
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 10px;
  border-left: 5px solid #e74c3c;
  margin: 20px 0;
  font-weight: 500;
}

/* Responsive Styles */
@media screen and (max-width: 1600px) {
  .service-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media screen and (max-width: 1200px) {
  .service-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .pricing-group {
    flex-direction: column;
    gap: 15px;
  }
}

@media screen and (max-width: 768px) {
  .provider-services {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .service-list {
    grid-template-columns: 1fr;
  }
  
  .service-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    padding: 20px;
  }
}

@media screen and (max-width: 480px) {
  .provider-services {
    padding: 10px;
  }
  
  .verification-alert {
    flex-direction: column;
  }
  
  .alert-icon {
    margin-bottom: 10px;
    margin-right: 0;
  }
  
  .service-card {
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
  }
}
</style>
