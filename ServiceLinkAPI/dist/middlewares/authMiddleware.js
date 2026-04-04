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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.checkProviderVerification = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const checkProviderVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is a provider
        if (req.user.role !== 'PROVIDER') {
            res.status(403).json({
                success: false,
                message: 'Access denied. This endpoint is for service providers only.'
            });
            return;
        }
        // Check provider verification status
        if (req.user.providerVerificationStatus !== 'verified') {
            // Get more detailed status to give better feedback
            const provider = yield prisma.serviceProvider.findUnique({
                where: { userId: req.user.id },
                include: {
                    documents: {
                        where: { type: 'ID' }
                    }
                }
            });
            if (!provider) {
                res.status(403).json({
                    success: false,
                    message: 'Provider profile not found'
                });
                return;
            }
            if (!provider.isProviderVerified) {
                res.status(403).json({
                    success: false,
                    message: 'Your provider account is pending verification by admin. You will be notified when your account is approved. Please complete your profile and upload all necessary identification documents to expedite the verification process.'
                });
                return;
            }
        }
        next();
    }
    catch (error) {
        console.error('Verification check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification check'
        });
        return;
    }
});
exports.checkProviderVerification = checkProviderVerification;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return; // Return without value
        }
        const hasRole = roles.includes(req.user.role);
        if (!hasRole) {
            res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to access this resource.'
            });
            return; // Return without value
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
