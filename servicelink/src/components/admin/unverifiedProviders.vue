<template>
  <div class="provider-services-container">
    <div class="provider-services">
      <h2 class="page-title">Providers Awaiting Verification</h2>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
        <div v-if="providers.length === 0" class="no-services">
          <i class="fa fa-briefcase empty-icon"></i>
          <p>No providers awaiting verification</p>
        </div>
        <div v-else class="provider-table-list">
          <div v-for="provider in providers" :key="provider.id" class="provider-table-row">
            <div class="provider-table-name">
              <span class="provider-name-text">{{ provider.user.firstName }} {{ provider.user.lastName }}</span>
            </div>
            <div class="provider-table-actions">
              <button class="view-profile-btn" @click="openProfileModal(provider)"><i class="fa fa-eye"></i> View Profile</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close-btn" @click="closeModal">&times;</span>
          <div v-if="selectedProvider" class="profile-modal-card-modern">
            <div class="profile-section-card" style="margin-bottom:18px;">
              <div class="profile-name-modern">{{ selectedProvider.user.firstName }} {{ selectedProvider.user.lastName }}</div>
              <div class="profile-info-chips">
                <div class="profile-chip"><i class="fa fa-envelope"></i> {{ selectedProvider.user.email }}</div>
                <div class="profile-chip"><i class="fa fa-phone"></i> {{ selectedProvider.user.phone || 'Not provided' }}</div>
              </div>
            </div>
            <div class="profile-section-card">
              <div class="profile-section-label">Documents</div>
              <div class="profile-docs-section">
                <div v-if="uniqueDocs.length" class="profile-docs-grid">
                  <div v-for="doc in uniqueDocs" :key="doc.id" class="profile-doc-card">
                    <template v-if="isImage(doc.fileUrl)">
                      <img :src="getFileUrl(doc.fileUrl)" :alt="doc.title || 'Document'" class="profile-doc-img-modern" @error="onImgError" @click="openFullscreenImg(getFileUrl(doc.fileUrl))" style="cursor:pointer;" />
                      <div class="profile-doc-caption-modern">{{ doc.title || doc.fileUrl }}</div>
                    </template>
                    <template v-else>
                      <a :href="getFileUrl(doc.fileUrl)" target="_blank" class="profile-doc-link-modern">{{ doc.title || doc.fileUrl }}</a>
                    </template>
                  </div>
                </div>
                <div v-else class="profile-no-docs-modern">No documents uploaded</div>
              </div>
            </div>
            <div class="profile-modal-actions">
              <button class="verify-btn" @click="verifyProvider(selectedProvider.id)" :disabled="actionLoading === selectedProvider.id">
                ✔️ Verify Provider
              </button>
              <button class="reject-btn" @click="rejectProvider(selectedProvider.id)" :disabled="actionLoading === selectedProvider.id">
                ❌ Reject
              </button>
            </div>
          </div>
          <!-- Fullscreen Image Overlay -->
          <div v-if="fullscreenImg" class="fullscreen-img-overlay" @click.self="closeFullscreenImg">
            <img :src="fullscreenImg" class="fullscreen-img" />
            <button class="fullscreen-img-close" @click="closeFullscreenImg">&times;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

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

function onImgError(e) {
  e.target.style.display = 'none';
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
  if (!confirm('Are you sure you want to verify this provider?')) return;
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
      alert('Provider verified successfully');
    } else {
      alert(data.message || 'Failed to verify provider');
    }
  } catch (e) {
    alert('Failed to verify provider');
  } finally {
    actionLoading.value = '';
  }
};

const rejectProvider = async (id) => {
  const reason = prompt('Please provide a reason for rejection:');
  if (!reason) return;
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
      alert('Provider rejection sent successfully');
    } else {
      alert(data.message || 'Failed to reject provider');
    }
  } catch (e) {
    alert('Failed to reject provider');
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

.provider-table-list {
  width: 100%;
  max-width: 1500px;
  margin: 32px auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: none;
}

.provider-table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(44, 62, 80, 0.07);
  margin-bottom: 18px;
  padding: 0 32px 0 24px;
  min-height: 72px;
  transition: box-shadow 0.18s;
  border: 1.5px solid #e3e9f0;
}

.provider-table-row:hover {
  box-shadow: 0 8px 32px rgba(56,183,118,0.13);
}

