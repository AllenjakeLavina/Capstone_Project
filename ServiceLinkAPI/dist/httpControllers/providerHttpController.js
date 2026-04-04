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
exports.deleteAvailabilitySlotController = exports.updateAvailabilitySlotController = exports.getAvailabilityController = exports.addAvailabilitySlotController = exports.getProviderReviewsController = exports.getReviewsGivenController = exports.getReviewsReceivedController = exports.createReviewController = exports.signContractController = exports.updateContractController = exports.createContractController = exports.getContractController = exports.handleCompleteService = exports.handleStartService = exports.handleDeclineBooking = exports.handleAcceptBooking = exports.handleGetProviderBookingDetails = exports.handleGetProviderBookings = exports.handleGetCategories = exports.handleUpdateProviderService = exports.handleGetProviderServices = exports.handleCreateService = exports.handleGetVerificationStatus = exports.handleAddDocument = exports.handleAddPortfolioWithFiles = exports.handleAddPortfolio = exports.handleAddSkill = exports.handleAddEducation = exports.handleAddWorkExperience = exports.handleGetProviderProfile = exports.handleUpdateProviderProfile = exports.handleRegisterProvider = void 0;
const providerFunctionController_1 = require("../functionControllers/providerFunctionController");
const fileHandler_1 = require("../middlewares/fileHandler");
const handleRegisterProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Check if ID document was uploaded
        let idDocument = undefined;
        if (req.file) {
            console.log('File uploaded during registration:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path
            });
            idDocument = {
                title: 'Identity Document',
                fileUrl: (0, fileHandler_1.getFileUrl)(req, req.file)
            };
            console.log('Generated file URL:', idDocument.fileUrl);
        }
        else {
            console.log('No file uploaded during registration');
        }
        const user = yield (0, providerFunctionController_1.registerProvider)(email, password, firstName, lastName, phone, idDocument);
        res.status(201).json({
            success: true,
            message: 'Service provider registered successfully. Your account and ID documents will be verified by an admin before you can offer services.',
            data: user
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error during provider registration:', error);
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleRegisterProvider = handleRegisterProvider;
const handleUpdateProviderProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        console.log('Update provider profile request received:', {
            userId,
            body: req.body,
            file: req.file
        });
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        // Handle file upload if present
        let profilePicture = req.body.profilePicture;
        if (req.file) {
            console.log('Profile picture file detected in request');
            profilePicture = (0, fileHandler_1.getFileUrl)(req, req.file);
            console.log('Generated profile picture URL:', profilePicture);
        }
        // Extract fields from request body
        const { firstName, lastName, phone, bio, headline } = req.body;
        const updateData = {
            firstName,
            lastName,
            phone,
            profilePicture,
            bio,
            headline,
        };
        console.log('Filtered update data:', updateData);
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        console.log('Final update data after filtering:', updateData);
        // At least one field should be updated
        if (Object.keys(updateData).length === 0) {
            console.error('No fields provided for update');
            res.status(400).json({
                success: false,
                message: 'At least one field is required for update'
            });
            return;
        }
        const updatedUser = yield (0, providerFunctionController_1.updateProviderProfile)(userId, updateData);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error updating provider profile:', error);
        res.status(400).json({
            success: false,
            message: errorMessage
        });
        return;
    }
});
exports.handleUpdateProviderProfile = handleUpdateProviderProfile;
const handleGetProviderProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const profile = yield (0, providerFunctionController_1.getProviderProfile)(userId);
        res.status(200).json({
            success: true,
            data: profile
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
exports.handleGetProviderProfile = handleGetProviderProfile;
const handleAddWorkExperience = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const { company, position, startDate, endDate, description, isCurrentPosition } = req.body;
        // Validate required fields
        if (!company || !position || !startDate) {
            res.status(400).json({
                success: false,
                message: 'Company, position, and start date are required'
            });
            return;
        }
        const newExperience = yield (0, providerFunctionController_1.addWorkExperience)(userId, {
            company,
            position,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            description,
            isCurrentPosition
        });
        res.status(201).json({
            success: true,
            message: 'Work experience added successfully',
            data: newExperience
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
exports.handleAddWorkExperience = handleAddWorkExperience;
const handleAddEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const { institution, degree, fieldOfStudy, startDate, endDate, isCurrentlyStudying } = req.body;
        // Validate required fields
        if (!institution || !degree || !startDate) {
            res.status(400).json({
                success: false,
                message: 'Institution, degree, and start date are required'
            });
            return;
        }
        const newEducation = yield (0, providerFunctionController_1.addEducation)(userId, {
            institution,
            degree,
            fieldOfStudy,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            isCurrentlyStudying
        });
        res.status(201).json({
            success: true,
            message: 'Education added successfully',
            data: newEducation
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
exports.handleAddEducation = handleAddEducation;
const handleAddSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const { skillName } = req.body;
        // Validate required fields
        if (!skillName) {
            res.status(400).json({
                success: false,
                message: 'Skill name is required'
            });
            return;
        }
        const skill = yield (0, providerFunctionController_1.addSkill)(userId, skillName);
        res.status(201).json({
            success: true,
            message: 'Skill added successfully',
            data: skill
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
exports.handleAddSkill = handleAddSkill;
const handleAddPortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const { title, description, imageUrls, projectUrl } = req.body;
        // Validate required fields
        if (!title) {
            res.status(400).json({
                success: false,
                message: 'Title is required'
            });
            return;
        }
        const newPortfolio = yield (0, providerFunctionController_1.addPortfolio)(userId, {
            title,
            description,
            imageUrls,
            projectUrl
        });
        res.status(201).json({
            success: true,
            message: 'Portfolio item added successfully',
            data: newPortfolio
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
exports.handleAddPortfolio = handleAddPortfolio;
const handleAddPortfolioWithFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const { title, description, projectUrl } = req.body;
        // Validate required fields
        if (!title) {
            res.status(400).json({
                success: false,
                message: 'Title is required'
            });
            return;
        }
        // Process uploaded files
        let fileUrls = [];
        if (req.files && Array.isArray(req.files)) {
            fileUrls = req.files.map(file => (0, fileHandler_1.getFileUrl)(req, file));
        }
        else if (req.file) {
            fileUrls = [(0, fileHandler_1.getFileUrl)(req, req.file)];
        }
        const newPortfolio = yield (0, providerFunctionController_1.addPortfolio)(userId, {
            title,
            description,
            imageUrls: fileUrls.length > 0 ? fileUrls : undefined,
            projectUrl
        });
        res.status(201).json({
            success: true,
            message: 'Portfolio item added successfully',
            data: newPortfolio
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
exports.handleAddPortfolioWithFiles = handleAddPortfolioWithFiles;
const handleAddDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const { title, type } = req.body;
        // Validate required fields
        if (!title || !type) {
            res.status(400).json({
                success: false,
                message: 'Title and document type are required'
            });
            return;
        }
        // Check if file was uploaded
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'File upload is required'
            });
            return;
        }
        const fileUrl = (0, fileHandler_1.getFileUrl)(req, req.file);
        // Add document function (create this in providerFunctionController)
        const newDocument = yield (0, providerFunctionController_1.addDocument)(userId, {
            title,
            type,
            fileUrl
        });
        res.status(201).json({
            success: true,
            message: 'Document added successfully',
            data: newDocument
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
exports.handleAddDocument = handleAddDocument;
const handleGetVerificationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const verificationStatus = yield (0, providerFunctionController_1.getProviderVerificationStatus)(userId);
        // Create/resend a notification if not verified
        if (!verificationStatus.isVerified) {
            try {
                yield (0, providerFunctionController_1.createProviderVerificationNotification)(userId);
            }
            catch (error) {
                console.error('Failed to create verification notification:', error);
            }
        }
        res.status(200).json({
            success: true,
            data: verificationStatus
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
exports.handleGetVerificationStatus = handleGetVerificationStatus;
const handleCreateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID from the JWT token
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        // Check if provider is verified
        const verificationStatus = yield (0, providerFunctionController_1.getProviderVerificationStatus)(userId);
        if (!verificationStatus.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Your provider account is pending verification by admin. You will be notified when your account is approved. Please complete your profile and upload all necessary identification documents to expedite the verification process.'
            });
            return;
        }
        const { title, description, categoryId, pricing, pricingType, imageUrls, skillIds } = req.body;
        // Validate required fields
        if (!title || !description || !categoryId || pricing === undefined || !pricingType) {
            res.status(400).json({
                success: false,
                message: 'Title, description, category ID, pricing, and pricing type are required'
            });
            return;
        }
        const newService = yield (0, providerFunctionController_1.createService)(userId, {
            title,
            description,
            categoryId,
            pricing: parseFloat(pricing),
            pricingType,
            imageUrls,
            skillIds
        });
        res.status(201).json({
            success: true,
            message: 'Service created successfully and submitted for admin approval. You will be notified once it\'s reviewed.',
            data: newService
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
exports.handleCreateService = handleCreateService;
const handleGetProviderServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const services = yield (0, providerFunctionController_1.getProviderServices)(userId);
        res.status(200).json({
            success: true,
            data: services
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
exports.handleGetProviderServices = handleGetProviderServices;
const handleUpdateProviderService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const serviceId = req.params.serviceId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!serviceId) {
            res.status(400).json({
                success: false,
                message: 'Service ID is required'
            });
            return;
        }
        const { title, description, categoryId, pricing, pricingType, imageUrls, isActive, skillIds } = req.body;
        // At least one field should be provided for update
        if (!title && !description && !categoryId && pricing === undefined &&
            !pricingType && imageUrls === undefined && isActive === undefined && !skillIds) {
            res.status(400).json({
                success: false,
                message: 'At least one field is required for update'
            });
            return;
        }
        const updatedService = yield (0, providerFunctionController_1.updateProviderService)(userId, serviceId, {
            title,
            description,
            categoryId,
            pricing: pricing !== undefined ? parseFloat(pricing) : undefined,
            pricingType,
            imageUrls,
            isActive,
            skillIds
        });
        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: updatedService
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
exports.handleUpdateProviderService = handleUpdateProviderService;
const handleGetCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, providerFunctionController_1.getCategories)();
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
exports.handleGetCategories = handleGetCategories;
const handleGetProviderBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        const status = req.query.status;
        const bookings = yield (0, providerFunctionController_1.getProviderBookings)(userId, status);
        res.status(200).json({
            success: true,
            data: bookings
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
exports.handleGetProviderBookings = handleGetProviderBookings;
const handleGetProviderBookingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookingId = req.params.bookingId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        const booking = yield (0, providerFunctionController_1.getProviderBookingDetails)(userId, bookingId);
        res.status(200).json({
            success: true,
            data: booking
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
exports.handleGetProviderBookingDetails = handleGetProviderBookingDetails;
const handleAcceptBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookingId = req.params.bookingId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        const booking = yield (0, providerFunctionController_1.acceptBooking)(userId, bookingId);
        res.status(200).json({
            success: true,
            message: 'Booking accepted successfully',
            data: booking
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
exports.handleAcceptBooking = handleAcceptBooking;
const handleDeclineBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookingId = req.params.bookingId;
        const { reason } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        const booking = yield (0, providerFunctionController_1.declineBooking)(userId, bookingId, reason);
        res.status(200).json({
            success: true,
            message: 'Booking declined successfully',
            data: booking
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
exports.handleDeclineBooking = handleDeclineBooking;
const handleStartService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookingId = req.params.bookingId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        const booking = yield (0, providerFunctionController_1.startService)(userId, bookingId);
        res.status(200).json({
            success: true,
            message: 'Service started successfully',
            data: booking
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
exports.handleStartService = handleStartService;
const handleCompleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookingId = req.params.bookingId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        const booking = yield (0, providerFunctionController_1.completeService)(userId, bookingId);
        res.status(200).json({
            success: true,
            message: 'Service completed successfully',
            data: booking
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
exports.handleCompleteService = handleCompleteService;
// Contract HTTP Controllers
const getContractController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { contractId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!contractId) {
            res.status(400).json({
                success: false,
                message: 'Contract ID is required'
            });
            return;
        }
        const contract = yield (0, providerFunctionController_1.getContractDetails)(userId, contractId);
        res.status(200).json({
            success: true,
            data: contract
        });
    }
    catch (error) {
        console.error('Error in getContractController:', error);
        if (error.message.includes('Not authorized') || error.message.includes('Contract not found')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get contract details',
            error: error
        });
    }
});
exports.getContractController = getContractController;
const createContractController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { bookingId } = req.params;
        const contractData = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        if (!contractData || !contractData.terms || !contractData.paymentAmount || !contractData.paymentType) {
            res.status(400).json({
                success: false,
                message: 'Contract terms, payment amount, and payment type are required'
            });
            return;
        }
        const contract = yield (0, providerFunctionController_1.createContract)(userId, bookingId, contractData);
        res.status(201).json({
            success: true,
            message: 'Contract created successfully',
            data: contract
        });
    }
    catch (error) {
        console.error('Error in createContractController:', error);
        if (error.message.includes('Not authorized') ||
            error.message.includes('Booking not found') ||
            error.message.includes('already exists')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create contract',
            error: error
        });
    }
});
exports.createContractController = createContractController;
const updateContractController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { contractId } = req.params;
        const contractData = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!contractId) {
            res.status(400).json({
                success: false,
                message: 'Contract ID is required'
            });
            return;
        }
        // At least one field should be provided for update
        if (!contractData || (!contractData.terms &&
            !contractData.paymentAmount &&
            !contractData.paymentType)) {
            res.status(400).json({
                success: false,
                message: 'At least one field (terms, paymentAmount, paymentType) must be provided for update'
            });
            return;
        }
        const updatedContract = yield (0, providerFunctionController_1.updateContract)(userId, contractId, contractData);
        res.status(200).json({
            success: true,
            message: 'Contract updated successfully',
            data: updatedContract
        });
    }
    catch (error) {
        console.error('Error in updateContractController:', error);
        if (error.message.includes('Not authorized') ||
            error.message.includes('Contract not found') ||
            error.message.includes('Cannot update')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update contract',
            error: error
        });
    }
});
exports.updateContractController = updateContractController;
const signContractController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { contractId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!contractId) {
            res.status(400).json({
                success: false,
                message: 'Contract ID is required'
            });
            return;
        }
        const signedContract = yield (0, providerFunctionController_1.signContract)(userId, contractId);
        res.status(200).json({
            success: true,
            message: 'Contract signed successfully',
            data: signedContract
        });
    }
    catch (error) {
        console.error('Error in signContractController:', error);
        if (error.message.includes('Not authorized') ||
            error.message.includes('Contract not found') ||
            error.message.includes('already signed')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to sign contract',
            error: error
        });
    }
});
exports.signContractController = signContractController;
// Review HTTP Controllers
const createReviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { bookingId } = req.params;
        const { rating, comment } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({
                success: false,
                message: 'Rating is required and must be between 1 and 5'
            });
            return;
        }
        const review = yield (0, providerFunctionController_1.createClientReview)(userId, bookingId, { rating, comment });
        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });
    }
    catch (error) {
        console.error('Error in createReviewController:', error);
        if (error.message.includes('already reviewed') ||
            error.message.includes('not completed') ||
            error.message.includes('not authorized') ||
            error.message.includes('not found')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create review',
            error: error
        });
    }
});
exports.createReviewController = createReviewController;
const getReviewsReceivedController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        const reviews = yield (0, providerFunctionController_1.getReviewsReceived)(userId);
        res.status(200).json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        console.error('Error in getReviewsReceivedController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reviews',
            error: error
        });
    }
});
exports.getReviewsReceivedController = getReviewsReceivedController;
const getReviewsGivenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        const reviews = yield (0, providerFunctionController_1.getReviewsGiven)(userId);
        res.status(200).json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        console.error('Error in getReviewsGivenController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reviews',
            error: error
        });
    }
});
exports.getReviewsGivenController = getReviewsGivenController;
const getProviderReviewsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId } = req.params;
        if (!providerId) {
            res.status(400).json({
                success: false,
                message: 'Provider ID is required'
            });
            return;
        }
        const providerReviews = yield (0, providerFunctionController_1.getServiceProviderReviews)(providerId);
        res.status(200).json({
            success: true,
            data: providerReviews
        });
    }
    catch (error) {
        console.error('Error in getProviderReviewsController:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get provider reviews',
            error: error
        });
    }
});
exports.getProviderReviewsController = getProviderReviewsController;
// Availability HTTP Controllers
const addAvailabilitySlotController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { date, startTime, endTime, isAvailable } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        // Validate required fields
        if (!date || !startTime || !endTime) {
            res.status(400).json({
                success: false,
                message: 'Date, start time, and end time are required'
            });
            return;
        }
        const availabilitySlot = yield (0, providerFunctionController_1.addAvailabilitySlot)(userId, {
            date,
            startTime,
            endTime,
            isAvailable
        });
        res.status(201).json({
            success: true,
            message: 'Availability slot added successfully',
            data: availabilitySlot
        });
    }
    catch (error) {
        console.error('Error in addAvailabilitySlotController:', error);
        if (error.message.includes('Date') ||
            error.message.includes('format') ||
            error.message.includes('after start time') ||
            error.message.includes('overlaps') ||
            error.message.includes('past dates')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add availability slot',
            error: error
        });
    }
});
exports.addAvailabilitySlotController = addAvailabilitySlotController;
const getAvailabilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        const availability = yield (0, providerFunctionController_1.getAvailability)(userId);
        res.status(200).json({
            success: true,
            data: availability
        });
    }
    catch (error) {
        console.error('Error in getAvailabilityController:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get availability',
            error: error
        });
    }
});
exports.getAvailabilityController = getAvailabilityController;
const updateAvailabilitySlotController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { slotId } = req.params;
        const { date, startTime, endTime, isAvailable } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!slotId) {
            res.status(400).json({
                success: false,
                message: 'Availability slot ID is required'
            });
            return;
        }
        // At least one field should be provided for update
        if (date === undefined && startTime === undefined && endTime === undefined && isAvailable === undefined) {
            res.status(400).json({
                success: false,
                message: 'At least one field (date, startTime, endTime, isAvailable) must be provided for update'
            });
            return;
        }
        const updatedSlot = yield (0, providerFunctionController_1.updateAvailabilitySlot)(userId, slotId, {
            date,
            startTime,
            endTime,
            isAvailable
        });
        res.status(200).json({
            success: true,
            message: 'Availability slot updated successfully',
            data: updatedSlot
        });
    }
    catch (error) {
        console.error('Error in updateAvailabilitySlotController:', error);
        if (error.message.includes('permission') ||
            error.message.includes('not found') ||
            error.message.includes('format') ||
            error.message.includes('after start time') ||
            error.message.includes('overlap') ||
            error.message.includes('Date') ||
            error.message.includes('Invalid date')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update availability slot',
            error: error
        });
    }
});
exports.updateAvailabilitySlotController = updateAvailabilitySlotController;
const deleteAvailabilitySlotController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { slotId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
            return;
        }
        if (!slotId) {
            res.status(400).json({
                success: false,
                message: 'Availability slot ID is required'
            });
            return;
        }
        const result = yield (0, providerFunctionController_1.deleteAvailabilitySlot)(userId, slotId);
        res.status(200).json({
            success: true,
            message: 'Availability slot deleted successfully'
        });
    }
    catch (error) {
        console.error('Error in deleteAvailabilitySlotController:', error);
        if (error.message.includes('permission') || error.message.includes('not found')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete availability slot',
            error: error
        });
    }
});
exports.deleteAvailabilitySlotController = deleteAvailabilitySlotController;
