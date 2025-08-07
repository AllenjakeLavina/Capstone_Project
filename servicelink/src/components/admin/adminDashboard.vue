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
          <i class="fas fa-dollar-sign"></i>
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
        <h3>Bookings Over Past 7 Days</h3>
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
    let lineChartInstance = null;
    let pieChartInstance = null;

    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Format time (HH:MM:SS AM/PM)
      currentTime.value = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Format date (Day, Month DD, YYYY)
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
        
        // Load dashboard stats
        const statsResponse = await adminService.getDashboardStats();
        if (statsResponse.success) {
          stats.value = statsResponse.data;
        }
        
        // Load recent bookings
        const bookingsResponse = await adminService.getRecentBookings(10);
        if (bookingsResponse.success) {
          recentBookings.value = bookingsResponse.data;
        }

        // Load provider ratings
        const ratingsResponse = await adminService.getProviderRatings();
        if (ratingsResponse.success) {
          providerRatings.value = ratingsResponse.data;
          providerRatingsStats.value = ratingsResponse.data.statistics;
          topProviders.value = ratingsResponse.data.providers.slice(0, 10); // Show top 10 providers
        }
        
        // Wait for DOM to update, then create charts
        await nextTick();
        createCharts();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        loading.value = false;
      }
    };

    const createCharts = () => {
      createLineChart();
      createPieChart();
    };

    const createLineChart = () => {
      const canvas = lineChart.value;
      if (!canvas || !stats.value.bookingsLast7Days) return;
      
      // Destroy existing chart if it exists
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
            backgroundColor: 'rgba(0, 200, 83, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00C853',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    };

    const createPieChart = () => {
      const canvas = pieChart.value;
      if (!canvas || !stats.value.statusDistribution) return;
      
      // Destroy existing chart if it exists
      if (pieChartInstance) {
        pieChartInstance.destroy();
      }
      
      const data = stats.value.statusDistribution;
      
      pieChartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: data.map(item => item.status),
          datasets: [{
            data: data.map(item => item.count),
            backgroundColor: [
              '#00C853',
              '#FF9800',
              '#F44336',
              '#2196F3',
              '#9C27B0',
              '#607D8B'
            ],
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

    onMounted(() => {
      // Initialize time and date
      updateTimeAndDate();
      
      // Set up interval to update time every second
      timeInterval.value = setInterval(updateTimeAndDate, 1000);
      
      // Load dashboard data
      loadDashboardData();
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
      getClientName,
      getProviderName,
      getStatusClass,
      formatDate
    };
  },
  beforeUnmount() {
    // Clean up interval on component unmount
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
</style>