.provider-table-name {
  flex: 1 1 0%;
  display: flex;
  align-items: center;
  font-size: 1.18rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -0.5px;
}

.provider-name-text {
  padding: 0 0 0 2px;
}

.provider-table-actions {
  display: flex;
  align-items: center;
  gap: 0;
}

.view-profile-btn {
  background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 28px;
  font-size: 1.08rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(46,204,113,0.10);
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, transform 0.13s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-profile-btn i {
  font-size: 1.1rem;
}

.view-profile-btn:hover {
  background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
  box-shadow: 0 4px 16px rgba(39,174,96,0.13);
  transform: translateY(-2px) scale(1.04);
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
  .provider-table-list {
    max-width: 99vw;
    padding: 0 2vw;
  }
  .provider-table-row {
    padding: 0 10px 0 10px;
  }
}

@media (max-width: 600px) {
  .provider-table-row {
    flex-direction: column;
    align-items: flex-start;
    min-height: 60px;
    padding: 10px 8px;
    gap: 8px;
}
  .provider-table-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .profile-modal-actions {
    flex-direction: column;
    gap: 10px;
  }
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
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 2px 16px rgba(44, 62, 80, 0.10);
  overflow-y: auto;
  border: 1px solid #ececec;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Card style for inner sections, like the Home Cleaning card in the screenshot */
.profile-section-card {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  padding: 16px 14px;
  margin-bottom: 18px;
  width: 100%;
}

.profile-modal-card-modern {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  min-width: 0;
  max-width: 100%;
  margin: 0;
}

.profile-name-modern {
  font-size: 1.4rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
  text-align: left;
  margin-top: 0;
  align-self: flex-start;
}

.profile-info-chips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-bottom: 12px;
  margin-top: 0;
}
.profile-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #444;
  background: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  font-weight: 500;
}
.profile-chip i {
  color: #888;
  font-size: 1.1rem;
}

.section-divider {
  width: 100%;
  height: 1px;
  background: #ececec;
  margin: 18px 0 14px 0;
  border: none;
}

.profile-section-label {
  font-size: 1.08rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
  margin-top: 0;
}

.profile-docs-section {
  width: 100%;
  margin-top: 0;
}
.profile-docs-label {
  font-size: 1.08rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
  margin-top: 0;
  text-align: left;
  width: 100%;
  letter-spacing: 0.1px;
}
.profile-docs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 0;
}
.profile-doc-card {
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
.profile-doc-img-modern {
  max-width: 70px;
  max-height: 60px;
  border-radius: 6px;
  margin-bottom: 4px;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.06);
}
.profile-doc-caption-modern {
  font-size: 0.95rem;
  color: #555;
  margin-top: 2px;
  text-align: center;
  word-break: break-all;
  font-weight: 500;
}
.profile-doc-link-modern {
  color: #1976d2;
  text-decoration: underline;
  font-size: 0.97rem;
  word-break: break-all;
  margin-top: 4px;
  font-weight: 500;
}
.profile-no-docs-modern {
  color: #e53e3e;
  background: #fff5f5;
  border-radius: 6px;
  padding: 6px 10px;
  margin-top: 4px;
  font-size: 0.97rem;
  text-align: center;
}

.close-btn {
  float: right;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #888;
  background: #f3f3f3;
  margin-left: auto;
  margin-bottom: 8px;
}
.close-btn:hover {
  color: #e74c3c;
  background-color: #fbeaea;
  transform: rotate(90deg);
}

@media (max-width: 600px) {
  .modal-content {
    padding: 10px 2vw;
    border-radius: 8px;
    max-width: 98vw;
    min-width: 0;
    width: 98vw;
    margin: 0 1vw;
  }
  .profile-modal-card-modern {
    padding: 0 2vw 0 2vw;
    min-width: 0;
    max-width: 100vw;
    width: 100%;
  }
  .profile-avatar-img {
    width: 38px;
    height: 38px;
  }
  .profile-info-chips {
    gap: 4px;
    font-size: 0.95rem;
  }
  .profile-docs-grid {
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  .profile-doc-card {
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 6px 4px 4px 4px;
  }
  .profile-doc-img-modern {
    max-width: 90vw;
    max-height: 30vw;
    min-width: 0;
    min-height: 0;
  }
  .profile-modal-actions {
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-top: 12px;
  }
  .close-btn {
    width: 38px;
    height: 38px;
    font-size: 1.5rem;
    margin-bottom: 4px;
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
</style>