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
exports.addDocument = exports.configureStaticFileServing = exports.getFileUrl = exports.uploadFile = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const index_1 = require("../index");
const express_1 = __importDefault(require("express"));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Storage configuration for multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        var _a, _b;
        // Check if this is a registration request
        if (req.originalUrl.includes('/register')) {
            // For registration, use a temporary folder
            const tempDir = path_1.default.join(uploadsDir, 'temp');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            return cb(null, tempDir);
        }
        // Check if this is an upload-image request for chat
        if (req.originalUrl.includes('/upload-image')) {
            // For chat images, use a chat folder
            const chatDir = path_1.default.join(uploadsDir, 'chat');
            if (!fs_1.default.existsSync(chatDir)) {
                fs_1.default.mkdirSync(chatDir, { recursive: true });
            }
            // If user is authenticated, add user subfolder
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (userId) {
                const userChatDir = path_1.default.join(chatDir, userId);
                if (!fs_1.default.existsSync(userChatDir)) {
                    fs_1.default.mkdirSync(userChatDir, { recursive: true });
                }
                return cb(null, userChatDir);
            }
            return cb(null, chatDir);
        }
        // Check if this is a category image upload
        if (req.originalUrl.includes('/category/image') || req.originalUrl.includes('/admin/category')) {
            // For category images, use a category folder
            const categoryDir = path_1.default.join(uploadsDir, 'category');
            if (!fs_1.default.existsSync(categoryDir)) {
                fs_1.default.mkdirSync(categoryDir, { recursive: true });
            }
            return cb(null, categoryDir);
        }
        // For authenticated requests, use user-specific folders
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            return cb(new Error('User ID not found'), '');
        }
        // Create user directory if it doesn't exist
        const userDir = path_1.default.join(uploadsDir, userId);
        if (!fs_1.default.existsSync(userDir)) {
            fs_1.default.mkdirSync(userDir, { recursive: true });
        }
        // Create subdirectory based on file type
        let subDir = 'other';
        if (req.originalUrl.includes('/portfolio')) {
            subDir = 'portfolio';
        }
        else if (req.originalUrl.includes('/document')) {
            subDir = 'documents';
        }
        else if (req.originalUrl.includes('/profile') || req.originalUrl.includes('/upload-profile-picture')) {
            subDir = 'profile';
        }
        const finalDir = path_1.default.join(userDir, subDir);
        if (!fs_1.default.existsSync(finalDir)) {
            fs_1.default.mkdirSync(finalDir, { recursive: true });
        }
        cb(null, finalDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueId = (0, uuid_1.v4)();
        const fileExtension = path_1.default.extname(file.originalname);
        const safeFilename = `${uniqueId}${fileExtension}`;
        cb(null, safeFilename);
    }
});
// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
    // Define allowed file types
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const allowedDocumentTypes = ['.pdf', '.doc', '.docx', '.txt'];
    // Extract file extension
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    // Check if it's a registration upload (ID document)
    if (req.originalUrl.includes('/register')) {
        // Allow both images and documents for registration
        if ([...allowedImageTypes, ...allowedDocumentTypes].includes(ext)) {
            return cb(null, true);
        }
    }
    // Check if it's a chat image upload
    else if (req.originalUrl.includes('/upload-image')) {
        // Allow only images for chat
        if (allowedImageTypes.includes(ext)) {
            return cb(null, true);
        }
    }
    // Check if it's a category image upload
    else if (req.originalUrl.includes('/category/image') || req.originalUrl.includes('/admin/category')) {
        // Allow only images for categories
        if (allowedImageTypes.includes(ext)) {
            return cb(null, true);
        }
    }
    // Check if it's a portfolio upload
    else if (req.originalUrl.includes('/portfolio')) {
        // Allow images, PDFs, and DOC files for portfolio
        if ([...allowedImageTypes, ...allowedDocumentTypes].includes(ext)) {
            return cb(null, true);
        }
    }
    // Document uploads (certifications, licenses, etc.)
    else if (req.originalUrl.includes('/document')) {
        // Allow PDFs and DOC files
        if (allowedDocumentTypes.includes(ext)) {
            return cb(null, true);
        }
    }
    // Profile picture uploads
    else if (req.originalUrl.includes('/profile') || req.originalUrl.includes('/upload-profile-picture')) {
        // Allow only images
        if (allowedImageTypes.includes(ext)) {
            return cb(null, true);
        }
    }
    // Reject file if it doesn't match any allowed types
    cb(null, false);
};
// Configure limits
const limits = {
    fileSize: 300 * 1024 * 1024, // 300MB max file size
};
// Create multer upload middleware
exports.uploadFile = (0, multer_1.default)({
    storage,
    fileFilter,
    limits
});
// Helper to get file URL
const getFileUrl = (req, file) => {
    var _a, _b;
    // Check if this is a registration request
    if (req.originalUrl.includes('/register')) {
        // For registration files, use a temp path
        return `/uploads/temp/${file.filename}`;
    }
    // Check if this is a chat image upload
    if (req.originalUrl.includes('/upload-image')) {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            return `/uploads/chat/${userId}/${file.filename}`;
        }
        return `/uploads/chat/${file.filename}`;
    }
    // Check if this is a category image upload
    if (req.originalUrl.includes('/category/image') || req.originalUrl.includes('/admin/category')) {
        return `/uploads/category/${file.filename}`;
    }
    // For authenticated requests, use user-specific paths
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!file || !userId) {
        throw new Error('File or user ID not available');
    }
    // Determine subdirectory
    let subDir = 'other';
    if (req.originalUrl.includes('/portfolio')) {
        subDir = 'portfolio';
    }
    else if (req.originalUrl.includes('/document')) {
        subDir = 'documents';
    }
    else if (req.originalUrl.includes('/profile') || req.originalUrl.includes('/upload-profile-picture')) {
        subDir = 'profile';
    }
    // Create relative path (without the base URL)
    return `/uploads/${userId}/${subDir}/${file.filename}`;
};
exports.getFileUrl = getFileUrl;
// Middleware to serve static files
const configureStaticFileServing = (app) => {
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
};
exports.configureStaticFileServing = configureStaticFileServing;
const addDocument = (userId, document) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by id
        const user = yield index_1.prisma.user.findUnique({
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
        const newDocument = yield index_1.prisma.document.create({
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
