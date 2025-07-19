<template>
  <div class="category-management">
    <h2 class="page-title">Category Management</h2>
    
    <!-- Create New Category Button -->
    <div class="category-action-bar">
      <button class="primary-btn" @click="showCreateForm = true">
        <i class="fa fa-plus-circle"></i> Create New Category
      </button>
    </div>
    <!-- Create New Category Modal -->
    <div v-if="showCreateForm" class="modal enhanced-modal">
      <div class="modal-content enhanced-modal-content animate-modal">
        <div class="modal-header">
          <span class="modal-icon"><i class="fa fa-plus-circle"></i></span>
          <h3>Create New Category</h3>
          <span class="close-button enhanced-close" @click="showCreateForm = false">&times;</span>
        </div>
        <hr class="modal-divider" />
        <form @submit.prevent="createCategory">
          <div class="form-group">
            <label for="category-name">Category Name:</label>
            <input type="text" id="category-name" v-model="newCategory.name" placeholder="Enter category name" required>
          </div>
          <div class="form-group">
            <label for="category-description">Description:</label>
            <textarea id="category-description" v-model="newCategory.description" placeholder="Enter category description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="category-image">Category Image:</label>
            <input type="file" id="category-image" @change="handleImageChange" accept="image/*">
            <div v-if="newCategory.image" class="image-preview">
              <img :src="URL.createObjectURL(newCategory.image)" alt="Preview" />
            </div>
          </div>
          <button type="submit" :disabled="loading" class="submit-btn">Create Category</button>
          <div v-if="createResult" :class="['result', createResult.success ? 'success' : 'error']">
            {{ createResult.message }}
          </div>
        </form>
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
    <div v-if="showEditModal" class="modal enhanced-modal">
      <div class="modal-content enhanced-modal-content animate-modal">
        <div class="modal-header">
          <span class="modal-icon"><i class="fa fa-edit"></i></span>
          <h3>Edit Category</h3>
          <span class="close-button enhanced-close" @click="closeEditModal">&times;</span>
        </div>
        <hr class="modal-divider" />
        <form @submit.prevent="updateCategory">
          <div class="form-group">
            <label for="edit-category-name">Category Name:</label>
            <input type="text" id="edit-category-name" v-model="editingCategory.name" placeholder="Enter category name" required>
          </div>
          <div class="form-group">
            <label for="edit-category-description">Description:</label>
            <textarea id="edit-category-description" v-model="editingCategory.description" placeholder="Enter category description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="edit-category-image">Category Image:</label>
            <div v-if="editingCategory.imageUrl" class="current-image">
              <img :src="editingCategory.imageUrl" width="100" :alt="editingCategory.name">
              <p><small>Current image</small></p>
            </div>
            <input type="file" id="edit-category-image" @change="handleEditImageChange" accept="image/*">
            <div v-if="editingCategory.image" class="image-preview">
              <img :src="URL.createObjectURL(editingCategory.image)" alt="Preview" />
            </div>
            <p><small>Leave empty to keep current image</small></p>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">Cancel</button>
            <button type="submit" :disabled="updating" class="save-btn">Save Changes</button>
          </div>
          <div v-if="editResult" :class="['result', editResult.success ? 'success' : 'error']">
            {{ editResult.message }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFileUrl as apiGetFileUrl } from '../../services/apiService';

const API_BASE_URL = 'http://localhost:5500/api';
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
  newCategory.value.image = event.target.files[0];
};

const handleEditImageChange = (event) => {
  editingCategory.value.image = event.target.files[0];
};

const createCategory = async () => {
  if (!newCategory.value.name.trim()) {
    createResult.value = { success: false, message: 'Category name is required' };
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
      createResult.value = { success: true, message: 'Category created successfully' };
      newCategory.value = { name: '', description: '', image: null };
      fetchCategories();
    } else {
      createResult.value = { success: false, message: data.message || 'Failed to create category' };
    }
  } catch (e) {
    createResult.value = { success: false, message: 'Failed to create category' };
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

onMounted(fetchCategories);
</script>

<style scoped>
.category-management {
  width: 100%;
  padding: 0;
  margin: 0;
  /* Remove max-width, center, etc */
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
  padding: 20px 30px;
  margin: 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.current-image {
  margin-bottom: 10px;
}

button {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

button:hover:not(:disabled) {
  background-color: #0b7dda;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.edit-btn {
  background-color: #f39c12;
  padding: 6px 12px;
  font-size: 14px;
}

.edit-btn:hover {
  background-color: #e67e22;
}

.cancel-btn {
  background-color: #ccc;
}

.save-btn {
  background-color: #2196F3;
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

.modal {
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  overflow: auto;
}

.modal-content {
  background-color: #fefefe;
  margin: 10% auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  width: 80%;
  max-width: 600px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.page-title {
  margin-top: 20px;
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
.enhanced-modal {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(2px);
}
.enhanced-modal-content {
  background: linear-gradient(135deg, #f8fafc 60%, #e0f7fa 100%);
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
  border-radius: 18px;
  border: 1.5px solid #e0e0e0;
  animation: modalPop 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
@keyframes modalPop {
  0% { transform: scale(0.92) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  position: relative;
}
.modal-header h3 {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1976d2;
  margin: 0;
}
.modal-icon {
  font-size: 2rem;
  color: #2196f3;
  background: #e3f2fd;
  border-radius: 50%;
  padding: 8px;
  margin-right: 8px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.08);
}
.enhanced-close {
  color: #888;
  font-size: 2rem;
  font-weight: 700;
  transition: color 0.2s, transform 0.2s;
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  padding: 4px 10px;
  border-radius: 50%;
}
.enhanced-close:hover {
  color: #e53935;
  background: #fbe9e7;
  transform: scale(1.15) rotate(8deg);
}
.modal-divider {
  border: none;
  border-top: 1.5px solid #e0e0e0;
  margin: 0 0 18px 0;
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
.form-group input[type="text"], .form-group textarea, .form-group input[type="file"] {
  transition: border 0.2s, box-shadow 0.2s;
}
.form-group input[type="text"]:focus, .form-group textarea:focus {
  border: 1.5px solid #2196f3;
  box-shadow: 0 0 0 2px #e3f2fd;
  outline: none;
}
.form-group input[type="file"]:hover {
  border: 1.5px solid #4caf50;
}
.animate-modal {
  animation: modalPop 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
