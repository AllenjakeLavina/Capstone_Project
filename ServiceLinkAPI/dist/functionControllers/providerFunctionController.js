"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteAvailabilitySlot = exports.updateAvailabilitySlot = exports.getProviderAvailabilityByProviderId = exports.getAvailability = exports.addAvailabilitySlot = exports.getServiceProviderReviews = exports.getReviewsGiven = exports.getReviewsReceived = exports.createClientReview = exports.signContract = exports.updateContract = exports.getContractDetails = exports.createContract = exports.completeService = exports.startService = exports.declineBooking = exports.acceptBooking = exports.getProviderBookingDetails = exports.getProviderBookings = exports.getProviderVerificationStatus = exports.createProviderVerificationNotification = exports.addDocument = exports.getCategories = exports.updateProviderService = exports.getProviderServices = exports.createService = exports.addPortfolio = exports.addSkill = exports.addEducation = exports.addWorkExperience = exports.getProviderProfile = exports.updateProviderProfile = exports.registerProvider = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailService_1 = require("../services/emailService");
const allRoleFunctionController_1 = require("./allRoleFunctionController");
const passwordValidator_1 = require("../utils/passwordValidator");
const prisma = new client_1.PrismaClient();
const registerProvider = (email, password, firstName, lastName, phone, idDocument) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user already exists with this email
        const existingUserByEmail = yield prisma.user.findUnique({
            where: { email }
        });
        if (existingUserByEmail) {
            throw new Error('User with this email already exists');
        }
        // Check if phone number already exists
        if (phone) {
            const existingUserByPhone = yield prisma.user.findFirst({
                where: { phone }
            });
            if (existingUserByPhone) {
                throw new Error('User with this phone number already exists');
            }
        }
        // Check if first name and last name combination already exists
        const existingUserByName = yield prisma.user.findFirst({
            where: {
                firstName: firstName.trim(),
                lastName: lastName.trim()
            }
        });
        if (existingUserByName) {
            throw new Error('User with this name already exists');
        }
        // Validate password strength
        const passwordValidation = (0, passwordValidator_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Generate verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Code valid for 24 hours
        // Create new user with provider profile and verification code
        const newUser = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: 'PROVIDER',
                isVerified: false,
                serviceProvider: {
                    create: {} // Will use default values, including isProviderVerified: false
                },
                verificationTokens: {
                    create: {
                        token: verificationCode,
                        type: 'EMAIL',
                        expiresAt: tokenExpiry
                    }
                }
            },
            include: {
                serviceProvider: true,
                verificationTokens: true
            }
        });
        // If ID document is provided, add it
        if (idDocument && newUser.serviceProvider) {
            yield prisma.document.create({
                data: {
                    serviceProviderId: newUser.serviceProvider.id,
                    title: idDocument.title || 'Identity Document',
                    type: 'ID',
                    fileUrl: idDocument.fileUrl,
                    isVerified: false
                }
            });
        }
        // Create verification notification
        yield prisma.notification.create({
            data: {
                receiverId: newUser.id,
                type: 'GENERAL',
                title: 'Complete Your Profile for Verification',
                message: 'Your provider account is pending verification. Please complete your profile and upload all necessary identification documents to expedite the verification process.',
                isRead: false
            }
        });
        // Send verification email
        const emailSent = yield (0, emailService_1.sendVerificationEmail)(email, verificationCode, firstName);
        if (!emailSent) {
            console.warn(`Failed to send verification email to ${email}`);
        }
        // Return user without password but with verification code
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        return userWithoutPassword;
    }
    catch (error) {
        throw error;
    }
});
exports.registerProvider = registerProvider;
const updateProviderProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Prepare data for user update
        const userData = {
            firstName: (_a = data.firstName) !== null && _a !== void 0 ? _a : user.firstName,
            lastName: (_b = data.lastName) !== null && _b !== void 0 ? _b : user.lastName,
            phone: (_c = data.phone) !== null && _c !== void 0 ? _c : user.phone,
            profilePicture: (_d = data.profilePicture) !== null && _d !== void 0 ? _d : user.profilePicture
        };
        // Prepare data for provider update
        const providerData = {
            bio: (_e = data.bio) !== null && _e !== void 0 ? _e : user.serviceProvider.bio,
            headline: (_f = data.headline) !== null && _f !== void 0 ? _f : user.serviceProvider.headline,
            hourlyRate: data.hourlyRate !== undefined ?
                data.hourlyRate :
                user.serviceProvider.hourlyRate
        };
        // Update user and provider in a transaction
        const updatedUser = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Update user information
            const updatedUser = yield prisma.user.update({
                where: { id: userId },
                data: userData,
                include: {
                    serviceProvider: true
                }
            });
            // Update provider information
            yield prisma.serviceProvider.update({
                where: { id: user.serviceProvider.id },
                data: providerData
            });
            return updatedUser;
        }));
        // Return user without password
        const { password: _ } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
        return userWithoutPassword;
    }
    catch (error) {
        throw error;
    }
});
exports.updateProviderProfile = updateProviderProfile;
const getProviderProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id with provider data
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                serviceProvider: {
                    include: {
                        workExperience: true,
                        education: true,
                        skills: true,
                        portfolio: {
                            include: {
                                files: true // Include portfolio files
                            }
                        },
                        documents: true, // Include documents
                        services: {
                            include: {
                                skills: true
                            }
                        }
                    }
                }
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Return user without password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return userWithoutPassword;
    }
    catch (error) {
        throw error;
    }
});
exports.getProviderProfile = getProviderProfile;
const addWorkExperience = (userId, experience) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Create new work experience
        const newExperience = yield prisma.workExperience.create({
            data: {
                serviceProviderId: user.serviceProvider.id,
                company: experience.company,
                position: experience.position,
                startDate: experience.startDate,
                endDate: experience.endDate,
                description: experience.description,
                isCurrentPosition: (_a = experience.isCurrentPosition) !== null && _a !== void 0 ? _a : false
            }
        });
        return newExperience;
    }
    catch (error) {
        throw error;
    }
});
exports.addWorkExperience = addWorkExperience;
const addEducation = (userId, education) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Create new education
        const newEducation = yield prisma.education.create({
            data: {
                serviceProviderId: user.serviceProvider.id,
                institution: education.institution,
                degree: education.degree,
                fieldOfStudy: education.fieldOfStudy,
                startDate: education.startDate,
                endDate: education.endDate,
                isCurrentlyStudying: (_a = education.isCurrentlyStudying) !== null && _a !== void 0 ? _a : false
            }
        });
        return newEducation;
    }
    catch (error) {
        throw error;
    }
});
exports.addEducation = addEducation;
const addSkill = (userId, skillName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Find or create skill
        let skill = yield prisma.skill.findFirst({
            where: { name: skillName }
        });
        if (!skill) {
            skill = yield prisma.skill.create({
                data: { name: skillName }
            });
        }
        // Add skill to provider if not already added
        const existingSkill = yield prisma.skill.findFirst({
            where: {
                name: skillName,
                serviceProviders: {
                    some: {
                        id: user.serviceProvider.id
                    }
                }
            }
        });
        if (existingSkill) {
            throw new Error('Skill already added to provider profile');
        }
        // Connect skill to provider
        yield prisma.serviceProvider.update({
            where: { id: user.serviceProvider.id },
            data: {
                skills: {
                    connect: { id: skill.id }
                }
            }
        });
        return skill;
    }
    catch (error) {
        throw error;
    }
});
exports.addSkill = addSkill;
const addPortfolio = (userId, portfolioData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Create portfolio first
        const portfolio = yield prisma.portfolio.create({
            data: {
                serviceProviderId: user.serviceProvider.id,
                title: portfolioData.title,
                description: portfolioData.description,
                projectUrl: portfolioData.projectUrl
            }
        });
        // If imageUrls are provided, create portfolio files
        if (portfolioData.imageUrls && portfolioData.imageUrls.length > 0) {
            // Create each file separately
            for (const fileUrl of portfolioData.imageUrls) {
                yield prisma.portfolioFile.create({
                    data: {
                        portfolioId: portfolio.id,
                        fileUrl: fileUrl,
                        fileName: fileUrl.split('/').pop() || '',
                        fileType: getFileTypeFromUrl(fileUrl)
                    }
                });
            }
        }
        // Return the portfolio with files
        const portfolioWithFiles = yield prisma.portfolio.findUnique({
            where: { id: portfolio.id },
            include: {
                files: true
            }
        });
        return portfolioWithFiles;
    }
    catch (error) {
        throw error;
    }
});
exports.addPortfolio = addPortfolio;
// Helper function to determine file type from URL
const getFileTypeFromUrl = (url) => {
    var _a;
    const extension = ((_a = url.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        return 'image';
    }
    else if (['pdf', 'doc', 'docx'].includes(extension)) {
        return 'document';
    }
    else {
        return 'other';
    }
};
const createService = (userId, service) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Check if category exists
        const category = yield prisma.category.findUnique({
            where: { id: service.categoryId }
        });
        if (!category) {
            throw new Error('Category not found');
        }
        // Create new service (pending admin approval)
        const newService = yield prisma.service.create({
            data: {
                serviceProviderId: user.serviceProvider.id,
                title: service.title,
                description: service.description,
                categoryId: service.categoryId,
                pricing: service.pricing,
                pricingType: service.pricingType,
                imageUrls: service.imageUrls ? JSON.stringify(service.imageUrls) : null,
                isActive: true,
                isApproved: false, // Must be approved by admin before visible to clients
                skills: service.skillIds ? {
                    connect: service.skillIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                skills: true,
                category: true
            }
        });
        // Notify provider that service is pending approval
        yield prisma.notification.create({
            data: {
                receiverId: userId,
                type: 'GENERAL',
                title: 'Service Submitted for Review',
                message: `Your service "${service.title}" has been submitted and is pending admin approval. You will be notified once it's reviewed.`,
                isRead: false
            }
        });
        // Notify all admins about new service pending approval
        const admins = yield prisma.user.findMany({
            where: {
                role: 'ADMIN',
                isActive: true
            }
        });
        // Create notifications for all admins
        const adminNotifications = admins.map(admin => ({
            receiverId: admin.id,
            type: client_1.NotificationType.GENERAL,
            title: 'New Service Pending Approval',
            message: `A new service "${service.title}" by ${user.firstName} ${user.lastName} is pending approval.`,
            isRead: false
        }));
        if (adminNotifications.length > 0) {
            yield prisma.notification.createMany({
                data: adminNotifications
            });
        }
        return newService;
    }
    catch (error) {
        throw error;
    }
});
exports.createService = createService;
const getProviderServices = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Get all services for this provider
        const services = yield prisma.service.findMany({
            where: {
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                category: true,
                skills: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return services;
    }
    catch (error) {
        throw error;
    }
});
exports.getProviderServices = getProviderServices;
const updateProviderService = (userId, serviceId, serviceData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Find the service and ensure it belongs to this provider
        const service = yield prisma.service.findFirst({
            where: {
                id: serviceId,
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                skills: true
            }
        });
        if (!service) {
            throw new Error('Service not found or not authorized');
        }
        // Check if category exists if provided
        if (serviceData.categoryId) {
            const category = yield prisma.category.findUnique({
                where: { id: serviceData.categoryId }
            });
            if (!category) {
                throw new Error('Category not found');
            }
        }
        // Prepare data for service update
        const updateData = {};
        if (serviceData.title !== undefined)
            updateData.title = serviceData.title;
        if (serviceData.description !== undefined)
            updateData.description = serviceData.description;
        if (serviceData.categoryId !== undefined)
            updateData.categoryId = serviceData.categoryId;
        if (serviceData.pricing !== undefined)
            updateData.pricing = serviceData.pricing;
        if (serviceData.pricingType !== undefined)
            updateData.pricingType = serviceData.pricingType;
        if (serviceData.imageUrls !== undefined) {
            updateData.imageUrls = serviceData.imageUrls ? JSON.stringify(serviceData.imageUrls) : null;
        }
        if (serviceData.isActive !== undefined)
            updateData.isActive = serviceData.isActive;
        // Update the service
        const updatedService = yield prisma.service.update({
            where: { id: serviceId },
            data: updateData,
            include: {
                category: true,
                skills: true
            }
        });
        // Update skills if provided
        if (serviceData.skillIds !== undefined) {
            // First disconnect all existing skills
            yield prisma.service.update({
                where: { id: serviceId },
                data: {
                    skills: {
                        disconnect: service.skills.map(skill => ({ id: skill.id }))
                    }
                }
            });
            // Then connect new skills if there are any
            if (serviceData.skillIds.length > 0) {
                yield prisma.service.update({
                    where: { id: serviceId },
                    data: {
                        skills: {
                            connect: serviceData.skillIds.map(id => ({ id }))
                        }
                    }
                });
            }
            // Fetch the service again with updated skills
            return yield prisma.service.findUnique({
                where: { id: serviceId },
                include: {
                    category: true,
                    skills: true
                }
            });
        }
        return updatedService;
    }
    catch (error) {
        throw error;
    }
});
exports.updateProviderService = updateProviderService;
const getCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.category.findMany();
        return categories;
    }
    catch (error) {
        throw error;
    }
});
exports.getCategories = getCategories;
const addDocument = (userId, document) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.serviceProvider) {
            throw new Error('Provider profile not found');
        }
        // Create new document
        const newDocument = yield prisma.document.create({
            data: {
                serviceProviderId: user.serviceProvider.id,
                title: document.title,
                type: document.type,
                fileUrl: document.fileUrl,
                isVerified: false
            }
        });
        return newDocument;
    }
    catch (error) {
        throw error;
    }
});
exports.addDocument = addDocument;
// Add this new function to create a verification notification for providers
const createProviderVerificationNotification = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Create a notification about verification status
        const notification = yield prisma.notification.create({
            data: {
                receiverId: userId,
                type: 'GENERAL',
                title: 'Complete Your Profile for Verification',
                message: 'Your provider account is pending verification. To expedite the verification process, please complete your profile and upload all necessary identification documents.',
                isRead: false
            }
        });
        return notification;
    }
    catch (error) {
        throw error;
    }
});
exports.createProviderVerificationNotification = createProviderVerificationNotification;
// New function to check provider verification status
const getProviderVerificationStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                serviceProvider: {
                    include: {
                        documents: {
                            where: {
                                type: 'ID'
                            }
                        }
                    }
                }
            }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        return {
            isVerified: user.serviceProvider.isProviderVerified,
            hasUploadedDocuments: user.serviceProvider.documents.length > 0,
            pendingVerification: !user.serviceProvider.isProviderVerified && user.serviceProvider.documents.length > 0
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getProviderVerificationStatus = getProviderVerificationStatus;
const getProviderBookings = (userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Build query conditions
        const where = {
            serviceProviderId: user.serviceProvider.id
        };
        // Filter by status if provided
        if (status) {
            where.status = status;
        }
        // Get all bookings for this provider
        const bookings = yield prisma.serviceBooking.findMany({
            where,
            include: {
                service: {
                    include: {
                        category: true
                    }
                },
                client: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                address: true,
                timeRecords: true,
                payment: true
            },
            orderBy: {
                startTime: 'desc'
            }
        });
        return bookings;
    }
    catch (error) {
        throw error;
    }
});
exports.getProviderBookings = getProviderBookings;
const getProviderBookingDetails = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Get booking with details, ensuring it belongs to this provider
        const booking = yield prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                service: {
                    include: {
                        category: true,
                        skills: true
                    }
                },
                client: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                address: true,
                payment: true,
                timeRecords: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found or not authorized');
        }
        return booking;
    }
    catch (error) {
        throw error;
    }
});
exports.getProviderBookingDetails = getProviderBookingDetails;
const acceptBooking = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Store serviceProviderId to avoid TypeScript null check issues
        const serviceProviderId = user.serviceProvider.id;
        // Find the booking and ensure it belongs to this provider
        const booking = yield prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                serviceProviderId: serviceProviderId
            },
            include: {
                client: {
                    include: {
                        user: true
                    }
                },
                service: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found or not authorized');
        }
        // Ensure booking is in PENDING status
        if (booking.status !== 'PENDING') {
            throw new Error(`Cannot accept a booking with status: ${booking.status}`);
        }
        // Calculate expected end time (default 1 hour duration)
        const bookingStart = new Date(booking.startTime);
        const expectedEndTime = new Date(bookingStart);
        expectedEndTime.setHours(expectedEndTime.getHours() + 1); // Default 1 hour duration
        // Format date and times
        const bookingDate = new Date(bookingStart);
        bookingDate.setHours(0, 0, 0, 0); // Set to start of day for date comparison
        const startTimeStr = bookingStart.getHours().toString().padStart(2, '0') + ':' +
            bookingStart.getMinutes().toString().padStart(2, '0');
        const endTimeStr = expectedEndTime.getHours().toString().padStart(2, '0') + ':' +
            expectedEndTime.getMinutes().toString().padStart(2, '0');
        // Update booking status and create unavailable slot in a transaction
        const updatedBooking = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update booking status
            const updated = yield tx.serviceBooking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' }
            });
            // Create unavailable slot for this date + time range
            yield tx.providerUnavailable.create({
                data: {
                    serviceProviderId: serviceProviderId,
                    date: bookingDate,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    bookingId: bookingId
                }
            });
            return updated;
        }));
        // Create a chat conversation between provider and client
        try {
            yield (0, allRoleFunctionController_1.createChatConversation)(userId, booking.client.userId, bookingId);
        }
        catch (error) {
            console.error('Error creating chat conversation:', error);
            // Don't fail the booking acceptance if chat creation fails
        }
        // Get full booking data for real-time update
        const fullBooking = yield prisma.serviceBooking.findUnique({
            where: { id: bookingId },
            include: {
                service: true,
                client: {
                    include: { user: true }
                },
                serviceProvider: {
                    include: { user: true }
                },
                payment: true
            }
        });
        // Only create notification if booking status is actually CONFIRMED
        // Check the updated booking status to ensure it matches
        if (fullBooking && fullBooking.status === 'CONFIRMED') {
            // Create notification for client
            const notification = yield prisma.notification.create({
                data: {
                    receiverId: booking.client.userId,
                    type: 'BOOKING_CONFIRMED',
                    title: 'Booking Confirmed',
                    message: `Your booking for "${booking.service.title}" has been confirmed by the provider.`,
                    isRead: false,
                    data: JSON.stringify({
                        bookingId: booking.id,
                        serviceId: booking.service.id
                    })
                }
            });
            // Emit real-time updates
            try {
                const { io } = yield Promise.resolve().then(() => __importStar(require('../index')));
                if (io && fullBooking) {
                    // Emit booking update to client
                    io.to(`user:${booking.client.userId}`).emit('booking-updated', {
                        bookingId: booking.id,
                        booking: fullBooking
                    });
                    // Emit notification to client
                    io.to(`user:${booking.client.userId}`).emit('notification', {
                        id: notification.id,
                        type: notification.type,
                        title: notification.title,
                        message: notification.message,
                        data: JSON.parse(notification.data || '{}'),
                        createdAt: notification.createdAt,
                        isRead: false
                    });
                }
            }
            catch (socketError) {
                console.error('Error emitting socket update:', socketError);
            }
            // Log activity
            const { logActivity } = yield Promise.resolve().then(() => __importStar(require('../utils/activityLogger')));
            yield logActivity('PROVIDER_ACCEPTED', `Provider ${user.firstName} ${user.lastName} accepted booking for "${booking.service.title}"`, userId, bookingId);
            return updatedBooking;
        }
        else {
            // Booking status doesn't match, don't create notification
            console.warn(`Booking ${bookingId} status is ${fullBooking === null || fullBooking === void 0 ? void 0 : fullBooking.status}, not CONFIRMED. Skipping notification.`);
            // Log activity anyway
            const { logActivity } = yield Promise.resolve().then(() => __importStar(require('../utils/activityLogger')));
            yield logActivity('PROVIDER_ACCEPTED', `Provider ${user.firstName} ${user.lastName} attempted to accept booking for "${booking.service.title}" but status is ${fullBooking === null || fullBooking === void 0 ? void 0 : fullBooking.status}`, userId, bookingId);
            return updatedBooking;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.acceptBooking = acceptBooking;
const declineBooking = (userId, bookingId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Find the booking and ensure it belongs to this provider
        const booking = yield prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                client: {
                    include: {
                        user: true
                    }
                },
                service: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found or not authorized');
        }
        // Ensure booking is in PENDING status
        if (booking.status !== 'PENDING') {
            throw new Error(`Cannot decline a booking with status: ${booking.status}`);
        }
        // Update booking status
        const updatedBooking = yield prisma.serviceBooking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                notes: booking.notes ?
                    `${booking.notes}\n\nDeclined by provider${reason ? `: ${reason}` : ''}` :
                    `Declined by provider${reason ? `: ${reason}` : ''}`
            }
        });
        // Get full booking data for real-time update
        const fullBooking = yield prisma.serviceBooking.findUnique({
            where: { id: bookingId },
            include: {
                service: true,
                client: {
                    include: { user: true }
                },
                serviceProvider: {
                    include: { user: true }
                },
                payment: true
            }
        });
        // Create notification for client
        const notification = yield prisma.notification.create({
            data: {
                receiverId: booking.client.userId,
                type: 'BOOKING_CANCELLED',
                title: 'Booking Declined',
                message: `Your booking for "${booking.service.title}" has been declined by the provider${reason ? `: ${reason}` : ''}.`,
                isRead: false,
                data: JSON.stringify({
                    bookingId: booking.id,
                    serviceId: booking.service.id
                })
            }
        });
        // Emit real-time updates
        try {
            const { io } = yield Promise.resolve().then(() => __importStar(require('../index')));
            if (io && fullBooking) {
                // Emit booking update to client
                io.to(`user:${booking.client.userId}`).emit('booking-updated', {
                    bookingId: booking.id,
                    booking: fullBooking
                });
                // Emit notification to client
                io.to(`user:${booking.client.userId}`).emit('notification', {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: JSON.parse(notification.data || '{}'),
                    createdAt: notification.createdAt,
                    isRead: false
                });
            }
        }
        catch (socketError) {
            console.error('Error emitting socket update:', socketError);
        }
        // Log activity
        const { logActivity } = yield Promise.resolve().then(() => __importStar(require('../utils/activityLogger')));
        yield logActivity('PROVIDER_DECLINED', `Provider ${user.firstName} ${user.lastName} declined booking for "${booking.service.title}"${reason ? `: ${reason}` : ''}`, userId, bookingId);
        return updatedBooking;
    }
    catch (error) {
        throw error;
    }
});
exports.declineBooking = declineBooking;
const startService = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Find the booking and ensure it belongs to this provider
        const booking = yield prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                client: {
                    include: {
                        user: true
                    }
                },
                service: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found or not authorized');
        }
        // Ensure booking is in CONFIRMED status
        if (booking.status !== 'CONFIRMED') {
            throw new Error(`Cannot start a booking with status: ${booking.status}`);
        }
        // Update booking status
        const updatedBooking = yield prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { status: 'IN_PROGRESS' }
        });
        // Create a time record for the booking
        yield prisma.timeRecord.create({
            data: {
                serviceBookingId: bookingId,
                startTime: new Date(),
                // End time will be set when service is completed
            }
        });
        // Get full booking data for real-time update
        const fullBooking = yield prisma.serviceBooking.findUnique({
            where: { id: bookingId },
            include: {
                service: true,
                client: {
                    include: { user: true }
                },
                serviceProvider: {
                    include: { user: true }
                },
                payment: true
            }
        });
        // Create notification for client
        const notification = yield prisma.notification.create({
            data: {
                receiverId: booking.client.userId,
                type: 'GENERAL',
                title: 'Service Started',
                message: `Your booked service "${booking.service.title}" has been started by the provider.`,
                isRead: false,
                data: JSON.stringify({
                    bookingId: booking.id,
                    serviceId: booking.service.id
                })
            }
        });
        // Emit real-time updates
        try {
            const { io } = yield Promise.resolve().then(() => __importStar(require('../index')));
            if (io && fullBooking) {
                // Emit booking update to client
                io.to(`user:${booking.client.userId}`).emit('booking-updated', {
                    bookingId: booking.id,
                    booking: fullBooking
                });
                // Emit notification to client
                io.to(`user:${booking.client.userId}`).emit('notification', {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: JSON.parse(notification.data || '{}'),
                    createdAt: notification.createdAt,
                    isRead: false
                });
            }
        }
        catch (socketError) {
            console.error('Error emitting socket update:', socketError);
        }
        return updatedBooking;
    }
    catch (error) {
        throw error;
    }
});
exports.startService = startService;
const completeService = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Find the booking and ensure it belongs to this provider
        const booking = yield prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                service: true,
                client: {
                    include: {
                        user: true
                    }
                },
                timeRecords: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found or not authorized');
        }
        // Ensure booking is in IN_PROGRESS status
        if (booking.status !== 'IN_PROGRESS') {
            throw new Error(`Cannot complete a booking with status: ${booking.status}`);
        }
        // Get the active time record (without an end time)
        const activeTimeRecord = booking.timeRecords.find(record => !record.endTime);
        let timeRecordToUpdate;
        if (!activeTimeRecord) {
            // Create a new time record if none exists
            console.log('No active time record found, creating one now...');
            // Create with start time of 1 hour ago as a fallback
            const defaultStartTime = new Date();
            defaultStartTime.setHours(defaultStartTime.getHours() - 1);
            // Create a new time record
            timeRecordToUpdate = yield prisma.timeRecord.create({
                data: {
                    serviceBookingId: bookingId,
                    startTime: defaultStartTime,
                }
            });
            console.log('Created new time record:', timeRecordToUpdate);
        }
        else {
            timeRecordToUpdate = activeTimeRecord;
        }
        // Calculate end time, duration, and total amount
        const endTime = new Date();
        const startTime = new Date(timeRecordToUpdate.startTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // in hours
        // Calculate total amount without hourly computation (per day/session/fixed)
        const totalAmount = booking.service.pricing;
        // Transaction to update everything at once
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update the time record with end time and duration
            const updatedTimeRecord = yield tx.timeRecord.update({
                where: { id: timeRecordToUpdate.id },
                data: {
                    endTime,
                    duration: durationHours
                }
            });
            // Update the booking with completion details
            const updatedBooking = yield tx.serviceBooking.update({
                where: { id: bookingId },
                data: {
                    status: 'COMPLETED',
                    endTime,
                    totalHours: durationHours,
                    totalAmount
                }
            });
            return {
                booking: updatedBooking,
                timeRecord: updatedTimeRecord
            };
        }));
        // Get full booking data for real-time update
        const fullBooking = yield prisma.serviceBooking.findUnique({
            where: { id: bookingId },
            include: {
                service: true,
                client: {
                    include: { user: true }
                },
                serviceProvider: {
                    include: { user: true }
                },
                payment: true
            }
        });
        // Only create notification if booking status is actually COMPLETED
        if (fullBooking && fullBooking.status === 'COMPLETED') {
            // Create notification for client
            const notification = yield prisma.notification.create({
                data: {
                    receiverId: booking.client.userId,
                    type: 'SERVICE_COMPLETED',
                    title: 'Service Completed',
                    message: `Your booked service "${booking.service.title}" has been completed. Total amount: ₱${totalAmount.toFixed(2)}.`,
                    isRead: false,
                    data: JSON.stringify({
                        bookingId: booking.id,
                        serviceId: booking.service.id,
                        totalAmount
                    })
                }
            });
            // Emit real-time updates
            try {
                const { io } = yield Promise.resolve().then(() => __importStar(require('../index')));
                if (io && fullBooking) {
                    // Emit booking update to client
                    io.to(`user:${booking.client.userId}`).emit('booking-updated', {
                        bookingId: booking.id,
                        booking: fullBooking
                    });
                    // Emit notification to client
                    io.to(`user:${booking.client.userId}`).emit('notification', {
                        id: notification.id,
                        type: notification.type,
                        title: notification.title,
                        message: notification.message,
                        data: JSON.parse(notification.data || '{}'),
                        createdAt: notification.createdAt,
                        isRead: false
                    });
                }
            }
            catch (socketError) {
                console.error('Error emitting socket update:', socketError);
            }
            // Log activity
            const { logActivity } = yield Promise.resolve().then(() => __importStar(require('../utils/activityLogger')));
            yield logActivity('PROVIDER_COMPLETED_JOB', `Provider ${user.firstName} ${user.lastName} completed service "${booking.service.title}" for booking`, userId, bookingId);
            return result.booking;
        }
        else {
            // Booking status doesn't match, don't create notification
            console.warn(`Booking ${bookingId} status is ${fullBooking === null || fullBooking === void 0 ? void 0 : fullBooking.status}, not COMPLETED. Skipping notification.`);
            // Log activity anyway
            const { logActivity } = yield Promise.resolve().then(() => __importStar(require('../utils/activityLogger')));
            yield logActivity('PROVIDER_COMPLETED_JOB', `Provider ${user.firstName} ${user.lastName} attempted to complete service "${booking.service.title}" but status is ${fullBooking === null || fullBooking === void 0 ? void 0 : fullBooking.status}`, userId, bookingId);
            return result.booking;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.completeService = completeService;
const createContract = (userId, bookingId, contractData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Find the booking and ensure it belongs to this provider
        const booking = yield prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                serviceProviderId: user.serviceProvider.id
            },
            include: {
                client: {
                    include: {
                        user: true
                    }
                },
                service: true,
                contract: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found or not authorized');
        }
        // Check if contract already exists
        if (booking.contract) {
            throw new Error('Contract already exists for this booking');
        }
        // Create the contract
        const contract = yield prisma.contract.create({
            data: {
                serviceBookingId: booking.id,
                terms: contractData.terms,
                paymentAmount: new client_1.Prisma.Decimal(contractData.paymentAmount.toString()),
                paymentType: contractData.paymentType,
                providerSigned: true, // Provider signs when creating
                clientSigned: false // Client will sign later
            }
        });
        // Create notification for client
        yield prisma.notification.create({
            data: {
                receiverId: booking.client.user.id,
                type: 'CONTRACT_SIGNED',
                title: 'New Contract Available',
                message: `A contract for service "${booking.service.title}" is available for your review and signature.`,
                isRead: false,
                data: JSON.stringify({
                    bookingId: booking.id,
                    contractId: contract.id,
                    serviceId: booking.service.id
                })
            }
        });
        return contract;
    }
    catch (error) {
        throw error;
    }
});
exports.createContract = createContract;
const getContractDetails = (userId, contractId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                serviceProvider: true,
                client: true
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Find the contract
        const contract = yield prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                serviceBooking: {
                    include: {
                        client: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
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
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true
                                    }
                                }
                            }
                        },
                        service: true
                    }
                }
            }
        });
        if (!contract) {
            throw new Error('Contract not found');
        }
        // Check authorization - only allow involved parties to access
        const isProvider = user.serviceProvider && user.serviceProvider.id === contract.serviceBooking.serviceProviderId;
        const isClient = user.client && user.client.id === contract.serviceBooking.clientId;
        if (!isProvider && !isClient) {
            throw new Error('Not authorized to access this contract');
        }
        return contract;
    }
    catch (error) {
        throw error;
    }
});
exports.getContractDetails = getContractDetails;
const updateContract = (userId, contractId, contractData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Find provider by userId
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true }
        });
        if (!user || !user.serviceProvider) {
            throw new Error('Provider not found');
        }
        // Find the contract
        const contract = yield prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                serviceBooking: {
                    include: {
                        client: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
        if (!contract) {
            throw new Error('Contract not found');
        }
        // Check if provider owns this contract
        if (contract.serviceBooking.serviceProviderId !== user.serviceProvider.id) {
            throw new Error('Not authorized to update this contract');
        }
        // Check if client has already signed - can't update after client signs
        if (contract.clientSigned) {
            throw new Error('Cannot update contract after client has signed');
        }
        // Update the contract
        const updatedContract = yield prisma.contract.update({
            where: { id: contractId },
            data: {
                terms: (_a = contractData.terms) !== null && _a !== void 0 ? _a : contract.terms,
                paymentAmount: contractData.paymentAmount ?
                    new client_1.Prisma.Decimal(contractData.paymentAmount.toString()) :
                    contract.paymentAmount,
                paymentType: (_b = contractData.paymentType) !== null && _b !== void 0 ? _b : contract.paymentType,
                providerSigned: true, // Re-sign after update
                clientSigned: false // Reset client signature
            }
        });
        // Notify client of contract update
        yield prisma.notification.create({
            data: {
                receiverId: contract.serviceBooking.client.user.id,
                type: 'CONTRACT_SIGNED',
                title: 'Contract Updated',
                message: 'The service contract has been updated. Please review and sign the updated contract.',
                isRead: false,
                data: JSON.stringify({
                    contractId: contract.id,
                    bookingId: contract.serviceBooking.id
                })
            }
        });
        return updatedContract;
    }
    catch (error) {
        throw error;
    }
});
exports.updateContract = updateContract;
const signContract = (userId, contractId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the user with provider information
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: {
            serviceProvider: true
        }
    });
    if (!user || !user.serviceProvider) {
        throw new Error('User not found or not a service provider');
    }
    // Find the contract
    const contract = yield prisma.contract.findUnique({
        where: { id: contractId },
        include: {
            serviceBooking: {
                include: {
                    client: {
                        include: {
                            user: true
                        }
                    },
                    service: true
                }
            }
        }
    });
    if (!contract) {
        throw new Error('Contract not found');
    }
    // Check if provider owns this contract
    if (contract.serviceBooking.serviceProviderId !== user.serviceProvider.id) {
        throw new Error('Not authorized to sign this contract');
    }
    // Check if provider has already signed
    if (contract.providerSigned) {
        throw new Error('Contract already signed by provider');
    }
    // Update the contract - mark as signed by provider
    const updatedContract = yield prisma.contract.update({
        where: { id: contractId },
        data: {
            providerSigned: true
        },
        include: {
            serviceBooking: {
                include: {
                    service: true,
                    client: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });
    // Notify the client that provider has signed the contract
    yield prisma.notification.create({
        data: {
            receiverId: contract.serviceBooking.client.user.id,
            type: 'CONTRACT_SIGNED',
            title: 'Contract Signed',
            message: `Service provider has signed the contract for service "${contract.serviceBooking.service.title}"`,
            data: JSON.stringify({
                contractId: contract.id,
                bookingId: contract.serviceBookingId
            }),
            isRead: false
        }
    });
    // If both parties have signed, update booking status to confirmed
    if (updatedContract.providerSigned && updatedContract.clientSigned) {
        yield prisma.serviceBooking.update({
            where: { id: contract.serviceBookingId },
            data: {
                status: 'CONFIRMED'
            }
        });
    }
    return updatedContract;
});
exports.signContract = signContract;
// Review Functions
const createClientReview = (userId, bookingId, reviewData) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the user with provider information
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: {
            serviceProvider: true
        }
    });
    if (!user || !user.serviceProvider) {
        throw new Error('User not found or not a service provider');
    }
    // Find the booking and ensure it belongs to this provider
    const booking = yield prisma.serviceBooking.findFirst({
        where: {
            id: bookingId,
            serviceProviderId: user.serviceProvider.id
        },
        include: {
            client: {
                include: {
                    user: true
                }
            },
            service: true
        }
    });
    if (!booking) {
        throw new Error('Booking not found or not authorized');
    }
    // Check if the booking is completed
    if (booking.status !== 'COMPLETED') {
        throw new Error('Cannot review a booking that is not completed');
    }
    // Check if this provider has already reviewed this booking
    const existingReview = yield prisma.review.findFirst({
        where: {
            serviceBookingId: bookingId,
            giverId: user.id
        }
    });
    if (existingReview) {
        throw new Error('You have already reviewed this booking');
    }
    // Create a new review
    const review = yield prisma.review.create({
        data: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            giverId: user.id,
            receiverId: booking.client.user.id,
            serviceBookingId: bookingId
        }
    });
    // Create notification for the client
    yield prisma.notification.create({
        data: {
            receiverId: booking.client.user.id,
            type: 'REVIEW_RECEIVED',
            title: 'New Review Received',
            message: `You received a ${reviewData.rating}-star review from ${user.firstName} ${user.lastName}`,
            data: JSON.stringify({
                bookingId: booking.id,
                serviceId: booking.serviceId,
                reviewId: review.id
            }),
            isRead: false
        }
    });
    return review;
});
exports.createClientReview = createClientReview;
const getReviewsReceived = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get reviews received by the user
    const reviews = yield prisma.review.findMany({
        where: {
            receiverId: userId
        },
        include: {
            giver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    return {
        reviews,
        averageRating,
        totalReviews
    };
});
exports.getReviewsReceived = getReviewsReceived;
const getReviewsGiven = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get reviews given by the user
    const reviews = yield prisma.review.findMany({
        where: {
            giverId: userId
        },
        include: {
            receiver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    return {
        reviews,
        averageRating,
        totalReviews
    };
});
exports.getReviewsGiven = getReviewsGiven;
const getServiceProviderReviews = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the provider user
    const provider = yield prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: {
            user: true
        }
    });
    if (!provider) {
        throw new Error('Service provider not found');
    }
    // Get all reviews for this provider
    const reviews = yield prisma.review.findMany({
        where: {
            receiverId: provider.user.id
        },
        include: {
            giver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return {
        provider: {
            id: provider.id,
            userId: provider.userId,
            firstName: provider.user.firstName,
            lastName: provider.user.lastName,
            rating: provider.rating
        },
        reviews: reviews,
        averageRating: provider.rating,
        totalReviews: reviews.length
    };
});
exports.getServiceProviderReviews = getServiceProviderReviews;
// Availability Functions
const addAvailabilitySlot = (userId, availabilityData) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate date
    if (!availabilityData.date) {
        throw new Error('Date is required');
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    if (!dateRegex.test(availabilityData.date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
    }
    const selectedDate = new Date(availabilityData.date);
    if (isNaN(selectedDate.getTime())) {
        throw new Error('Invalid date');
    }
    // Ensure date is not in the past (allow same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        throw new Error('Cannot create availability for past dates');
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour format: HH:MM
    if (!timeRegex.test(availabilityData.startTime) || !timeRegex.test(availabilityData.endTime)) {
        throw new Error('Time must be in 24-hour format (HH:MM)');
    }
    // Parse times to compare them
    const [startHour, startMinute] = availabilityData.startTime.split(':').map(Number);
    const [endHour, endMinute] = availabilityData.endTime.split(':').map(Number);
    // Convert to minutes for easy comparison
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    if (startTimeMinutes >= endTimeMinutes) {
        throw new Error('End time must be after start time');
    }
    // Find the user with service provider info
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { serviceProvider: true }
    });
    if (!user || !user.serviceProvider) {
        throw new Error('Service provider not found');
    }
    // Check for overlapping availability slots on the same date
    const existingSlots = yield prisma.availability.findMany({
        where: {
            serviceProviderId: user.serviceProvider.id,
            date: selectedDate,
            isAvailable: true
        }
    });
    for (const slot of existingSlots) {
        const [slotStartHour, slotStartMinute] = slot.startTime.split(':').map(Number);
        const [slotEndHour, slotEndMinute] = slot.endTime.split(':').map(Number);
        const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
        const slotEndMinutes = slotEndHour * 60 + slotEndMinute;
        // Check for overlap
        if ((startTimeMinutes >= slotStartMinutes && startTimeMinutes < slotEndMinutes) || // Start time overlaps with existing slot
            (endTimeMinutes > slotStartMinutes && endTimeMinutes <= slotEndMinutes) || // End time overlaps with existing slot
            (startTimeMinutes <= slotStartMinutes && endTimeMinutes >= slotEndMinutes) // New slot completely covers existing slot
        ) {
            throw new Error(`This time slot overlaps with an existing availability slot (${slot.startTime} - ${slot.endTime})`);
        }
    }
    // Create new availability slot
    const availability = yield prisma.availability.create({
        data: {
            serviceProviderId: user.serviceProvider.id,
            date: selectedDate,
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
            isAvailable: availabilityData.isAvailable !== false // Default to true unless explicitly set to false
        }
    });
    return availability;
});
exports.addAvailabilitySlot = addAvailabilitySlot;
const getAvailability = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the user with service provider info
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { serviceProvider: true }
    });
    if (!user || !user.serviceProvider) {
        throw new Error('Service provider not found');
    }
    // Get all availability slots (date-based)
    const availabilitySlots = yield prisma.availability.findMany({
        where: {
            serviceProviderId: user.serviceProvider.id
        },
        orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
        ]
    });
    // Return slots directly (frontend will filter by date range)
    return {
        providerInfo: {
            id: user.serviceProvider.id,
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`
        },
        slots: availabilitySlots
    };
});
exports.getAvailability = getAvailability;
const getProviderAvailabilityByProviderId = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the service provider
    const serviceProvider = yield prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
    });
    if (!serviceProvider) {
        throw new Error('Service provider not found');
    }
    // Get all availability slots (date-based)
    const availabilitySlots = yield prisma.availability.findMany({
        where: {
            serviceProviderId: providerId,
            isAvailable: true
        },
        orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
        ]
    });
    // Return slots directly (clients can filter by date range as needed)
    return {
        providerInfo: {
            id: serviceProvider.id,
            userId: serviceProvider.userId,
            name: `${serviceProvider.user.firstName} ${serviceProvider.user.lastName}`
        },
        slots: availabilitySlots
    };
});
exports.getProviderAvailabilityByProviderId = getProviderAvailabilityByProviderId;
const updateAvailabilitySlot = (userId, slotId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the user with service provider info
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { serviceProvider: true }
    });
    if (!user || !user.serviceProvider) {
        throw new Error('Service provider not found');
    }
    // Find the slot and verify it belongs to this provider
    const slot = yield prisma.availability.findUnique({
        where: { id: slotId }
    });
    if (!slot) {
        throw new Error('Availability slot not found');
    }
    if (slot.serviceProviderId !== user.serviceProvider.id) {
        throw new Error('You do not have permission to update this availability slot');
    }
    // Validate date if provided
    let updatedDate = slot.date;
    if (updateData.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(updateData.date)) {
            throw new Error('Date must be in YYYY-MM-DD format');
        }
        updatedDate = new Date(updateData.date);
        if (isNaN(updatedDate.getTime())) {
            throw new Error('Invalid date');
        }
    }
    // Validate time formats if provided
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const startTime = updateData.startTime || slot.startTime;
    const endTime = updateData.endTime || slot.endTime;
    if (updateData.startTime && !timeRegex.test(startTime)) {
        throw new Error('Start time must be in 24-hour format (HH:MM)');
    }
    if (updateData.endTime && !timeRegex.test(endTime)) {
        throw new Error('End time must be in 24-hour format (HH:MM)');
    }
    // Parse and compare times to ensure end is after start
    if (updateData.startTime || updateData.endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;
        if (startTimeMinutes >= endTimeMinutes) {
            throw new Error('End time must be after start time');
        }
        // Check for overlapping availability slots on the same date (excluding this slot)
        const checkDate = updateData.date ? new Date(updateData.date) : slot.date;
        const existingSlots = yield prisma.availability.findMany({
            where: {
                serviceProviderId: user.serviceProvider.id,
                date: checkDate,
                isAvailable: true,
                id: { not: slotId }
            }
        });
        for (const existingSlot of existingSlots) {
            const [slotStartHour, slotStartMinute] = existingSlot.startTime.split(':').map(Number);
            const [slotEndHour, slotEndMinute] = existingSlot.endTime.split(':').map(Number);
            const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
            const slotEndMinutes = slotEndHour * 60 + slotEndMinute;
            // Check for overlap
            if ((startTimeMinutes >= slotStartMinutes && startTimeMinutes < slotEndMinutes) ||
                (endTimeMinutes > slotStartMinutes && endTimeMinutes <= slotEndMinutes) ||
                (startTimeMinutes <= slotStartMinutes && endTimeMinutes >= slotEndMinutes)) {
                throw new Error(`This time slot would overlap with an existing availability slot (${existingSlot.startTime} - ${existingSlot.endTime})`);
            }
        }
    }
    // Update the slot
    const updatePayload = {};
    if (updateData.date !== undefined)
        updatePayload.date = updatedDate;
    if (updateData.startTime !== undefined)
        updatePayload.startTime = updateData.startTime;
    if (updateData.endTime !== undefined)
        updatePayload.endTime = updateData.endTime;
    if (updateData.isAvailable !== undefined)
        updatePayload.isAvailable = updateData.isAvailable;
    const updatedSlot = yield prisma.availability.update({
        where: { id: slotId },
        data: updatePayload
    });
    return updatedSlot;
});
exports.updateAvailabilitySlot = updateAvailabilitySlot;
const deleteAvailabilitySlot = (userId, slotId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the user with service provider info
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { serviceProvider: true }
    });
    if (!user || !user.serviceProvider) {
        throw new Error('Service provider not found');
    }
    // Find the slot and verify it belongs to this provider
    const slot = yield prisma.availability.findUnique({
        where: { id: slotId }
    });
    if (!slot) {
        throw new Error('Availability slot not found');
    }
    if (slot.serviceProviderId !== user.serviceProvider.id) {
        throw new Error('You do not have permission to delete this availability slot');
    }
    // Check for any bookings that might depend on this availability slot
    // This is a simplification. In a production system, you'd want to check
    // if any bookings exist in this time slot on any day that matches this day of week.
    // For simplicity, we're skipping this check here.
    // Delete the slot
    yield prisma.availability.delete({
        where: { id: slotId }
    });
    return { success: true, message: 'Availability slot deleted successfully' };
});
exports.deleteAvailabilitySlot = deleteAvailabilitySlot;
// Helper function to get day name
const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
};
