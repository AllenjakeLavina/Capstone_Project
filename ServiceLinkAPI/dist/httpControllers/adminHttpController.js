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
exports.handleRejectService = exports.handleApproveService = exports.handleGetPendingServices = exports.handleGetProviderRatings = exports.handleGetActivityLogs = exports.handleGetAllTransactions = exports.handleGetRecentBookings = exports.handleGetDashboardStats = exports.handleToggleProviderStatus = exports.handleToggleClientStatus = exports.handleDeleteCategory = exports.handleEditCategory = exports.handleGetAllCategories = exports.handleCreateCategory = exports.handleGetProviderDetailsForAdmin = exports.handleGetUnverifiedUserDetails = exports.handleGetUnverifiedClientDetails = exports.handleGetUnverifiedProviderDetails = exports.handleRejectClientVerification = exports.handleRejectProviderVerification = exports.handleVerifyClient = exports.handleVerifyProvider = exports.handleGetUnverifiedUsers = exports.handleGetUnverifiedProviders = exports.handleGetAllProviders = exports.handleGetAllClients = exports.handleChangeUserPassword = exports.handleCreateAdmin = exports.handleSetPassword = void 0;
const adminFunctionController_1 = require("../functionControllers/adminFunctionController");
const handleSetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
            return;
        }
        yield (0, adminFunctionController_1.setPassword)(email, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
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
exports.handleSetPassword = handleSetPassword;
const handleCreateAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        // Validate input
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({
                success: false,
                message: 'Email, password, first name, and last name are required'
            });
            return;
        }
        const admin = yield (0, adminFunctionController_1.createAdminUser)(email, password, firstName, lastName, phone);
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: admin
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
exports.handleCreateAdmin = handleCreateAdmin;
const handleChangeUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, newPassword } = req.body;
        // Admin making the request
        const adminId = req.user.id;
        // Validate required fields
        if (!userId || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'User ID and new password are required'
            });
            return;
        }
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const result = yield (0, adminFunctionController_1.changeUserPassword)(userId, newPassword, adminId);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
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
exports.handleChangeUserPassword = handleChangeUserPassword;
const handleGetAllClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const clients = yield (0, adminFunctionController_1.getAllClients)();
        res.status(200).json({
            success: true,
            data: clients
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
exports.handleGetAllClients = handleGetAllClients;
const handleGetAllProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const providers = yield (0, adminFunctionController_1.getAllProvidersWithStatus)();
        res.status(200).json({
            success: true,
            data: providers
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
exports.handleGetAllProviders = handleGetAllProviders;
const handleGetUnverifiedProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const providers = yield (0, adminFunctionController_1.getUnverifiedProviders)();
        res.status(200).json({
            success: true,
            data: providers
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
exports.handleGetUnverifiedProviders = handleGetUnverifiedProviders;
const handleGetUnverifiedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const users = yield (0, adminFunctionController_1.getUnverifiedUsers)();
        res.status(200).json({
            success: true,
            data: users
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
exports.handleGetUnverifiedUsers = handleGetUnverifiedUsers;
const handleVerifyProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, documentId } = req.body;
        // Admin making the request
        const adminId = req.user.id;
        // Validate required fields
        if (!providerId) {
            res.status(400).json({
                success: false,
                message: 'Provider ID is required'
            });
            return;
        }
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const result = yield (0, adminFunctionController_1.verifyProviderAccount)(providerId, adminId, documentId);
        res.status(200).json({
            success: true,
            message: 'Provider account verified successfully',
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
exports.handleVerifyProvider = handleVerifyProvider;
const handleVerifyClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId } = req.body;
        // Admin making the request
        const adminId = req.user.id;
        // Validate required fields
        if (!clientId) {
            res.status(400).json({
                success: false,
                message: 'Client ID is required'
            });
            return;
        }
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const result = yield (0, adminFunctionController_1.verifyClientAccount)(clientId, adminId);
        res.status(200).json({
            success: true,
            message: 'Client account verified successfully',
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
exports.handleVerifyClient = handleVerifyClient;
const handleRejectProviderVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, reason } = req.body;
        const adminId = req.user.id;
        if (!providerId || !reason) {
            res.status(400).json({
                success: false,
                message: 'Provider ID and rejection reason are required'
            });
            return;
        }
        const result = yield (0, adminFunctionController_1.rejectProviderVerification)(providerId, adminId, reason);
        res.status(200).json({
            success: true,
            message: 'Provider verification rejected successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error rejecting provider verification:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject provider verification'
        });
    }
});
exports.handleRejectProviderVerification = handleRejectProviderVerification;
const handleRejectClientVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, reason } = req.body;
        const adminId = req.user.id;
        if (!clientId || !reason) {
            res.status(400).json({
                success: false,
                message: 'Client ID and rejection reason are required'
            });
            return;
        }
        const result = yield (0, adminFunctionController_1.rejectClientVerification)(clientId, adminId, reason);
        res.status(200).json({
            success: true,
            message: 'Client verification rejected successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error rejecting client verification:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject client verification'
        });
    }
});
exports.handleRejectClientVerification = handleRejectClientVerification;
const handleGetUnverifiedProviderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        if (!providerId) {
            res.status(400).json({
                success: false,
                message: 'Provider ID is required'
            });
            return;
        }
        const providerDetails = yield (0, adminFunctionController_1.getUnverifiedProviderDetails)(providerId);
        res.status(200).json({
            success: true,
            message: 'Provider details retrieved successfully',
            data: providerDetails
        });
    }
    catch (error) {
        console.error('Error getting unverified provider details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get provider details'
        });
    }
});
exports.handleGetUnverifiedProviderDetails = handleGetUnverifiedProviderDetails;
const handleGetUnverifiedClientDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            res.status(400).json({
                success: false,
                message: 'Client ID is required'
            });
            return;
        }
        const clientDetails = yield (0, adminFunctionController_1.getUnverifiedClientDetails)(clientId);
        res.status(200).json({
            success: true,
            message: 'Client details retrieved successfully',
            data: clientDetails
        });
    }
    catch (error) {
        console.error('Error getting unverified client details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get client details'
        });
    }
});
exports.handleGetUnverifiedClientDetails = handleGetUnverifiedClientDetails;
const handleGetUnverifiedUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userType } = req.params;
        if (!userId || !userType) {
            res.status(400).json({
                success: false,
                message: 'User ID and user type are required'
            });
            return;
        }
        let userDetails;
        if (userType === 'PROVIDER') {
            userDetails = yield (0, adminFunctionController_1.getUnverifiedProviderDetails)(userId);
        }
        else if (userType === 'CLIENT') {
            userDetails = yield (0, adminFunctionController_1.getUnverifiedClientDetails)(userId);
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Invalid user type. Must be PROVIDER or CLIENT'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            data: Object.assign(Object.assign({}, userDetails), { userType })
        });
    }
    catch (error) {
        console.error('Error getting unverified user details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get user details'
        });
    }
});
exports.handleGetUnverifiedUserDetails = handleGetUnverifiedUserDetails;
const handleGetProviderDetailsForAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        if (!providerId) {
            res.status(400).json({ success: false, message: 'Provider ID is required' });
            return;
        }
        const providerDetails = yield (0, adminFunctionController_1.getProviderDetailsForAdmin)(providerId);
        res.status(200).json({ success: true, message: 'Provider details retrieved successfully', data: providerDetails });
    }
    catch (error) {
        console.error('Error getting provider details for admin:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to get provider details' });
    }
});
exports.handleGetProviderDetailsForAdmin = handleGetProviderDetailsForAdmin;
const handleCreateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const { name, description } = req.body;
        // Validate required fields
        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
            return;
        }
        // Get image URL from file upload if it exists
        let imageUrl;
        if (req.file) {
            console.log('File uploaded:', req.file);
            imageUrl = `/uploads/category/${req.file.filename}`;
        }
        console.log('Creating category with image URL:', imageUrl);
        const category = yield (0, adminFunctionController_1.createCategory)(name, description, imageUrl);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
        return;
    }
    catch (error) {
        console.error('Error in handleCreateCategory:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleCreateCategory = handleCreateCategory;
const handleGetAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const categories = yield (0, adminFunctionController_1.getAllCategories)();
        res.status(200).json({
            success: true,
            data: categories
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
exports.handleGetAllCategories = handleGetAllCategories;
const handleEditCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        const imageUrl = req.file ? req.file.path : undefined;
        // Validate required fields
        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
            return;
        }
        const updatedCategory = yield (0, adminFunctionController_1.editCategory)(categoryId, {
            name,
            description,
            imageUrl
        });
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
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
exports.handleEditCategory = handleEditCategory;
const handleDeleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }
        // Role guard
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized: Only admins can perform this action' });
            return;
        }
        const result = yield (0, adminFunctionController_1.deleteCategory)(categoryId);
        res.status(200).json({ success: true, message: 'Category deleted successfully', data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ success: false, message: errorMessage });
    }
});
exports.handleDeleteCategory = handleDeleteCategory;
const handleToggleClientStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId } = req.params;
        const { isActive } = req.body;
        // Validate required fields
        if (typeof isActive !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isActive field is required and must be a boolean'
            });
            return;
        }
        const updatedClient = yield (0, adminFunctionController_1.toggleClientStatus)(clientId, isActive);
        res.status(200).json({
            success: true,
            message: `Client ${isActive ? 'enabled' : 'disabled'} successfully`,
            data: updatedClient
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
exports.handleToggleClientStatus = handleToggleClientStatus;
const handleToggleProviderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        const { isActive } = req.body;
        // Validate required fields
        if (typeof isActive !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isActive field is required and must be a boolean'
            });
            return;
        }
        const updatedProvider = yield (0, adminFunctionController_1.toggleProviderStatus)(providerId, isActive);
        res.status(200).json({
            success: true,
            message: `Provider ${isActive ? 'enabled' : 'disabled'} successfully`,
            data: updatedProvider
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
exports.handleToggleProviderStatus = handleToggleProviderStatus;
const handleGetDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield (0, adminFunctionController_1.getDashboardStats)();
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetDashboardStats:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetDashboardStats = handleGetDashboardStats;
const handleGetRecentBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const bookings = yield (0, adminFunctionController_1.getRecentBookings)(limit);
        res.status(200).json({
            success: true,
            data: bookings
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetRecentBookings:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetRecentBookings = handleGetRecentBookings;
const handleGetAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {};
        if (req.query.paymentStatus) {
            filters.paymentStatus = req.query.paymentStatus;
        }
        if (req.query.providerId) {
            filters.providerId = req.query.providerId;
        }
        if (req.query.clientId) {
            filters.clientId = req.query.clientId;
        }
        if (req.query.sortBy) {
            filters.sortBy = req.query.sortBy;
        }
        if (req.query.sortOrder) {
            filters.sortOrder = req.query.sortOrder;
        }
        const transactions = yield (0, adminFunctionController_1.getAllTransactions)(filters);
        res.status(200).json({
            success: true,
            data: transactions
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetAllTransactions:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetAllTransactions = handleGetAllTransactions;
const handleGetActivityLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {};
        if (req.query.bookingId) {
            filters.bookingId = req.query.bookingId;
        }
        if (req.query.userId) {
            filters.userId = req.query.userId;
        }
        if (req.query.action) {
            filters.action = req.query.action;
        }
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit);
        }
        const logs = yield (0, adminFunctionController_1.getActivityLogs)(filters);
        res.status(200).json({
            success: true,
            data: logs
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetActivityLogs:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetActivityLogs = handleGetActivityLogs;
const handleGetProviderRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield (0, adminFunctionController_1.getProviderRatings)();
        res.status(200).json({
            success: true,
            data: ratings
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetProviderRatings:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetProviderRatings = handleGetProviderRatings;
// Service approval HTTP controllers
const handleGetPendingServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        const services = yield (0, adminFunctionController_1.getPendingServices)();
        res.status(200).json({
            success: true,
            data: services
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleGetPendingServices:', error);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleGetPendingServices = handleGetPendingServices;
const handleApproveService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId } = req.body;
        const adminId = req.user.id;
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        // Validate required fields
        if (!serviceId) {
            res.status(400).json({
                success: false,
                message: 'Service ID is required'
            });
            return;
        }
        const service = yield (0, adminFunctionController_1.approveService)(serviceId, adminId);
        res.status(200).json({
            success: true,
            message: 'Service approved successfully',
            data: service
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleApproveService:', error);
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleApproveService = handleApproveService;
const handleRejectService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId, reason } = req.body;
        const adminId = req.user.id;
        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins can perform this action'
            });
            return;
        }
        // Validate required fields
        if (!serviceId || !reason) {
            res.status(400).json({
                success: false,
                message: 'Service ID and rejection reason are required'
            });
            return;
        }
        const service = yield (0, adminFunctionController_1.rejectService)(serviceId, adminId, reason);
        res.status(200).json({
            success: true,
            message: 'Service rejected successfully',
            data: service
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in handleRejectService:', error);
        res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
});
exports.handleRejectService = handleRejectService;
