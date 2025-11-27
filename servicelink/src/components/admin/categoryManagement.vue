<template>
  <div class="category-management">
    <div class="page-header">
      <h2 class="page-title">Category Management</h2>
    </div>
    
    <!-- Create New Category Button -->
    <div class="category-action-bar">
      <button class="primary-btn" @click="showCreateForm = true">
        <i class="fa fa-plus-circle"></i> Create New Category
      </button>
    </div>
    <!-- Create New Category Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Create New Category</h3>
          <button class="close-btn" @click="showCreateForm = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createCategory" id="create-category-form">
            <div class="form-group">
              <label for="category-name">Category Name <span class="required">*</span></label>
              <input type="text" id="category-name" v-model="newCategory.name" placeholder="Enter category name" required class="form-control">
            </div>
            <div class="form-group">
              <label for="category-description">Description</label>
              <textarea id="category-description" v-model="newCategory.description" placeholder="Enter category description" rows="3" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label for="category-image">Category Image</label>
              <input type="file" id="category-image" @change="handleImageChange" accept="image/*" class="form-control">
              <div v-if="newCategory.image" class="image-preview">
                <img :src="newCategoryImagePreview" alt="Preview" />
              </div>
            </div>
            <div v-if="createResult" :class="['result', createResult.success ? 'success' : 'error']">
              {{ createResult.message }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="showCreateForm = false">Cancel</button>
          <button type="submit" form="create-category-form" :disabled="loading" class="btn-submit">
            {{ loading ? 'Creating...' : 'Create Category' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Existing Categories as Cards -->
    <div class="categories-container">
      <h3>Existing Categories</h3>
      <div v-if="loadingCategories" class="loading">Loading...</div>
      <div v-else-if="categoriesError" class="error">{{ categoriesError }}</div>
      <div v-else>
        <div v-if="categories.length === 0">No categories found</div>
        <div v-else class="category-list">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="category-image-box">
              <img v-if="category.imageUrl" :src="getFileUrl(category.imageUrl)" :alt="category.name" class="category-img" />
              <div v-else class="category-img-placeholder"><i class="fa fa-image"></i></div>
            </div>
            <div class="category-info">
              <div class="category-title">{{ category.name }}</div>
              <div class="category-desc">{{ category.description || 'No description' }}</div>
            </div>
            <div class="category-actions">
              <button @click="openEditModal(category)" class="edit-btn">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Edit Category</h3>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateCategory" id="edit-category-form">
            <div class="form-group">
              <label for="edit-category-name">Category Name <span class="required">*</span></label>
              <input type="text" id="edit-category-name" v-model="editingCategory.name" placeholder="Enter category name" required class="form-control">
            </div>
            <div class="form-group">
              <label for="edit-category-description">Description</label>
              <textarea id="edit-category-description" v-model="editingCategory.description" placeholder="Enter category description" rows="3" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label for="edit-category-image">Category Image</label>
              <div v-if="editingCategory.imageUrl" class="current-image">
                <img :src="getFileUrl(editingCategory.imageUrl)" :alt="editingCategory.name" class="current-image-preview">
                <p><small>Current image</small></p>
              </div>
              <input type="file" id="edit-category-image" @change="handleEditImageChange" accept="image/*" class="form-control">
              <div v-if="editingCategory.image" class="image-preview">
                <img :src="editingCategoryImagePreview" alt="Preview" />
              </div>
              <p><small>Leave empty to keep current image</small></p>
            </div>
            <div v-if="editResult" :class="['result', editResult.success ? 'success' : 'error']">
              {{ editResult.message }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeEditModal">Cancel</button>
          <button type="button" class="btn-delete" @click="confirmDeleteCategory" :disabled="updating">
            {{ updating ? 'Processing...' : 'Delete Category' }}
          </button>
          <button type="submit" form="edit-category-form" :disabled="updating" class="btn-submit">
            {{ updating ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getFileUrl as apiGetFileUrl } from '../../services/apiService';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5500/api';
const categories = ref([]);
const loadingCategories = ref(true);
const categoriesError = ref('');
const loading = ref(false);
const updating = ref(false);
const createResult = ref('');
const editResult = ref('');

const newCategory = ref({
  name: '',
  description: '',
  image: null
});

const showEditModal = ref(false);
const editingCategory = ref({
  id: '',
  name: '',
  description: '',
  imageUrl: '',
  image: null
});

const showCreateForm = ref(false);

const getFileUrl = apiGetFileUrl;

// Computed properties for image previews
const newCategoryImagePreview = computed(() => {
  if (newCategory.value.image && typeof URL !== 'undefined') {
    return URL.createObjectURL(newCategory.value.image);
  }
  return '';
});

const editingCategoryImagePreview = computed(() => {
  if (editingCategory.value.image && typeof URL !== 'undefined') {
    return URL.createObjectURL(editingCategory.value.image);
  }
  return '';
});

const fetchCategories = async () => {
  loadingCategories.value = true;
  categoriesError.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      categoriesError.value = 'Not authenticated';
      return;
    }
    const res = await fetch(`${API_BASE_URL}/admin/category`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      categories.value = data.data || [];
    } else {
      categoriesError.value = data.message || 'Failed to load categories';
    }
  } catch (e) {
    categoriesError.value = 'Failed to load categories';
  } finally {
    loadingCategories.value = false;
  }
};

const handleImageChange = (event) => {
  // Clean up previous object URL if it exists
  if (newCategory.value.image && newCategoryImagePreview.value) {
    URL.revokeObjectURL(newCategoryImagePreview.value);
  }
  newCategory.value.image = event.target.files[0];
};

const handleEditImageChange = (event) => {
  // Clean up previous object URL if it exists
  if (editingCategory.value.image && editingCategoryImagePreview.value) {
    URL.revokeObjectURL(editingCategoryImagePreview.value);
  }
  editingCategory.value.image = event.target.files[0];
};

const createCategory = async () => {
  if (!newCategory.value.name.trim()) {
    Swal.fire({
      title: 'Missing Information',
      text: 'Category name is required',
      icon: 'warning',
      confirmButtonColor: '#ff9800'
    });
    return;
  }

  loading.value = true;
  createResult.value = '';

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', newCategory.value.name.trim());
    
    if (newCategory.value.description.trim()) {
      formData.append('description', newCategory.value.description.trim());
    }
    
    if (newCategory.value.image) {
      formData.append('categoryImage', newCategory.value.image);
    }

    const res = await fetch(`${API_BASE_URL}/admin/category`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        title: 'Category Created!',
        text: 'New category has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#4CAF50',
        timer: 2000
      });
      newCategory.value = { name: '', description: '', image: null };
      showCreateForm.value = false;
      fetchCategories();
    } else {
      Swal.fire({
        title: 'Error',
        text: data.message || 'Failed to create category',
        icon: 'error',
        confirmButtonColor: '#f44336'
      });
    }
  } catch (e) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to create category',
      icon: 'error',
      confirmButtonColor: '#f44336'
    });
  } finally {
    loading.value = false;
  }
};

