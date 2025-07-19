<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h2>Notifications</h2>
      <div class="notification-actions">
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-read">
          Mark all as read
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="notifications-loading">
      <div class="loading-spinner"></div>
      <p>Loading notifications...</p>
    </div>
    
    <div v-else-if="error" class="notifications-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchNotifications" class="retry-btn">Try Again</button>
    </div>
    
    <div v-else-if="notifications.length === 0" class="no-notifications">
      <i class="fas fa-bell-slash"></i>
      <p>You have no notifications</p>
    </div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        :class="['notification-item', { unread: !notification.isRead }]"
        @click="viewNotification(notification)"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
        </div>
        <div class="notification-actions">
          <button 
            v-if="!notification.isRead" 
            @click.stop="markAsRead(notification)" 
            class="mark-read-btn"
            title="Mark as read"
          >
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="notifications.length > 0 && hasMoreNotifications" class="load-more">
      <button @click="loadMore" :disabled="loadingMore">
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationService } from '../../services/apiService';

export default {
  name: 'Notifications',
  emits: ['update-count'],
  
  setup(props, { emit }) {
    const router = useRouter();
    const notifications = ref([]);
    const loading = ref(true);
    const loadingMore = ref(false);
    const error = ref('');
    const currentPage = ref(1);
    const hasMoreNotifications = ref(false);
    const totalCount = ref(0);
    
    // Get unread count
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.isRead).length;
    });
    
    // Emit unread count whenever it changes
    const updateUnreadCount = () => {
      emit('update-count', unreadCount.value);
    };
    
    // Get appropriate icon based on notification type
    const getNotificationIcon = (type) => {
      const iconMap = {
        'BOOKING_REQUEST': 'fas fa-calendar-plus',
        'BOOKING_CONFIRMED': 'fas fa-calendar-check',
        'BOOKING_CANCELLED': 'fas fa-calendar-times',
        'PAYMENT_RECEIVED': 'fas fa-money-bill-wave',
        'NEW_MESSAGE': 'fas fa-envelope',
        'REVIEW_RECEIVED': 'fas fa-star',
        'SERVICE_COMPLETED': 'fas fa-check-circle',
        'CONTRACT_SIGNED': 'fas fa-file-signature',
        'GENERAL': 'fas fa-bell'
      };
      
      return iconMap[type] || 'fas fa-bell';
    };
    
    // Format time string to relative time
    const formatTime = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffSec < 60) {
        return 'Just now';
      } else if (diffMin < 60) {
        return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
      } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    };
    
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        loading.value = true;
        error.value = '';
        
        const result = await notificationService.getNotifications(currentPage.value, 10);
        
        if (result.success) {
          // First page, replace notifications; otherwise append
          if (currentPage.value === 1) {
            notifications.value = result.data.notifications || [];
          } else {
            notifications.value = [...notifications.value, ...(result.data.notifications || [])];
          }
          
          hasMoreNotifications.value = result.data.hasMore || false;
          totalCount.value = result.data.totalCount || 0;
          updateUnreadCount();
        } else {
          throw new Error(result.message || 'Failed to load notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        error.value = err.message || 'Failed to load notifications';
      } finally {
        loading.value = false;
        loadingMore.value = false;
      }
    };
    
    // Load more notifications
    const loadMore = async () => {
      if (!hasMoreNotifications.value || loadingMore.value) return;
      
      loadingMore.value = true;
      currentPage.value++;
      await fetchNotifications();
    };
    
    // Mark a notification as read
    const markAsRead = async (notification) => {
      try {
        if (notification.isRead) return;
        
        const result = await notificationService.markAsRead(notification.id);
        
        if (result.success) {
          // Update notification in the list
          const index = notifications.value.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            notifications.value[index].isRead = true;
            updateUnreadCount();
          }
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    };
    
    // Mark all notifications as read
    const markAllAsRead = async () => {
      try {
        const result = await notificationService.markAllAsRead();
        
        if (result.success) {
          // Update all notifications in the list
          notifications.value = notifications.value.map(n => ({
            ...n,
            isRead: true
          }));
          updateUnreadCount();
        }
      } catch (err) {
        console.error('Error marking all notifications as read:', err);
      }
    };
    
    // Handle notification click
    const viewNotification = async (notification) => {
      // Mark as read first
      if (!notification.isRead) {
        await markAsRead(notification);
      }
      
      // Handle navigation based on notification type and data
      if (notification.data) {
        try {
          const data = typeof notification.data === 'string' 
            ? JSON.parse(notification.data) 
            : notification.data;
          
          const userRole = localStorage.getItem('userRole') || '';
          const isProvider = userRole === 'PROVIDER';
          
          switch (notification.type) {
            case 'BOOKING_REQUEST':
            case 'BOOKING_CONFIRMED':
            case 'BOOKING_CANCELLED':
            case 'SERVICE_COMPLETED':
              if (data.bookingId) {
                if (isProvider) {
                  router.push(`/provider/booking/${data.bookingId}`);
                } else {
                  router.push(`/client/booking/${data.bookingId}`);
                }
              }
              break;
              
            case 'PAYMENT_RECEIVED':
              if (data.bookingId) {
                if (isProvider) {
                  router.push(`/provider/booking/${data.bookingId}`);
                } else {
                  router.push(`/client/booking/${data.bookingId}`);
                }
              }
              break;
              
            case 'NEW_MESSAGE':
              if (data.conversationId) {
                router.push(`/messages/${data.conversationId}`);
              }
              break;
              
            case 'REVIEW_RECEIVED':
              if (isProvider) {
                router.push('/provider/reviews');
              } else {
                router.push('/client/reviews');
              }
              break;
              
            case 'CONTRACT_SIGNED':
              if (data.contractId) {
                if (isProvider) {
                  router.push(`/provider/contracts/${data.contractId}`);
                } else {
                  router.push(`/client/contracts/${data.contractId}`);
                }
              }
              break;
              
            default:
              // For general notifications, no navigation needed
              break;
          }
        } catch (err) {
          console.error('Error parsing notification data:', err);
        }
      }
    };
    
    // Fetch notifications on component mount
    onMounted(() => {
      fetchNotifications();
    });
    
    return {
      notifications,
      loading,
      loadingMore,
      error,
      unreadCount,
      hasMoreNotifications,
      getNotificationIcon,
      formatTime,
      fetchNotifications,
      loadMore,
      markAsRead,
      markAllAsRead,
      viewNotification
    };
  }
};
</script>

