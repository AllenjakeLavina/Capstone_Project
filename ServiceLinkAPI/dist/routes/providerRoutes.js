"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const providerHttpController_1 = require("../httpControllers/providerHttpController");
const clientHttpController_1 = require("../httpControllers/clientHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const providerHttpController_2 = require("../httpControllers/providerHttpController");
const router = express_1.default.Router();
// Public routes
router.post('/register', fileHandler_1.uploadFile.single('idDocument'), providerHttpController_1.handleRegisterProvider);
router.get('/categories', providerHttpController_1.handleGetCategories);
// Protected routes - require authentication
router.get('/profile', authMiddleware_1.authenticateToken, providerHttpController_1.handleGetProviderProfile);
router.get('/verification-status', authMiddleware_1.authenticateToken, providerHttpController_1.handleGetVerificationStatus);
router.patch('/profile', authMiddleware_1.authenticateToken, fileHandler_1.uploadFile.single('profilePicture'), providerHttpController_1.handleUpdateProviderProfile);
router.post('/experience', authMiddleware_1.authenticateToken, providerHttpController_1.handleAddWorkExperience);
router.post('/education', authMiddleware_1.authenticateToken, providerHttpController_1.handleAddEducation);
router.post('/skill', authMiddleware_1.authenticateToken, providerHttpController_1.handleAddSkill);
// Original portfolio endpoint (without file uploads)
router.post('/portfolio', authMiddleware_1.authenticateToken, providerHttpController_1.handleAddPortfolio);
// New portfolio endpoint with file uploads (supports multiple files)
router.post('/portfolio/upload', authMiddleware_1.authenticateToken, fileHandler_1.uploadFile.array('files', 5), // Allow up to 5 files
providerHttpController_1.handleAddPortfolioWithFiles);
// Document upload endpoint (single file)
router.post('/document', authMiddleware_1.authenticateToken, fileHandler_1.uploadFile.single('file'), providerHttpController_1.handleAddDocument);
// Routes requiring verification - provider must be verified by admin
router.post('/service', authMiddleware_1.authenticateToken, authMiddleware_1.checkProviderVerification, providerHttpController_1.handleCreateService);
router.get('/services', authMiddleware_1.authenticateToken, providerHttpController_1.handleGetProviderServices);
router.put('/services/:serviceId', authMiddleware_1.authenticateToken, providerHttpController_1.handleUpdateProviderService);
// Booking management routes
router.get('/bookings', authMiddleware_1.authenticateToken, providerHttpController_1.handleGetProviderBookings);
router.get('/bookings/:bookingId', authMiddleware_1.authenticateToken, providerHttpController_1.handleGetProviderBookingDetails);
router.post('/bookings/:bookingId/accept', authMiddleware_1.authenticateToken, providerHttpController_1.handleAcceptBooking);
router.post('/bookings/:bookingId/decline', authMiddleware_1.authenticateToken, providerHttpController_1.handleDeclineBooking);
router.post('/bookings/:bookingId/start', authMiddleware_1.authenticateToken, providerHttpController_1.handleStartService);
router.post('/bookings/:bookingId/complete', authMiddleware_1.authenticateToken, providerHttpController_1.handleCompleteService);
// Payment management routes
router.post('/bookings/:bookingId/payment/complete', authMiddleware_1.authenticateToken, clientHttpController_1.handleMarkPaymentCompleted);
// Contract Routes
router.get('/contracts/:contractId', authMiddleware_1.authenticateToken, providerHttpController_2.getContractController);
router.post('/bookings/:bookingId/contracts', authMiddleware_1.authenticateToken, providerHttpController_2.createContractController);
router.put('/contracts/:contractId', authMiddleware_1.authenticateToken, providerHttpController_2.updateContractController);
router.post('/contracts/:contractId/sign', authMiddleware_1.authenticateToken, providerHttpController_2.signContractController);
// Review Routes
router.post('/bookings/:bookingId/reviews', authMiddleware_1.authenticateToken, providerHttpController_1.createReviewController);
router.get('/reviews/received', authMiddleware_1.authenticateToken, providerHttpController_1.getReviewsReceivedController);
router.get('/reviews/given', authMiddleware_1.authenticateToken, providerHttpController_1.getReviewsGivenController);
router.get('/providers/:providerId/reviews', providerHttpController_1.getProviderReviewsController);
// Availability Routes
router.post('/availability', authMiddleware_1.authenticateToken, providerHttpController_1.addAvailabilitySlotController);
router.get('/availability', authMiddleware_1.authenticateToken, providerHttpController_1.getAvailabilityController);
router.put('/availability/:slotId', authMiddleware_1.authenticateToken, providerHttpController_1.updateAvailabilitySlotController);
router.delete('/availability/:slotId', authMiddleware_1.authenticateToken, providerHttpController_1.deleteAvailabilitySlotController);
exports.providerRoutes = router;
