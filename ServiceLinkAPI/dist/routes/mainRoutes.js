"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRoutes = void 0;
const express_1 = __importDefault(require("express"));
const allRoleHttpController_1 = require("../httpControllers/allRoleHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const router = express_1.default.Router();
exports.mainRoutes = router;
// Public routes
router.post('/login', allRoleHttpController_1.handleLogin);
router.post('/forgot-password', allRoleHttpController_1.handleForgotPassword);
router.post('/reset-password', allRoleHttpController_1.handleResetPassword);
router.post('/resend-verification', allRoleHttpController_1.handleResendVerificationCode);
router.post('/verify-email', allRoleHttpController_1.handleVerifyEmailCode);
// Public service routes
router.get('/services', allRoleHttpController_1.handleGetAllServices);
router.get('/services/:serviceId', allRoleHttpController_1.handleGetServiceDetails);
router.get('/providers/search', allRoleHttpController_1.handleSearchProviders);
router.get('/providers/:providerId', allRoleHttpController_1.handleGetProviderDetails);
router.get('/providers/:providerId/availability', allRoleHttpController_1.handleGetProviderAvailability);
router.get('/categories-with-services', allRoleHttpController_1.handleGetCategoriesWithServices);
// Protected routes
router.get('/me', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleGetMe);
router.post('/change-password', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleChangePassword);
// Notification routes
router.get('/notifications', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleGetNotifications);
router.get('/notifications/count', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleGetNotificationCount);
router.post('/notifications/:notificationId/read', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleMarkNotificationRead);
router.post('/notifications/read-all', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleMarkAllNotificationsRead);
// Chat routes
router.get('/conversations', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleGetConversations);
router.get('/conversations/:conversationId/messages', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleGetConversationMessages);
router.post('/conversations/:conversationId/messages', authMiddleware_1.authenticateToken, allRoleHttpController_1.handleSendMessage);
// File upload route for chat images
router.post('/upload-image', authMiddleware_1.authenticateToken, fileHandler_1.uploadFile.single('image'), allRoleHttpController_1.handleUploadImage);
// Profile picture upload route
router.post('/upload-profile-picture', authMiddleware_1.authenticateToken, fileHandler_1.uploadFile.single('profilePicture'), allRoleHttpController_1.handleUploadProfilePicture);
