import express from 'express';
import { 
  handleCreateAdmin, 
  handleSetPassword, 
  handleGetUnverifiedProviders,
  handleGetUnverifiedUsers,
  handleVerifyProvider,
  handleVerifyClient,
  handleRejectProviderVerification,
  handleRejectClientVerification,
  handleGetUnverifiedProviderDetails,
  handleGetUnverifiedClientDetails,
  handleGetUnverifiedUserDetails,
  handleGetProviderDetailsForAdmin,
  handleGetAllClients,
  handleGetAllProviders,
  handleChangeUserPassword,
  handleCreateCategory,
  handleGetAllCategories,
  handleEditCategory,
  handleDeleteCategory,
  handleToggleClientStatus,
  handleToggleProviderStatus,
  handleGetDashboardStats,
  handleGetRecentBookings,
  handleGetProviderRatings,
  handleGetPendingServices,
  handleApproveService,
  handleRejectService,
  handleGetAllTransactions,
  handleGetActivityLogs,
  handleIncrementWebsiteViews,
  handleGetWebsiteViews 
} from '../httpControllers/adminHttpController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';
import { uploadFile } from '../middlewares/fileHandler';

const router = express.Router();

// TEMPORARY - WARNING - REMOVE BEFORE PRODUCTION
// This route is intentionally unprotected for initial setup
router.post('/set-password', handleSetPassword);

// This route is also unprotected for initial admin creation
router.post('/create-admin', handleCreateAdmin);

// Dashboard routes
router.get('/dashboard/stats', authenticateToken, authorizeRoles('ADMIN'), handleGetDashboardStats);
router.get('/dashboard/recent-bookings', authenticateToken, authorizeRoles('ADMIN'), handleGetRecentBookings);
router.get('/dashboard/provider-ratings', authenticateToken, authorizeRoles('ADMIN'), handleGetProviderRatings);

// Transactions and Activity Logs
router.get('/transactions', authenticateToken, authorizeRoles('ADMIN'), handleGetAllTransactions);
router.get('/activity-logs', authenticateToken, authorizeRoles('ADMIN'), handleGetActivityLogs);

// Protected admin routes (example)
router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard data',
    data: {
      stats: {
        users: 100,
        providers: 25,
        clients: 75
      }
    }
  });
});

// Protected routes - require admin authentication
// Client management
router.get('/clients', authenticateToken, authorizeRoles('ADMIN'), handleGetAllClients);
router.post('/clients/:clientId/toggle-status', authenticateToken, authorizeRoles('ADMIN'), handleToggleClientStatus);

// Provider management
router.get('/providers', authenticateToken, authorizeRoles('ADMIN'), handleGetAllProviders);
router.get('/providers/unverified', authenticateToken, authorizeRoles('ADMIN'), handleGetUnverifiedProviders);
router.get('/providers/:providerId/details', authenticateToken, authorizeRoles('ADMIN'), handleGetProviderDetailsForAdmin);
router.post('/providers/verify', authenticateToken, authorizeRoles('ADMIN'), handleVerifyProvider);
router.post('/providers/reject', authenticateToken, authorizeRoles('ADMIN'), handleRejectProviderVerification);
router.post('/providers/:providerId/toggle-status', authenticateToken, authorizeRoles('ADMIN'), handleToggleProviderStatus);

// Client management - verification
router.post('/clients/verify', authenticateToken, authorizeRoles('ADMIN'), handleVerifyClient);
router.post('/clients/reject', authenticateToken, authorizeRoles('ADMIN'), handleRejectClientVerification);
router.get('/clients/:clientId/details', authenticateToken, authorizeRoles('ADMIN'), handleGetUnverifiedClientDetails);

// Combined unverified users (clients + providers)
router.get('/users/unverified', authenticateToken, authorizeRoles('ADMIN'), handleGetUnverifiedUsers);
router.get('/users/:userType/:userId/details', authenticateToken, authorizeRoles('ADMIN'), handleGetUnverifiedUserDetails);

// User management
router.post('/users/change-password', authenticateToken, authorizeRoles('ADMIN'), handleChangeUserPassword);

// Category management
router.post(
  '/category',
  authenticateToken,
  authorizeRoles('ADMIN'),
  uploadFile.single('categoryImage'),
  handleCreateCategory
);
router.get('/category', authenticateToken, authorizeRoles('ADMIN'), handleGetAllCategories);
router.patch(
  '/category/:categoryId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  uploadFile.single('categoryImage'),
  handleEditCategory
);

router.delete(
  '/category/:categoryId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  handleDeleteCategory
);

// Service approval management
router.get('/services/pending', authenticateToken, authorizeRoles('ADMIN'), handleGetPendingServices);
router.post('/services/approve', authenticateToken, authorizeRoles('ADMIN'), handleApproveService);
router.post('/services/reject', authenticateToken, authorizeRoles('ADMIN'), handleRejectService);

// Add this comment to remind yourself to secure or remove these routes
/*
  !!!! IMPORTANT !!!!
  REMOVE OR PROTECT THESE ROUTES BEFORE PRODUCTION DEPLOYMENT
  These routes are only for development and initial setup.
*/
router.post('/views/increment', handleIncrementWebsiteViews);
router.get('/views', authenticateToken, authorizeRoles('ADMIN'), handleGetWebsiteViews);

export { router as adminRoutes };
