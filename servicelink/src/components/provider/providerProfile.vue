<template>
  <div class="provider-profile">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <!-- Mobile Layout - Completely Separate -->
    <template v-else-if="isMobile">
      <div class="mobile-profile-layout">
        <!-- Mobile Tabs Navigation -->
        <div class="mobile-profile-tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.id" 
            :class="['mobile-tab', { active: activeTab === tab.id }]"
            @click="handleTabClick(tab.id)"
          >
            <i :class="tab.icon"></i> {{ tab.name }}
          </div>
        </div>
        
        <!-- Mobile Sections - Using v-show to keep components mounted -->
        <!-- Personal Information -->
        <section v-show="activeTab === 'personal'" class="mobile-section">
          <!-- Profile Info Card - Mobile -->
          <div class="mobile-profile-info-card">
            <div class="profile-picture-wrapper">
              <div class="profile-picture-container large">
                <div v-if="profile.profilePicture" class="profile-picture">
                  <img :src="getFullFileUrl(profile.profilePicture)" alt="Profile Picture" />
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
                <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
                <div v-if="verificationStatus.isVerified" class="verification-badge">
                  <i class="fas fa-check-circle"></i>
                  <span>Verified</span>
                </div>
              </div>
              <div class="profile-role">Provider Account</div>
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
                  <span>{{ profile.email }}</span>
                </div>
                <div v-if="profile.phone" class="contact-item">
                  <i class="fas fa-phone"></i>
                  <span>{{ profile.phone }}</span>
                </div>
                <div class="contact-item">
                  <i class="fas fa-calendar-alt"></i>
                  <span>Joined {{ formatDate(profile.createdAt) }}</span>
                </div>
              </div>
              <button class="edit-profile-btn-sidebar" @click="toggleEditPersonal">
                <i class="fas fa-edit"></i> Edit Profile
              </button>
            </div>
          </div>

          <!-- Activity Summary - Mobile -->
          <div class="mobile-activity-summary">
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

          <!-- Personal Information Section -->
          <div class="personal-info-section">
            <h2>Personal Information</h2>
            <div v-if="!editingPersonal" class="profile-info">
              <div class="profile-details">
                <div class="detail-item">
                  <h3>Basic Info</h3>
                  <p><strong>Name:</strong> {{ profile.firstName || '' }} {{ profile.lastName || '' }}</p>
                  <p><strong>Email:</strong> {{ profile.email || '' }}</p>
                  <p><strong>Phone:</strong> {{ profile.phone || '' }}</p>
                </div>
                
                <div class="detail-item">
                  <h3>Professional Info</h3>
                  <p><strong>Headline:</strong> {{ profile.serviceProvider?.headline || 'Not set' }}</p>
                </div>
                
                <div class="detail-item">
                  <h3>Bio</h3>
                  <p class="bio-text">{{ profile.serviceProvider?.bio || 'No bio added yet.' }}</p>
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
        </section>
        
        <!-- Work Experience -->
        <section v-show="activeTab === 'experience'" class="mobile-section">
          <div class="section-header">
            <h2>Work Experience</h2>
            <button @click="toggleAddExperience" class="add-btn">
              <i class="fas fa-plus"></i> Add Experience
            </button>
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
          <div v-else class="no-data">
            <p>No work experience added yet.</p>
            <p>Add work experience to showcase your professional history to potential clients.</p>
          </div>
        </section>
        
        <!-- Education -->
        <section v-show="activeTab === 'education'" class="mobile-section">
          <div class="section-header">
            <h2>Education</h2>
            <button @click="toggleAddEducation" class="add-btn">
              <i class="fas fa-plus"></i> Add Education
            </button>
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
          <div v-else class="no-data">
            <p>No education history added yet.</p>
            <p>Add your educational background to highlight your qualifications.</p>
          </div>
        </section>
        
        <!-- Skills & Portfolio -->
        <section v-show="activeTab === 'skillsportfolio'" class="mobile-section">
          <div class="section-header">
            <h2>Skills, Documents & Portfolio</h2>
          </div>

          <!-- Skills Section -->
          <div class="subsection">
            <div class="subsection-header">
              <h3>Professional Skills</h3>
              <button @click="toggleAddSkill" class="add-btn">
                <i class="fas fa-plus"></i> Add Skill
              </button>
            </div>
            
            <div v-if="profile.serviceProvider?.skills && profile.serviceProvider.skills.length > 0" class="skills-list">
              <span v-for="skill in profile.serviceProvider.skills" :key="skill.id" class="skill-tag">{{ skill.name }}</span>
            </div>
            <div v-else class="no-data">
              <p>No skills added yet.</p>
              <p>Add skills to help clients find you and understand your expertise.</p>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="subsection">
            <div class="subsection-header">
              <h3>Documents</h3>
              <button @click="toggleAddDocument" class="add-btn">
                <i class="fas fa-plus"></i> Add Document
              </button>
            </div>
            
            <div v-if="profile.serviceProvider?.documents && profile.serviceProvider.documents.length > 0" class="documents-list">
              <div v-for="doc in profile.serviceProvider.documents" :key="doc.id" class="document-item">
                <div class="document-icon">
                  <i :class="getFileIcon(doc.fileUrl)"></i>
                </div>
                <div class="document-info">
                  <h4>{{ doc.title }}</h4>
                  <p>{{ doc.type }}</p>
                </div>
                <button @click="openFileModal(doc.fileUrl, doc.title, isPdfFile(doc.fileUrl) ? 'PDF' : 'Document')" class="view-doc-btn">
                  <i class="fas fa-eye"></i> View
                </button>
              </div>
            </div>
            <div v-else class="no-data">
              <p>No documents added yet.</p>
              <p>Add documents to verify your credentials and build trust with clients.</p>
            </div>
          </div>

          <!-- Portfolio Section -->
          <div class="subsection">
            <div class="subsection-header">
              <h3>Portfolio</h3>
              <button @click="toggleAddPortfolio" class="add-btn">
                <i class="fas fa-plus"></i> Add Portfolio Item
              </button>
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
                      <img v-if="isImageFile(file.fileUrl)" :src="getFullFileUrl(file.fileUrl)" :alt="item.title" />
                      <div v-else class="document-preview">
                        <i :class="getFileIcon(file.fileUrl)"></i>
                        <span>{{ getFileName(file.fileUrl) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>No portfolio items added yet.</p>
              <p>Add portfolio items to showcase your work and projects.</p>
            </div>
          </div>
        </section>
        
        <!-- Availability -->
        <section v-show="activeTab === 'availability'" class="mobile-section">
          <div class="section-header">
            <h2>Availability Schedule</h2>
            <button @click="toggleAddAvailability" class="add-btn">
              <i class="fas fa-plus"></i> Add Time Slot
            </button>
          </div>
          
          <p class="availability-description">
            Set your weekly availability schedule. Clients will see when you're available to book services.
          </p>

          <!-- Week Navigation -->
          <div class="week-navigation">
            <div class="week-navigation-header">
              <button @click="goToPreviousWeek" class="week-nav-btn">
                <i class="fas fa-chevron-left"></i> Previous Week
              </button>
              <div class="week-range-display">
                <i class="fas fa-calendar-alt"></i>
                <span>{{ getCurrentWeekRange }}</span>
              </div>
              <button @click="goToNextWeek" class="week-nav-btn">
                Next Week <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="week-nav-actions">
              <button 
                v-if="currentWeekOffset !== 0" 
                @click="goToCurrentWeek" 
                class="current-week-btn"
              >
                <i class="fas fa-home"></i> <span class="btn-text-full">Back to Current Week</span><span class="btn-text-short">Current Week</span>
              </button>
              <button 
                @click="copyPreviousWeek" 
                class="copy-week-btn"
                :disabled="isProcessing"
              >
                <i class="fas fa-home"></i>
                  <span class="btn-text-full">Back to Current Week</span>
                  <span class="btn-text-short">Copy Week</span>
              </button>
            </div>
          </div>

          <!-- Availability Schedule by Day -->
          <div class="availability-schedule">
            <div v-for="(day, index) in weekDays" :key="index" class="day-schedule">
              <div class="day-header">
                <h3>{{ day.name }}</h3>
                <span v-if="getDaySlots(index).length > 0" class="slot-count">
                  {{ getDaySlots(index).length }} {{ getDaySlots(index).length === 1 ? 'slot' : 'slots' }}
                </span>
                <span v-else class="no-slots">Not available</span>
              </div>
              
              <div v-if="getDaySlots(index).length > 0" class="time-slots">
                <div v-for="slot in getDaySlots(index)" :key="slot.id" class="time-slot-item">
                  <div class="slot-time">
                    <i class="fas fa-clock"></i>
                    <span>{{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}</span>
                    <span v-if="!slot.isAvailable" class="unavailable-badge">Unavailable</span>
                  </div>
                  <div class="slot-actions">
                    <button @click="editAvailabilitySlot(slot)" class="edit-slot-btn">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button @click="deleteAvailabilitySlot(slot.id)" class="delete-slot-btn">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-slots-message">
                <i class="fas fa-calendar-times"></i>
                <p>No time slots set for this day</p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Reviews -->
        <section v-show="activeTab === 'reviews'" class="mobile-section">
          <div class="section-header">
            <h2>Reviews & Ratings</h2>
          </div>

          <!-- Overall Rating Summary -->
          <div class="rating-summary">
            <div class="overall-rating">
              <div class="rating-display">
                <div class="rating-number">{{ averageRating.toFixed(1) }}</div>
                <div class="rating-stars">
                  <i v-for="i in 5" :key="i" 
                     :class="['fas', i <= Math.round(averageRating) ? 'fa-star' : 'fa-star-o']">
                  </i>
                </div>
                <div class="rating-text">
                  {{ totalReviews }} {{ totalReviews === 1 ? 'review' : 'reviews' }}
                </div>
              </div>
            </div>
            
            <!-- Rating Distribution -->
            <div class="rating-distribution">
              <div v-for="i in 5" :key="i" class="rating-bar">
                <span class="star-label">{{ 6 - i }}★</span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: getRatingPercentage(6 - i) + '%' }"></div>
                </div>
                <span class="count">{{ getRatingCount(6 - i) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Reviews List -->
          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="reviewer-avatar">
                <div class="avatar placeholder">
                  {{ (review.giver?.firstName?.[0] || review.client?.firstName?.[0] || 'U') }}{{ (review.giver?.lastName?.[0] || review.client?.lastName?.[0] || '') }}
                </div>
              </div>
              <div class="review-content">
                <div class="reviewer-details">
                  <span class="reviewer-name">{{ (review.giver?.firstName || review.client?.firstName || 'Unknown') }} {{ (review.giver?.lastName || review.client?.lastName || 'User') }}</span>
                  <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                </div>
                <div class="review-rating">
                  <i v-for="i in 5" :key="i" 
                     :class="['fas', i <= review.rating ? 'fa-star' : 'fa-star-o']">
                  </i>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
                <div v-if="review.images && review.images.length > 0" class="review-images">
                  <div v-for="(image, idx) in review.images" :key="idx" class="review-image" @click="openFileModal(image, 'Review Image', 'image')">
                    <img :src="getFullFileUrl(image)" alt="Review image" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <p>No reviews yet.</p>
            <p>Reviews from clients will appear here once you start receiving bookings.</p>
          </div>
        </section>
      </div>
    </template>
    
    <!-- Desktop Layout - Original Structure -->
    <template v-else>
      <div class="profile-layout">
      <!-- Left Sidebar -->
      <div class="profile-sidebar">
        <!-- Profile Info Card -->
        <div class="sidebar-card profile-info-card">
          <div class="profile-picture-wrapper">
            <div class="profile-picture-container large">
              <div v-if="profile.profilePicture" class="profile-picture">
                <img :src="getFullFileUrl(profile.profilePicture)" alt="Profile Picture" />
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
              <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
              <div v-if="verificationStatus.isVerified" class="verification-badge">
                <i class="fas fa-check-circle"></i>
                <span>Verified</span>
              </div>
            </div>
            <div class="profile-role">Provider Account</div>
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
                <span>{{ profile.email }}</span>
              </div>
              <div v-if="profile.phone" class="contact-item">
                <i class="fas fa-phone"></i>
                <span>{{ profile.phone }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Joined {{ formatDate(profile.createdAt) }}</span>
              </div>
            </div>
            <button class="edit-profile-btn-sidebar" @click="toggleEditPersonal">
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
              <h1>Welcome back, {{ profile.firstName }}!</h1>
              <p>Manage your profile, services, and bookings</p>
            </div>
          </div>
        </div>

        <!-- Profile Tabs Navigation -->
        <div class="profile-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab', { active: activeTab === tab.id }]"
          @click="handleTabClick(tab.id)"
        >
          <i :class="tab.icon"></i> {{ tab.name }}
        </div>
      </div>
      
      <!-- Personal Information Tab -->
      <div v-show="activeTab === 'personal'" class="tab-content section">
        <h2>Personal Information</h2>
        <div v-if="!editingPersonal" class="profile-info">
          <div class="profile-details">
            <div class="detail-item">
              <h3>Basic Info</h3>
              <p><strong>Name:</strong> {{ profile.firstName || '' }} {{ profile.lastName || '' }}</p>
              <p><strong>Email:</strong> {{ profile.email || '' }}</p>
              <p><strong>Phone:</strong> {{ profile.phone || '' }}</p>
            </div>
            
            <div class="detail-item">
              <h3>Professional Info</h3>
              <p><strong>Headline:</strong> {{ profile.serviceProvider?.headline || 'Not set' }}</p>
              <!-- Removed hourly rate display per new pricing policy -->
            </div>
            
            <div class="detail-item">
              <h3>Bio</h3>
              <p class="bio-text">{{ profile.serviceProvider?.bio || 'No bio added yet.' }}</p>
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
          <!-- Removed hourly rate input per new pricing policy -->
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
          <button @click="toggleAddExperience" class="add-btn">
            <i class="fas fa-plus"></i> Add Experience
          </button>
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
        <div v-else class="no-data">
          <p>No work experience added yet.</p>
          <p>Add work experience to showcase your professional history to potential clients.</p>
        </div>
      </div>

      <!-- Education Tab -->
      <div v-show="activeTab === 'education'" class="tab-content section">
        <div class="section-header">
          <h2>Education</h2>
          <button @click="toggleAddEducation" class="add-btn">
            <i class="fas fa-plus"></i> Add Education
          </button>
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
        <div v-else class="no-data">
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
            <button @click="toggleAddSkill" class="add-btn">
              <i class="fas fa-plus"></i> Add Skill
            </button>
          </div>
          
          <div v-if="profile.serviceProvider?.skills && profile.serviceProvider.skills.length > 0" class="skills-list">
            <span v-for="skill in profile.serviceProvider.skills" :key="skill.id" class="skill-tag">{{ skill.name }}</span>
          </div>
          <div v-else class="no-data">
            <p>No skills added yet.</p>
            <p>Add skills to help clients find you and understand your expertise.</p>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="subsection">
          <div class="subsection-header">
            <h3>Documents & Verification</h3>
            <button @click="toggleAddDocument" class="add-btn">
              <i class="fas fa-plus"></i> Upload Document
            </button>
          </div>
          
          <div class="verification-status">
            <p><strong>Verification Status:</strong> 
              <span :class="verificationStatusClass">{{ verificationStatusText }}</span>
            </p>
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
          <div v-else class="no-data">
            <p>No documents uploaded yet.</p>
            <p>Upload identity documents to complete the verification process.</p>
          </div>
        </div>

        <!-- Portfolio Section -->
        <div class="subsection">
          <div class="subsection-header">
            <h3>Portfolio</h3>
            <button @click="toggleAddPortfolio" class="add-btn">
              <i class="fas fa-plus"></i> Add Portfolio Item
            </button>
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
          <div v-else class="no-data">
            <p>No portfolio items added yet.</p>
            <p>Add portfolio items to showcase your work and projects.</p>
          </div>
        </div>
      </div>

      <!-- Availability Tab -->
      <div v-show="activeTab === 'availability'" class="tab-content section">
        <div class="section-header">
          <h2>Availability Schedule</h2>
          <button @click="toggleAddAvailability" class="add-btn">
            <i class="fas fa-plus"></i> Add Time Slot
          </button>
        </div>
        
          <p class="availability-description">
            Set your weekly availability schedule. Clients will see when you're available to book services.
          </p>

          <!-- Week Navigation -->
          <div class="week-navigation">
            <div class="week-navigation-header">
              <button @click="goToPreviousWeek" class="week-nav-btn">
                <i class="fas fa-chevron-left"></i> Previous Week
              </button>
              <div class="week-range-display">
                <i class="fas fa-calendar-alt"></i>
                <span>{{ getCurrentWeekRange }}</span>
              </div>
              <button @click="goToNextWeek" class="week-nav-btn">
                Next Week <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="week-nav-actions">
              <button 
                v-if="currentWeekOffset !== 0" 
                @click="goToCurrentWeek" 
                class="current-week-btn"
              >
                <i class="fas fa-home"></i> Back to Current Week
              </button>
              <button 
                @click="copyPreviousWeek" 
                class="copy-week-btn"
                :disabled="isProcessing"
              >
                <i class="fas fa-copy"></i> Copy Last Week's Schedule
              </button>
            </div>
          </div>

          <!-- Availability Schedule by Day -->
          <div class="availability-schedule">
          <div v-for="(day, index) in weekDays" :key="index" class="day-schedule">
            <div class="day-header">
              <h3>{{ day.name }}</h3>
              <span v-if="getDaySlots(index).length > 0" class="slot-count">
                {{ getDaySlots(index).length }} {{ getDaySlots(index).length === 1 ? 'slot' : 'slots' }}
              </span>
              <span v-else class="no-slots">Not available</span>
            </div>
            
            <div v-if="getDaySlots(index).length > 0" class="time-slots">
              <div v-for="slot in getDaySlots(index)" :key="slot.id" class="time-slot-item">
                <div class="slot-time">
                  <i class="fas fa-clock"></i>
                  <span>{{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}</span>
                  <span v-if="!slot.isAvailable" class="unavailable-badge">Unavailable</span>
                </div>
                <div class="slot-actions">
                  <button @click="editAvailabilitySlot(slot)" class="edit-slot-btn">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button @click="deleteAvailabilitySlot(slot.id)" class="delete-slot-btn">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="no-slots-message">
              <i class="fas fa-calendar-times"></i>
              <p>No time slots set for this day</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews & Ratings Tab -->
      <div v-show="activeTab === 'reviews'" class="tab-content section">
        <div class="section-header">
          <h2>Reviews & Ratings</h2>
        </div>

        <!-- Overall Rating Summary -->
        <div class="rating-summary">
          <div class="overall-rating">
            <div class="rating-display">
              <div class="rating-number">{{ averageRating.toFixed(1) }}</div>
              <div class="rating-stars">
                <i v-for="i in 5" :key="i" 
                   :class="['fas', i <= Math.round(averageRating) ? 'fa-star' : 'fa-star-o']">
                </i>
              </div>
              <div class="rating-text">
                {{ totalReviews }} {{ totalReviews === 1 ? 'review' : 'reviews' }}
              </div>
            </div>
          </div>
          
          <!-- Rating Distribution -->
          <div class="rating-distribution">
            <div v-for="i in 5" :key="i" class="rating-bar">
              <span class="star-label">{{ 6 - i }}★</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: getRatingPercentage(6 - i) + '%' }"></div>
              </div>
              <span class="count">{{ getRatingCount(6 - i) }}</span>
            </div>
          </div>
        </div>

        <!-- Reviews List -->
        <div class="reviews-section">
          <h3>Recent Reviews</h3>
          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <img 
                    v-if="review.giver?.profilePicture || review.client?.profilePicture" 
                    :src="getFullFileUrl(review.giver?.profilePicture || review.client?.profilePicture)" 
                    :alt="review.giver?.firstName || review.client?.firstName || 'User'"
                    class="reviewer-avatar"
                  />
                  <div v-else class="reviewer-avatar placeholder">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="reviewer-details">
                    <div class="reviewer-name">
                      {{ (review.giver?.firstName || review.client?.firstName || 'Unknown') }} {{ (review.giver?.lastName || review.client?.lastName || 'User') }}
                    </div>
                    <div class="review-date">
                      {{ formatDate(review.createdAt) }}
                    </div>
                  </div>
                </div>
                <div class="review-rating">
                  <i v-for="i in 5" :key="i" 
                     :class="['fas', i <= review.rating ? 'fa-star' : 'fa-star-o']">
                  </i>
                </div>
              </div>
              <div v-if="review.comment" class="review-comment">
                {{ review.comment }}
              </div>
              <div v-if="review.imageUrls" class="review-images">
                <div v-for="(imageUrl, index) in JSON.parse(review.imageUrls)" :key="index" class="review-image">
                  <img :src="getFullFileUrl(imageUrl)" :alt="`Review image ${index + 1}`" @click="openFileModal(imageUrl, 'Review Image', 'image')" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <p>No reviews yet.</p>
            <p>Reviews from clients will appear here once they rate your services.</p>
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
      </div>
    </template>
    
    <!-- All Modals - Always available for both mobile and desktop (outside templates) -->
      <!-- Edit Profile Modal -->
    <div v-if="showEditProfileModal" class="modal-overlay" @click.self="showEditProfileModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Edit Profile</h2>
            <button class="close-btn" @click="showEditProfileModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePersonalInfo" class="edit-form">
              <div class="form-group">
                <label>First Name:</label>
                <input v-model.trim="personalForm.firstName" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model.trim="personalForm.lastName" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Phone:</label>
                <input v-model.trim="personalForm.phone" class="form-control" />
              </div>
              <div class="form-group">
                <label>Headline:</label>
                <input v-model.trim="personalForm.headline" placeholder="Short professional headline (e.g., Experienced Web Developer)" class="form-control" />
              </div>
              <div class="form-group">
                <label>Bio:</label>
                <textarea v-model.trim="personalForm.bio" rows="4" placeholder="Tell clients about yourself, your skills, and experience" class="form-control"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showEditProfileModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Experience Modal -->
    <div v-if="showAddExperienceModal" class="modal-overlay" @click.self="showAddExperienceModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Add Work Experience</h2>
            <button class="close-btn" @click="showAddExperienceModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addExperience" class="add-form">
              <div class="form-group">
                <label>Company:</label>
                <input v-model="experienceForm.company" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Position:</label>
                <input v-model="experienceForm.position" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Start Date:</label>
                <input type="date" v-model="experienceForm.startDate" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Current Position:</label>
                <input type="checkbox" v-model="experienceForm.isCurrentPosition" />
              </div>
              <div v-if="!experienceForm.isCurrentPosition" class="form-group">
                <label>End Date:</label>
                <input type="date" v-model="experienceForm.endDate" :required="!experienceForm.isCurrentPosition" class="form-control" />
              </div>
              <div class="form-group">
                <label>Description:</label>
                <textarea v-model="experienceForm.description" rows="3" class="form-control"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showAddExperienceModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Adding...' : 'Add Experience' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Education Modal -->
    <div v-if="showAddEducationModal" class="modal-overlay" @click.self="showAddEducationModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Add Education</h2>
            <button class="close-btn" @click="showAddEducationModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addEducation" class="add-form">
              <div class="form-group">
                <label>Institution:</label>
                <input v-model="educationForm.institution" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Degree:</label>
                <input v-model="educationForm.degree" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Field of Study:</label>
                <input v-model="educationForm.fieldOfStudy" class="form-control" />
              </div>
              <div class="form-group">
                <label>Start Date:</label>
                <input type="date" v-model="educationForm.startDate" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Currently Studying:</label>
                <input type="checkbox" v-model="educationForm.isCurrentlyStudying" />
              </div>
              <div v-if="!educationForm.isCurrentlyStudying" class="form-group">
                <label>End Date:</label>
                <input type="date" v-model="educationForm.endDate" :required="!educationForm.isCurrentlyStudying" class="form-control" />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showAddEducationModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Adding...' : 'Add Education' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Skill Modal -->
    <div v-if="showAddSkillModal" class="modal-overlay" @click.self="showAddSkillModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Add Skill</h2>
            <button class="close-btn" @click="showAddSkillModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addSkill" class="add-form">
              <div class="form-group">
                <label>Skill Name:</label>
                <input v-model="skillForm.skillName" required class="form-control" placeholder="e.g., JavaScript, Web Design, Photography" />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showAddSkillModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Adding...' : 'Add Skill' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Document Modal -->
    <div v-if="showAddDocumentModal" class="modal-overlay" @click.self="showAddDocumentModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Upload Document</h2>
            <button class="close-btn" @click="showAddDocumentModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addDocument" class="add-form" enctype="multipart/form-data">
              <div class="form-group">
                <label>Document Title:</label>
                <input v-model="documentForm.title" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Document Type:</label>
                <select v-model="documentForm.type" required class="form-control">
                  <option value="ID">ID Document</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="LICENSE">License</option>
                  <option value="RESUME">Resume</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>File:</label>
                <input type="file" ref="fileInput" required class="form-control" />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showAddDocumentModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Uploading...' : 'Upload Document' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add/Edit Availability Modal -->
    <div v-if="showAddAvailabilityModal || showEditAvailabilityModal" class="modal-overlay" @click.self="closeAvailabilityModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ showEditAvailabilityModal ? 'Edit Time Slot' : 'Add Time Slot' }}</h2>
            <button class="close-btn" @click="closeAvailabilityModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAvailabilitySlot" class="add-form">
              <div class="form-group">
                <label>Date*</label>
                <input type="date" v-model="availabilityForm.date" required class="form-control" :min="new Date().toISOString().split('T')[0]" />
                <small class="form-hint">Select the date for this availability slot</small>
              </div>
              
              <!-- Week Range Display -->
              <div v-if="selectedDateWeekRange" class="week-range-info">
                <i class="fas fa-calendar-week"></i>
                <span>Week of {{ selectedDateWeekRange }}</span>
              </div>
              
              <div class="form-group">
                <label>Start Time*</label>
                <input type="time" v-model="availabilityForm.startTime" required class="form-control" />
              </div>
              <div class="form-group">
                <label>End Time*</label>
                <input type="time" v-model="availabilityForm.endTime" required class="form-control" />
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" v-model="availabilityForm.isAvailable" />
                  Available
                </label>
                <small class="form-hint">Uncheck if this time slot is temporarily unavailable</small>
              </div>

              <!-- Repeat Weekly — only show when adding, not editing -->
              <div v-if="showAddAvailabilityModal" class="form-group repeat-weekly-group">
                <div class="repeat-toggle">
                  <label class="repeat-label">
                    <input type="checkbox" v-model="availabilityForm.repeatWeekly" />
                    <span class="repeat-label-text">
                      <i class="fas fa-redo"></i> Repeat Weekly
                    </span>
                  </label>
                  <small class="form-hint">Automatically create this slot for multiple weeks</small>
                </div>
                <div v-if="availabilityForm.repeatWeekly" class="repeat-weeks-selector">
                  <label>Number of weeks:</label>
                  <div class="weeks-buttons">
                    <button 
                      v-for="n in [2, 4, 8, 12]" 
                      :key="n"
                      type="button"
                      :class="['week-opt-btn', { active: availabilityForm.repeatWeeks === n }]"
                      @click="availabilityForm.repeatWeeks = n"
                    >{{ n }}w</button>
                  </div>
                  <small class="repeat-preview">
                    Will create slots on <strong>{{ getRepeatPreviewDays() }}</strong> for {{ availabilityForm.repeatWeeks }} weeks
                  </small>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="closeAvailabilityModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Saving...' : (showEditAvailabilityModal ? 'Update Slot' : 'Add Slot') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Portfolio Modal -->
    <div v-if="showAddPortfolioModal" class="modal-overlay" @click.self="showAddPortfolioModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Add Portfolio Item</h2>
            <button class="close-btn" @click="showAddPortfolioModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addPortfolioItem" class="add-form" enctype="multipart/form-data">
              <div class="form-group">
                <label>Title:</label>
                <input v-model="portfolioForm.title" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Description:</label>
                <textarea v-model="portfolioForm.description" rows="3" class="form-control"></textarea>
              </div>
              <div class="form-group">
                <label>Project URL (optional):</label>
                <input type="url" v-model="portfolioForm.projectUrl" placeholder="https://example.com" class="form-control" />
              </div>
              <div class="form-group">
                <label>Images/Files (up to 5):</label>
                <input type="file" multiple ref="portfolioFilesInput" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt" required class="form-control" />
                <small class="form-hint">Select up to 5 files to showcase your work (images, PDFs, or documents)</small>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showAddPortfolioModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                  {{ isProcessing ? 'Adding...' : 'Add Portfolio Item' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    
    <!-- File View Modal - Always mounted globally, shown/hidden with v-show -->
    <div v-show="showFileModal" class="file-modal">
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
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';
import { providerService } from '../../services/apiService';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';

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
    
    // Mobile detection
    const isMobile = ref(window.innerWidth <= 767);
    
    // Handle window resize
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 767;
    };
    
    // Handle tab click with mobile scroll to top
    const handleTabClick = (tabId) => {
      activeTab.value = tabId;
      if (isMobile.value) {
        // Scroll to top of mobile layout on mobile
        nextTick(() => {
          const mobileLayout = document.querySelector('.mobile-profile-layout');
          if (mobileLayout) {
            mobileLayout.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Also scroll window to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
    };

    // Tabs configuration
    const tabs = [
      { id: 'personal', name: 'Personal Info', icon: 'fas fa-user' },
      { id: 'experience', name: 'Work Experience', icon: 'fas fa-briefcase' },
      { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap' },
      { id: 'skillsportfolio', name: 'Skills & Portfolio', icon: 'fas fa-tools' },
      { id: 'availability', name: 'Availability', icon: 'fas fa-calendar-alt' },
      { id: 'reviews', name: 'Reviews & Ratings', icon: 'fas fa-star' },
    ];

    // UI state
    const editingPersonal = ref(false);
    const addingExperience = ref(false);
    const addingEducation = ref(false);
    const addingSkill = ref(false);
    const addingDocument = ref(false);
    const addingPortfolio = ref(false);

    // Modal state
    const showEditProfileModal = ref(false);
    const showAddExperienceModal = ref(false);
    const showAddEducationModal = ref(false);
    const showAddSkillModal = ref(false);
    const showAddDocumentModal = ref(false);
    const showAddPortfolioModal = ref(false);
    const showAddAvailabilityModal = ref(false);
    const showEditAvailabilityModal = ref(false);
    const isProcessing = ref(false);

    // Form data
    const personalForm = reactive({
      firstName: '',
      lastName: '',
      phone: '',
      profilePicture: '',
      bio: '',
      headline: ''
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

    const availabilityForm = reactive({
      date: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
      repeatWeekly: false,
      repeatWeeks: 4
    });
    
    // Computed property for week range based on selected date in modal
  const selectedDateWeekRange = computed(() => {
    if (!availabilityForm.date) return '';
    
    const selectedDate = new Date(availabilityForm.date);
    if (isNaN(selectedDate.getTime())) return '';
    
    // Calculate week start (Sunday)
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Calculate week end (Saturday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    };
    
    // If same month and year, simplify format
    if (
      weekStart.getMonth() === weekEnd.getMonth() &&
      weekStart.getFullYear() === weekEnd.getFullYear()
    ) {
      const month = weekStart.toLocaleDateString('en-US', { month: 'long' });
      const year = weekStart.getFullYear();
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      return `${month} ${startDay} – ${endDay}, ${year}`;
    }
    
    return `${formatDate(weekStart)} – ${formatDate(weekEnd)}`;
  });

  // ADD THIS HERE
  const getRepeatPreviewDays = () => {
    if (!availabilityForm.date) return '-';
    const d = new Date(availabilityForm.date);
    return weekDays[d.getDay()].name + "'s";
  };

    // Availability data
    const availabilitySlots = ref([]);
    const currentAvailabilitySlotId = ref(null);
    const currentWeekOffset = ref(0); // Weeks from current week (0 = current week)
    
    // Week days configuration
    const weekDays = [
      { name: 'Sunday', short: 'Sun' },
      { name: 'Monday', short: 'Mon' },
      { name: 'Tuesday', short: 'Tue' },
      { name: 'Wednesday', short: 'Wed' },
      { name: 'Thursday', short: 'Thu' },
      { name: 'Friday', short: 'Fri' },
      { name: 'Saturday', short: 'Sat' }
    ];

    // Reviews data
    const reviews = ref([]);
    const averageRating = ref(0);
    const totalReviews = ref(0);
    const ratingDistribution = ref({});

    // Activity stats
    const activityStats = ref({
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0
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

    const getUserInitials = computed(() => {
      if (profile.value.firstName && profile.value.lastName) {
        return `${profile.value.firstName[0]}${profile.value.lastName[0]}`;
      }
      return '';
    });

    // Week navigation computed properties
    const getCurrentWeekRange = computed(() => {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      currentWeekStart.setHours(0, 0, 0, 0);
      
      // Apply week offset
      currentWeekStart.setDate(currentWeekStart.getDate() + (currentWeekOffset.value * 7));
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of week (Saturday)
      
      const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      };
      
      const startDateStr = formatDate(currentWeekStart);
      const endDateStr = formatDate(currentWeekEnd);
      
      // If same month and year, simplify format
      if (currentWeekStart.getMonth() === currentWeekEnd.getMonth() && 
          currentWeekStart.getFullYear() === currentWeekEnd.getFullYear()) {
        const month = currentWeekStart.toLocaleDateString('en-US', { month: 'long' });
        const year = currentWeekStart.getFullYear();
        const startDay = currentWeekStart.getDate();
        const endDay = currentWeekEnd.getDate();
        return `${month} ${startDay} – ${endDay}, ${year}`;
      }
      
      return `${startDateStr} – ${endDateStr}`;
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
          // hourly rate removed per pricing policy
          
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
      showEditProfileModal.value = true;
    };

    const updatePersonalInfo = async () => {
      try {
        isProcessing.value = true;
        error.value = null;
        
        // Create the update data object from the form
        const updateData = {
          firstName: personalForm.firstName,
          lastName: personalForm.lastName,
          phone: personalForm.phone,
          bio: personalForm.bio,
          headline: personalForm.headline
        };
        
        console.log('Component: Update data to send:', updateData);
        
        const response = await providerService.updateProviderProfile(updateData);
        console.log('Component: Profile update response:', response);

        if (response.success) {
          // Update local data
          profile.value = response.data;
          showEditProfileModal.value = false;
          
          // Emit event to notify Navigation component
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: {
              firstName: personalForm.firstName,
              lastName: personalForm.lastName
            }
          }));
          
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
        console.error('Component: Error updating profile:', err);
        error.value = err.message;
        
        await Swal.fire({
          title: 'Update Failed',
          text: err.message || 'Failed to update profile. Please try again.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    const toggleAddExperience = () => {
      showAddExperienceModal.value = true;
    };

    const addExperience = async () => {
      try {
        isProcessing.value = true;
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
          showAddExperienceModal.value = false;
          // Reset form
          experienceForm.company = '';
          experienceForm.position = '';
          experienceForm.startDate = '';
          experienceForm.endDate = '';
          experienceForm.description = '';
          experienceForm.isCurrentPosition = false;
        } else {
          throw new Error(response.message || 'Failed to add work experience');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    const toggleAddEducation = () => {
      showAddEducationModal.value = true;
    };

    const addEducation = async () => {
      try {
        isProcessing.value = true;
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
          showAddEducationModal.value = false;
          // Reset form
          educationForm.institution = '';
          educationForm.degree = '';
          educationForm.fieldOfStudy = '';
          educationForm.startDate = '';
          educationForm.endDate = '';
          educationForm.isCurrentlyStudying = false;
        } else {
          throw new Error(response.message || 'Failed to add education');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    const toggleAddSkill = () => {
      showAddSkillModal.value = true;
    };

    const addSkill = async () => {
      try {
        isProcessing.value = true;
        const response = await providerService.addSkill({
          skillName: skillForm.skillName
        });

        if (response.success) {
          // Refresh profile data
          await fetchProfileData();
          showAddSkillModal.value = false;
          // Reset form
          skillForm.skillName = '';
        } else {
          throw new Error(response.message || 'Failed to add skill');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    const toggleAddDocument = () => {
      showAddDocumentModal.value = true;
    };

    const addDocument = async () => {
      try {
        isProcessing.value = true;
        
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
          showAddDocumentModal.value = false;
          // Reset form
          documentForm.title = '';
          documentForm.type = 'ID';
        } else {
          throw new Error(response.message || 'Failed to upload document');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    const toggleAddPortfolio = () => {
      showAddPortfolioModal.value = true;
    };

    const addPortfolioItem = async () => {
      try {
        isProcessing.value = true;
        
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
          showAddPortfolioModal.value = false;
          // Reset form
          portfolioForm.title = '';
          portfolioForm.description = '';
          portfolioForm.projectUrl = '';
        } else {
          throw new Error(response.message || 'Failed to add portfolio item');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    // Fetch activity stats
    const fetchActivityStats = async () => {
      try {
        const response = await providerService.getProviderBookings();
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

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
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
    };

    const closeFileModal = () => {
      showFileModal.value = false;
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
        await Swal.fire({
          title: 'Invalid File',
          text: 'Please select an image file',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire({
          title: 'File Too Large',
          text: 'Image must be less than 5MB',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
        return;
      }
      try {
        uploadingProfileImage.value = true;
        error.value = null;
        const response = await apiService.uploadProfilePicture(file);
        if (response.success) {
          profile.value = response.data;
          
          // Emit event to notify Navigation component
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: {
              firstName: profile.value.firstName,
              lastName: profile.value.lastName,
              profilePicture: profile.value.profilePicture
            }
          }));
          
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
        error.value = err.message || 'Failed to upload profile picture';
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

    // Reviews functions
    const fetchReviews = async () => {
      try {
        const response = await providerService.getReviewsReceived();
        if (response.success) {
          reviews.value = response.data.reviews || [];
          averageRating.value = response.data.averageRating || 0;
          totalReviews.value = response.data.totalReviews || 0;
          
          // Calculate rating distribution
          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          reviews.value.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          });
          ratingDistribution.value = distribution;
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    const getRatingPercentage = (rating) => {
      if (totalReviews.value === 0) return 0;
      const count = ratingDistribution.value[rating] || 0;
      return Math.round((count / totalReviews.value) * 100);
    };

    const getRatingCount = (rating) => {
      return ratingDistribution.value[rating] || 0;
    };

    // Availability functions
    const fetchAvailability = async () => {
      try {
        const response = await providerService.getAvailability();
        if (response.success) {
          // Get all availability slots (date-based)
          availabilitySlots.value = [];
          let availabilityData = response.data;
          
          // Handle response format - could be array of slots or nested structure
          if (Array.isArray(availabilityData)) {
            // Direct array of slots
            availabilitySlots.value = availabilityData;
          } else if (availabilityData && availabilityData.slots) {
            // Array of slots in data.slots
            availabilitySlots.value = availabilityData.slots;
          } else if (availabilityData && availabilityData.availabilityByDay) {
            // Legacy format - flatten it (for backward compatibility)
            availabilityData.availabilityByDay.forEach(dayData => {
              if (dayData.slots && Array.isArray(dayData.slots)) {
                dayData.slots.forEach(slot => {
                  availabilitySlots.value.push(slot);
                });
              }
            });
          }
          
          // Ensure all slots have date field
          availabilitySlots.value = availabilitySlots.value.filter(slot => slot.date);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };

    // Get current week date range
    const getCurrentWeekDateRange = computed(() => {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      currentWeekStart.setHours(0, 0, 0, 0);
      
      // Apply week offset
      currentWeekStart.setDate(currentWeekStart.getDate() + (currentWeekOffset.value * 7));
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of week (Saturday)
      currentWeekEnd.setHours(23, 59, 59, 999);
      
      return {
        start: currentWeekStart,
        end: currentWeekEnd
      };
    });

    const getDaySlots = (dayIndex) => {
      // Filter slots that fall within the current week date range
      const weekRange = getCurrentWeekDateRange.value;
      
      return availabilitySlots.value.filter(slot => {
        if (!slot.date) return false;
        
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        
        // Check if slot is within the current week range
        if (slotDate < weekRange.start || slotDate > weekRange.end) {
          return false;
        }
        
        // Check if the slot's day of week matches the requested day
        const slotDayOfWeek = slotDate.getDay();
        return slotDayOfWeek === dayIndex;
      }).sort((a, b) => {
        // Sort by time
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return 0;
      });
    };

    const formatTime = (timeString) => {
      if (!timeString) return '';
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Week navigation functions
    const goToPreviousWeek = () => {
      currentWeekOffset.value--;
    };

    const goToNextWeek = () => {
      currentWeekOffset.value++;
    };

    const goToCurrentWeek = () => {
      currentWeekOffset.value = 0;
    };

    const copyPreviousWeek = async () => {
      // Get the previous week's date range
      const prevWeekOffset = currentWeekOffset.value - 1;
      const now = new Date();
      const prevWeekStart = new Date(now);
      prevWeekStart.setDate(now.getDate() - now.getDay() + (prevWeekOffset * 7));
      prevWeekStart.setHours(0, 0, 0, 0);

      // Get all slots from previous week
      const prevWeekSlots = availabilitySlots.value.filter(slot => {
        if (!slot.date) return false;
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
        prevWeekEnd.setHours(23, 59, 59, 999);
        return slotDate >= prevWeekStart && slotDate <= prevWeekEnd;
      });

      if (prevWeekSlots.length === 0) {
        Swal.fire({
          title: 'No Slots Found',
          text: 'The previous week has no time slots to copy.',
          icon: 'info',
          confirmButtonColor: '#27ae60'
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Copy Previous Week?',
        html: `<p>This will copy <strong>${prevWeekSlots.length} time slot${prevWeekSlots.length > 1 ? 's' : ''}</strong> from last week to the current week.</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, copy them!',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      isProcessing.value = true;
      let successCount = 0;
      let errorCount = 0;

      for (const slot of prevWeekSlots) {
        try {
          // Calculate the corresponding date in the current week
          const slotDate = new Date(slot.date);
          const dayOfWeek = slotDate.getDay();
          const currentWeekStart = new Date(now);
          currentWeekStart.setDate(now.getDate() - now.getDay() + (currentWeekOffset.value * 7));
          currentWeekStart.setHours(0, 0, 0, 0);
          const newDate = new Date(currentWeekStart);
          newDate.setDate(currentWeekStart.getDate() + dayOfWeek);

          // Skip if date is in the past
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (newDate < today) {
            errorCount++;
            continue;
          }

          const dateStr = newDate.toISOString().split('T')[0];
          const response = await providerService.addAvailabilitySlot({
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable
          });
          if (response.success) successCount++;
          else errorCount++;
        } catch (err) {
          errorCount++;
        }
      }

      await fetchAvailability();
      isProcessing.value = false;

      Swal.fire({
        title: successCount > 0 ? 'Slots Copied!' : 'Copy Failed',
        html: `<p>${successCount} slot${successCount !== 1 ? 's' : ''} copied successfully${errorCount > 0 ? `, ${errorCount} skipped (past dates or conflicts)` : ''}.</p>`,
        icon: successCount > 0 ? 'success' : 'error',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    };

    const toggleAddAvailability = () => {
      availabilityForm.date = new Date().toISOString().split('T')[0];
      availabilityForm.startTime = '';
      availabilityForm.endTime = '';
      availabilityForm.isAvailable = true;
      availabilityForm.repeatWeekly = false;
      availabilityForm.repeatWeeks = 4;
      currentAvailabilitySlotId.value = null;
      showAddAvailabilityModal.value = true;
    };

    const editAvailabilitySlot = (slot) => {
      currentAvailabilitySlotId.value = slot.id;
      // Convert date to YYYY-MM-DD format for date input
      if (slot.date) {
        const slotDate = new Date(slot.date);
        availabilityForm.date = slotDate.toISOString().split('T')[0];
      } else {
        // Fallback: if no date, use today (shouldn't happen with new schema)
        availabilityForm.date = new Date().toISOString().split('T')[0];
      }
      availabilityForm.startTime = slot.startTime;
      availabilityForm.endTime = slot.endTime;
      availabilityForm.isAvailable = slot.isAvailable !== false;
      showAddAvailabilityModal.value = false; // Close add modal if open
      showEditAvailabilityModal.value = true;
    };

    const closeAvailabilityModal = () => {
      showAddAvailabilityModal.value = false;
      showEditAvailabilityModal.value = false;
      availabilityForm.date = '';
      availabilityForm.startTime = '';
      availabilityForm.endTime = '';
      availabilityForm.isAvailable = true;
      currentAvailabilitySlotId.value = null;
    };

    const saveAvailabilitySlot = async () => {
      try {
        isProcessing.value = true;
        error.value = null;

        // Validate date input
        if (!availabilityForm.date) {
          Swal.fire({
            title: 'Validation Error',
            text: 'Please select a date',
            icon: 'error',
            confirmButtonColor: '#27ae60'
          });
          isProcessing.value = false;
          return;
        }

        // Validate time inputs
        if (!availabilityForm.startTime || !availabilityForm.endTime) {
          Swal.fire({
            title: 'Validation Error',
            text: 'Please select both start and end times',
            icon: 'error',
            confirmButtonColor: '#27ae60'
          });
          isProcessing.value = false;
          return;
        }

        // Validate that end time is after start time
        if (availabilityForm.startTime >= availabilityForm.endTime) {
          Swal.fire({
            title: 'Validation Error',
            text: 'End time must be after start time',
            icon: 'error',
            confirmButtonColor: '#27ae60'
          });
          isProcessing.value = false;
          return;
        }

        const slotData = {
          date: availabilityForm.date,
          startTime: availabilityForm.startTime,
          endTime: availabilityForm.endTime,
          isAvailable: availabilityForm.isAvailable
        };

        const isEdit = showEditAvailabilityModal.value && currentAvailabilitySlotId.value;
        const shouldRepeat = !isEdit && availabilityForm.repeatWeekly;
        const weeksToCreate = shouldRepeat ? availabilityForm.repeatWeeks : 1;

        let response;
        let successCount = 0;
        let errorMessages = [];

        if (isEdit) {
          response = await providerService.updateAvailabilitySlot(currentAvailabilitySlotId.value, slotData);
          if (response.success) successCount = 1;
          else throw new Error(response.message || 'Failed to update availability slot');
        } else {
          // Loop to create slots for each week
          const baseDate = new Date(slotData.date);
          for (let i = 0; i < weeksToCreate; i++) {
            const loopDate = new Date(baseDate);
            loopDate.setDate(baseDate.getDate() + (i * 7));
            const dateStr = loopDate.toISOString().split('T')[0];
            try {
              const r = await providerService.addAvailabilitySlot({
                ...slotData,
                date: dateStr
              });
              if (r.success) successCount++;
              else errorMessages.push(`Week ${i + 1}: ${r.message}`);
            } catch (err) {
              errorMessages.push(`Week ${i + 1}: ${err.message}`);
            }
          }
          if (successCount === 0) throw new Error(errorMessages[0] || 'Failed to add availability slot');
        }

        await fetchAvailability();
        closeAvailabilityModal();

        const slotDate = new Date(slotData.date);
        const dayName = weekDays[slotDate.getDay()].name;
        const dateStr = slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeRange = `${formatTime(slotData.startTime)} - ${formatTime(slotData.endTime)}`;

        const titleMsg = isEdit ? 'Time Slot Updated!' : 
          (shouldRepeat ? `${successCount} Slots Added!` : 'Time Slot Added!');
        const bodyMsg = isEdit ? `${dayName}, ${dateStr}: ${timeRange}` :
          (shouldRepeat 
            ? `${dayName} ${timeRange} added for ${successCount} week${successCount !== 1 ? 's' : ''}${errorMessages.length > 0 ? ` (${errorMessages.length} skipped)` : ''}`
            : `${dayName}, ${dateStr}: ${timeRange}`);

        Swal.fire({
          title: titleMsg,
          html: `<p>${bodyMsg}</p>`,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'An error occurred while saving the time slot',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    const deleteAvailabilitySlot = async (slotId) => {
      // Find the slot to get its details for the confirmation message
      const slot = availabilitySlots.value.find(s => s.id === slotId);
      let dayName = 'this day';
      let dateStr = '';
      let timeRange = '';
      
      if (slot) {
        if (slot.date) {
          const slotDate = new Date(slot.date);
          dayName = weekDays[slotDate.getDay()].name;
          dateStr = slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else if (slot.dayOfWeek !== undefined) {
          // Legacy support
          dayName = weekDays[slot.dayOfWeek]?.name || 'this day';
        }
        timeRange = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
      }

      const result = await Swal.fire({
        title: 'Delete Time Slot?',
        html: `<p>Are you sure you want to delete the time slot for <strong>${dayName}${dateStr ? `, ${dateStr}` : ''}</strong>${timeRange ? ` (${timeRange})` : ''}?</p><p class="swal-warning">This action cannot be undone.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        isProcessing.value = true;
        const response = await providerService.deleteAvailabilitySlot(slotId);
        
        if (response.success) {
          await fetchAvailability();
          
          // Show success notification
          Swal.fire({
            title: 'Deleted!',
            text: 'Time slot has been deleted successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          throw new Error(response.message || 'Failed to delete availability slot');
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'An error occurred while deleting the time slot',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
        error.value = err.message;
      } finally {
        isProcessing.value = false;
      }
    };

    // Watch for modal state changes to manage body scroll
    const anyModalOpen = computed(() => {
      return showEditProfileModal.value || 
             showAddExperienceModal.value || 
             showAddEducationModal.value || 
             showAddSkillModal.value || 
             showAddDocumentModal.value || 
             showAddPortfolioModal.value || 
             showAddAvailabilityModal.value || 
             showEditAvailabilityModal.value ||
             showFileModal.value;
    });

    watch(anyModalOpen, (isOpen) => {
      if (isOpen) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
      } else {
        // Restore body scroll when modal is closed
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }
    });

    onMounted(() => {
      fetchProfileData();
      fetchReviews();
      fetchAvailability();
      fetchActivityStats();
      // If navigated with ?tab=reviews, focus Reviews tab
      try {
        const url = new URL(window.location.href);
        const tabQuery = url.searchParams.get('tab');
        if (tabQuery === 'reviews') {
          activeTab.value = 'reviews';
        }
        } catch (_) {
          console.debug('ProviderProfile: unable to parse URL for tab query');
        }
      // Use nextTick to ensure DOM is ready
      nextTick(() => {
        const tabBar = document.querySelector('.profile-tabs');
        if (tabBar) {
          tabBar.scrollLeft = 0;
        }
      });
      
      // Add resize listener for mobile detection
      window.addEventListener('resize', handleResize);
    });
    
    onBeforeUnmount(() => {
      // Clean up resize listener
      window.removeEventListener('resize', handleResize);
      // Ensure body scroll is restored
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    });

    return {
      profile,
      loading,
      error,
      verificationStatus,
      activeTab,
      tabs,
      isMobile,
      handleTabClick,
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
      profileImageInput,
      showEditProfileModal,
      showAddExperienceModal,
      showAddEducationModal,
      showAddSkillModal,
      showAddDocumentModal,
      showAddPortfolioModal,
      showAddAvailabilityModal,
      showEditAvailabilityModal,
      isProcessing,
      availabilitySlots,
      weekDays,
      availabilityForm,
      getDaySlots,
      formatTime,
      toggleAddAvailability,
      editAvailabilitySlot,
      closeAvailabilityModal,
      saveAvailabilitySlot,
      deleteAvailabilitySlot,
      reviews,
      averageRating,
      totalReviews,
      ratingDistribution,
      fetchReviews,
      getRatingPercentage,
      getRatingCount,
      activityStats,
      getUserInitials,
      currentWeekOffset,
      getCurrentWeekRange,
      goToPreviousWeek,
      goToNextWeek,
      goToCurrentWeek,
      copyPreviousWeek,
      selectedDateWeekRange,
      getRepeatPreviewDays,
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.provider-profile {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f7f9fc;
  min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
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

.profile-picture-container.large {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0;
  position: relative;
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

.profile-initials {
  font-size: 32px;
  font-weight: bold;
  color: #555;
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

/* Hide h1 in banner since it's now in banner-content */
.profile-main-content > h1 {
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
  scroll-behavior: smooth; /* Smooth scrolling */
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

.profile-picture-container.large {
  width: 180px;
  height: 180px;
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

.experience-item, .education-item, .portfolio-item {
  padding: 30px;
  background: white;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  min-width: 320px;
  min-height: 180px;
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

.week-range-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e8f5e9, #f1f8f4);
  border-radius: 10px;
  border: 1px solid #c8e6c9;
  margin-bottom: 20px;
  color: #2d3748;
  font-weight: 500;
}

.week-range-info i {
  color: #27ae60;
  font-size: 1.1rem;
}

.week-range-info span {
  font-size: 0.95rem;
}

/* Modal Styles */
.file-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100dvh;
  height: 100vh; /* Fallback for older browsers */
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Prevent body scroll when modal is open */
  pointer-events: none;
}

.file-modal .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 99998;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  animation: fadeIn 0.2s ease;
  pointer-events: auto;
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
  z-index: 10000;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px;
  box-sizing: border-box;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90dvh;
  max-height: 90vh; /* Fallback for older browsers */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.3s ease-out;
  position: relative;
  z-index: 10001;
  margin: auto;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #27ae60;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
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

/* File Modal Specific Styles */
.file-modal .modal-container {
  background-color: white;
  border-radius: 20px;
  max-width: 90%;
  width: 900px;
  max-height: 90dvh;
  max-height: 90vh; /* Fallback for older browsers */
  z-index: 99999;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #e2e8f0;
  position: relative;
  pointer-events: auto;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.file-modal .modal-content {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  min-height: 0;
  position: relative;
  z-index: 1;
  filter: none !important;
  -webkit-filter: none !important;
  transform: none !important;
  will-change: auto;
  backface-visibility: visible;
  -webkit-font-smoothing: antialiased;
}

.file-modal .modal-image {
  max-width: 100%;
  max-height: 70dvh;
  max-height: 70vh; /* Fallback */
  width: auto;
  height: auto;
  object-fit: contain;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  border-radius: 12px;
  border: 3px solid white;
  transition: transform 0.3s ease;
  display: block;
  margin: 0 auto;
  filter: none !important;
  -webkit-filter: none !important;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.modal-image:hover {
  transform: scale(1.02);
}

.file-modal .modal-document {
  width: 100%;
  height: 70dvh;
  height: 70vh; /* Fallback */
  border: none;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  display: block;
}

.file-modal .modal-file-info {
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
  position: relative;
  z-index: 1;
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

/* Reviews & Ratings Styles */
.rating-summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overall-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.rating-display {
  text-align: center;
}

.rating-number {
  font-size: 3rem;
  font-weight: 700;
  color: #f39c12;
  line-height: 1;
}

.rating-stars {
  margin: 0.5rem 0;
}

.rating-stars i {
  color: #f39c12;
  font-size: 1.5rem;
  margin: 0 2px;
}

.rating-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.rating-distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.star-label {
  min-width: 30px;
  font-weight: 600;
  color: #333;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f39c12, #e67e22);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.count {
  min-width: 30px;
  text-align: right;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.reviews-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reviews-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-avatar.placeholder {
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.review-date {
  font-size: 0.8rem;
  color: #666;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-rating i {
  color: #f39c12;
  font-size: 0.9rem;
}

.review-comment {
  color: #555;
  line-height: 1.5;
  margin-top: 0.5rem;
}

.review-images {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.review-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: border-color 0.2s ease;
}

.review-image:hover {
  border-color: #f39c12;
}

.review-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  .provider-profile {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: auto;
    min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  }

  .profile-layout {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: auto;
  }
  
  /* Reorder: Banner first, then tabs, then sidebar, then rest of content */
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
  
  /* Tabs appear after banner */
  .profile-layout > .profile-tabs,
  .profile-main-content > .profile-tabs {
    order: 2 !important;
  }
  
  /* Sidebar appears after tabs */
  .profile-sidebar {
    order: 3 !important;
    width: 100%;
  }
  
  /* Tab content appears after sidebar */
  .profile-layout > .tab-content,
  .profile-layout > .section,
  .profile-main-content > .tab-content,
  .profile-main-content > .section {
    order: 4 !important;
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

@media (max-width: 600px) {
  .experience-list,
  .education-list,
  .portfolio-grid {
    display: flex !important;
    flex-direction: column;
    align-items: center;
  }
  .experience-item,
  .education-item,
  .portfolio-item {
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
  .profile-tabs {
    justify-content: flex-start !important;
    scroll-padding-left: 10px;
    scroll-snap-type: x mandatory; /* Snap to tabs */
  }
  
  .tab {
    scroll-snap-align: start; /* Snap alignment */
  }
  
  /* Mobile styles for reviews */
  .rating-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .overall-rating {
    min-width: auto;
  }
  
  .rating-number {
    font-size: 2.5rem;
  }
  
  .rating-stars i {
    font-size: 1.2rem;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .review-rating {
    align-self: flex-end;
  }
  
  .provider-profile {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: auto;
    min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  }

  .profile-layout {
    padding: 15px;
    gap: 15px;
    display: flex;
    flex-direction: column;
    min-height: auto;
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
  
  .profile-banner-enhanced {
    min-height: 140px;
    padding: 30px 20px;
  }

  .profile-main-content {
    overflow: visible;
    min-height: auto;
  }
}

/* Availability Schedule Styles */
.availability-description {
  color: #666;
  margin-bottom: 2rem;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #27ae60;
  line-height: 1.6;
}

.week-navigation {
  margin-bottom: 2rem;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.week-navigation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.week-range-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #e8f5e9, #f1f8f4);
  border-radius: 12px;
  border: 1px solid #c8e6c9;
  flex: 1;
  min-width: 250px;
  justify-content: center;
}

.week-range-display i {
  color: #27ae60;
  font-size: 1.2rem;
}

.week-range-display span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.week-nav-btn {
  padding: 12px 20px;
  background: white;
  border: 2px solid #27ae60;
  border-radius: 12px;
  color: #27ae60;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  white-space: nowrap;
}

.week-nav-btn:hover {
  background: #27ae60;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
}

.week-nav-btn i {
  font-size: 0.9rem;
}

.current-week-btn {
  margin-top: 15px;
  width: 100%;
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.current-week-btn:hover {
  background: #e9ecef;
  border-color: #27ae60;
  color: #27ae60;
  transform: translateY(-1px);
}

.current-week-btn i {
  font-size: 0.85rem;
}

.availability-schedule {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.day-schedule {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.day-schedule:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.day-header h3 {
  margin: 0;
  color: #27ae60;
  font-size: 1.2rem;
  font-weight: 600;
}

.slot-count {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.no-slots {
  color: #999;
  font-size: 0.9rem;
  font-style: italic;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.time-slot-item:hover {
  background: #f0f0f0;
  border-color: #27ae60;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.slot-time i {
  color: #27ae60;
  font-size: 1rem;
}

.slot-time span:not(.unavailable-badge) {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.unavailable-badge {
  background: #ffebee;
  color: #c62828;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8px;
}

.slot-actions {
  display: flex;
  gap: 8px;
}

.edit-slot-btn, .delete-slot-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.edit-slot-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.edit-slot-btn:hover {
  background: #bbdefb;
  transform: translateY(-1px);
}

.delete-slot-btn {
  background: #ffebee;
  color: #c62828;
}

.delete-slot-btn:hover {
  background: #ffcdd2;
  transform: translateY(-1px);
}

.no-slots-message {
  text-align: center;
  padding: 30px 20px;
  color: #999;
}

.no-slots-message i {
  font-size: 2.5rem;
  color: #ddd;
  margin-bottom: 10px;
  display: block;
}

.no-slots-message p {
  margin: 0;
  font-size: 0.9rem;
  font-style: italic;
}

/* Mobile Layout - Completely Separate from Desktop */
.mobile-profile-layout {
  position: static;
  margin: 0;
  padding: 0;
  min-height: 100dvh;
  min-height: 100vh; /* Fallback for older browsers */
  width: 100%;
  background: white;
  padding-bottom: 60px; /* Space for bottom navigation */
  box-sizing: border-box;
}

.mobile-profile-tabs {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #f7f9fc;
  padding: 10px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mobile-profile-tabs::-webkit-scrollbar {
  display: none;
}

.mobile-tab {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
  border-radius: 12px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  color: #4a5568;
  font-size: 0.9rem;
  border: 1px solid #e2e8f0;
}

.mobile-tab:hover {
  background-color: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.mobile-tab.active {
  background: #27ae60;
  color: white;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(39, 174, 96, 0.15);
  transform: translateY(-2px);
  border-color: #27ae60;
}

.mobile-tab i {
  font-size: 16px;
  color: #718096;
}

.mobile-tab.active i {
  color: white;
}

.mobile-section {
  position: static;
  margin: 0;
  padding: 20px;
  min-height: auto;
  height: auto;
  background: white;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.mobile-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #4a5568;
  font-weight: 700;
  font-size: 1.8rem;
}

.mobile-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.mobile-section .section-header h2 {
  margin: 0;
}

/* Mobile Profile Info Card */
.mobile-profile-info-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  text-align: center;
}

.mobile-profile-info-card .profile-picture-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mobile-profile-info-card .profile-info-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-profile-info-card .profile-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mobile-profile-info-card .profile-role {
  color: #718096;
  font-size: 0.9rem;
}

.mobile-profile-info-card .profile-stats-mini {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
}

.mobile-profile-info-card .profile-contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.mobile-profile-info-card .contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #4a5568;
}

.mobile-profile-info-card .edit-profile-btn-sidebar {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #27ae60, #219d55);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.mobile-profile-info-card .edit-profile-btn-sidebar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

/* Mobile Activity Summary */
.mobile-activity-summary {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.mobile-activity-summary .activity-summary {
  margin: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.mobile-activity-summary .activity-summary h4 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.mobile-activity-summary .activity-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-activity-summary .activity-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f7f9fc;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.mobile-activity-summary .activity-card:hover {
  background: #edf2f7;
  transform: translateX(5px);
}

.mobile-activity-summary .activity-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.mobile-activity-summary .activity-content {
  flex: 1;
}

.mobile-activity-summary .activity-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.mobile-activity-summary .activity-label {
  font-size: 0.85rem;
  color: #718096;
}

/* Personal Info Section spacing */
.personal-info-section {
  margin-top: 20px;
}

.personal-info-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

@media (max-width: 767px) {
  .provider-profile {
    margin: 0;
    padding: 0;
    min-height: 100dvh;
    min-height: 100vh; /* Fallback for older browsers */
    background: white;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }
  
  /* Hide desktop layout on mobile */
  .profile-layout {
    display: none !important;
  }
  
  /* Ensure mobile layout stretches full height */
  .mobile-profile-layout {
    min-height: 100dvh;
    min-height: 100vh; /* Fallback for older browsers */
    background: white;
    padding-bottom: 60px; /* Space for bottom navigation */
  }
  
  /* Remove any fixed heights that prevent stretching */
  .mobile-section {
    min-height: auto !important;
    height: auto !important;
  }
  
  /* Ensure smooth scrolling */
  .provider-profile,
  .mobile-profile-layout {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Modal fixes for mobile */
  .modal-overlay {
    z-index: 10000 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    padding: 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex !important;
    align-items: flex-start;
    padding-top: 20px;
  }
  
  .modal {
    z-index: 10001 !important;
    position: relative !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto;
    max-height: calc(100dvh - 40px);
    max-height: calc(100vh - 40px); /* Fallback */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  
  .modal-body {
    overflow-y: visible;
    max-height: none;
  }
  
  /* Ensure parent containers don't clip modals */
  .provider-profile,
  .mobile-profile-layout,
  .mobile-section {
    overflow: visible !important;
  }
  
  /* Prevent body scroll when modal is open */
  body.modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
  }
}

/* Outside any media query - default show/hide */
.copy-btn-text-short {
  display: none;
}

.btn-text-short {
  display: none;
}

@media (max-width: 768px) {
  .availability-schedule {
    grid-template-columns: 1fr;
  }
  
  .time-slot-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .slot-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .week-navigation {
    padding: 12px;
  }

  .week-navigation-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .week-nav-btn {
    flex-shrink: 0;
    padding: 8px 10px;
    font-size: 0.78rem;
    white-space: nowrap;
    width: auto;
    justify-content: center;
  }

  .week-range-display {
    flex: 1;
    min-width: 0;
    padding: 8px 4px;
    justify-content: center;
  }

  .week-range-display span {
    font-size: 0.72rem;
    text-align: center;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .week-range-display i {
    display: none;
  }

  .week-nav-actions {
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 8px;
    flex-wrap: nowrap;
    width: 100%;
  }

  .current-week-btn {
    padding: 8px 12px;
    font-size: 0.75rem;
    flex: 1;
    margin-top: 0;
    white-space: nowrap;
    text-align: center;
    justify-content: center;
  }

  .copy-week-btn {
    padding: 8px 10px;
    font-size: 0.72rem;
    flex: 1;
    gap: 4px;
  }

  .copy-week-btn i {
    font-size: 0.7rem;
  }

  /* Show short text, hide full text on mobile */
  .copy-btn-text-full {
    display: none;
  }

  .copy-btn-text-short {
    display: inline;
  }

  .btn-text-full {
    display: none;
  }

  .btn-text-short {
    display: inline;
  }
}


/* SweetAlert2 custom styles */
:deep(.swal-warning) {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 10px;
  font-weight: 500;
}
/* Repeat Weekly Feature */
.repeat-weekly-group {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 5px;
}

.repeat-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.repeat-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #166534;
  margin-bottom: 0;
}

.repeat-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #27ae60;
  cursor: pointer;
}

.repeat-label-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
}

.repeat-label-text i {
  color: #27ae60;
}

.repeat-weeks-selector {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #bbf7d0;
}

.repeat-weeks-selector label {
  display: block;
  font-weight: 600;
  color: #166534;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.weeks-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.week-opt-btn {
  padding: 8px 18px;
  border: 2px solid #27ae60;
  border-radius: 10px;
  background: white;
  color: #27ae60;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.week-opt-btn:hover {
  background: #f0fdf4;
  transform: translateY(-1px);
}

.week-opt-btn.active {
  background: #27ae60;
  color: white;
  box-shadow: 0 4px 10px rgba(39, 174, 96, 0.25);
}

.repeat-preview {
  display: block;
  margin-top: 6px;
  color: #166534;
  font-size: 0.85rem;
  background: #dcfce7;
  padding: 6px 10px;
  border-radius: 6px;
}

/* Copy Week Button */
.week-nav-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.copy-week-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #e8f5e9, #f1f8f4);
  border: 2px solid #27ae60;
  border-radius: 10px;
  color: #27ae60;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
  width: auto;
  flex: none;
}

.copy-week-btn:hover:not(:disabled) {
  background: #27ae60;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.25);
}

.copy-week-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-week-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
  width: auto;
  flex: none;
  margin-top: 0;
}

.current-week-btn:hover {
  background: #e9ecef;
  border-color: #27ae60;
  color: #27ae60;
  transform: translateY(-1px);
}
</style>
