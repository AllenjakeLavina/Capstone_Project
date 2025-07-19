<template>
  <div class="provider-profile">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <h1>Provider Profile</h1>
      
      <!-- Profile Tabs Navigation -->
      <div class="profile-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i> {{ tab.name }}
        </div>
      </div>
      
      <!-- Personal Information Tab -->
      <div v-show="activeTab === 'personal'" class="tab-content section">
        <h2>Personal Information</h2>
        <div v-if="!editingPersonal" class="profile-info">
          <div class="profile-header">
            <div class="profile-picture-container">
              <div v-if="profile.profilePicture" class="profile-picture">
                <img :src="getFullFileUrl(profile.profilePicture)" alt="Profile Picture" />
              </div>
              <div v-else class="profile-picture placeholder-img">
                <i class="fas fa-user"></i>
              </div>
              
              <!-- Overlay clickable area -->
              <div class="profile-picture-overlay" @click="triggerFileUpload">
                <i class="fas fa-camera"></i>
                <span>Change Photo</span>
              </div>
              
              <!-- Hidden file input -->
              <input 
                type="file" 
                ref="profileImageInput" 
                @change="handleProfileImageChange" 
                accept="image/*" 
                class="hidden-input" 
                style="display:none" 
              />
              
              <!-- Upload progress indicator -->
              <div v-if="uploadingProfileImage" class="upload-progress">
                <div class="spinner"></div>
              </div>
            </div>
            
            <div class="profile-actions">
              <button class="edit-btn" @click="toggleEditPersonal">
                <i class="fas fa-edit"></i> Edit Profile
              </button>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="detail-item">
              <h3>Basic Info</h3>
              <p><strong>Name:</strong> {{ profile.firstName || '' }} {{ profile.lastName || '' }}</p>
              <p><strong>Email:</strong> {{ profile.email || '' }}</p>
              <p><strong>Phone:</strong> {{ profile.phone || '' }}</p>
            </div>
            
            <div class="detail-item">
              <h3>Professional Info</h3>
              <p><strong>Headline:</strong> {{ profile.serviceProvider?.headline || '' }}</p>
              <p><strong>Hourly Rate:</strong> ${{ profile.serviceProvider?.hourlyRate || 0 }}/hr</p>
            </div>
            
            <div class="detail-item">
              <h3>Bio</h3>
              <p class="bio-text">{{ profile.serviceProvider?.bio || '' }}</p>
            </div>
          </div>
        </div>
        
        <form v-else @submit.prevent="updatePersonalInfo" class="edit-form">
          <div class="form-group">
            <label>First Name:</label>
            <input v-model.trim="personalForm.firstName" required />
          </div>
          <div class="form-group">
            <label>Last Name:</label>
            <input v-model.trim="personalForm.lastName" required />
          </div>
          <div class="form-group">
            <label>Phone:</label>
            <input v-model.trim="personalForm.phone" />
          </div>
          <div class="form-group">
            <label>Hourly Rate ($):</label>
            <input type="number" v-model.number="personalForm.hourlyRate" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Headline:</label>
            <input v-model.trim="personalForm.headline" placeholder="Short professional headline (e.g., Experienced Web Developer)" />
          </div>
          <div class="form-group">
            <label>Bio:</label>
            <textarea v-model.trim="personalForm.bio" rows="4" placeholder="Tell clients about yourself, your skills, and experience"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" class="cancel-btn" @click="toggleEditPersonal">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Work Experience Tab -->
      <div v-show="activeTab === 'experience'" class="tab-content section">
        <div class="section-header">
          <h2>Work Experience</h2>
          <button v-if="!addingExperience" @click="toggleAddExperience" class="add-btn">
            <i class="fas fa-plus"></i> Add Experience
          </button>
        </div>
        
        <div v-if="addingExperience" class="add-section">
          <form @submit.prevent="addExperience" class="add-form">
            <div class="form-group">
              <label>Company:</label>
              <input v-model="experienceForm.company" required />
            </div>
            <div class="form-group">
              <label>Position:</label>
              <input v-model="experienceForm.position" required />
            </div>
            <div class="form-group">
              <label>Start Date:</label>
              <input type="date" v-model="experienceForm.startDate" required />
            </div>
            <div class="form-group">
              <label>Current Position:</label>
              <input type="checkbox" v-model="experienceForm.isCurrentPosition" />
            </div>
            <div v-if="!experienceForm.isCurrentPosition" class="form-group">
              <label>End Date:</label>
              <input type="date" v-model="experienceForm.endDate" :required="!experienceForm.isCurrentPosition" />
            </div>
            <div class="form-group">
              <label>Description:</label>
              <textarea v-model="experienceForm.description" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="toggleAddExperience">Cancel</button>
            </div>
          </form>
        </div>
        
        <div v-if="profile.serviceProvider?.workExperience && profile.serviceProvider.workExperience.length > 0" class="experience-list">
          <div v-for="experience in profile.serviceProvider.workExperience" :key="experience.id" class="experience-item">
            <div class="experience-header">
              <h3>{{ experience.position }}</h3>
              <div class="experience-company">{{ experience.company }}</div>
              <div class="experience-dates">
                {{ formatDate(experience.startDate) }} - {{ experience.isCurrentPosition ? 'Present' : formatDate(experience.endDate) }}
              </div>
            </div>
            <p class="experience-description">{{ experience.description }}</p>
          </div>
        </div>
        <div v-else-if="!addingExperience" class="no-data">
          <p>No work experience added yet.</p>
          <p>Add work experience to showcase your professional history to potential clients.</p>
        </div>
      </div>

      <!-- Education Tab -->
      <div v-show="activeTab === 'education'" class="tab-content section">
        <div class="section-header">
          <h2>Education</h2>
          <button v-if="!addingEducation" @click="toggleAddEducation" class="add-btn">
            <i class="fas fa-plus"></i> Add Education
          </button>
        </div>
        
        <div v-if="addingEducation" class="add-section">
          <form @submit.prevent="addEducation" class="add-form">
            <div class="form-group">
              <label>Institution:</label>
              <input v-model="educationForm.institution" required />
            </div>
            <div class="form-group">
              <label>Degree:</label>
              <input v-model="educationForm.degree" required />
            </div>
            <div class="form-group">
              <label>Field of Study:</label>
              <input v-model="educationForm.fieldOfStudy" />
            </div>
            <div class="form-group">
              <label>Start Date:</label>
              <input type="date" v-model="educationForm.startDate" required />
            </div>
            <div class="form-group">
              <label>Currently Studying:</label>
              <input type="checkbox" v-model="educationForm.isCurrentlyStudying" />
            </div>
            <div v-if="!educationForm.isCurrentlyStudying" class="form-group">
              <label>End Date:</label>
              <input type="date" v-model="educationForm.endDate" :required="!educationForm.isCurrentlyStudying" />
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="toggleAddEducation">Cancel</button>
            </div>
          </form>
        </div>
        
        <div v-if="profile.serviceProvider?.education && profile.serviceProvider.education.length > 0" class="education-list">
          <div v-for="edu in profile.serviceProvider.education" :key="edu.id" class="education-item">
            <div class="education-header">
              <h3>{{ edu.degree }}</h3>
              <div class="education-field" v-if="edu.fieldOfStudy">{{ edu.fieldOfStudy }}</div>
              <div class="education-institution">{{ edu.institution }}</div>
              <div class="education-dates">
                {{ formatDate(edu.startDate) }} - {{ edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!addingEducation" class="no-data">
          <p>No education history added yet.</p>
          <p>Add your educational background to highlight your qualifications.</p>
        </div>
      </div>

      <!-- Skills, Documents & Portfolio Tab -->
      <div v-show="activeTab === 'skillsportfolio'" class="tab-content section">
        <div class="section-header">
          <h2>Skills, Documents & Portfolio</h2>
        </div>

        <!-- Skills Section -->
        <div class="subsection">
          <div class="subsection-header">
            <h3>Professional Skills</h3>
            <button v-if="!addingSkill" @click="toggleAddSkill" class="add-btn">
              <i class="fas fa-plus"></i> Add Skill
            </button>
          </div>
          
          <div v-if="addingSkill" class="add-section">
            <form @submit.prevent="addSkill" class="add-form">
              <div class="form-group">
                <label>Skill Name:</label>
                <input v-model="skillForm.skillName" required />
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">Save</button>
                <button type="button" class="cancel-btn" @click="toggleAddSkill">Cancel</button>
              </div>
            </form>
          </div>
          
          <div v-if="profile.serviceProvider?.skills && profile.serviceProvider.skills.length > 0" class="skills-list">
            <span v-for="skill in profile.serviceProvider.skills" :key="skill.id" class="skill-tag">{{ skill.name }}</span>
          </div>
          <div v-else-if="!addingSkill" class="no-data">
            <p>No skills added yet.</p>
            <p>Add skills to help clients find you and understand your expertise.</p>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="subsection">
          <div class="subsection-header">
            <h3>Documents & Verification</h3>
            <button v-if="!addingDocument" @click="toggleAddDocument" class="add-btn">
              <i class="fas fa-plus"></i> Upload Document
            </button>
          </div>
          
          <div class="verification-status">
            <p><strong>Verification Status:</strong> 
              <span :class="verificationStatusClass">{{ verificationStatusText }}</span>
            </p>
          </div>
          
          <div v-if="addingDocument" class="add-section">
            <form @submit.prevent="addDocument" class="add-form" enctype="multipart/form-data">
              <div class="form-group">
                <label>Document Title:</label>
                <input v-model="documentForm.title" required />
              </div>
              <div class="form-group">
                <label>Document Type:</label>
                <select v-model="documentForm.type" required>
                  <option value="ID">ID Document</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="LICENSE">License</option>
                  <option value="RESUME">Resume</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>File:</label>
                <input type="file" ref="fileInput" required />
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">Upload</button>
                <button type="button" class="cancel-btn" @click="toggleAddDocument">Cancel</button>
              </div>
            </form>
          </div>
          
          <div v-if="profile.serviceProvider?.documents && profile.serviceProvider.documents.length > 0" class="documents-list">
            <h4>Uploaded Documents</h4>
            <div v-for="doc in profile.serviceProvider.documents" :key="doc.id" class="document-item">
              <div class="document-info">
                <div class="document-title">
                  <strong>{{ doc.title }}</strong> ({{ doc.type }})
                </div>
                <span :class="doc.isVerified ? 'verified' : 'pending'">
                  {{ doc.isVerified ? 'Verified' : 'Pending Verification' }}
                </span>
              </div>
              <a @click.prevent="openFileModal(doc.fileUrl, doc.title, doc.type)" class="view-btn">View Document</a>
            </div>
          </div>
          <div v-else-if="!addingDocument" class="no-data">
            <p>No documents uploaded yet.</p>
            <p>Upload identity documents to complete the verification process.</p>
          </div>
        </div>

        <!-- Portfolio Section -->
        <div class="subsection">
          <div class="subsection-header">
            <h3>Portfolio</h3>
            <button v-if="!addingPortfolio" @click="toggleAddPortfolio" class="add-btn">
              <i class="fas fa-plus"></i> Add Portfolio Item
            </button>
          </div>
          
          <div v-if="addingPortfolio" class="add-section">
            <form @submit.prevent="addPortfolioItem" class="add-form" enctype="multipart/form-data">
              <div class="form-group">
                <label>Title:</label>
                <input v-model="portfolioForm.title" required />
              </div>
              <div class="form-group">
                <label>Description:</label>
                <textarea v-model="portfolioForm.description" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Project URL (optional):</label>
                <input type="url" v-model="portfolioForm.projectUrl" placeholder="https://example.com" />
              </div>
              <div class="form-group">
                <label>Images/Files (up to 5):</label>
                <input type="file" multiple ref="portfolioFilesInput" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt" required />
                <small class="form-hint">Select up to 5 files to showcase your work (images, PDFs, or documents)</small>
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">Save</button>
                <button type="button" class="cancel-btn" @click="toggleAddPortfolio">Cancel</button>
              </div>
            </form>
          </div>
          
          <div v-if="profile.serviceProvider?.portfolio && profile.serviceProvider.portfolio.length > 0" class="portfolio-grid">
            <div v-for="item in profile.serviceProvider.portfolio" :key="item.id" class="portfolio-item">
              <div class="portfolio-header">
                <h3>{{ item.title }}</h3>
                <a v-if="item.projectUrl" :href="item.projectUrl" target="_blank" class="project-link">
                  <i class="fas fa-external-link-alt"></i> View Project
                </a>
              </div>
              <p v-if="item.description" class="portfolio-description">{{ item.description }}</p>
              
              <div class="portfolio-images">
                <div v-if="item.files && item.files.length > 0" class="image-gallery">
                  <div v-for="file in item.files" :key="file.id" class="gallery-item" @click="openFileModal(file.fileUrl, item.title, file.fileType)">
                    <!-- Handle image files -->
                    <img v-if="isImageFile(file.fileUrl)" :src="getFullFileUrl(file.fileUrl)" :alt="item.title" />
                    <!-- Handle document files -->
                    <div v-else class="document-preview">
                      <i :class="getFileIcon(file.fileUrl)"></i>
                      <span>{{ getFileName(file.fileUrl) }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="no-images">
                  <p>No files available for this project</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!addingPortfolio" class="no-data">
            <p>No portfolio items added yet.</p>
            <p>Add portfolio items to showcase your work and projects.</p>
          </div>
        </div>
      </div>

      <!-- File View Modal -->
      <div v-if="showFileModal" class="file-modal">
        <div class="modal-overlay" @click="closeFileModal"></div>
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ modalFile.title || 'File Preview' }}</h3>
            <button class="close-btn" @click="closeFileModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <!-- Image viewer -->
            <img v-if="isImageFile(modalFile.url)" :src="getFullFileUrl(modalFile.url)" :alt="modalFile.title" class="modal-image" />
            
            <!-- PDF viewer -->
            <iframe v-else-if="isPdfFile(modalFile.url)" :src="getFullFileUrl(modalFile.url)" class="modal-document"></iframe>
            
            <!-- Other file types -->
            <div v-else class="modal-file-info">
              <i :class="getFileIcon(modalFile.url)" class="file-icon"></i>
              <p>{{ getFileName(modalFile.url) }}</p>
              <a :href="getFullFileUrl(modalFile.url)" target="_blank" class="download-btn">
                <i class="fas fa-download"></i> Open File
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { providerService } from '../../services/apiService';
import apiService from '../../services/apiService';

export default {
  name: 'ProviderProfile',
  setup() {
    const profile = ref({});
    const loading = ref(true);
    const error = ref(null);
    const verificationStatus = ref({});
    const activeTab = ref('personal');
    const profileImageInput = ref(null);
    const uploadingProfileImage = ref(false);

    // Tabs configuration
    const tabs = [
      { id: 'personal', name: 'Personal Info', icon: 'fas fa-user' },
      { id: 'experience', name: 'Work Experience', icon: 'fas fa-briefcase' },
      { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap' },
      { id: 'skillsportfolio', name: 'Skills & Portfolio', icon: 'fas fa-tools' },
    ];

    // UI state
    const editingPersonal = ref(false);
    const addingExperience = ref(false);
    const addingEducation = ref(false);
    const addingSkill = ref(false);
    const addingDocument = ref(false);
    const addingPortfolio = ref(false);

    // Form data
    const personalForm = reactive({
      firstName: '',
      lastName: '',
      phone: '',
      profilePicture: '',
      bio: '',
      headline: '',
      hourlyRate: 0
    });

    const experienceForm = reactive({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentPosition: false
    });

    const educationForm = reactive({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false
    });

    const skillForm = reactive({
      skillName: ''
    });

    const documentForm = reactive({
      title: '',
      type: 'ID'
    });

    const portfolioForm = reactive({
      title: '',
      description: '',
      projectUrl: ''
    });

    // Computed properties
    const verificationStatusText = computed(() => {
      if (!verificationStatus.value) return 'Unknown';
      if (verificationStatus.value.isVerified) return 'Verified';
      if (verificationStatus.value.pendingVerification) return 'Pending Verification';
      return 'Not Verified';
    });

    const verificationStatusClass = computed(() => {
      if (!verificationStatus.value) return 'unknown';
      if (verificationStatus.value.isVerified) return 'verified';
      if (verificationStatus.value.pendingVerification) return 'pending';
      return 'not-verified';
    });

    // Modal state
    const showFileModal = ref(false);
    const modalFile = reactive({
      url: '',
      title: '',
      type: ''
    });

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        console.log('Fetching provider profile data...');
        const profileResponse = await providerService.getProviderProfile();
        console.log('Profile response:', profileResponse);
        
        if (profileResponse.success) {
          profile.value = profileResponse.data || {};
          
          // Set default values for form - access properties directly from profile data
          personalForm.firstName = profile.value.firstName || '';
          personalForm.lastName = profile.value.lastName || '';
          personalForm.phone = profile.value.phone || '';
          personalForm.profilePicture = profile.value.profilePicture || '';
          
          // ServiceProvider properties
          personalForm.bio = profile.value.serviceProvider?.bio || '';
          personalForm.headline = profile.value.serviceProvider?.headline || '';
          personalForm.hourlyRate = profile.value.serviceProvider?.hourlyRate || 0;
          
          // Set verification status based on profile data
          verificationStatus.value = {
            isVerified: profile.value.serviceProvider?.isProviderVerified || false,
            hasUploadedDocuments: profile.value.serviceProvider?.documents?.length > 0 || false,
            pendingVerification: !profile.value.serviceProvider?.isProviderVerified && 
                                (profile.value.serviceProvider?.documents?.length > 0 || false)
          };
        } else {
          console.error('Failed to load profile:', profileResponse.message);
          error.value = profileResponse.message || 'Failed to load profile data';
          // Initialize with empty objects
          profile.value = {};
          verificationStatus.value = { isVerified: false, pendingVerification: false };
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        error.value = err.message || 'An error occurred while fetching your profile';
        profile.value = {};
        verificationStatus.value = { isVerified: false, pendingVerification: false };
      } finally {
        loading.value = false;
      }
    };

    // Form handlers
    const toggleEditPersonal = () => {
      editingPersonal.value = !editingPersonal.value;
    };

    const updatePersonalInfo = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Create the update data object from the form
        const updateData = {
          firstName: personalForm.firstName,
          lastName: personalForm.lastName,
          phone: personalForm.phone,
          bio: personalForm.bio,
          headline: personalForm.headline,
          hourlyRate: personalForm.hourlyRate ? parseFloat(personalForm.hourlyRate) : undefined
        };
        
        console.log('Component: Update data to send:', updateData);
        
        const response = await providerService.updateProviderProfile(updateData);
        console.log('Component: Profile update response:', response);

        if (response.success) {
          // Update local data
          profile.value = response.data;
          editingPersonal.value = false;
        } else {
          throw new Error(response.message || 'Failed to update profile');
        }
      } catch (err) {
        console.error('Component: Error updating profile:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleAddExperience = () => {
      addingExperience.value = !addingExperience.value;
      if (!addingExperience.value) {
        // Reset form
        experienceForm.company = '';
        experienceForm.position = '';
        experienceForm.startDate = '';
        experienceForm.endDate = '';
        experienceForm.description = '';
        experienceForm.isCurrentPosition = false;
      }
    };

    const addExperience = async () => {
      try {
        loading.value = true;
        const response = await providerService.addWorkExperience({
          company: experienceForm.company,
          position: experienceForm.position,
          startDate: experienceForm.startDate,
          endDate: experienceForm.isCurrentPosition ? null : experienceForm.endDate,
          description: experienceForm.description,
          isCurrentPosition: experienceForm.isCurrentPosition
        });

        if (response.success) {
          // Refresh profile data
          await fetchProfileData();
          toggleAddExperience();
        } else {
          throw new Error(response.message || 'Failed to add work experience');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleAddEducation = () => {
      addingEducation.value = !addingEducation.value;
      if (!addingEducation.value) {
        // Reset form
        educationForm.institution = '';
        educationForm.degree = '';
        educationForm.fieldOfStudy = '';
        educationForm.startDate = '';
        educationForm.endDate = '';
        educationForm.isCurrentlyStudying = false;
      }
    };

    const addEducation = async () => {
      try {
        loading.value = true;
        const response = await providerService.addEducation({
          institution: educationForm.institution,
          degree: educationForm.degree,
          fieldOfStudy: educationForm.fieldOfStudy,
          startDate: educationForm.startDate,
          endDate: educationForm.isCurrentlyStudying ? null : educationForm.endDate,
          isCurrentlyStudying: educationForm.isCurrentlyStudying
        });

        if (response.success) {
          // Refresh profile data
          await fetchProfileData();
          toggleAddEducation();
        } else {
          throw new Error(response.message || 'Failed to add education');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleAddSkill = () => {
      addingSkill.value = !addingSkill.value;
      if (!addingSkill.value) {
        // Reset form
        skillForm.skillName = '';
      }
    };

    const addSkill = async () => {
      try {
        loading.value = true;
        const response = await providerService.addSkill({
          skillName: skillForm.skillName
        });

        if (response.success) {
          // Refresh profile data
          await fetchProfileData();
          toggleAddSkill();
        } else {
          throw new Error(response.message || 'Failed to add skill');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleAddDocument = () => {
      addingDocument.value = !addingDocument.value;
      if (!addingDocument.value) {
        // Reset form
        documentForm.title = '';
        documentForm.type = 'ID';
      }
    };

    const addDocument = async () => {
      try {
        loading.value = true;
        
        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
          throw new Error('Please select a file');
        }

        const formData = new FormData();
        formData.append('title', documentForm.title);
        formData.append('type', documentForm.type);
        formData.append('file', fileInput.files[0]);

        const response = await providerService.addDocument(formData);

        if (response.success) {
          // Refresh profile data
          await fetchProfileData();
          toggleAddDocument();
        } else {
          throw new Error(response.message || 'Failed to upload document');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleAddPortfolio = () => {
      addingPortfolio.value = !addingPortfolio.value;
      if (!addingPortfolio.value) {
        // Reset form
        portfolioForm.title = '';
        portfolioForm.description = '';
        portfolioForm.projectUrl = '';
      }
    };

    const addPortfolioItem = async () => {
      try {
        loading.value = true;
        
        const fileInput = document.querySelector('input[type="file"][multiple]');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          throw new Error('Please select at least one file');
        }
        
        // Check if too many files selected
        if (fileInput.files.length > 5) {
          throw new Error('You can only upload up to 5 files');
        }

        const formData = new FormData();
        formData.append('title', portfolioForm.title);
        formData.append('description', portfolioForm.description);
        formData.append('projectUrl', portfolioForm.projectUrl || '');
        
        // Append each file separately
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append('files', fileInput.files[i]);
        }

        const response = await providerService.addPortfolioWithFiles(formData);

        if (response.success) {
          // Refresh profile data
          await fetchProfileData();
          toggleAddPortfolio();
        } else {
          throw new Error(response.message || 'Failed to add portfolio item');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    };

    const isImageFile = (fileUrl) => {
      const extension = fileUrl.split('.').pop().toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes('.' + extension);
    };

    const getFileIcon = (fileUrl) => {
      const extension = fileUrl.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'fas fa-file-pdf';
        case 'doc':
        case 'docx':
          return 'fas fa-file-word';
        case 'txt':
          return 'fas fa-file-alt';
        default:
          return 'fas fa-file';
      }
    };

    const getFileName = (fileUrl) => {
      const parts = fileUrl.split('/');
      return parts[parts.length - 1];
    };

    const getFullFileUrl = (fileUrl) => {
      return apiService.getFileUrl(fileUrl);
    };

    const openFileModal = (fileUrl, title = '', type = '') => {
      modalFile.url = fileUrl;
      modalFile.title = title;
      modalFile.type = type;
      showFileModal.value = true;
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeFileModal = () => {
      showFileModal.value = false;
      document.body.style.overflow = ''; // Restore scrolling
    };

    const isPdfFile = (fileUrl) => {
      if (!fileUrl) return false;
      const extension = fileUrl.split('.').pop().toLowerCase();
      return extension === 'pdf';
    };

    // Profile image upload functions
    const triggerFileUpload = () => {
      if (profileImageInput.value) profileImageInput.value.click();
    };

    const handleProfileImageChange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      // Validate file type
      if (!file.type.match('image.*')) {
        error.value = 'Please select an image file';
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'Image must be less than 5MB';
        return;
      }
      try {
        uploadingProfileImage.value = true;
        error.value = null;
        const response = await apiService.uploadProfilePicture(file);
        if (response.success) {
          profile.value = response.data;
        } else {
          throw new Error(response.message || 'Failed to update profile picture');
        }
      } catch (err) {
        error.value = err.message || 'Failed to upload profile picture';
      } finally {
        uploadingProfileImage.value = false;
        event.target.value = '';
      }
    };

    onMounted(() => {
      fetchProfileData();
    });

    return {
      profile,
      loading,
      error,
      verificationStatus,
      activeTab,
      tabs,
      editingPersonal,
      addingExperience,
      addingEducation,
      addingSkill,
      addingDocument,
      addingPortfolio,
      personalForm,
      experienceForm,
      educationForm,
      skillForm,
      documentForm,
      portfolioForm,
      verificationStatusText,
      verificationStatusClass,
      toggleEditPersonal,
      updatePersonalInfo,
      toggleAddExperience,
      addExperience,
      toggleAddEducation,
      addEducation,
      toggleAddSkill,
      addSkill,
      toggleAddDocument,
      addDocument,
      toggleAddPortfolio,
      addPortfolioItem,
      formatDate,
      isImageFile,
      getFileIcon,
      getFileName,
      getFullFileUrl,
      showFileModal,
      modalFile,
      openFileModal,
      closeFileModal,
      isPdfFile,
      triggerFileUpload,
      handleProfileImageChange,
      uploadingProfileImage,
      profileImageInput
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.provider-profile {
  max-width: 100%;
  width: 100%;
  margin: 0;
  padding: 30px;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f7f9fc;
  min-height: 100vh;
  color: #2d3748;
  box-sizing: border-box;
  overflow-x: hidden;
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

h1::after {
  display: none;
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

h2::after {
  display: none;
}

h3 {
  color: #4a5568;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.01em;
}

/* Profile Tabs */
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

/* Sections */
.section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 35px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
}

.section::before {
  display: none;
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
  font-size: 11px;
  text-align: center;
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

.detail-item::before {
  display: none;
}

.detail-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}

.detail-item h3 {
  color: #27ae60;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf2f7;
}

.bio-text {
  white-space: pre-line;
  line-height: 1.7;
  color: #444;
  font-size: 1.02rem;
}

/* Buttons */
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
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
  font-size: 1rem;
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
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.cancel-btn:hover {
  background: #f8fafc;
  color: #27ae60;
  border-color: #27ae60;
  transform: translateY(-3px);
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #27ae60;
  font-size: 0.95rem;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #333;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15);
  outline: none;
  background-color: #fff;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 35px;
  justify-content: flex-end;
}

/* Experience and Education */
.experience-list, .education-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.experience-item, .education-item {
  padding: 30px;
  background: white;
  border-radius: 16px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.experience-item::before, .education-item::before {
  display: none;
}

.experience-item:hover, .education-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}

.experience-header, .education-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #edf2f7;
}

.experience-company, .education-institution {
  font-weight: 700;
  color: #27ae60;
  font-size: 1.1rem;
  margin-top: 5px;
}

.experience-dates, .education-dates, .education-field {
  color: #718096;
  font-size: 0.9rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.experience-description {
  margin-top: 15px;
  white-space: pre-line;
  line-height: 1.6;
  color: #4a5568;
  font-size: 0.95rem;
}

/* Skills */
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0 30px;
}

.skill-tag {
  background: white;
  color: #4a5568;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
}

.skill-tag:hover {
  background: #27ae60;
  color: white;
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(39, 174, 96, 0.15);
  border-color: #27ae60;
}

/* Documents */
.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 15px;
  overflow: hidden;
}

.document-item::before {
  display: none;
}

.document-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}

.document-info {
  flex: 1;
  min-width: 200px;
}

.document-title {
  margin-bottom: 8px;
  font-weight: 600;
  color: #27ae60;
  font-size: 1.1rem;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: #27ae60;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
}

.view-btn:hover {
  background-color: #219d55;
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.2);
  transform: translateY(-3px);
}

.view-btn::before {
  content: '\f06e';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
}

/* Verification Status */
.verification-status {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 25px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
}

.verification-status::before {
  display: none;
}

.verification-status p {
  margin: 0;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.verified {
  color: #10b981;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 15px;
  background-color: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.verified:before {
  content: "✓";
  display: inline-block;
  font-size: 14px;
  background: #10b981;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  text-align: center;
  line-height: 22px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.pending {
  color: #f59e0b;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 15px;
  background-color: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
}

.pending:before {
  content: "\f254";
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 14px;
  color: #f59e0b;
}

.no-data {
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

.no-data::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, rgba(39, 174, 96, 0.3), rgba(46, 204, 113, 0.3));
}

.no-data p:first-child {
  font-size: 1.2rem;
  margin-bottom: 15px;
  font-weight: 600;
  color: #27ae60;
}

.no-data p:last-child {
  color: #555;
  line-height: 1.6;
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

/* Portfolio */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.portfolio-item {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
}

.portfolio-item::before {
  display: none;
}

.portfolio-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.portfolio-header {
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #edf2f7;
  background: white;
}

.portfolio-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #27ae60;
}

.project-link {
  color: #27ae60;
  text-decoration: none;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 8px 15px;
  border-radius: 8px;
  background-color: #f7fffa;
  border: 1px solid #e5e7eb;
}

.project-link:hover {
  background-color: #27ae60;
  color: white;
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.2);
  transform: translateY(-3px);
}

.portfolio-description {
  padding: 20px 25px;
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.7;
  background-color: #f8fafc;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.portfolio-images {
  padding: 25px;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.gallery-item {
  height: 150px;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  position: relative;
  border: 3px solid white;
}

.gallery-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(39, 174, 96, 0) 0%,
    rgba(39, 174, 96, 0.8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.gallery-item:hover::before {
  opacity: 1;
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(39, 174, 96, 0.2);
}

.document-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 5px;
  background-color: #f9f9f9;
  border-radius: 8px;
  height: 100%;
  text-align: center;
}

.document-preview i {
  font-size: 30px;
  color: #607d8b;
}

.document-preview span {
  font-size: 0.8rem;
  color: #455a64;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-images {
  text-align: center;
  color: #9e9e9e;
  padding: 30px 20px;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 15px;
}

.form-hint {
  display: block;
  margin-top: 8px;
  color: #78909c;
  font-size: 0.85rem;
}

/* Modal Styles */
.file-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background-color: white;
  border-radius: 20px;
  max-width: 90vw;
  width: 900px;
  max-height: 90vh;
  z-index: 1001;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #e2e8f0;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #27ae60;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #4a5568;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #e8f5e9;
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-content {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.modal-image {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
  border-radius: 12px;
  border: 3px solid white;
  transition: transform 0.3s ease;
}

.modal-image:hover {
  transform: scale(1.02);
}

.modal-document {
  width: 100%;
  height: 75vh;
  border: none;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
}

.modal-file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: center;
  padding: 40px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 500px;
  border: 1px solid #e2e8f0;
}

.modal-file-info .file-icon {
  font-size: 80px;
  color: #27ae60;
  margin-bottom: 10px;
}

.modal-file-info p {
  font-size: 1.2rem;
  color: #333;
  word-break: break-word;
  margin: 0;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: #27ae60;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
  margin-top: 20px;
}

.download-btn:hover {
  background: #219d55;
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.2);
  transform: translateY(-3px);
}

.profile-picture-overlay span {
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

/* Add this to the end of the existing <style> section */

.subsection {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e8e8e8;
}

.subsection:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subsection-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.documents-list h4 {
  font-size: 1.1rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 1rem;
}
</style>