const openEditModal = (category) => {
  editingCategory.value = {
    id: category.id,
    name: category.name,
    description: category.description || '',
    imageUrl: category.imageUrl,
    image: null
  };
  showEditModal.value = true;
  editResult.value = '';
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingCategory.value = { id: '', name: '', description: '', imageUrl: '', image: null };
  editResult.value = '';
};

const updateCategory = async () => {
  if (!editingCategory.value.name.trim()) {
    editResult.value = { success: false, message: 'Category name is required' };
    return;
  }

  updating.value = true;
  editResult.value = '';

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', editingCategory.value.name.trim());
    
    if (editingCategory.value.description.trim()) {
      formData.append('description', editingCategory.value.description.trim());
    }
    
    if (editingCategory.value.image) {
      formData.append('categoryImage', editingCategory.value.image);
    }

    const res = await fetch(`${API_BASE_URL}/admin/category/${editingCategory.value.id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      editResult.value = { success: true, message: 'Category updated successfully' };
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Category Updated',
          text: 'Changes have been saved successfully.',
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          timer: 2000
        });
      }
      setTimeout(() => {
        fetchCategories();
        closeEditModal();
      }, 1500);
    } else {
      editResult.value = { success: false, message: data.message || 'Failed to update category' };
    }
  } catch (e) {
    editResult.value = { success: false, message: 'Failed to update category' };
  } finally {
    updating.value = false;
  }
};

const confirmDeleteCategory = async () => {
  if (!editingCategory.value.id) return;

  try {
    const confirmed = typeof Swal !== 'undefined'
      ? (await Swal.fire({
          title: 'Delete Category?',
          text: 'This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, delete it',
          cancelButtonText: 'Cancel'
        })).isConfirmed
      : confirm('Delete this category?');

    if (!confirmed) return;

    updating.value = true;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/admin/category/${editingCategory.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && (data.success === undefined || data.success === true)) {
      if (typeof Swal !== 'undefined') {
        await Swal.fire({
          title: 'Deleted!',
          text: 'Category has been removed.',
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          timer: 1800
        });
      }
      await fetchCategories();
      closeEditModal();
    } else {
      const message = data.message || 'Failed to delete category';
      if (typeof Swal !== 'undefined') {
        Swal.fire({ title: 'Error', text: message, icon: 'error', confirmButtonColor: '#f44336' });
      } else {
        alert(message);
      }
    }
  } catch (e) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({ title: 'Error', text: 'Failed to delete category', icon: 'error', confirmButtonColor: '#f44336' });
    } else {
      alert('Failed to delete category');
    }
  } finally {
    updating.value = false;
  }
};

onMounted(fetchCategories);

onUnmounted(() => {
  // Clean up object URLs to prevent memory leaks
  if (newCategory.value.image && newCategoryImagePreview.value) {
    URL.revokeObjectURL(newCategoryImagePreview.value);
  }
  if (editingCategory.value.image && editingCategoryImagePreview.value) {
    URL.revokeObjectURL(editingCategoryImagePreview.value);
  }
});
</script>

<style scoped>
.category-management {
  width: 100%;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 20px 30px;
  border: none;
  min-height: calc(100vh - 80px);
}

.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.categories-container {
  width: 100%;
  background: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
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
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #00C853;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.current-image {
  margin-bottom: 10px;
}

.current-image-preview {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  border: 1px solid #e0e0e0;
  object-fit: cover;
}

.btn-cancel, .btn-submit, .btn-delete {
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

.btn-cancel {
  background: #e0e0e0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-submit {
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 200, 83, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.btn-submit:disabled, .btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.edit-btn {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  padding: 12px 50px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(33, 150, 243, 0.3);
}

.loading {
  padding: 20px;
}

.error {
  color: red;
  padding: 20px;
}

.result {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.result.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.categories-table th, .categories-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.categories-table th {
  background: #f5f5f5;
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

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #ececec;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
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

/* Action bar for create button */
.category-action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
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
/* Match providerServices.vue card grid and card style */
.category-list {
  width: 100%;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 18px;
}
.category-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  margin-bottom: 25px;
  padding: 25px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.category-card::before {
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
.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}
.category-card:hover::before {
  transform: scaleX(1);
}
.category-image-box {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}
.category-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
.category-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bdbdbd;
  font-size: 2rem;
}
.category-info {
  flex: 1;
  width: 100%;
  margin-bottom: 10px;
}
.category-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}
.category-desc {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0;
  padding: 10px 0 0 0;
}
.category-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.edit-btn {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  padding: 12px 50px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.edit-btn:hover {
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(33, 150, 243, 0.3);
}
@media screen and (max-width: 1600px) {
  .category-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
@media screen and (max-width: 1200px) {
  .category-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
@media screen and (max-width: 768px) {
  .category-list {
    grid-template-columns: 1fr;
  }
  .category-card {
    padding: 15px;
  }
  .categories-container {
    padding: 15px;
  }
}
@media screen and (max-width: 480px) {
  .categories-container {
    padding: 10px;
  }
}
.image-preview {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview img {
  max-width: 120px;
  max-height: 120px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  border: 1px solid #e0e0e0;
}
</style>
