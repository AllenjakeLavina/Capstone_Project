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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectService = exports.approveService = exports.getPendingServices = exports.getProviderDetailsForAdmin = exports.getProviderRatings = exports.getActivityLogs = exports.getAllTransactions = exports.getRecentBookings = exports.getDashboardStats = exports.toggleProviderStatus = exports.toggleClientStatus = exports.deleteCategory = exports.editCategory = exports.getAllCategories = exports.createCategory = exports.getUnverifiedProviderDetails = exports.getUnverifiedClientDetails = exports.rejectClientVerification = exports.verifyClientAccount = exports.getUnverifiedUsers = exports.getUnverifiedClients = exports.getUnverifiedProviders = exports.rejectProviderVerification = exports.verifyProviderAccount = exports.getAllProvidersWithStatus = exports.getAllProviders = exports.getAllClients = exports.changeUserPassword = exports.createAdminUser = exports.setPassword = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailService_1 = require("../services/emailService");
const prisma = new client_1.PrismaClient();
const setPassword = (email, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        // Update user
        yield prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        return { success: true, message: 'Password updated successfully' };
    }
    catch (error) {
        console.error('Error setting password:', error);
        throw error;
    }
});
exports.setPassword = setPassword;
const createAdminUser = (email, password, firstName, lastName, phone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Create admin user
        const newAdmin = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: 'ADMIN',
                isVerified: true,
                isActive: true
            }
        });
        // Return user without password
        const { password: _ } = newAdmin, adminWithoutPassword = __rest(newAdmin, ["password"]);
        return adminWithoutPassword;
    }
    catch (error) {
        throw error;
    }
});
exports.createAdminUser = createAdminUser;
// Change a user's password (by admin)
const changeUserPassword = (userId, newPassword, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Check if admin exists
        const admin = yield prisma.user.findUnique({
            where: {
                id: adminId,
                role: 'ADMIN'
            }
        });
        if (!admin) {
            throw new Error('Admin not found or unauthorized');
        }
        // Hash new password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        // Update user password
        yield prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        // Create notification for user
        yield prisma.notification.create({
            data: {
                receiverId: userId,
                type: 'GENERAL',
                title: 'Password Changed',
                message: 'Your password has been changed by an administrator. If you did not request this change, please contact support immediately.',
                isRead: false
            }
        });
        return { success: true, message: 'Password changed successfully' };
    }
    catch (error) {
        throw error;
    }
});
exports.changeUserPassword = changeUserPassword;
// Get all clients
const getAllClients = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield prisma.client.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true
                    }
                },
                addresses: true,
                serviceBookings: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });
        // Format data to exclude sensitive information
        const formattedClients = clients.map(client => {
            return {
                id: client.id,
                userId: client.userId,
                user: client.user,
                addresses: client.addresses,
                bookingCount: client.serviceBookings.length,
                recentBookings: client.serviceBookings.slice(0, 5)
            };
        });
        return formattedClients;
    }
    catch (error) {
        throw error;
    }
});
exports.getAllClients = getAllClients;
// Get all active providers with their services, skills, etc.
const getAllProviders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield prisma.serviceProvider.findMany({
            where: {
                user: {
                    isActive: true // Only include active users (exclude rejected providers)
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true
                    }
                },
                services: {
                    select: {
                        id: true,
                        title: true,
                        isActive: true
                    }
                },
                skills: true,
                documents: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        isVerified: true
                    }
                }
            }
        });
        return providers;
    }
    catch (error) {
        throw error;
    }
});
exports.getAllProviders = getAllProviders;
// Get all providers including rejected ones (for admin management)
const getAllProvidersWithStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield prisma.serviceProvider.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true
                    }
                },
                services: {
                    select: {
                        id: true,
                        title: true,
                        isActive: true
                    }
                },
                skills: true,
                documents: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        isVerified: true
                    }
                }
            }
        });
        // Add status information to each provider
        const providersWithStatus = providers.map(provider => (Object.assign(Object.assign({}, provider), { status: provider.isProviderVerified
                ? 'Verified'
                : provider.user.isActive
                    ? 'Pending Verification'
                    : 'Rejected' })));
        return providersWithStatus;
    }
    catch (error) {
        throw error;
    }
});
exports.getAllProvidersWithStatus = getAllProvidersWithStatus;
// Verify a provider's account and ID documents
const verifyProviderAccount = (providerId, adminId, documentId // If verifying a specific document
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the provider by ID
        const provider = yield prisma.serviceProvider.findUnique({
            where: { id: providerId },
            include: {
                user: true,
                documents: true
            }
        });
        if (!provider) {
            throw new Error('Provider not found');
        }
        // Verify the provider
        const updatedProvider = yield prisma.serviceProvider.update({
            where: { id: providerId },
            data: {
                isProviderVerified: true
            },
            include: {
                user: true
            }
        });
        // If a specific document ID was provided, verify just that document
        if (documentId) {
            yield prisma.document.update({
                where: { id: documentId },
                data: {
                    isVerified: true
                }
            });
        }
        // Otherwise, verify all ID documents
        else {
            for (const doc of provider.documents) {
                if (doc.type === 'ID') {
                    yield prisma.document.update({
                        where: { id: doc.id },
                        data: {
                            isVerified: true
                        }
                    });
                }
            }
        }
        // Create a notification for the provider
        yield prisma.notification.create({
            data: {
                receiverId: provider.userId,
                type: 'GENERAL',
                title: 'Account Verified',
                message: 'Your service provider account has been verified by an admin. You can now offer services on the platform.',
                isRead: false
            }
        });
        // Send email notification to the provider
        if (provider.user.email) {
            yield (0, emailService_1.sendProviderVerificationEmail)(provider.user.email, provider.user.firstName);
        }
        // Excluding sensitive information
        const { user } = updatedProvider, providerData = __rest(updatedProvider, ["user"]);
        const { password } = user, userData = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, providerData), { user: userData });
    }
    catch (error) {
        throw error;
    }
});
exports.verifyProviderAccount = verifyProviderAccount;
// Reject a provider's account verification
const rejectProviderVerification = (providerId, adminId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the provider by ID
        const provider = yield prisma.serviceProvider.findUnique({
            where: { id: providerId },
            include: {
                user: true
            }
        });
        if (!provider) {
            throw new Error('Provider not found');
        }
        // Mark the provider as rejected and deactivate the user account
        // This prevents them from appearing in unverified list and shows rejected status
        yield prisma.serviceProvider.update({
            where: { id: providerId },
            data: {
                isProviderVerified: false,
                // We'll use a custom field to track rejection status
                // For now, we'll store rejection info in a comment field or use a different approach
            }
        });
        // Temporarily deactivate the user account to prevent them from appearing in unverified list
        // This gives them time to fix their information before reapplying
        yield prisma.user.update({
            where: { id: provider.userId },
            data: { isActive: false }
        });
        // Create a notification for the provider
        yield prisma.notification.create({
            data: {
                receiverId: provider.userId,
                type: 'GENERAL',
                title: 'Verification Rejected',
                message: `Your service provider verification was rejected. Reason: ${reason}. Your account has been temporarily deactivated. Please update your information and contact support to reactivate your account.`,
                isRead: false
            }
        });
        // Return the provider (excluding sensitive information)
        const { user } = provider, providerData = __rest(provider, ["user"]);
        const { password } = user, userData = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, providerData), { user: userData });
    }
    catch (error) {
        throw error;
    }
});
exports.rejectProviderVerification = rejectProviderVerification;
// Get all unverified providers
const getUnverifiedProviders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield prisma.serviceProvider.findMany({
            where: {
                isProviderVerified: false,
                user: {
                    isActive: true // Only include active users
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        createdAt: true
                    }
                },
                documents: {
                    where: {
                        type: 'ID'
                    }
                }
            }
        });
        return providers;
    }
    catch (error) {
        throw error;
    }
});
exports.getUnverifiedProviders = getUnverifiedProviders;
// Get all unverified clients
// Uses Client.isClientVerified as the admin-approval flag.
// Clients stay here until an admin explicitly verifies them, even if email is already verified.
const getUnverifiedClients = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield prisma.client.findMany({
            where: {
                isClientVerified: false,
                user: {
                    isActive: true // Only include active users
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        createdAt: true,
                        isVerified: true // Include to check email verification status
                    }
                },
                addresses: true // Get all addresses
            }
        });
        return clients;
    }
    catch (error) {
        throw error;
    }
});
exports.getUnverifiedClients = getUnverifiedClients;
// Get all unverified users (both clients and providers)
const getUnverifiedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [providers, clients] = yield Promise.all([
            (0, exports.getUnverifiedProviders)(),
            (0, exports.getUnverifiedClients)()
        ]);
        // Format providers with type indicator
        const formattedProviders = providers.map(provider => (Object.assign(Object.assign({}, provider), { userType: 'PROVIDER', id: provider.id, userId: provider.userId })));
        // Format clients with type indicator
        const formattedClients = clients.map(client => (Object.assign(Object.assign({}, client), { userType: 'CLIENT', id: client.id, userId: client.userId })));
        // Combine and return
        return [...formattedProviders, ...formattedClients];
    }
    catch (error) {
        throw error;
    }
});
exports.getUnverifiedUsers = getUnverifiedUsers;
// Verify a client's account
const verifyClientAccount = (clientId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the client by ID
        const client = yield prisma.client.findUnique({
            where: { id: clientId },
            include: {
                user: true
            }
        });
        if (!client) {
            throw new Error('Client not found');
        }
        // Verify the client by updating flags
        yield prisma.$transaction([
            prisma.user.update({
                where: { id: client.userId },
                data: {
                    isVerified: true
                }
            }),
            prisma.client.update({
                where: { id: clientId },
                data: {
                    isClientVerified: true
                }
            })
        ]);
        // Create a notification for the client
        yield prisma.notification.create({
            data: {
                receiverId: client.userId,
                type: 'GENERAL',
                title: 'Account Verified',
                message: 'Your client account has been verified by an admin. You can now use all features of the platform.',
                isRead: false
            }
        });
        // Get updated client data
        const updatedClient = yield prisma.client.findUnique({
            where: { id: clientId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true
                    }
                }
            }
        });
        return updatedClient;
    }
    catch (error) {
        throw error;
    }
});
exports.verifyClientAccount = verifyClientAccount;
// Reject a client's account verification
const rejectClientVerification = (clientId, adminId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the client by ID
        const client = yield prisma.client.findUnique({
            where: { id: clientId },
            include: {
                user: true
            }
        });
        if (!client) {
            throw new Error('Client not found');
        }
        // Temporarily deactivate the user account to prevent them from appearing in unverified list
        yield prisma.user.update({
            where: { id: client.userId },
            data: { isActive: false }
        });
        // Create a notification for the client
        yield prisma.notification.create({
            data: {
                receiverId: client.userId,
                type: 'GENERAL',
                title: 'Verification Rejected',
                message: `Your client verification was rejected. Reason: ${reason}. Your account has been temporarily deactivated. Please update your information and contact support to reactivate your account.`,
                isRead: false
            }
        });
        // Return the client (excluding sensitive information)
        const { user } = client, clientData = __rest(client, ["user"]);
        const { password } = user, userData = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, clientData), { user: userData });
    }
    catch (error) {
        throw error;
    }
});
exports.rejectClientVerification = rejectClientVerification;
// Get detailed profile of unverified client for admin review
const getUnverifiedClientDetails = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield prisma.client.findFirst({
            where: {
                id: clientId,
                isClientVerified: false,
                user: {
                    isActive: true
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        createdAt: true
                    }
                },
                addresses: true,
                documents: true
            }
        });
        if (!client) {
            throw new Error('Client not found or already verified');
        }
        // Transform the data to match the expected format
        const transformedClient = {
            id: client.id,
            firstName: client.user.firstName,
            lastName: client.user.lastName,
            email: client.user.email,
            phone: client.user.phone,
            profilePicture: client.user.profilePicture,
            addresses: client.addresses,
            documents: client.documents,
            createdAt: client.user.createdAt
        };
        return transformedClient;
    }
    catch (error) {
        throw error;
    }
});
exports.getUnverifiedClientDetails = getUnverifiedClientDetails;
// Get detailed profile of unverified provider for admin review
const getUnverifiedProviderDetails = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const provider = yield prisma.serviceProvider.findFirst({
            where: {
                id: providerId,
                isProviderVerified: false,
                user: {
                    isActive: true
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        createdAt: true
                    }
                },
                workExperience: {
                    orderBy: {
                        startDate: 'desc'
                    }
                },
                education: {
                    orderBy: {
                        startDate: 'desc'
                    }
                },
                skills: true,
                portfolio: {
                    include: {
                        files: true
                    }
                },
                documents: {
                    where: {
                        type: 'ID'
                    }
                }
            }
        });
        if (!provider) {
            throw new Error('Provider not found or already verified');
        }
        // Transform the data to match the expected format
        const transformedProvider = {
            id: provider.id,
            firstName: provider.user.firstName,
            lastName: provider.user.lastName,
            email: provider.user.email,
            phone: provider.user.phone,
            profilePicture: provider.user.profilePicture,
            headline: provider.headline,
            bio: provider.bio,
            // hourlyRate removed
            workExperience: provider.workExperience,
            education: provider.education,
            skills: provider.skills,
            portfolio: provider.portfolio,
            documents: provider.documents,
            createdAt: provider.user.createdAt
        };
        return transformedProvider;
    }
    catch (error) {
        throw error;
    }
});
exports.getUnverifiedProviderDetails = getUnverifiedProviderDetails;
const createCategory = (name, description, imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if category already exists
        const existingCategory = yield prisma.category.findUnique({
            where: { name }
        });
        if (existingCategory) {
            throw new Error('Category with this name already exists');
        }
        // Create category
        const newCategory = yield prisma.category.create({
            data: {
                name,
                description,
                imageUrl
            }
        });
        return newCategory;
    }
    catch (error) {
        throw error;
    }
});
exports.createCategory = createCategory;
// Get all categories
const getAllCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.category.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return categories;
    }
    catch (error) {
        throw error;
    }
});
exports.getAllCategories = getAllCategories;
// Edit an existing category
const editCategory = (categoryId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if category exists
        const existingCategory = yield prisma.category.findUnique({
            where: { id: categoryId }
        });
        if (!existingCategory) {
            throw new Error('Category not found');
        }
        // Check if name is being updated and if it's already in use
        if (updateData.name && updateData.name !== existingCategory.name) {
            const categoryWithSameName = yield prisma.category.findFirst({
                where: {
                    name: updateData.name,
                    id: { not: categoryId } // Exclude the current category
                }
            });
            if (categoryWithSameName) {
                throw new Error('Another category with this name already exists');
            }
        }
        // Update category
        const updatedCategory = yield prisma.category.update({
            where: { id: categoryId },
            data: updateData
        });
        return updatedCategory;
    }
    catch (error) {
        throw error;
    }
});
exports.editCategory = editCategory;
// Delete a category
const deleteCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield prisma.category.findUnique({ where: { id: categoryId } });
        if (!existingCategory) {
            throw new Error('Category not found');
        }
        // Optional safeguard: prevent delete if referenced by services
        // If you want stricter enforcement, uncomment below and adjust relation as needed
        // const relatedServiceCount = await prisma.service.count({ where: { categoryId } });
        // if (relatedServiceCount > 0) {
        //   throw new Error('Cannot delete category with existing services');
        // }
        yield prisma.category.delete({ where: { id: categoryId } });
        return { id: categoryId };
    }
    catch (error) {
        throw error;
    }
});
exports.deleteCategory = deleteCategory;
// Toggle client account status (Active/Inactive)
const toggleClientStatus = (clientId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the client by ID
        const client = yield prisma.client.findUnique({
            where: { id: clientId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!client) {
            throw new Error('Client not found');
        }
        // Update the user's isActive status
        const updatedUser = yield prisma.user.update({
            where: { id: client.userId },
            data: { isActive },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                profilePicture: true,
                isActive: true,
                isVerified: true,
                createdAt: true
            }
        });
        // Create a notification for the client
        const notificationMessage = isActive
            ? 'Your account has been reactivated. You can now log in and use our services.'
            : 'Your account has been temporarily suspended. Please contact support for assistance.';
        yield prisma.notification.create({
            data: {
                receiverId: client.userId,
                type: 'GENERAL',
                title: isActive ? 'Account Reactivated' : 'Account Suspended',
                message: notificationMessage,
                isRead: false
            }
        });
        // Return the updated client data
        return Object.assign(Object.assign({}, client), { user: updatedUser });
    }
    catch (error) {
        throw error;
    }
});
exports.toggleClientStatus = toggleClientStatus;
// Toggle provider account status (Active/Inactive)
const toggleProviderStatus = (providerId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the provider by ID
        const provider = yield prisma.serviceProvider.findUnique({
            where: { id: providerId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!provider) {
            throw new Error('Provider not found');
        }
        // Update the user's isActive status
        const updatedUser = yield prisma.user.update({
            where: { id: provider.userId },
            data: { isActive },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                profilePicture: true,
                isActive: true,
                isVerified: true,
                createdAt: true
            }
        });
        // Create a notification for the provider
        const notificationMessage = isActive
            ? 'Your account has been reactivated. You can now log in and offer services on the platform.'
            : 'Your account has been temporarily suspended. Please contact support for assistance.';
        yield prisma.notification.create({
            data: {
                receiverId: provider.userId,
                type: 'GENERAL',
                title: isActive ? 'Account Reactivated' : 'Account Suspended',
                message: notificationMessage,
                isRead: false
            }
        });
        // Return the updated provider data
        return Object.assign(Object.assign({}, provider), { user: updatedUser });
    }
    catch (error) {
        throw error;
    }
});
exports.toggleProviderStatus = toggleProviderStatus;
// Dashboard Statistics Functions
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get total counts
        const totalBookings = yield prisma.serviceBooking.count();
        const totalClients = yield prisma.client.count();
        const totalProviders = yield prisma.serviceProvider.count();
        // Calculate total revenue from completed bookings
        const completedBookings = yield prisma.serviceBooking.findMany({
            where: {
                status: 'COMPLETED',
                totalAmount: {
                    not: null
                }
            },
            select: {
                totalAmount: true
            }
        });
        const totalRevenue = completedBookings.reduce((sum, booking) => {
            return sum + Number(booking.totalAmount || 0);
        }, 0);
        // Get bookings over the past 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const bookingsLast7Days = yield prisma.serviceBooking.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                createdAt: true,
                status: true
            }
        });
        // Group bookings by date for the line chart
        const bookingsByDate = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            bookingsByDate[dateKey] = 0;
        }
        bookingsLast7Days.forEach(booking => {
            const dateKey = booking.createdAt.toISOString().split('T')[0];
            if (bookingsByDate[dateKey] !== undefined) {
                bookingsByDate[dateKey]++;
            }
        });
        // Get booking status distribution
        const bookingStatusCounts = yield prisma.serviceBooking.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        const statusDistribution = bookingStatusCounts.map(item => ({
            status: item.status,
            count: item._count.status
        }));
        return {
            summary: {
                totalBookings,
                totalClients,
                totalProviders,
                totalRevenue: parseFloat(totalRevenue.toFixed(2))
            },
            bookingsLast7Days: Object.entries(bookingsByDate).reverse().map(([date, count]) => ({
                date,
                count
            })),
            statusDistribution
        };
    }
    catch (error) {
        console.error('Error getting dashboard stats:', error);
        throw error;
    }
});
exports.getDashboardStats = getDashboardStats;
const getRecentBookings = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10) {
    try {
        const recentBookings = yield prisma.serviceBooking.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                serviceProvider: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                service: {
                    select: {
                        title: true,
                        pricing: true
                    }
                }
            }
        });
        return recentBookings;
    }
    catch (error) {
        console.error('Error getting recent bookings:', error);
        throw error;
    }
});
exports.getRecentBookings = getRecentBookings;
const getAllTransactions = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const where = {};
        // Apply filters
        if (filters === null || filters === void 0 ? void 0 : filters.paymentStatus) {
            // When filtering by payment status, payment must exist and have that status
            where.payment = {
                status: filters.paymentStatus
            };
        }
        else {
            // If no payment status filter, just ensure payment exists
            where.payment = {
                isNot: null
            };
        }
        if (filters === null || filters === void 0 ? void 0 : filters.providerId) {
            where.serviceProviderId = filters.providerId;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.clientId) {
            where.clientId = filters.clientId;
        }
        // Determine sort order
        const orderBy = {};
        if ((filters === null || filters === void 0 ? void 0 : filters.sortBy) === 'date') {
            orderBy.createdAt = filters.sortOrder || 'desc';
        }
        else if ((filters === null || filters === void 0 ? void 0 : filters.sortBy) === 'amount') {
            orderBy.totalAmount = filters.sortOrder || 'desc';
        }
        else {
            orderBy.createdAt = 'desc'; // Default sort by date
        }
        const transactions = yield prisma.serviceBooking.findMany({
            where,
            orderBy,
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                serviceProvider: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                service: {
                    select: {
                        title: true,
                        pricing: true
                    }
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        paymentMethod: true,
                        paymentDate: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
        return transactions;
    }
    catch (error) {
        console.error('Error getting all transactions:', error);
        throw error;
    }
});
exports.getAllTransactions = getAllTransactions;
const getActivityLogs = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const where = {};
        if (filters === null || filters === void 0 ? void 0 : filters.bookingId) {
            where.bookingId = filters.bookingId;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            where.userId = filters.userId;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.action) {
            where.action = filters.action;
        }
        const logs = yield prisma.activityLog.findMany({
            where,
            take: (filters === null || filters === void 0 ? void 0 : filters.limit) || 100,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        return logs;
    }
    catch (error) {
        console.error('Error getting activity logs:', error);
        throw error;
    }
});
exports.getActivityLogs = getActivityLogs;
const getProviderRatings = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all providers with their user data and received reviews
        const providersWithReviews = yield prisma.serviceProvider.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        isActive: true,
                        receivedReviews: {
                            select: {
                                rating: true,
                                comment: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });
        // Calculate average rating for each provider
        const providersWithRatings = providersWithReviews.map(provider => {
            const totalReviews = provider.user.receivedReviews.length;
            const averageRating = totalReviews > 0
                ? provider.user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                : 0;
            return {
                id: provider.id,
                firstName: provider.user.firstName,
                lastName: provider.user.lastName,
                email: provider.user.email,
                totalReviews,
                averageRating: parseFloat(averageRating.toFixed(2)),
                isActive: provider.user.isActive
            };
        });
        // Sort by average rating (highest first)
        providersWithRatings.sort((a, b) => b.averageRating - a.averageRating);
        // Calculate overall statistics
        const totalProviders = providersWithRatings.length;
        const providersWithReviewsCount = providersWithRatings.filter(p => p.totalReviews > 0).length;
        const overallAverageRating = providersWithReviewsCount > 0
            ? providersWithRatings
                .filter(p => p.totalReviews > 0)
                .reduce((sum, p) => sum + p.averageRating, 0) / providersWithReviewsCount
            : 0;
        return {
            providers: providersWithRatings,
            statistics: {
                totalProviders,
                providersWithReviews: providersWithReviewsCount,
                overallAverageRating: parseFloat(overallAverageRating.toFixed(2))
            }
        };
    }
    catch (error) {
        console.error('Error getting provider ratings:', error);
        throw error;
    }
});
exports.getProviderRatings = getProviderRatings;
const getProviderDetailsForAdmin = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const provider = yield prisma.serviceProvider.findFirst({
            where: {
                id: providerId,
                user: {
                    isActive: true
                }
            },
            include: {
                user: {
                    select: {
                        id: true, email: true, firstName: true, lastName: true, phone: true, profilePicture: true, createdAt: true
                    }
                },
                workExperience: { orderBy: { startDate: 'desc' } },
                education: { orderBy: { startDate: 'desc' } },
                skills: true,
                portfolio: { include: { files: true } },
                documents: { where: { type: 'ID' } }
            }
        });
        if (!provider) {
            throw new Error('Provider not found');
        }
        const transformedProvider = {
            id: provider.id,
            firstName: provider.user.firstName,
            lastName: provider.user.lastName,
            email: provider.user.email,
            phone: provider.user.phone,
            profilePicture: provider.user.profilePicture,
            headline: provider.headline,
            bio: provider.bio,
            // hourlyRate removed
            workExperience: provider.workExperience,
            education: provider.education,
            skills: provider.skills,
            portfolio: provider.portfolio,
            documents: provider.documents,
            createdAt: provider.user.createdAt
        };
        return transformedProvider;
    }
    catch (error) {
        throw error;
    }
});
exports.getProviderDetailsForAdmin = getProviderDetailsForAdmin;
// Get all services for admin monitoring (pending and approved)
const getPendingServices = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield prisma.service.findMany({
            where: {
                isActive: true // Get all active services (both approved and pending)
            },
            include: {
                category: true,
                skills: true,
                serviceProvider: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Process image URLs
        const processedServices = services.map(service => {
            let imageUrls = [];
            if (service.imageUrls) {
                try {
                    imageUrls = JSON.parse(service.imageUrls);
                }
                catch (error) {
                    console.warn(`Error parsing image URLs for service ${service.id}:`, error);
                }
            }
            return {
                id: service.id,
                title: service.title,
                description: service.description,
                pricing: service.pricing,
                pricingType: service.pricingType,
                imageUrls,
                category: service.category,
                skills: service.skills,
                isApproved: service.isApproved, // Include approval status
                provider: {
                    id: service.serviceProvider.id,
                    userId: service.serviceProvider.userId,
                    name: `${service.serviceProvider.user.firstName} ${service.serviceProvider.user.lastName}`,
                    email: service.serviceProvider.user.email,
                    profilePicture: service.serviceProvider.user.profilePicture
                },
                createdAt: service.createdAt,
                updatedAt: service.updatedAt
            };
        });
        return processedServices;
    }
    catch (error) {
        throw error;
    }
});
exports.getPendingServices = getPendingServices;
// Approve a service
const approveService = (serviceId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the service
        const service = yield prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                serviceProvider: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (!service) {
            throw new Error('Service not found');
        }
        // Update service to approved
        const updatedService = yield prisma.service.update({
            where: { id: serviceId },
            data: {
                isApproved: true
            },
            include: {
                category: true,
                skills: true,
                serviceProvider: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            }
        });
        // Create notification for the provider
        yield prisma.notification.create({
            data: {
                receiverId: service.serviceProvider.userId,
                type: 'GENERAL',
                title: 'Service Approved',
                message: `Your service "${service.title}" has been approved by an admin and is now visible to clients.`,
                isRead: false
            }
        });
        // Process image URLs
        let imageUrls = [];
        if (updatedService.imageUrls) {
            try {
                imageUrls = JSON.parse(updatedService.imageUrls);
            }
            catch (error) {
                console.warn(`Error parsing image URLs for service ${updatedService.id}:`, error);
            }
        }
        return {
            id: updatedService.id,
            title: updatedService.title,
            description: updatedService.description,
            pricing: updatedService.pricing,
            pricingType: updatedService.pricingType,
            imageUrls,
            category: updatedService.category,
            skills: updatedService.skills,
            provider: {
                id: updatedService.serviceProvider.id,
                userId: updatedService.serviceProvider.userId,
                name: `${updatedService.serviceProvider.user.firstName} ${updatedService.serviceProvider.user.lastName}`,
                email: updatedService.serviceProvider.user.email,
                profilePicture: updatedService.serviceProvider.user.profilePicture
            },
            isApproved: updatedService.isApproved,
            createdAt: updatedService.createdAt,
            updatedAt: updatedService.updatedAt
        };
    }
    catch (error) {
        throw error;
    }
});
exports.approveService = approveService;
// Reject a service
const rejectService = (serviceId, adminId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the service
        const service = yield prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                serviceProvider: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (!service) {
            throw new Error('Service not found');
        }
        // Deactivate the service instead of deleting it (to maintain data integrity)
        const updatedService = yield prisma.service.update({
            where: { id: serviceId },
            data: {
                isActive: false,
                isApproved: false
            },
            include: {
                category: true,
                skills: true,
                serviceProvider: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            }
        });
        // Create notification for the provider
        yield prisma.notification.create({
            data: {
                receiverId: service.serviceProvider.userId,
                type: 'GENERAL',
                title: 'Service Rejected',
                message: `Your service "${service.title}" has been rejected by an admin. Reason: ${reason}. You can update the service and resubmit it for review.`,
                isRead: false
            }
        });
        // Process image URLs
        let imageUrls = [];
        if (updatedService.imageUrls) {
            try {
                imageUrls = JSON.parse(updatedService.imageUrls);
            }
            catch (error) {
                console.warn(`Error parsing image URLs for service ${updatedService.id}:`, error);
            }
        }
        return {
            id: updatedService.id,
            title: updatedService.title,
            description: updatedService.description,
            pricing: updatedService.pricing,
            pricingType: updatedService.pricingType,
            imageUrls,
            category: updatedService.category,
            skills: updatedService.skills,
            provider: {
                id: updatedService.serviceProvider.id,
                userId: updatedService.serviceProvider.userId,
                name: `${updatedService.serviceProvider.user.firstName} ${updatedService.serviceProvider.user.lastName}`,
                email: updatedService.serviceProvider.user.email,
                profilePicture: updatedService.serviceProvider.user.profilePicture
            },
            isApproved: updatedService.isApproved,
            isActive: updatedService.isActive,
            createdAt: updatedService.createdAt,
            updatedAt: updatedService.updatedAt
        };
    }
    catch (error) {
        throw error;
    }
});
exports.rejectService = rejectService;
