import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../components/LandingPage.vue';
import LoginPage from '../components/LoginPage.vue';
import RegisterOption from '../components/RegisterOption.vue';
import RegisterClientPage from '../components/RegisterClientPage.vue';
import RegisterProvider from '../components/RegisterProvider.vue';
import EmailVerification from '../components/EmailVerification.vue';
import ForgotPassword from '../components/ForgotPassword.vue';
import ResetPassword from '../components/ResetPassword.vue';
import ProviderProfile from '../components/provider/providerProfile.vue';
import ProviderServices from '../components/provider/providerServices.vue';
import Notifications from '../components/shared/Notifications.vue';
import ClientProfile from '../components/client/clientProfile.vue';
import ClientServices from '../components/client/clientServices.vue';
import ClientBookings from '../components/client/clientBookings.vue';
import ClientBookingDetails from '../components/client/clientBookingDetails.vue';
import ProviderBookings from '../components/provider/providerBookings.vue';
import ProviderBookingDetails from '../components/provider/providerBookingDetails.vue';
import message from '../components/shared/message.vue';
import UnverifiedProviders from '../components/admin/unverifiedProviders.vue';
import AllProviders from '../components/admin/allProviders.vue';
import AllClients from '../components/admin/allClients.vue';
import UserManagement from '../components/admin/userManagement.vue';
import CategoryManagement from '../components/admin/categoryManagement.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LandingPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'RegisterOption',
    component: RegisterOption
  },
  {
    path: '/register/client',
    name: 'RegisterClient',
    component: RegisterClientPage
  },
  {
    path: '/register/provider',
    name: 'RegisterProvider',
    component: RegisterProvider
  },
  {
    path: '/verify-email',
    name: 'EmailVerification',
    component: EmailVerification
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/provider/profile',
    name: 'ProviderProfile',
    component: ProviderProfile,
    meta: { requiresAuth: true, roles: ['PROVIDER'] }
  },
  {
    path: '/provider/services',
    name: 'ProviderServices',
    component: ProviderServices,
    meta: { requiresAuth: true, roles: ['PROVIDER'] }
  },
  {
    path: '/provider/bookings',
    name: 'ProviderBookings',
    component: ProviderBookings,
    meta: { requiresAuth: true, roles: ['PROVIDER'] }
  },
  {
    path: '/provider/booking/:bookingId',
    name: 'ProviderBookingDetails',
    component: ProviderBookingDetails,
    meta: { requiresAuth: true, roles: ['PROVIDER'] }
  },
  {
    path: '/client/profile',
    name: 'ClientProfile',
    component: ClientProfile,
    meta: { requiresAuth: true, roles: ['CLIENT'] }
  },
  {
    path: '/client/services',
    name: 'ClientServices',
    component: ClientServices,
    meta: { requiresAuth: true, roles: ['CLIENT'] }
  },
  {
    path: '/client/bookings',
    name: 'ClientBookings',
    component: ClientBookings,
    meta: { requiresAuth: true, roles: ['CLIENT'] }
  },
  {
    path: '/client/booking/:bookingId',
    name: 'ClientBookingDetails',
    component: ClientBookingDetails,
    meta: { requiresAuth: true, roles: ['CLIENT'] }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: message,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/unverified-providers',
    name: 'UnverifiedProviders',
    component: UnverifiedProviders,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/providers',
    name: 'AllProviders',
    component: AllProviders,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/clients',
    name: 'AllClients',
    component: AllClients,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/category-management',
    name: 'CategoryManagement',
    component: CategoryManagement,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  if (requiresAuth && !token) {
    next('/login');
  } else if (requiresAuth && to.meta.roles && !to.meta.roles.includes(userRole)) {
    next('/');
  } else {
    next();
  }
});

export default router;
