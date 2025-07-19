<template>
  <div class="all-clients">
    <h2 class="page-title">All Clients</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="clients.length === 0">No clients found</div>
      <table v-else class="clients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Addresses</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.user.firstName }} {{ client.user.lastName }}</td>
            <td>{{ client.user.email }}</td>
            <td>{{ client.user.phone || 'Not provided' }}</td>
            <td>{{ client.user.isActive ? 'Active' : 'Inactive' }}</td>
            <td>{{ client.addresses ? client.addresses.length : 0 }} address(es)</td>
            <td>{{ client.bookingCount || 0 }} booking(s)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_BASE_URL = 'http://localhost:5500/api';
const clients = ref([]);
const loading = ref(true);
const error = ref('');

const fetchClients = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Not authenticated';
      loading.value = false;
      return;
    }
    const res = await fetch(`${API_BASE_URL}/admin/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      clients.value = data.data;
    } else {
      error.value = data.message || 'Failed to load clients';
    }
  } catch (e) {
    error.value = 'Failed to load clients';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchClients);
</script>

<style scoped>
.all-clients {
  max-width: 1000px;
  padding: 20px;
  margin: 0 auto;
}
.loading {
  padding: 20px;
}
.error {
  color: red;
  padding: 20px;
}
.clients-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-top: 20px;
}
.clients-table th, .clients-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.clients-table th {
  background: #f5f5f5;
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
