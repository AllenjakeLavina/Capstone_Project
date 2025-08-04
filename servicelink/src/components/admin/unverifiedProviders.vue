<template>
  <div class="provider-services-container">
    <div class="provider-services">
      <div class="page-header">
        <h2 class="page-title">Providers Awaiting Verification</h2>
        <button class="refresh-btn" @click="fetchProviders" :disabled="loading">
          <i class="fa fa-refresh" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </button>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="providers.length === 0">No providers found</div>
        <table v-else class="providers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Documents</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="provider in providers" :key="provider.id">
              <td>{{ provider.user.firstName }} {{ provider.user.lastName }}</td>
              <td>{{ provider.user.email }}</td>
              <td>{{ provider.user.phone || 'Not provided' }}</td>
              <td>{{ provider.documents ? provider.documents.length : 0 }} document(s)</td>
              <td>
                <div class="action-buttons">
                  <button class="view-profile-btn" @click="openProfileModal(provider)">View Profile</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Provider Profile Modal -->
  <div v-if="showModal" class="profile-modal-overlay">
    <div class="profile-modal-container">
      <button class="close-modal-btn" @click="closeModal">&times;</button>
      <div v-if="selectedProvider" class="modal-profile-content">
        <div class="modal-profile-top">
          <div class="modal-profile-avatar">
            <img v-if="selectedProvider.profilePicture" :src="getFileUrl(selectedProvider.profilePicture)" alt="Profile Picture" />
            <div v-else class="modal-placeholder-img"><i class="fas fa-user"></i></div>
          </div>
          <div class="modal-profile-name-email">
            <h2>{{ selectedProvider.user.firstName }} {{ selectedProvider.user.lastName }}</h2>
            <div class="modal-profile-email">{{ selectedProvider.user.email }}</div>
          </div>
        </div>
        <div class="modal-section-card">
          <h3><i class="fas fa-id-card"></i> Personal Information</h3>
          <div class="modal-profile-details-grid">
            <div><span class="modal-label">Phone:</span> {{ selectedProvider.user.phone || 'Not provided' }}</div>
            <div><span class="modal-label">Headline:</span> {{ selectedProvider.headline || '—' }}</div>
            <div><span class="modal-label">Hourly Rate:</span> ${{ selectedProvider.hourlyRate || 0 }}/hr</div>
            <div class="modal-bio"><span class="modal-label">Bio:</span> {{ selectedProvider.bio || '—' }}</div>
          </div>
        </div>
        <div class="modal-section-card">
          <h3><i class="fas fa-file-alt"></i> Documents</h3>
          <div v-if="uniqueDocs.length" class="modal-docs-grid">
            <div v-for="doc in uniqueDocs" :key="doc.id" class="modal-doc-item">
              <template v-if="isImage(doc.fileUrl)">
                <img :src="getFileUrl(doc.fileUrl)" :alt="doc.title || 'Document'" class="modal-doc-img" @click="openFullscreenImg(getFileUrl(doc.fileUrl))" style="cursor:pointer;" />
                <div class="modal-doc-caption">{{ doc.title || doc.fileUrl }}</div>
              </template>
              <template v-else>
                <a :href="getFileUrl(doc.fileUrl)" target="_blank" class="modal-doc-link">{{ doc.title || doc.fileUrl }}</a>
              </template>
            </div>
          </div>
          <div v-else class="modal-no-data">No documents uploaded</div>
        </div>
        <div class="modal-section-card">
          <h3><i class="fas fa-tools"></i> Skills</h3>
          <div v-if="selectedProvider.skills?.length" class="modal-skills-list">
            <span v-for="skill in selectedProvider.skills" :key="skill.id" class="modal-skill-tag">{{ skill.name }}</span>
          </div>
          <div v-else class="modal-no-data">No skills listed</div>
        </div>
        <div class="profile-modal-actions">
          <button class="verify-btn" @click="verifyProvider(selectedProvider.id)" :disabled="actionLoading === selectedProvider.id">
            <span v-if="actionLoading === selectedProvider.id">
              <i class="fa fa-spinner fa-spin"></i> Processing...
            </span>
            <span v-else>
              ✔️ Verify Provider
            </span>
          </button>
          <button class="reject-btn" @click="rejectProvider(selectedProvider.id)" :disabled="actionLoading === selectedProvider.id">
            <span v-if="actionLoading === selectedProvider.id">
              <i class="fa fa-spinner fa-spin"></i> Processing...
            </span>
            <span v-else>
              ❌ Reject
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Fullscreen Image Overlay -->
  <div v-if="fullscreenImg" class="fullscreen-img-overlay" @click.self="closeFullscreenImg">
    <img :src="fullscreenImg" class="fullscreen-img" />
    <button class="fullscreen-img-close" @click="closeFullscreenImg">&times;</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5500/api';
const FILE_SERVER_URL = 'http://localhost:5500';
const providers = ref([]);
const loading = ref(true);
const error = ref('');
const actionLoading = ref('');

const showModal = ref(false);
const selectedProvider = ref(null);

