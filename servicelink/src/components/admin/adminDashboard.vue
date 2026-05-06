<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h2 class="page-title">Admin Dashboard</h2>
      <div class="time-date-display">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="card">
        <div class="card-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="card-content">
          <h3>{{ stats.summary?.totalBookings || 0 }}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="card-content">
          <h3>{{ stats.summary?.totalClients || 0 }}</h3>
          <p>Total Clients</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon">
          <i class="fas fa-briefcase"></i>
        </div>
        <div class="card-content">
          <h3>{{ stats.summary?.totalProviders || 0 }}</h3>
          <p>Total Providers</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon">
          <i class="fas fa-coins"></i>
        </div>
        <div class="card-content">
          <h3>₱{{ stats.summary?.totalRevenue || 0 }}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <!-- Line Chart - Bookings over 7 days -->
      <div class="chart-container">
        <div class="chart-header">
          <h3>
            {{ selectedPeriod === 'week' ? 'Bookings Over Past 7 Days' 
            : selectedPeriod === 'month' ? 'Bookings Over Past 30 Days' 
            : 'Bookings Over Past Year' }}
          </h3>
          <select v-model="selectedPeriod" @change="changePeriod(selectedPeriod)" class="period-select">
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <div class="chart-wrapper">
          <canvas ref="lineChart"></canvas>
        </div>
      </div>

      <!-- Pie Chart - Booking Status Distribution -->
      <div class="chart-container">
        <h3>Booking Status Distribution</h3>
        <div class="chart-wrapper">
          <canvas ref="pieChart"></canvas>
        </div>
      </div>
    </div>

    <!-- All Transactions Section -->
    <div class="all-transactions-section">
      <div class="section-header">
        <h3>All Transactions</h3>
        <div class="filters-section">
          <div class="filter-group">
            <label>Payment Status:</label>
            <select v-model="transactionFilters.paymentStatus" @change="applyTransactionFilters">
              <option value="">All</option>
              <option value="PENDING">Unpaid</option>
              <option value="COMPLETED">Paid</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Sort By:</label>
            <select v-model="transactionFilters.sortBy" @change="applyTransactionFilters">
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Order:</label>
            <select v-model="transactionFilters.sortOrder" @change="applyTransactionFilters">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <button class="btn btn-secondary" @click="resetTransactionFilters">Reset</button>
        </div>
      </div>

      <div v-if="loadingTransactions" class="loading-transactions">
        <div class="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>

      <div v-else-if="transactionError" class="error-container">
        <div class="error">{{ transactionError }}</div>
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
              <td>{{ getTransactionClientName(transaction) }}</td>
              <td>{{ getTransactionProviderName(transaction) }}</td>
              <td>{{ transaction.service?.title || 'N/A' }}</td>
              <td>₱{{ Number(transaction.payment?.amount || transaction.totalAmount || 0).toFixed(2) }}</td>
              <td>{{ transaction.payment?.paymentMethod || 'Cash' }}</td>
              <td>
                <span :class="['status-badge', transaction.payment?.status === 'COMPLETED' ? 'paid' : 'unpaid']">
                  {{ transaction.payment?.status === 'COMPLETED' ? 'Paid' : 'Unpaid' }}
                </span>
              </td>
              <td>{{ transaction.payment?.paymentDate ? formatTransactionDate(transaction.payment.paymentDate) : 'N/A' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(transaction.status)]">
                  {{ formatTransactionStatus(transaction.status) }}
                </span>
              </td>
              <td>{{ formatTransactionDate(transaction.createdAt) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="transactions.length === 0" class="no-transactions">
          <p>No transactions found.</p>
        </div>
      </div>
    </div>

    <!-- Provider Ratings Section -->
    <div class="provider-ratings-section">
      <div class="ratings-summary">
        <h3>Provider Ratings Overview</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-value">{{ providerRatingsStats.overallAverageRating || 0 }}</div>
            <div class="stat-label">Overall Average Rating</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ providerRatingsStats.providersWithReviews || 0 }}</div>
            <div class="stat-label">Providers with Reviews</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ providerRatingsStats.totalProviders || 0 }}</div>
            <div class="stat-label">Total Providers</div>
          </div>
        </div>
      </div>

      <div class="top-providers">
        <h3>Top Rated Providers</h3>
        <div class="providers-table">
          <table>
            <thead>
              <tr>
                <th>Provider Name</th>
                <th>Email</th>
                <th>Average Rating</th>
                <th>Total Reviews</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="provider in topProviders" :key="provider.id">
                <td>{{ provider.firstName }} {{ provider.lastName }}</td>
                <td>{{ provider.email }}</td>
                <td>
                  <div class="rating-display">
                    <span class="rating-value">{{ provider.averageRating }}</span>
                    <div class="stars">
                      <i 
                        v-for="star in 5" 
                        :key="star"
                        :class="['fas', 'fa-star', star <= provider.averageRating ? 'star-filled' : 'star-empty']"
                      ></i>
                    </div>
                  </div>
                </td>
                <td>{{ provider.totalReviews }}</td>
                <td>
                  <span :class="['status-badge', provider.isActive ? 'status-active' : 'status-inactive']">
                    {{ provider.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Recent Bookings Table -->
    <div class="recent-bookings">
      <h3>Recent Bookings</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in recentBookings" :key="booking.id">
              <td>{{ getClientName(booking.client) }}</td>
              <td>{{ getProviderName(booking.serviceProvider) }}</td>
              <td>{{ booking.service?.title || 'N/A' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(booking.status)]">
                  {{ booking.status }}
                </span>
              </td>
              <td>₱{{ booking.totalAmount || booking.service?.pricing || 'N/A' }}</td>
              <td>{{ formatDate(booking.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { adminService } from '../../services/apiService';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default {
  name: 'AdminDashboard',
  setup() {
    const loading = ref(true);
    const stats = ref({});
    const recentBookings = ref([]);
    const providerRatings = ref({});
    const providerRatingsStats = ref({});
    const topProviders = ref([]);
    const lineChart = ref(null);
    const pieChart = ref(null);
    const currentTime = ref('');
    const currentDate = ref('');
    const timeInterval = ref(null);
    const transactions = ref([]);
    const loadingTransactions = ref(false);
    const transactionError = ref('');
    const transactionFilters = ref({
      paymentStatus: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });

    // ✅ BAGO
    const selectedPeriod = ref('week');

    let lineChartInstance = null;
    let pieChartInstance = null;

    const updateTimeAndDate = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      currentDate.value = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const loadDashboardData = async () => {
      try {
        loading.value = true;
        
        // ✅ BAGO: i-pass ang selectedPeriod
        const statsResponse = await adminService.getDashboardStats(selectedPeriod.value);
        if (statsResponse.success) {
          stats.value = statsResponse.data;
        }
        
        const bookingsResponse = await adminService.getRecentBookings(10);
        if (bookingsResponse.success) {
          recentBookings.value = bookingsResponse.data;
        }

        const ratingsResponse = await adminService.getProviderRatings();
        if (ratingsResponse.success) {
          providerRatings.value = ratingsResponse.data;
          providerRatingsStats.value = ratingsResponse.data.statistics;
          topProviders.value = ratingsResponse.data.providers.slice(0, 10);
        }
        
        await nextTick();
        createCharts();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        loading.value = false;
      }
    };

    // ✅ BAGO: changePeriod method
    const changePeriod = async (period) => {
      selectedPeriod.value = period;
      const statsResponse = await adminService.getDashboardStats(period);
      if (statsResponse.success) {
        stats.value = statsResponse.data;
        await nextTick();
        createLineChart();
      }
    };

    const createCharts = () => {
      createLineChart();
      createPieChart();
    };

    const createLineChart = () => {
      const canvas = lineChart.value;
      if (!canvas || !stats.value.bookingsLast7Days) return;
      
      if (lineChartInstance) {
        lineChartInstance.destroy();
      }
      
      const data = stats.value.bookingsLast7Days;

      lineChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: data.map(item => item.date),
          datasets: [{
            label: 'Bookings',
            data: data.map(item => item.count),
            borderColor: '#00C853',
            backgroundColor: 'rgba(0, 200, 83, 0.05)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00C853',
            pointBorderColor: '#00C853',
            pointBorderWidth: 0,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#00C853',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#333',
              bodyColor: '#00C853',
              borderColor: '#e0e0e0',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                title: (items) => items[0].label,
                label: (item) => `Bookings: ${item.raw}`
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(0,0,0,0.04)',
                drawTicks: false,
              },
              border: { display: false },
              ticks: {
                color: '#aaa',
                font: { size: 11 },
                maxRotation: 0,
                autoSkip: true,
                // ✅ Key fix: limit kung ilan lang ang lalabas
                maxTicksLimit: selectedPeriod.value === 'month' ? 8 : 
                              selectedPeriod.value === 'year' ? 12 : 7,
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.04)',
                drawTicks: false,
              },
              border: { 
                display: false,
                dash: [4, 4]
              },
              ticks: {
                color: '#aaa',
                font: { size: 11 },
                stepSize: 1,
                padding: 8
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    };

    const createPieChart = () => {
      const canvas = pieChart.value;
      if (!canvas || !stats.value.statusDistribution) return;
      
      if (pieChartInstance) {
        pieChartInstance.destroy();
      }
      
      const data = stats.value.statusDistribution;

      const statusColors = {
        'COMPLETED': '#00C853',
        'PENDING': '#FF9800',
        'CANCELLED': '#F44336',
        'IN_PROGRESS': '#2196F3',
        'CONFIRMED': '#9C27B0',
        'DISPUTED': '#607D8B'
      };
      
      pieChartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: data.map(item => item.status),
          datasets: [{
            data: data.map(item => item.count),
            backgroundColor: data.map(item => statusColors[item.status] || '#607D8B'),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      });
    };

    const getClientName = (client) => {
      if (!client?.user) return 'N/A';
      return `${client.user.firstName} ${client.user.lastName}`;
    };

    const getProviderName = (provider) => {
      if (!provider?.user) return 'N/A';
      return `${provider.user.firstName} ${provider.user.lastName}`;
    };

    const getStatusClass = (status) => {
      const statusClasses = {
        'PENDING': 'status-pending',
        'ACCEPTED': 'status-accepted',
        'IN_PROGRESS': 'status-progress',
        'COMPLETED': 'status-completed',
        'CANCELLED': 'status-cancelled'
      };
      return statusClasses[status] || 'status-default';
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    const fetchTransactions = async () => {
      try {
        loadingTransactions.value = true;
        transactionError.value = '';
        
        const queryParams = new URLSearchParams();
        if (transactionFilters.value.paymentStatus) {
          queryParams.append('paymentStatus', transactionFilters.value.paymentStatus);
        }
        if (transactionFilters.value.sortBy) {
          queryParams.append('sortBy', transactionFilters.value.sortBy);
        }
        if (transactionFilters.value.sortOrder) {
          queryParams.append('sortOrder', transactionFilters.value.sortOrder);
        }

        const response = await adminService.getAllTransactions(queryParams.toString());
        
        if (response.success) {
          transactions.value = response.data;
        } else {
          transactionError.value = response.message || 'Failed to load transactions';
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        transactionError.value = 'Unable to load transactions. Please try again later.';
      } finally {
        loadingTransactions.value = false;
      }
    };

    const applyTransactionFilters = () => {
      fetchTransactions();
    };

    const resetTransactionFilters = () => {
      transactionFilters.value = {
        paymentStatus: '',
        sortBy: 'date',
        sortOrder: 'desc'
      };
      fetchTransactions();
    };

    const getTransactionClientName = (transaction) => {
      if (transaction.client?.user) {
        return `${transaction.client.user.firstName} ${transaction.client.user.lastName}`;
      }
      return 'N/A';
    };

    const getTransactionProviderName = (transaction) => {
      if (transaction.serviceProvider?.user) {
        return `${transaction.serviceProvider.user.firstName} ${transaction.serviceProvider.user.lastName}`;
      }
      return 'N/A';
    };

    const formatTransactionDate = (dateString) => {
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

    const formatTransactionStatus = (status) => {
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

    onMounted(() => {
      updateTimeAndDate();
      timeInterval.value = setInterval(updateTimeAndDate, 1000);
      loadDashboardData();
      fetchTransactions();
    });

    return {
      loading,
      stats,
      recentBookings,
      providerRatings,
      providerRatingsStats,
      topProviders,
      lineChart,
      pieChart,
      currentTime,
      currentDate,
      timeInterval,
      transactions,
      loadingTransactions,
      transactionError,
      transactionFilters,
      selectedPeriod,
      changePeriod,
      getClientName,
      getProviderName,
      getStatusClass,
      formatDate,
      fetchTransactions,
      applyTransactionFilters,
      resetTransactionFilters,
      getTransactionClientName,
      getTransactionProviderName,
      formatTransactionDate,
      formatTransactionStatus
    };
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  width: 100%;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 20px 30px;
  border: none;
  min-height: calc(100dvh - 80px);
  min-height: calc(100vh - 80px); /* Fallback for older browsers */
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
  background: linear-gradient(90deg, #00C853, #009688);
  border-radius: 2px;
}

.time-date-display {
  text-align: right;
  color: #4a5568;
}

.time {
  font-size: 1.8rem;
  font-weight: 700;
  color: #00C853;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.date {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid #ececec;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.1);
}

.card-icon {
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 1.8rem;
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
}

.card-content h3 {
  font-size: 2.2rem;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 700;
}

.card-content p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  border: 1px solid #ececec;
}

.chart-container h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.chart-wrapper {
  position: relative;
  height: 350px;
  width: 100%;
}

.provider-ratings-section {
  margin-bottom: 25px;
}

.ratings-summary {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  border: 1px solid #ececec;
  margin-bottom: 20px;
}

.ratings-summary h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #00C853;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.top-providers {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  border: 1px solid #ececec;
}

.top-providers h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.providers-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #ececec;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-value {
  font-weight: 600;
  color: #333;
  min-width: 30px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-filled {
  color: #FFD700;
}

.star-empty {
  color: #ddd;
}

.status-active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-inactive {
  background: #f5c6cb;
  color: #721c24;
  border: 1px solid #f1b0b7;
}

.recent-bookings {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  border: 1px solid #ececec;
}

.recent-bookings h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #ececec;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

th, td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #ececec;
  font-size: 1rem;
}

th {
  background: #f8f9fa;
  font-weight: 700;
  color: #1976d2;
  border-bottom: 2px solid #ececec;
}

td {
  color: #555;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background: #f4f8f6;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-accepted {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-progress {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-completed {
  background: #c3e6cb;
  color: #155724;
  border: 1px solid #b1dfbb;
}

.status-cancelled {
  background: #f5c6cb;
  color: #721c24;
  border: 1px solid #f1b0b7;
}

.status-default {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00C853;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .admin-dashboard {
    padding: 15px 20px;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 10px 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .time-date-display {
    text-align: left;
  }
  
  .time {
    font-size: 1.5rem;
  }
  
  .date {
    font-size: 0.9rem;
  }
  
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .card {
    padding: 20px;
  }
  
  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    margin-right: 15px;
  }
  
  .card-content h3 {
    font-size: 1.8rem;
  }
  
  .charts-section {
    gap: 15px;
  }
  
  .chart-container {
    padding: 20px;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .ratings-summary {
    padding: 20px;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .top-providers {
    padding: 20px;
  }
  
  .rating-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .recent-bookings {
    padding: 20px;
  }
  
  th, td {
    padding: 12px 8px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: 8px 10px;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .card {
    flex-direction: column;
    text-align: center;
  }
  
  .card-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .chart-wrapper {
    height: 200px;
  }
  
  th, td {
    padding: 8px 6px;
    font-size: 0.8rem;
  }
  
  .status-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
  .admin-dashboard {
    margin-top: 90px;
    margin-bottom: 90px;
  }
}

/* Transactions Section Styles */
.all-transactions-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 6px rgba(44, 62, 80, 0.06);
  border: 1px solid #ececec;
  margin-top: 25px;
  margin-bottom: 30px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.filters-section {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
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
  background: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading-transactions {
  text-align: center;
  padding: 40px;
}

.loading-transactions .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #00C853;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error-container {
  text-align: center;
  padding: 20px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin: 20px 0;
}

.transactions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.transactions-table th,
.transactions-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
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

.status-badge.paid {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.unpaid {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-transactions {
  text-align: center;
  padding: 40px;
  color: #666;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.period-select {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.period-select:focus,
.period-select:hover {
  border-color: #00C853;
}
</style>
