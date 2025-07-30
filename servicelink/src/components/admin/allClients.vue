<template>
  <div class="all-clients">
    <div class="page-header">
      <h2 class="page-title">All Clients</h2>
      <button class="refresh-btn" @click="refreshClients" :disabled="loading">
        <i class="fa fa-refresh" :class="{ 'fa-spin': loading }"></i>
        Refresh
      </button>
    </div>
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.user.firstName }} {{ client.user.lastName }}</td>
            <td>{{ client.user.email }}</td>
            <td>{{ client.user.phone || 'Not provided' }}</td>
            <td>
              <span :class="getStatusClass(client.user.isActive ? 'Active' : 'Inactive')">
                {{ client.user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ client.addresses ? client.addresses.length : 0 }} address(es)</td>
            <td>{{ client.bookingCount || 0 }} booking(s)</td>
            <td>
              <button 
                :class="client.user.isActive ? 'disable-btn' : 'enable-btn'"
                @click="toggleClientStatus(client)"
                :disabled="actionLoading === client.id"
              >
                <span v-if="actionLoading === client.id">
                  <i class="fa fa-spinner fa-spin"></i> Processing...
                </span>
                <span v-else>
                  <i :class="client.user.isActive ? 'fa fa-ban' : 'fa fa-check'"></i>
                  {{ client.user.isActive ? 'Disable' : 'Enable' }}
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5500/api';
const clients = ref([]);
const loading = ref(true);
const error = ref('');
const actionLoading = ref('');

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

// Refresh clients list
const refreshClients = () => {
  fetchClients();
};

// Toggle client status (Active/Inactive)
const toggleClientStatus = async (client) => {
  const isCurrentlyActive = client.user.isActive;
  const action = isCurrentlyActive ? 'disable' : 'enable';
  const clientName = `${client.user.firstName} ${client.user.lastName}`;
  
  // Confirmation dialog
  const result = await Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Client`,
    text: `Are you sure you want to ${action} ${clientName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isCurrentlyActive ? '#e74c3c' : '#2ecc71',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: `Yes, ${action}`,
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  actionLoading.value = client.id;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/admin/clients/${client.id}/toggle-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isActive: !isCurrentlyActive
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Update the client status locally
      client.user.isActive = !isCurrentlyActive;
      
      Swal.fire({
        title: 'Success!',
        text: `${clientName} has been ${action}d successfully`,
        icon: 'success',
        confirmButtonColor: '#2ecc71',
        timer: 2000
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: data.message || `Failed to ${action} client`,
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
    }
  } catch (e) {
    Swal.fire({
      title: 'Error',
      text: `Failed to ${action} client. Please try again.`,
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
  } finally {
    actionLoading.value = '';
  }
};

// Get CSS class for status styling
function getStatusClass(status) {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Inactive':
      return 'status-inactive';
    default:
      return 'status-default';
  }
}

onMounted(fetchClients);
</script>

<style scoped>
.all-clients {
  width: 100%;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 20px 30px;
  border: none;
  min-height: calc(100vh - 80px);
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

/* Responsive table */
.clients-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  margin-top: 18px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
}

.clients-table th, .clients-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #ececec;
  text-align: left;
  font-size: 1rem;
}

.clients-table th {
  background: #f8f9fa;
  font-weight: 700;
  color: #1976d2;
  border-bottom: 2px solid #ececec;
}

.clients-table tr:last-child td {
  border-bottom: none;
}

.clients-table tr:hover {
  background: #f4f8f6;
}

/* Status styling */
.status-active {
  background: #d4edda;
  color: #155724;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid #c3e6cb;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid #f5c6cb;
}

.status-default {
  background: #e2e3e5;
  color: #383d41;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid #d6d8db;
}

/* Action button styling */
.disable-btn, .enable-btn {
  background-color: #e74c3c; /* Red for disable */
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
}

.enable-btn {
  background-color: #2ecc71; /* Green for enable */
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.disable-btn:hover:not(:disabled) {
  background-color: #c0392b; /* Darker red for disable */
}

.enable-btn:hover:not(:disabled) {
  background-color: #27ae60; /* Darker green for enable */
}

.disable-btn:disabled, .enable-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  color: #e2e8f0;
}

@media (max-width: 900px) {
  .all-clients {
    padding: 15px;
    border-radius: 0;
  }
  
  .clients-table th, .clients-table td {
    padding: 10px 6px;
    font-size: 0.97rem;
    white-space: nowrap;
  }
  
  .all-clients h2 {
    font-size: 1.3rem;
    margin-bottom: 18px;
  }
  
  .clients-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
