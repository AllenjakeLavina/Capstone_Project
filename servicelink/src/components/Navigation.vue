<template>
  <div class="navigation-container" v-if="shouldShowNav">
    <div class="nav-content">
      <!-- Logo aligned to the left -->
      <div class="logo">
        <router-link to="/">
          <img src="../assets/logo.png" alt="ServiceLink" />
        </router-link>
      </div>

      <!-- All navigation items moved to the right side -->
      <div class="right-content">
        <!-- Navigation Links -->
        <div class="nav-links">
          <!-- Client links -->
          <template v-if="userRole === 'CLIENT'">
            <router-link to="/client/services" class="nav-item">
              <div class="icon"><i class="fas fa-concierge-bell"></i></div>
              <span>Services</span>
            </router-link>
            <router-link to="/client/bookings" class="nav-item">
              <div class="icon"><i class="fas fa-calendar-alt"></i></div>
              <span>Bookings</span>
            </router-link>
            <router-link to="/messages" class="nav-item">
              <div class="icon"><i class="fas fa-envelope"></i></div>
              <span>Messages</span>
            </router-link>
          </template>
          
          <!-- Provider links -->
          <template v-if="userRole === 'PROVIDER'">
            <router-link to="/provider/services" class="nav-item">
              <div class="icon"><i class="fas fa-briefcase"></i></div>
              <span>My Services</span>
            </router-link>
            <router-link to="/provider/bookings" class="nav-item">
              <div class="icon"><i class="fas fa-calendar-alt"></i></div>
              <span>Bookings</span>
            </router-link>
            <router-link to="/messages" class="nav-item">
              <div class="icon"><i class="fas fa-envelope"></i></div>
              <span>Messages</span>
            </router-link>
          </template>
          
          <!-- Admin links -->
          <template v-if="userRole === 'ADMIN'">
            <router-link to="/admin/unverified-providers" class="nav-item">
              <div class="icon"><i class="fas fa-user-times"></i></div>
              <span>Unverified Providers</span>
            </router-link>
            <router-link to="/admin/providers" class="nav-item">
              <div class="icon"><i class="fas fa-briefcase"></i></div>
              <span>All Providers</span>
            </router-link>
            <router-link to="/admin/clients" class="nav-item">
              <div class="icon"><i class="fas fa-users"></i></div>
              <span>All Clients</span>
            </router-link>
            <router-link to="/admin/user-management" class="nav-item">
              <div class="icon"><i class="fas fa-user-cog"></i></div>
              <span>User Management</span>
            </router-link>
            <router-link to="/admin/category-management" class="nav-item">
              <div class="icon"><i class="fas fa-th-list"></i></div>
              <span>Category Management</span>
            </router-link>
          </template>
        </div>

        <!-- User actions -->
        <div class="user-actions">
          <!-- Notification and user profile for CLIENT and PROVIDER only -->
          <template v-if="userRole === 'CLIENT' || userRole === 'PROVIDER'">
            <!-- Notification item -->
            <div class="nav-item notification-wrapper" v-if="isAuthenticated" @click="toggleNotificationDropdown" ref="notificationRef">
              <div class="notification-icon">
                <i class="fas fa-bell"></i>
                <div v-if="notificationCount > 0" class="notification-badge">{{ formatCount(notificationCount) }}</div>
              </div>
              
              <!-- Notifications dropdown -->
              <div v-if="showNotificationDropdown" class="notifications-dropdown">
                <div class="notifications-header">
                  <h3>Notifications</h3>
                  <router-link to="/notifications" class="view-all" @click="showNotificationDropdown = false">
                    View All
                  </router-link>
                </div>
                <div v-if="loadingNotifications" class="notifications-loading">
                  <div class="loading-spinner"></div>
                </div>
                <div v-else-if="recentNotifications.length === 0" class="no-notifications">
                  <p>No notifications</p>
                </div>
                <div v-else class="recent-notifications">
                  <div 
                    v-for="notification in recentNotifications" 
                    :key="notification.id" 
                    :class="['notification-item', { unread: !notification.isRead }]"
                    @click="viewNotification(notification)"
                  >
                    <div class="notification-mini-icon">
                      <i :class="getNotificationIcon(notification.type)"></i>
                    </div>
                    <div class="notification-content">
                      <div class="notification-title">{{ notification.title }}</div>
                      <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="user-profile" v-if="isAuthenticated" @click="toggleUserMenu">
              <div v-if="userAvatar" class="user-avatar-small">
                <img :src="userAvatar" alt="Profile" />
              </div>
              <span class="username">{{ userName }}</span>
              <div class="dropdown-icon"><i class="fas fa-chevron-down"></i></div>
              
              <!-- Dropdown menu -->
              <div class="dropdown-menu" v-if="showUserMenu">
                <div class="dropdown-header">
                  <div class="user-avatar">
                    <img v-if="userAvatar" :src="userAvatar" alt="Profile" />
                    <i v-else class="fas fa-user"></i>
                  </div>
                  <span>{{ userName }}</span>
                </div>
                
                <!-- Client Profile Link -->
                <template v-if="userRole === 'CLIENT'">
                  <router-link to="/client/profile" class="dropdown-item">
                    <i class="fas fa-user-circle"></i>
                    <span>Profile</span>
                  </router-link>
                </template>
                
                <!-- Provider Profile Link -->
                <template v-if="userRole === 'PROVIDER'">
                  <router-link to="/provider/profile" class="dropdown-item">
                    <i class="fas fa-user-circle"></i>
                    <span>Profile</span>
                  </router-link>
                </template>
                
                <router-link to="/settings" class="dropdown-item">
                  <i class="fas fa-cog"></i>
                  <span>Settings</span>
                </router-link>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout" @click="handleLogout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          </template>
          <!-- Logout only for ADMIN -->
          <template v-if="userRole === 'ADMIN' && isAuthenticated">
            <div class="dropdown-item logout" @click="handleLogout" style="display: flex; align-items: center; cursor: pointer; color: #f44336; padding: 12px 15px;">
              <i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i>
              <span>Logout</span>
            </div>
          </template>
          <div class="auth-buttons" v-if="!isAuthenticated">
            <router-link to="/login" class="btn login-btn">Login</router-link>
            <router-link to="/register" class="btn register-btn">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile-specific navigation layout -->
  <div class="mobile-nav-layout" v-if="isMobile && shouldShowNav">
    <!-- Top navbar spacer to push content down -->
    <div class="mobile-top-spacer"></div>
    
    <!-- Top navbar with logo and profile -->
    <div class="mobile-top-navbar">
      <div class="mobile-logo">
        <router-link to="/">
          <img src="../assets/logo.png" alt="ServiceLink" />
        </router-link>
      </div>

      <div class="mobile-actions">
        <!-- Notification bell for mobile -->
        <div class="mobile-notification-icon" v-if="isAuthenticated" @click="toggleMobileNotificationDropdown">
          <i class="fas fa-bell"></i>
          <div v-if="notificationCount > 0" class="mobile-notification-badge">{{ formatCount(notificationCount) }}</div>
        </div>

        <div class="mobile-profile-icon" @click="toggleUserMenu">
          <img v-if="userAvatar" :src="userAvatar" alt="Profile" />
          <i v-else class="fas fa-user-circle"></i>
        </div>
      </div>

      <!-- Mobile notification dropdown -->
      <div v-if="showMobileNotificationDropdown" class="mobile-notifications-dropdown">
        <div class="mobile-notifications-header">
          <h3>Notifications</h3>
          <div class="mobile-notifications-close" @click="showMobileNotificationDropdown = false">
            <i class="fas fa-times"></i>
          </div>
        </div>
        
        <div v-if="loadingNotifications" class="mobile-notifications-loading">
          <div class="loading-spinner"></div>
        </div>
        <div v-else-if="recentNotifications.length === 0" class="mobile-no-notifications">
          <p>No notifications</p>
        </div>
        <div v-else class="mobile-recent-notifications">
          <div 
            v-for="notification in recentNotifications" 
            :key="notification.id" 
            :class="['mobile-notification-item', { unread: !notification.isRead }]"
            @click="viewNotification(notification)"
          >
            <div class="notification-mini-icon">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <div class="mobile-notifications-footer">
          <router-link to="/notifications" class="view-all-mobile" @click="showMobileNotificationDropdown = false">
            View All Notifications
          </router-link>
        </div>
      </div>

      <!-- User dropdown menu -->
      <div class="mobile-dropdown-menu" v-if="showUserMenu && (userRole === 'CLIENT' || userRole === 'PROVIDER')" ref="mobileDropdownRef">
        <div class="dropdown-header">
          <div class="dropdown-close" @click="toggleUserMenu">
            <i class="fas fa-times"></i>
          </div>
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" alt="Profile" />
            <i v-else class="fas fa-user"></i>
          </div>
          <span class="user-name">{{ userName }}</span>
          <span class="user-email" v-if="userEmail">{{ userEmail }}</span>
        </div>
        
        <div class="dropdown-items">
          <!-- Client Profile Link -->
          <template v-if="userRole === 'CLIENT'">
            <router-link to="/client/profile" class="dropdown-item" @click="showUserMenu = false">
              <div class="item-icon">
                <i class="fas fa-user"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Profile</span>
                <span class="item-subtitle">View your profile</span>
              </div>
              <div class="item-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </router-link>
          </template>
          
          <!-- Provider Profile Link -->
          <template v-if="userRole === 'PROVIDER'">
            <router-link to="/provider/profile" class="dropdown-item" @click="showUserMenu = false">
              <div class="item-icon">
                <i class="fas fa-user"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Profile</span>
                <span class="item-subtitle">View your profile</span>
              </div>
              <div class="item-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </router-link>
          </template>
          
          <router-link to="/settings" class="dropdown-item" @click="showUserMenu = false">
            <div class="item-icon">
              <i class="fas fa-cog"></i>
            </div>
            <div class="item-content">
              <span class="item-title">Settings</span>
              <span class="item-subtitle">Manage your account</span>
            </div>
            <div class="item-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </router-link>

          <div class="dropdown-divider"></div>
          
          <div class="dropdown-item logout" @click="handleLogout">
            <div class="item-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <div class="item-content">
              <span class="item-title">Logout</span>
              <span class="item-subtitle">Sign out from your account</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Logout only for ADMIN on mobile -->
      <div v-if="showUserMenu && userRole === 'ADMIN' && isAuthenticated" class="mobile-dropdown-menu" ref="mobileDropdownRef">
        <div class="dropdown-header">
          <div class="dropdown-close" @click="toggleUserMenu">
            <i class="fas fa-times"></i>
          </div>
          <span class="user-name">Admin</span>
        </div>
        <div class="dropdown-items">
          <div class="dropdown-item logout" @click="handleLogout">
            <div class="item-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <div class="item-content">
              <span class="item-title">Logout</span>
              <span class="item-subtitle">Sign out from your account</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom navigation -->
    <div class="mobile-bottom-navbar">
      <!-- Client links -->
      <template v-if="userRole === 'CLIENT'">
        <router-link to="/client/services" class="mobile-nav-item" :class="{ 'active': isRouteActive('client/services') }">
          <div class="icon"><i class="fas fa-concierge-bell"></i></div>
          <span>Services</span>
        </router-link>
        <router-link to="/client/bookings" class="mobile-nav-item" :class="{ 'active': isRouteActive('client/bookings') }">
          <div class="icon"><i class="fas fa-calendar-alt"></i></div>
          <span>Bookings</span>
        </router-link>
        <router-link to="/messages" class="mobile-nav-item" :class="{ 'active': isRouteActive('messages') }">
          <div class="icon"><i class="fas fa-envelope"></i></div>
          <span>Messages</span>
        </router-link>
      </template>
      
      <!-- Provider links -->
      <template v-if="userRole === 'PROVIDER'">
        <router-link to="/provider/services" class="mobile-nav-item" :class="{ 'active': isRouteActive('provider/services') }">
          <div class="icon"><i class="fas fa-briefcase"></i></div>
          <span>Services</span>
        </router-link>
        <router-link to="/provider/bookings" class="mobile-nav-item" :class="{ 'active': isRouteActive('provider/bookings') }">
          <div class="icon"><i class="fas fa-calendar-alt"></i></div>
          <span>Bookings</span>
        </router-link>
        <router-link to="/messages" class="mobile-nav-item" :class="{ 'active': isRouteActive('messages') }">
          <div class="icon"><i class="fas fa-envelope"></i></div>
          <span>Messages</span>
        </router-link>
      </template>
      
      <!-- Admin links -->
      <template v-if="userRole === 'ADMIN'">
        <router-link to="/admin/unverified-providers" class="mobile-nav-item" :class="{ 'active': isRouteActive('admin/unverified-providers') }">
          <div class="icon"><i class="fas fa-user-times"></i></div>
          <span>Unverified</span>
        </router-link>
        <router-link to="/admin/providers" class="mobile-nav-item" :class="{ 'active': isRouteActive('admin/providers') }">
          <div class="icon"><i class="fas fa-briefcase"></i></div>
          <span>Providers</span>
        </router-link>
        <router-link to="/admin/clients" class="mobile-nav-item" :class="{ 'active': isRouteActive('admin/clients') }">
          <div class="icon"><i class="fas fa-users"></i></div>
          <span>Clients</span>
        </router-link>
        <router-link to="/admin/user-management" class="mobile-nav-item" :class="{ 'active': isRouteActive('admin/user-management') }">
          <div class="icon"><i class="fas fa-user-cog"></i></div>
          <span>Users</span>
        </router-link>
        <router-link to="/admin/category-management" class="mobile-nav-item" :class="{ 'active': isRouteActive('admin/category-management') }">
          <div class="icon"><i class="fas fa-th-list"></i></div>
          <span>Categories</span>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notificationService, clientService, providerService } from '../services/apiService';

