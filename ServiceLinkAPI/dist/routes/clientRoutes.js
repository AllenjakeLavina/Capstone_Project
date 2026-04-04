"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRoutes = void 0;
const express_1 = __importDefault(require("express"));
const clientHttpController_1 = require("../httpControllers/clientHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const router = express_1.default.Router();
exports.clientRoutes = router;
router.post('/register', fileHandler_1.uploadFile.single('idDocument'), clientHttpController_1.handleRegisterClient);
// Profile management
router.get('/profile', authMiddleware_1.authenticateToken, clientHttpController_1.handleGetClientProfile);
//PROFILE UPDATE
router.put('/profile', authMiddleware_1.authenticateToken, clientHttpController_1.handleUpdateClientProfile);
// Address management
router.post('/address', authMiddleware_1.authenticateToken, clientHttpController_1.handleAddClientAddress);
router.get('/address', authMiddleware_1.authenticateToken, clientHttpController_1.handleGetClientAddresses);
router.put('/address/:addressId', authMiddleware_1.authenticateToken, clientHttpController_1.handleUpdateClientAddress);
router.delete('/address/:addressId', authMiddleware_1.authenticateToken, clientHttpController_1.handleDeleteClientAddress);
router.patch('/address/:addressId/default', authMiddleware_1.authenticateToken, clientHttpController_1.handleSetDefaultAddress);
// Service booking management
router.post('/booking', authMiddleware_1.authenticateToken, clientHttpController_1.handleBookService);
router.get('/booking', authMiddleware_1.authenticateToken, clientHttpController_1.handleGetClientBookings);
router.get('/booking/:bookingId', authMiddleware_1.authenticateToken, clientHttpController_1.handleGetBookingDetails);
router.put('/booking/:bookingId', authMiddleware_1.authenticateToken, clientHttpController_1.handleUpdateBooking);
router.post('/booking/:bookingId/cancel', authMiddleware_1.authenticateToken, clientHttpController_1.handleCancelBooking);
// Payment management
router.post('/booking/:bookingId/payment', authMiddleware_1.authenticateToken, clientHttpController_1.handleProcessPayment);
router.post('/booking/:bookingId/payment/complete', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRoles)('PROVIDER'), clientHttpController_1.handleMarkPaymentCompleted);
// Contract Routes
router.get('/contracts', authMiddleware_1.authenticateToken, clientHttpController_1.getContractsController);
router.get('/contracts/:contractId', authMiddleware_1.authenticateToken, clientHttpController_1.getContractDetailsController);
router.post('/contracts/:contractId/sign', authMiddleware_1.authenticateToken, clientHttpController_1.signContractController);
// Review Routes
router.post('/bookings/:bookingId/reviews', authMiddleware_1.authenticateToken, fileHandler_1.uploadFile.array('images', 5), clientHttpController_1.createReviewController);
router.get('/reviews/received', authMiddleware_1.authenticateToken, clientHttpController_1.getReviewsReceivedController);
router.get('/reviews/given', authMiddleware_1.authenticateToken, clientHttpController_1.getReviewsGivenController);
