<template>
  <div class="user-management">
    <h2 class="page-title">Change User Password</h2>
    <div class="form-container">
      <div class="form-group">
        <label for="user-id">User ID:</label>
        <input type="text" id="user-id" v-model="userId" placeholder="Enter user ID">
      </div>
      <div class="form-group">
        <label for="new-password">New Password:</label>
        <input type="password" id="new-password" v-model="newPassword" placeholder="Enter new password">
      </div>
      <button @click="changePassword" :disabled="loading">Change Password</button>
      <div v-if="result" :class="['result', result.success ? 'success' : 'error']">
        {{ result.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const API_BASE_URL = 'http://localhost:5500/api';
const userId = ref('');
const newPassword = ref('');
const loading = ref(false);
const result = ref('');

const changePassword = async () => {
  if (!userId.value || !newPassword.value) {
    result.value = { success: false, message: 'Please enter both User ID and new password' };
    return;
  }

  loading.value = true;
  result.value = '';

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      result.value = { success: false, message: 'You must be logged in' };
      return;
    }

    const res = await fetch(`${API_BASE_URL}/admin/users/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: userId.value, newPassword: newPassword.value })
    });

    const data = await res.json();

    if (data.success) {
      result.value = { success: true, message: 'Password changed successfully' };
      userId.value = '';
      newPassword.value = '';
    } else {
      result.value = { success: false, message: data.message || 'Failed to change password' };
    }
  } catch (e) {
    result.value = { success: false, message: 'Failed to change password' };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.user-management {
  max-width: 600px;
  padding: 20px;
  margin: 0 auto;
}
.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:hover:not(:disabled) {
  background-color: #0b7dda;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
</style>