export default {
  name: 'Navigation',
  setup() {
    // Helper function to get file URL
    const getFileUrl = (relativePath) => {
      const API_BASE_URL = 'http://localhost:5500';
      
      if (!relativePath) return '';
      
      if (relativePath && (relativePath.startsWith('http://') || relativePath.startsWith('https://'))) {
        return relativePath;
      }
      
      if (relativePath && relativePath.startsWith('/')) {
        return `${API_BASE_URL}${relativePath}`;
      }
      
      return relativePath;
    };
    
    // State
    const isMobile = ref(false);
    const showUserMenu = ref(false);
    const userRole = ref('');
    const isAuthenticated = ref(false);
    const userName = ref('');
    const userEmail = ref('');
    const userAvatar = ref('/default-avatar.png');
    
    // Get route and router
    const route = useRoute();
    const router = useRouter();
    
    // Add isRouteActive method to check active routes
    const isRouteActive = (path) => {
      return route.path.includes(path);
    };
    
    // Notification state
    const notificationCount = ref(0);
    const showNotificationDropdown = ref(false);
    const recentNotifications = ref([]);
    const loadingNotifications = ref(false);
    const notificationRef = ref(null);
    const mobileDropdownRef = ref(null);
    
    // Check if navigation should be shown based on route
    const shouldShowNav = computed(() => {
      const hiddenRoutes = ['/', '/login', '/register', '/register/client', '/register/provider', '/verify-email', '/forgot-password', '/reset-password'];
      return !hiddenRoutes.includes(route.path);
    });
    
    // Handle window resize for responsive design
    const checkIfMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };
    
    // Toggle user dropdown menu
    const toggleUserMenu = () => {
      console.log('Toggling user menu, current state:', showUserMenu.value);
      showUserMenu.value = !showUserMenu.value;
      
      // Close notification dropdowns if open
      if (showNotificationDropdown.value) {
        showNotificationDropdown.value = false;
      }
      
      // Close mobile notification dropdown if open
      if (showMobileNotificationDropdown.value) {
        showMobileNotificationDropdown.value = false;
      }
      
      // If opening the menu on mobile, ensure it's visible
      if (showUserMenu.value && isMobile.value) {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        document.body.classList.add('has-mobile-dropdown'); // Add class for styling
      } else {
        document.body.style.overflow = ''; // Restore scrolling
        document.body.classList.remove('has-mobile-dropdown'); // Remove class
      }
      
      console.log('Menu toggled, new state:', showUserMenu.value);
    };
    
    // Toggle notification dropdown
    const toggleNotificationDropdown = () => {
      showNotificationDropdown.value = !showNotificationDropdown.value;
      // Close user menu if open
      if (showUserMenu.value) {
        showUserMenu.value = false;
      }
      // Fetch recent notifications if showing dropdown
      if (showNotificationDropdown.value) {
        fetchRecentNotifications();
      }
    };
    
    // Format notification count (e.g., 99+ for large numbers)
    const formatCount = (count) => {
      return count > 99 ? '99+' : count;
    };
    
    // Get notification icon based on type
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
    
    // Format time for notifications
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
        return `${diffMin}m ago`;
      } else if (diffHour < 24) {
        return `${diffHour}h ago`;
      } else if (diffDay < 7) {
        return `${diffDay}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    };
    
    // Fetch notification count from API
    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('Fetching notification count');
        
        const result = await notificationService.getUnreadCount();
        
        if (result.success) {
          notificationCount.value = result.data.count || 0;
          console.log('Updated notification count to:', notificationCount.value);
        } else {
          console.warn('Notification count API returned success: false -', result.message);
          notificationCount.value = 0;
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
        // Default to 0 on error
        notificationCount.value = 0;
      }
    };
    
    // Fetch recent notifications for dropdown
    const fetchRecentNotifications = async () => {
      try {
        loadingNotifications.value = true;
        
        console.log('Fetching recent notifications');
        
        const result = await notificationService.getNotifications(1, 5);
        
        if (result.success) {
          recentNotifications.value = result.data.notifications || [];
          console.log('Updated recent notifications, count:', recentNotifications.value.length);
        } else {
          console.warn('Recent notifications API returned success: false -', result.message);
          recentNotifications.value = [];
        }
      } catch (error) {
        console.error('Error fetching recent notifications:', error);
        recentNotifications.value = [];
      } finally {
        loadingNotifications.value = false;
      }
    };
    
    // Handle notification click
    const viewNotification = async (notification) => {
      try {
        // Mark notification as read
        if (!notification.isRead) {
          const result = await notificationService.markAsRead(notification.id);
          
          if (result.success) {
            // Update notification count
            notificationCount.value = Math.max(0, notificationCount.value - 1);
            
            // Update the notification in the list
            const index = recentNotifications.value.findIndex(n => n.id === notification.id);
            if (index !== -1) {
              recentNotifications.value[index].isRead = true;
            }
          }
        }
        
        // Close dropdown
        showNotificationDropdown.value = false;
        showMobileNotificationDropdown.value = false;
        
        // Navigate based on notification type
        if (notification.data) {
          try {
            const data = typeof notification.data === 'string' 
              ? JSON.parse(notification.data) 
              : notification.data;
            
            switch (notification.type) {
              case 'BOOKING_REQUEST':
              case 'BOOKING_CONFIRMED':
              case 'BOOKING_CANCELLED':
              case 'SERVICE_COMPLETED':
              case 'PAYMENT_RECEIVED':
                if (data.bookingId) {
                  if (userRole.value === 'PROVIDER') {
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
                if (userRole.value === 'PROVIDER') {
                  router.push('/provider/reviews');
                } else {
                  router.push('/client/reviews');
                }
                break;
                
              case 'CONTRACT_SIGNED':
                if (data.contractId) {
                  if (userRole.value === 'PROVIDER') {
                    router.push(`/provider/contracts/${data.contractId}`);
                  } else {
                    router.push(`/client/contracts/${data.contractId}`);
                  }
                }
                break;
                
              default:
                router.push('/notifications');
                break;
            }
          } catch (err) {
            console.error('Error parsing notification data:', err);
            router.push('/notifications');
          }
        } else {
          router.push('/notifications');
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    };
    
    // Close dropdown when clicking elsewhere
    const handleClickOutside = (event) => {
      if (showUserMenu.value) {
        // For desktop dropdown
        if (!event.target.closest('.user-profile') && !isMobile.value) {
          showUserMenu.value = false;
        }
        
        // For mobile dropdown
        if (isMobile.value && mobileDropdownRef.value && !mobileDropdownRef.value.contains(event.target) && 
            !event.target.closest('.mobile-profile-icon')) {
          toggleUserMenu();
        }
      }
      
      if (showNotificationDropdown.value && notificationRef.value && !notificationRef.value.contains(event.target)) {
        showNotificationDropdown.value = false;
      }
      
      // Handle mobile notification dropdown
      if (showMobileNotificationDropdown.value && !event.target.closest('.mobile-notification-icon') && 
          !event.target.closest('.mobile-notifications-dropdown')) {
        showMobileNotificationDropdown.value = false;
      }
    };
    
    // Log out the user
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      showUserMenu.value = false;
      router.push('/login');
    };
    
    // Get user data from local storage
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        isAuthenticated.value = true;
        userRole.value = localStorage.getItem('userRole') || '';
        
        try {
          // Fetch user details based on role
          if (userRole.value === 'CLIENT') {
            const response = await clientService.getClientProfile();
            if (response.success) {
              const userData = response.data;
              userName.value = `${userData.firstName} ${userData.lastName}`;
              userEmail.value = userData.email;
              
              // Handle profile picture
              if (userData.profilePicture) {
                userAvatar.value = getFileUrl(userData.profilePicture);
              }
            }
          } else if (userRole.value === 'PROVIDER') {
            const response = await providerService.getProviderProfile();
            if (response.success) {
              const userData = response.data;
              userName.value = `${userData.firstName} ${userData.lastName}`;
              userEmail.value = userData.email;
              
              // Handle profile picture
              if (userData.profilePicture) {
                userAvatar.value = getFileUrl(userData.profilePicture);
              }
            }
          } else {
            userName.value = 'User';
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          userName.value = 'User';
        }
        
        // Fetch notification count
        fetchNotificationCount();
      } else {
        isAuthenticated.value = false;
        userRole.value = '';
      }
    };
    
    // Setup polling for notification count
    let notificationInterval;
    const startNotificationPolling = () => {
      if (isAuthenticated.value) {
        // Poll every 30 seconds
        notificationInterval = setInterval(fetchNotificationCount, 30000);
      }
    };
    
    // Watch for route changes to update user data
    watch(() => route.path, () => {
      loadUserData();
    });
    
    // Setup on component mount
    onMounted(() => {
      loadUserData();
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      document.addEventListener('click', handleClickOutside);
      startNotificationPolling();
    });
    
    // Cleanup on component unmount
    onUnmounted(() => {
      window.removeEventListener('resize', checkIfMobile);
      document.removeEventListener('click', handleClickOutside);
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    });
    
    // Mobile specific notification state
    const showMobileNotificationDropdown = ref(false);

    // Toggle mobile notification dropdown
    const toggleMobileNotificationDropdown = () => {
      showMobileNotificationDropdown.value = !showMobileNotificationDropdown.value;
      
      // Close user menu if open
      if (showUserMenu.value) {
        showUserMenu.value = false;
      }
      
      // Add/remove body class for overlay
      if (showMobileNotificationDropdown.value) {
        document.body.classList.add('has-mobile-dropdown');
        window.scrollTo(0, 0);
        // Fetch recent notifications
        fetchRecentNotifications();
      } else {
        document.body.classList.remove('has-mobile-dropdown');
      }
    };
    
    return {
      isMobile,
      showUserMenu,
      userRole,
      isAuthenticated,
      userName,
      userEmail,
      userAvatar,
      shouldShowNav,
      toggleUserMenu,
      handleLogout,
      
      // Notification related
      notificationCount,
      showNotificationDropdown,
      recentNotifications,
      loadingNotifications,
      notificationRef,
      toggleNotificationDropdown,
      formatCount,
      getNotificationIcon,
      formatTime,
      viewNotification,
      getFileUrl,
      isRouteActive,
      mobileDropdownRef,
      
      // Mobile notification related
      showMobileNotificationDropdown,
      toggleMobileNotificationDropdown
    };
  }
};
</script>

<style scoped>
/* Common styles */
.navigation-container {
  width: 100%;
  background: linear-gradient(135deg, #00C853 0%, #009688 100%);
  color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
}

/* Add this global fix for the content padding */
:root {
  --nav-height: 80px;
  --mobile-nav-height: 60px;
}

/* Push content below the navbar */
#app {
  padding-top: var(--nav-height);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between logo and right content */
  width: 100%; /* Full width */
  padding: 0; /* Remove padding */
  height: 80px;
}

.logo {
  padding-left: 30px; /* Add padding to logo container instead */
}

/* Right side content container */
.right-content {
  display: flex;
  align-items: center;
  gap: 10px; /* Reduced from 20px to create more consistent spacing */
  padding-right: 30px; /* Add padding to right content */
}

.logo img {
  height: 50px;
  margin: 15px 0;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 10px; /* Added specific gap instead of relying on nav-item margins */
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  margin: 0; /* Removed 0 5px margin to use parent's gap instead */
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 22px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: transform 0.3s;
}

.nav-item:hover .icon {
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.2);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* Added specific gap property */
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 40px;
  margin-left: 0; /* Removed the 15px margin */
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-profile:hover {
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.username {
  font-weight: 500;
}

.dropdown-icon {
  margin-left: 10px;
  font-size: 14px;
  opacity: 0.8;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  min-width: 220px;
  z-index: 1001;
  margin-top: 10px;
  overflow: hidden;
  transform-origin: top right;
  animation: dropdownFadeIn 0.2s forwards;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
  margin-right: 12px;
  font-size: 20px;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
}

.user-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item i {
  width: 24px;
  text-align: center;
  margin-right: 10px;
  font-size: 16px;
  color: #666;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #eeeeee;
  margin: 5px 0;
}

.logout {
  color: #f44336;
  cursor: pointer;
}

.logout i {
  color: #f44336;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn {
  color: white;
  border: 2px solid white;
  background-color: transparent;
}

.login-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.register-btn {
  background-color: white;
  color: #00C853;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Notifications styles */
.notification-wrapper {
  position: relative;
  cursor: pointer;
}

.notification-icon {
  position: relative;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  width: 45px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s;
}

.notification-wrapper:hover .notification-icon {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff5252;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid #00C853;
  transform: translate(25%, -25%);
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: -100px;
  width: 320px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  margin-top: 15px;
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: dropdownFadeIn 0.2s forwards;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.notifications-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.view-all {
  font-size: 14px;
  color: #00C853;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-all:hover {
  background-color: rgba(0, 200, 83, 0.1);
}

.notifications-loading {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 200, 83, 0.1);
  border-top: 3px solid #00C853;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-notifications {
  padding: 30px;
  text-align: center;
  color: #757575;
  font-size: 15px;
}

.recent-notifications {
  overflow-y: auto;
  max-height: 320px;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #e8f5e9;
}

.notification-mini-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #00C853;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.notification-item.unread .notification-mini-icon {
  background-color: #00C853;
  color: white;
}

.notification-title {
  font-size: 15px;
  margin-bottom: 5px;
  font-weight: 500;
}

.notification-time {
  font-size: 13px;
  color: #757575;
}

/* Mobile navigation CSS */
.mobile-nav-layout {
  width: 100%;
  position: relative;
  z-index: 1000;
}

/* Mobile top navbar */
.mobile-top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #00C853, #009688);
  padding: 15px 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90px; /* Increased to 90px */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1050;
}

/* Spacer to push content down */
.mobile-top-spacer {
  display: block;
    width: 100%;
  height: 90px;  /* Increased to match 90px height */
  visibility: visible !important;
}

.mobile-logo {
  height: 55px; /* Increased for 90px navbar */
  display: flex;
  align-items: center;
}

.mobile-logo img {
  height: 75px; /* Increased for 90px navbar */
}

.mobile-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Clean, modern notification icon */
.mobile-notification-icon {
  position: relative;
  cursor: pointer;
  width: 42px;
  height: 42px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.mobile-notification-icon:active {
  transform: scale(0.95);
}

.mobile-notification-icon i {
  font-size: 20px;
  color: white;
}

.mobile-notification-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  background-color: #ff5252;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
}

/* Clean, modern profile icon */
.mobile-profile-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
}

.mobile-profile-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-profile-icon:active {
  transform: scale(0.95);
}

/* Mobile notification dropdown styles */
.mobile-notifications-dropdown {
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  width: 92%;
  max-width: none;
  max-height: 80vh;
  margin: 0 auto;
  background-color: white;
  z-index: 1000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  animation: slideInDown 0.3s ease;
  transform: none;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-notifications-dropdown::before {
  content: none;
}

.mobile-notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background-color: white;
  border-bottom: 1px solid #eaeaea;
}

.mobile-notifications-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.mobile-notifications-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
}

.mobile-notifications-close:active {
  background-color: #f5f5f5;
}

.mobile-no-notifications {
  padding: 30px 20px;
  text-align: center;
  color: #777;
}

.mobile-recent-notifications {
  max-height: 60vh;
  overflow-y: auto;
}

.mobile-notification-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-notification-item:active {
  background-color: #f8f8f8;
}

.mobile-notification-item.unread {
  background-color: #f0f8ff;
}

.mobile-notification-item .notification-mini-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #00C853;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.mobile-notification-item.unread .notification-mini-icon {
  background-color: #00C853;
  color: white;
}

.mobile-notifications-footer {
  padding: 15px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.view-all-mobile {
  color: #00A046;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
}

/* Mobile dropdown menu */
.mobile-dropdown-menu {
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  width: 92%;
  margin: 0 auto;
  background-color: white;
  z-index: 1000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  animation: slideInDown 0.3s ease;
  transform: none;
}

.mobile-dropdown-menu::before {
  content: none;
}

.mobile-dropdown-menu .dropdown-header {
  padding: 20px;
  background-color: #00C853;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mobile-dropdown-menu .dropdown-close {
  position: absolute;
  right: 15px;
  top: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

.mobile-dropdown-menu .user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  color: #00C853;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.mobile-dropdown-menu .dropdown-items {
  padding: 8px 0;
}

.mobile-dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #f5f5f5;
}

.mobile-dropdown-menu .dropdown-item:active {
  background-color: #f8f8f8;
}

.mobile-dropdown-menu .item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 15px;
  flex-shrink: 0;
}

.mobile-dropdown-menu .item-content {
  flex: 1;
}

.mobile-dropdown-menu .item-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 3px;
}

.mobile-dropdown-menu .item-subtitle {
  font-size: 13px;
  color: #777;
}

.mobile-dropdown-menu .logout .item-icon {
  color: #f44336;
  background-color: #ffebee;
}

.mobile-dropdown-menu .logout .item-title {
  color: #f44336;
}

@media (max-width: 767px) {
  /* Global CSS reset for all elements */
  * {
    box-sizing: border-box;
  }

  /* Global page structure fix */
  html, body {
    margin: 0;
    padding: 0;
  }
  
  body {
    padding-top: 0 !important;
    padding-bottom: 90px !important;
  }
  
  /* Add a global style for all elements that need to be pushed down */
  .view, .page, .content-view, main, section, article, .container, .content {
    margin-top: 90px !important;
    padding-top: 15px !important;
  }

  /* Content fixes */
  #app {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
  
  .app-content,
  .page-content,
  .main-content {
    margin-top: 90px !important;
    padding-top: 15px !important;
  }
  
  /* Force the spacer to be visible */
  .mobile-top-spacer {
    display: block !important;
    min-height: 90px !important;
  }
  
  .navigation-container {
    display: none; /* Hide the regular navigation on mobile */
  }
  
  /* Only show mobile nav layout on mobile */
  .mobile-nav-layout {
    display: block;
  }
  
  /* Make sure the mobile top navbar has the highest z-index */
  .mobile-top-navbar {
    z-index: 1050 !important;
  }
  
  .mobile-bottom-navbar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: linear-gradient(to right, #00C853, #009688);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 90px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1050 !important;
  }
  
  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.8);
    padding: 12px;
    transition: all 0.2s ease;
    flex: 1;
  }
  
  .mobile-nav-item .icon {
    font-size: 28px;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    background-color: transparent;
  }
  
  .mobile-nav-item span {
    font-size: 13px;
    font-weight: 500;
  }
  
  .mobile-nav-item.active {
    color: white;
    position: relative;
  }
  
  .mobile-nav-item.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 25%;
    width: 50%;
    height: 3px;
    background-color: white;
    border-radius: 3px;
  }
  
  /* Add overlay for dropdowns when active */
  body.has-mobile-dropdown::after {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 900;
  }
  
  /* Target common container classes to ensure padding */
  .container, 
  .content-wrapper, 
  .page-container,
  .booking-list,
  .card,
  .main-content {
    margin-bottom: var(--mobile-nav-height) !important;
    padding-bottom: 20px !important;
  }
}
</style>
