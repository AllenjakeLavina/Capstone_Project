"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const adminHttpController_1 = require("../httpControllers/adminHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const router = express_1.default.Router();
exports.adminRoutes = router;
// TEMPORARY - WARNING - REMOVE BEFORE PRODUCTION
// This route is intentionally unprotected for initial setup
router.post('/set-password', adminHttpController_1.handleSetPassword);
// This route is also unprotected for initial admin creation
router.post('/create-admin', adminHttpController_1.handleCreateAdmin);
// Dashboard routes
router.get('/dashboard/stats', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetDashboardStats);
router.get('/dashboard/recent-bookings', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetRecentBookings);
router.get('/dashboard/provider-ratings', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetProviderRatings);
// Transactions and Activity Logs
router.get('/transactions', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetAllTransactions);
router.get('/activity-logs', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetActivityLogs);
// Protected admin routes (example)
router.get('/dashboard', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), (req, res) => {
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
router.get('/clients', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetAllClients);
router.post('/clients/:clientId/toggle-status', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleToggleClientStatus);
// Provider management
router.get('/providers', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetAllProviders);
router.get('/providers/unverified', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetUnverifiedProviders);
router.get('/providers/:providerId/details', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetProviderDetailsForAdmin);
router.post('/providers/verify', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleVerifyProvider);
router.post('/providers/reject', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleRejectProviderVerification);
router.post('/providers/:providerId/toggle-status', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleToggleProviderStatus);
// Client management - verification
router.post('/clients/verify', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleVerifyClient);
router.post('/clients/reject', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleRejectClientVerification);
router.get('/clients/:clientId/details', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetUnverifiedClientDetails);
// Combined unverified users (clients + providers)
router.get('/users/unverified', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetUnverifiedUsers);
router.get('/users/:userType/:userId/details', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetUnverifiedUserDetails);
// User management
router.post('/users/change-password', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleChangeUserPassword);
// Category management
router.post('/category', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), fileHandler_1.uploadFile.single('categoryImage'), adminHttpController_1.handleCreateCategory);
router.get('/category', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetAllCategories);
router.patch('/category/:categoryId', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), fileHandler_1.uploadFile.single('categoryImage'), adminHttpController_1.handleEditCategory);
router.delete('/category/:categoryId', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleDeleteCategory);
// Service approval management
router.get('/services/pending', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleGetPendingServices);
router.post('/services/approve', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleApproveService);
router.post('/services/reject', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('ADMIN'), adminHttpController_1.handleRejectService);