// Fullscreen image viewer
const fullscreenImg = ref(null);
function openFullscreenImg(url) {
  fullscreenImg.value = url;
}
function closeFullscreenImg() {
  fullscreenImg.value = null;
}

// Filter unique documents by id
const uniqueDocs = computed(() =>
  selectedProvider.value?.documents
    ? Array.from(new Map(selectedProvider.value.documents.map(doc => [doc.id, doc])).values())
    : []
);

const fetchProviders = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Not authenticated';
      loading.value = false;
      return;
    }
    const res = await fetch(`${API_BASE_URL}/admin/providers/unverified`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      providers.value = data.data;
    } else {
      error.value = data.message || 'Failed to load providers';
    }
  } catch (e) {
    error.value = 'Failed to load providers';
  } finally {
    loading.value = false;
  }
};

function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function getFileUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return FILE_SERVER_URL + path;
}

function openProfileModal(provider) {
  selectedProvider.value = provider;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedProvider.value = null;
}

const verifyProvider = async (id) => {
  const result = await Swal.fire({
    title: 'Verify Provider',
    text: 'Are you sure you want to verify this provider?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2ecc71',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Yes, verify',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;
  
  actionLoading.value = id;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/admin/providers/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ providerId: id })
    });
    const data = await res.json();
    if (data.success) {
      providers.value = providers.value.filter(p => p.id !== id);
      closeModal(); // Close the modal after successful verification
      
      Swal.fire({
        title: 'Success!',
        text: 'Provider verified successfully',
        icon: 'success',
        confirmButtonColor: '#2ecc71',
        timer: 2000
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: data.message || 'Failed to verify provider',
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
    }
  } catch (e) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to verify provider. Please try again.',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
  } finally {
    actionLoading.value = '';
  }
};

const rejectProvider = async (id) => {
  const { value: reason, isConfirmed } = await Swal.fire({
    title: 'Reject Provider',
    text: 'Please provide a reason for rejection:',
    input: 'textarea',
    inputPlaceholder: 'Enter rejection reason...',
    inputValidator: (value) => {
      if (!value || value.trim().length < 10) {
        return 'Please provide a detailed reason (at least 10 characters)';
      }
    },
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Reject',
    cancelButtonText: 'Cancel'
  });

  if (!isConfirmed || !reason) return;
  
  actionLoading.value = id;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/admin/providers/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ providerId: id, reason })
    });
    const data = await res.json();
    if (data.success) {
      providers.value = providers.value.filter(p => p.id !== id);
      closeModal(); // Close the modal after successful rejection
      
      Swal.fire({
        title: 'Success!',
        text: 'Provider rejection sent successfully',
        icon: 'success',
        confirmButtonColor: '#2ecc71',
        timer: 2000
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: data.message || 'Failed to reject provider',
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
    }
  } catch (e) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to reject provider. Please try again.',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
  } finally {
    actionLoading.value = '';
  }
};

// Prevent background scroll when fullscreen image is open
watch(fullscreenImg, (val) => {
  if (val) {
    document.body.classList.add('fullscreen-img-open');
  } else {
    document.body.classList.remove('fullscreen-img-open');
  }
});

onMounted(fetchProviders);
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
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 2px;
}

/* Responsive table and modal */
.providers-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  margin-top: 18px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
}

.providers-table th, .providers-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #ececec;
  text-align: left;
  font-size: 1rem;
}

.providers-table th {
  background: #f8f9fa;
  font-weight: 700;
  color: #1976d2;
  border-bottom: 2px solid #ececec;
}

.providers-table tr:last-child td {
  border-bottom: none;
}

.providers-table tr:hover {
  background: #f4f8f6;
}

/* Action button styling */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.view-profile-btn {
  background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(46,204,113,0.10);
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, transform 0.13s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-profile-btn:hover {
  background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
  box-shadow: 0 4px 16px rgba(39,174,96,0.13);
  transform: translateY(-1px) scale(1.02);
}

.refresh-btn {
  background-color: #4299e1;
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(66, 153, 225, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.refresh-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  color: #e2e8f0;
}

.loading {
  padding: 40px 0;
  text-align: center;
  color: #888;
}

.error {
  color: #e74c3c;
  background: #fff5f5;
  border-radius: 8px;
  padding: 18px 0;
  text-align: center;
  margin-bottom: 18px;
  font-weight: 500;
  border-left: 5px solid #e74c3c;
}

/* Modal Styles */
.profile-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-modal-container {
  background: #fff;
  border-radius: 18px;
  max-width: 700px;
  width: 95vw;
  max-height: 92vh;
  overflow-y: auto;
  padding: 0 0 32px 0;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border: 1.5px solid #e0e0e0;
}

.close-modal-btn {
  position: absolute;
  top: 18px;
  right: 28px;
  font-size: 2.2rem;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s;
}

.close-modal-btn:hover { 
  color: #e74c3c; 
}

.modal-profile-content {
  padding: 0 32px;
  margin-top: 32px;
}

.modal-profile-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}

.modal-profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  background: #e0e0e0;
  box-shadow: 0 2px 12px rgba(39,174,96,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.modal-profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.modal-placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2rem;
  color: #aaa;
}

.modal-profile-name-email h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #222;
  text-align: center;
}

