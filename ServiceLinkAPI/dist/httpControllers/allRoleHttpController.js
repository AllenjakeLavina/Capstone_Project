"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetProviderAvailability = exports.handleGetCategoriesWithServices = exports.handleUploadProfilePicture = exports.handleMarkAllNotificationsRead = exports.handleMarkNotificationRead = exports.handleGetNotificationCount = exports.handleGetNotifications = exports.handleUploadImage = exports.handleSendMessage = exports.handleGetConversationMessages = exports.handleGetConversations = exports.handleGetProviderDetails = exports.handleSearchProviders = exports.handleGetServiceDetails = exports.handleGetAllServices = exports.handleVerifyEmailCode = exports.handleResendVerificationCode = exports.handleResetPassword = exports.handleForgotPassword = exports.handleGetMe = exports.handleChangePassword = exports.handleLogin = void 0;
const allRoleFunctionController_1 = require("../functionControllers/allRoleFunctionController");
const providerFunctionController_1 = require("../functionControllers/providerFunctionController");
const fileHandler_1 = require("../middlewares/fileHandler");
const handleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.loginUser)(email, password);
        // If a provider with pending verification logs in, create a notification
        if (result.providerVerificationStatus === 'pending') {
            try {
                yield (0, providerFunctionController_1.createProviderVerificationNotification)(result.user.id);
            }
            catch (notifError) {
                console.error('Failed to create verification notification:', notifError);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Determine status code based on error message
        let statusCode = 400;
        if (errorMessage.includes('not verified') || errorMessage.includes('pending verification')) {
            statusCode = 403; // Forbidden - account exists but can't be used yet
        }
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleLogin = handleLogin;
const handleChangePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // From JWT token
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
            return;
        }
        // Validate password strength
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.changePassword)(userId, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleChangePassword = handleChangePassword;
const handleGetMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // From JWT token
        const user = yield (0, allRoleFunctionController_1.getUserById)(userId);
        res.status(200).json({
            success: true,
            data: user
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetMe = handleGetMe;
const handleForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }
        yield (0, allRoleFunctionController_1.forgotPassword)(email);
        // Always return success even if email doesn't exist (for security)
        res.status(200).json({
            success: true,
            message: 'If your email exists in our system, you will receive password reset instructions'
        });
        return;
    }
    catch (error) {
        // For security, don't reveal specific errors
        console.error('Password reset error:', error);
        res.status(200).json({
            success: true,
            message: 'If your email exists in our system, you will receive password reset instructions'
        });
        return;
    }
});
exports.handleForgotPassword = handleForgotPassword;
const handleResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Email, token, and new password are required'
            });
            return;
        }
        // Validate password strength
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.resetPassword)(email, token, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleResetPassword = handleResetPassword;
const handleResendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.resendVerificationCode)(email);
        res.status(200).json({
            success: true,
            message: 'Verification code resent successfully'
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleResendVerificationCode = handleResendVerificationCode;
const handleVerifyEmailCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.verifyEmailCode)(email, code);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleVerifyEmailCode = handleVerifyEmailCode;
const handleGetAllServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract query parameters
        const { categoryId, minPrice, maxPrice, searchTerm, skillIds, page, limit } = req.query;
        // Prepare filters object
        const filters = {};
        if (categoryId)
            filters.categoryId = categoryId;
        if (minPrice)
            filters.minPrice = parseFloat(minPrice);
        if (maxPrice)
            filters.maxPrice = parseFloat(maxPrice);
        if (searchTerm)
            filters.searchTerm = searchTerm;
        if (skillIds) {
            if (typeof skillIds === 'string') {
                filters.skillIds = [skillIds];
            }
            else {
                filters.skillIds = skillIds;
            }
        }
        // Prepare pagination
        const pagination = {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10
        };
        const result = yield (0, allRoleFunctionController_1.getAllServices)(filters, pagination);
        res.status(200).json({
            success: true,
            data: result
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetAllServices = handleGetAllServices;
const handleGetServiceDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId } = req.params;
        if (!serviceId) {
            res.status(400).json({
                success: false,
                message: 'Service ID is required'
            });
            return;
        }
        const service = yield (0, allRoleFunctionController_1.getServiceDetails)(serviceId);
        res.status(200).json({
            success: true,
            data: service
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Use correct status code based on the error
        const statusCode = errorMessage.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetServiceDetails = handleGetServiceDetails;
const handleSearchProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract query parameters
        const { searchTerm, skillIds, categoryId, page, limit } = req.query;
        // Prepare query object
        const query = {};
        if (searchTerm)
            query.searchTerm = searchTerm;
        if (categoryId)
            query.categoryId = categoryId;
        if (skillIds) {
            if (typeof skillIds === 'string') {
                query.skillIds = [skillIds];
            }
            else {
                query.skillIds = skillIds;
            }
        }
        // Prepare pagination
        const pagination = {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10
        };
        const result = yield (0, allRoleFunctionController_1.searchProviders)(query, pagination);
        res.status(200).json({
            success: true,
            data: result
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleSearchProviders = handleSearchProviders;
const handleGetProviderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        if (!providerId) {
            res.status(400).json({
                success: false,
                message: 'Provider ID is required'
            });
            return;
        }
        const providerDetails = yield (0, allRoleFunctionController_1.getProviderDetails)(providerId);
        res.status(200).json({
            success: true,
            data: providerDetails
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Use correct status code based on the error
        const statusCode = errorMessage.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetProviderDetails = handleGetProviderDetails;
const handleGetConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const conversations = yield (0, allRoleFunctionController_1.getUserConversations)(userId);
        res.status(200).json({
            success: true,
            data: conversations
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetConversations = handleGetConversations;
const handleGetConversationMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!conversationId) {
            res.status(400).json({
                success: false,
                message: 'Conversation ID is required'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.getConversationMessages)(conversationId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetConversationMessages = handleGetConversationMessages;
const handleSendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;
        const { content, imageUrl } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!conversationId) {
            res.status(400).json({
                success: false,
                message: 'Conversation ID is required'
            });
            return;
        }
        if ((!content || typeof content !== 'string' || content.trim() === '') && !imageUrl) {
            res.status(400).json({
                success: false,
                message: 'Message content or image is required'
            });
            return;
        }
        try {
            const message = yield (0, allRoleFunctionController_1.sendMessage)(conversationId, userId, content || '', imageUrl);
            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: message
            });
        }
        catch (error) {
            // Handle specific error for completed bookings
            if (error instanceof Error && error.message.includes('booking has been completed')) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                throw error;
            }
        }
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleSendMessage = handleSendMessage;
const handleUploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        // Check if file was uploaded
        if (!req.file) {
            console.error('No file found in request:', req.body);
            res.status(400).json({
                success: false,
                message: 'Image file is required'
            });
            return;
        }
        // Get the URL for the uploaded file
        const fileUrl = (0, fileHandler_1.getFileUrl)(req, req.file);
        console.log('Image uploaded successfully:', fileUrl);
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: fileUrl
        });
        return;
    }
    catch (error) {
        console.error('Error in upload image handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleUploadImage = handleUploadImage;
const handleGetNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        console.log('GET /notifications - Request received');
        console.log('User from token:', req.user);
        console.log('Using userId:', userId);
        console.log('Query parameters:', req.query);
        if (!userId) {
            console.error('No user ID found in token');
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        // Get pagination parameters with proper validation
        let page = 1;
        let limit = 10;
        if (req.query.page) {
            const pageParam = parseInt(req.query.page);
            if (!isNaN(pageParam) && pageParam > 0) {
                page = pageParam;
            }
        }
        if (req.query.limit) {
            const limitParam = parseInt(req.query.limit);
            if (!isNaN(limitParam) && limitParam > 0) {
                limit = Math.min(limitParam, 50); // Cap at 50 to prevent excessive loads
            }
        }
        console.log(`Using pagination: page=${page}, limit=${limit}`);
        const result = yield (0, allRoleFunctionController_1.getUserNotifications)(userId, page, limit);
        console.log('Notification result summary:', {
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            returningCount: result.notifications.length
        });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetNotifications:', error);
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetNotifications = handleGetNotifications;
const handleGetNotificationCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        console.log('GET /notifications/count - Request received');
        console.log('User from token:', req.user);
        console.log('Using userId:', userId);
        if (!userId) {
            console.error('No user ID found in token');
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const count = yield (0, allRoleFunctionController_1.getUnreadNotificationCount)(userId);
        console.log('Notification count result:', count);
        res.status(200).json({
            success: true,
            data: { count }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetNotificationCount:', error);
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetNotificationCount = handleGetNotificationCount;
const handleMarkNotificationRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!notificationId) {
            res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.markNotificationAsRead)(userId, notificationId);
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: result
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleMarkNotificationRead = handleMarkNotificationRead;
const handleMarkAllNotificationsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const result = yield (0, allRoleFunctionController_1.markAllNotificationsAsRead)(userId);
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: result
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleMarkAllNotificationsRead = handleMarkAllNotificationsRead;
const handleUploadProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        // Check if file was uploaded
        if (!req.file) {
            console.error('No profile picture file found in request:', req.body);
            res.status(400).json({
                success: false,
                message: 'Profile picture file is required'
            });
            return;
        }
        // Get the URL for the uploaded file
        const fileUrl = (0, fileHandler_1.getFileUrl)(req, req.file);
        console.log('Profile picture uploaded successfully:', fileUrl);
        // Update the user's profile picture in the database
        const updatedUser = yield (0, allRoleFunctionController_1.updateProfilePicture)(userId, fileUrl);
        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                profilePicture: fileUrl
            }
        });
    }
    catch (error) {
        console.error('Error in upload profile picture handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleUploadProfilePicture = handleUploadProfilePicture;
const handleGetCategoriesWithServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoriesWithServices = yield (0, allRoleFunctionController_1.getCategoriesWithServices)();
        res.status(200).json({
            success: true,
            data: categoriesWithServices
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error getting categories with services:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetCategoriesWithServices = handleGetCategoriesWithServices;
const handleGetProviderAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        if (!providerId) {
            res.status(400).json({
                success: false,
                message: 'Provider ID is required'
            });
            return;
        }
        const availability = yield (0, providerFunctionController_1.getProviderAvailabilityByProviderId)(providerId);
        res.status(200).json({
            success: true,
            data: availability
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Use correct status code based on the error
        const statusCode = errorMessage.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleGetProviderAvailability = handleGetProviderAvailability;