<style scoped>
.notifications-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.notifications-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 600;
}

.mark-all-read {
  background-color: transparent;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-all-read:hover {
  background-color: #4CAF50;
  color: white;
}

.notifications-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #78909c;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notifications-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #e53935;
  text-align: center;
}

.notifications-error i {
  font-size: 40px;
  margin-bottom: 15px;
}

.retry-btn {
  margin-top: 15px;
  background-color: #f5f5f5;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #e0e0e0;
}

.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9e9e9e;
  text-align: center;
}

.no-notifications i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.notifications-list {
  max-height: 70vh;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  cursor: pointer;
  position: relative;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f1f8e9;
}

.notification-item.unread:hover {
  background-color: #e8f5e9;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #4CAF50;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.notification-item.unread .notification-icon {
  background-color: #4CAF50;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1rem;
}

.notification-message {
  color: #607d8b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 0.8rem;
  color: #9e9e9e;
}

.notification-actions {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.mark-read-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-read-btn:hover {
  background-color: #4CAF50;
  color: white;
}

.load-more {
  padding: 15px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

.load-more button {
  background-color: #f5f5f5;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.load-more button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.load-more button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .notifications-container {
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
  }
  
  .notifications-list {
    max-height: calc(100vh - 180px);
  }
  
  .notification-icon {
    width: 36px;
    height: 36px;
  }
  
  .notification-title {
    font-size: 0.95rem;
  }
  
  .notification-message {
    font-size: 0.85rem;
  }
}
</style>