.modal-profile-email {
  color: #27ae60;
  font-size: 1.05rem;
  text-align: center;
  margin-bottom: 2px;
}

.modal-section-card {
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(39,174,96,0.04);
  padding: 22px 22px 12px 22px;
  margin-bottom: 18px;
  border: 1px solid #e0e0e0;
}

.modal-section-card h3 {
  margin: 0 0 16px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #27ae60;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-profile-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
  margin-bottom: 8px;
}

.modal-label {
  color: #888;
  font-weight: 600;
  margin-right: 4px;
}

.modal-bio {
  grid-column: 1 / -1;
  color: #444;
  margin-top: 4px;
}

.modal-docs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.modal-doc-item {
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.06);
  padding: 10px 8px 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  max-width: 120px;
  border: 1px solid #ececec;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
}

.modal-doc-img {
  max-width: 70px;
  max-height: 60px;
  border-radius: 6px;
  margin-bottom: 4px;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.06);
}

.modal-doc-caption {
  font-size: 0.95rem;
  color: #555;
  margin-top: 2px;
  text-align: center;
  word-break: break-all;
  font-weight: 500;
}

.modal-doc-link {
  color: #1976d2;
  text-decoration: underline;
  font-size: 0.97rem;
  word-break: break-all;
  margin-top: 4px;
  font-weight: 500;
}

.modal-no-data {
  color: #888;
  font-style: italic;
  margin: 8px 0;
  padding-left: 2px;
}

.modal-skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.modal-skill-tag {
  display: inline-block;
  background: #e8f5e9;
  color: #27ae60;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(39,174,96,0.07);
  border: 1px solid #b2dfdb;
}

.profile-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
  width: 100%;
}

.verify-btn, .reject-btn {
  padding: 12px 28px;
  border-radius: 24px;
  font-size: 1.08rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, transform 0.13s;
  box-shadow: 0 2px 8px rgba(25,118,210,0.10);
}

.verify-btn {
  background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
  color: #fff;
}

.verify-btn:hover {
  background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
  box-shadow: 0 4px 16px rgba(39,174,96,0.13);
  transform: translateY(-2px) scale(1.04);
}

.reject-btn {
  background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
  color: #fff;
}

.reject-btn:hover {
  background: linear-gradient(90deg, #c0392b 0%, #e74c3c 100%);
  box-shadow: 0 4px 16px rgba(231,76,60,0.13);
  transform: translateY(-2px) scale(1.04);
}

@media (max-width: 900px) {
  .providers-table {
    max-width: 99vw;
    padding: 0 2vw;
  }
  .providers-table th,
  .providers-table td {
    padding: 10px 10px;
  }
}

@media (max-width: 600px) {
  .providers-table {
    max-width: 98vw;
    padding: 0 2vw;
  }
  .providers-table th,
  .providers-table td {
    padding: 8px 8px;
  }
  .providers-table tr {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-height: 60px;
    gap: 8px;
  }
  .providers-table th {
    display: none;
  }
  .providers-table td {
    text-align: left;
    border-bottom: 1px solid #e3e9f0;
  }
  .providers-table td:last-child {
    border-bottom: none;
  }
  .providers-table tr:hover {
    background-color: #f1f3f5;
  }
  .profile-modal-actions {
    flex-direction: column;
    gap: 10px;
  }
}

/* Remove old glass/gradient styles */
.glass-card, .modern-modal-bg, .modern-fade-in, .profile-accent-bar-modern {
  background: none !important;
  box-shadow: none !important;
  border: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  display: none !important;
}

/* Fullscreen Image Overlay */
.fullscreen-img-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.96);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.22s cubic-bezier(.4,0,.2,1);
  padding: 0;
}
.fullscreen-img {
  max-width: 88vw;
  max-height: 88vh;
  border-radius: 18px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.45);
  background: #fff;
  margin: 32px 0 24px 0;
  animation: imgPopIn 0.28s cubic-bezier(.4,0,.2,1);
  display: block;
}
@keyframes imgPopIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
.fullscreen-img-close {
  position: fixed;
  top: 36px;
  right: 56px;
  font-size: 2.5rem;
  color: #fff;
  background: rgba(0,0,0,0.55);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3100;
  transition: background 0.18s, color 0.18s, transform 0.13s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}
.fullscreen-img-close:hover {
  background: #38b676;
  color: #fff;
  transform: scale(1.12);
}
@media (max-width: 900px) {
  .fullscreen-img {
    max-width: 98vw;
    max-height: 70vh;
    margin: 16px 0 12px 0;
  }
  .fullscreen-img-close {
    top: 12px;
    right: 12px;
    font-size: 2rem;
    width: 38px;
    height: 38px;
  }
}

body.fullscreen-img-open {
  overflow: hidden !important;
}

.no-services {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-services .empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
  display: block;
}

.no-services p {
  margin: 10px 0;
  font-size: 1.2rem;
}

.no-services .empty-subtitle {
  font-size: 1rem;
  color: #999;
  margin-top: 10px;
}
</style>