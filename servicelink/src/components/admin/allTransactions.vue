<template>
  <div class="all-transactions">
    <div class="page-header">
      <h2 class="page-title">All Transactions</h2>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Payment Status:</label>
        <select v-model="filters.paymentStatus" @change="applyFilters">
          <option value="">All</option>
          <option value="PENDING">Unpaid</option>
          <option value="COMPLETED">Paid</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Sort By:</label>
        <select v-model="filters.sortBy" @change="applyFilters">
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Order:</label>
        <select v-model="filters.sortOrder" @change="applyFilters">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <button class="btn btn-primary" @click="resetFilters">Reset Filters</button>
    </div>

    <!-- Transactions Table -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading transactions...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error">{{ error }}</div>
    </div>

    <div v-else class="table-container">
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Client Name</th>
            <th>Provider Name</th>
            <th>Service Name</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Date Paid</th>
            <th>Booking Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.id.substring(0, 8) }}...</td>
            <td>{{ getClientName(transaction) }}</td>
            <td>{{ getProviderName(transaction) }}</td>
            <td>{{ transaction.service?.title || 'N/A' }}</td>
            <td>₱{{ Number(transaction.payment?.amount || transaction.totalAmount || 0).toFixed(2) }}</td>
            <td>{{ transaction.payment?.paymentMethod || 'Cash' }}</td>
            <td>
              <span :class="['status-badge', transaction.payment?.status === 'COMPLETED' ? 'paid' : 'unpaid']">
                {{ transaction.payment?.status === 'COMPLETED' ? 'Paid' : 'Unpaid' }}
              </span>
            </td>
            <td>{{ transaction.payment?.paymentDate ? formatDate(transaction.payment.paymentDate) : 'N/A' }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(transaction.status)]">
                {{ formatStatus(transaction.status) }}
              </span>
            </td>
            <td>{{ formatDate(transaction.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="transactions.length === 0" class="no-transactions">
        <p>No transactions found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { adminService } from '../../services/apiService';

export default {
  name: 'AllTransactions',
  setup() {
    const loading = ref(true);
    const error = ref('');
    const transactions = ref([]);
    const filters = ref({
      paymentStatus: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });

    const fetchTransactions = async () => {
      try {
        loading.value = true;
        error.value = '';
        
        const queryParams = new URLSearchParams();
        if (filters.value.paymentStatus) {
          queryParams.append('paymentStatus', filters.value.paymentStatus);
        }
        if (filters.value.sortBy) {
          queryParams.append('sortBy', filters.value.sortBy);
        }
        if (filters.value.sortOrder) {
          queryParams.append('sortOrder', filters.value.sortOrder);
        }

        const response = await adminService.getAllTransactions(queryParams.toString());
        
        if (response.success) {
          transactions.value = response.data;
        } else {
          error.value = response.message || 'Failed to load transactions';
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        error.value = 'Unable to load transactions. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    const applyFilters = () => {
      fetchTransactions();
    };

    const resetFilters = () => {
      filters.value = {
        paymentStatus: '',
        sortBy: 'date',
        sortOrder: 'desc'
      };
      fetchTransactions();
    };

    const getClientName = (transaction) => {
      if (transaction.client?.user) {
        return `${transaction.client.user.firstName} ${transaction.client.user.lastName}`;
      }
      return 'N/A';
    };

    const getProviderName = (transaction) => {
      if (transaction.serviceProvider?.user) {
        return `${transaction.serviceProvider.user.firstName} ${transaction.serviceProvider.user.lastName}`;
      }
      return 'N/A';
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatStatus = (status) => {
      const statusMap = {
        'PENDING': 'Pending',
        'CONFIRMED': 'Confirmed',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled',
        'DISPUTED': 'Disputed'
      };
      return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
      const classMap = {
        'PENDING': 'pending',
        'CONFIRMED': 'confirmed',
        'IN_PROGRESS': 'in-progress',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled',
        'DISPUTED': 'disputed'
      };
      return classMap[status] || '';
    };

    onMounted(() => {
      fetchTransactions();
    });

    return {
      loading,
      error,
      transactions,
      filters,
      applyFilters,
      resetFilters,
      getClientName,
      getProviderName,
      formatDate,
      formatStatus,
      getStatusClass
    };
  }
};
</script>

<style scoped>
.all-transactions {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100dvh - 60px);
  min-height: calc(100vh - 60px); /* Fallback for older browsers */
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.filters-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 500;
  font-size: 14px;
  color: #666;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th,
.transactions-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transactions-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.transactions-table tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.paid {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.unpaid {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.confirmed {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.in-progress {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.loading, .error-container {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff9800;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-transactions {
  text-align: center;
  padding: 40px;
  color: #666;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background-color: #ff9800;
  color: white;
}

.btn-primary:hover {
  background-color: #e68900;
}
</style>

