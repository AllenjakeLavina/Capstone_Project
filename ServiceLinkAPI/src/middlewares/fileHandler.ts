import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import { prisma } from '../index';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to determine folder based on route
const getFolder = (req: Request): string => {
  const url = req.originalUrl;

  if (url.includes('/register')) {
    return 'servicelink/temp';
  }
  if (url.includes('/upload-image')) {
    return `servicelink/chat/${req.user?.id || 'unknown'}`;
  }
  if (url.includes('/category/image') || url.includes('/admin/category')) {
    return 'servicelink/category';
  }
  if (url.includes('/portfolio')) {
    return `servicelink/${req.user?.id || 'unknown'}/portfolio`;
  }
  if (url.includes('/document')) {
    return `servicelink/${req.user?.id || 'unknown'}/documents`;
  }
  if (url.includes('/profile') || url.includes('/upload-profile-picture')) {
    return `servicelink/${req.user?.id || 'unknown'}/profile`;
  }

  return `servicelink/${req.user?.id || 'unknown'}/other`;
};

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req: Request, file: Express.Multer.File) => ({
    folder: getFolder(req),
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  }),
});

// File filter — same logic as before
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const url = req.originalUrl;
  const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedDocs = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = ('.' + file.mimetype.split('/')[1]).toLowerCase();

  if (url.includes('/register') || url.includes('/portfolio')) {
    if ([...allowedImages, ...allowedDocs].includes(ext)) return cb(null, true);
  } else if (url.includes('/document')) {
    if (allowedDocs.includes(ext)) return cb(null, true);
  } else {
    if (allowedImages.includes(ext)) return cb(null, true);
  }

  cb(null, false);
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 },
});

export const getFileUrl = (req: Request, file: Express.Multer.File): string => {
  return (file as any).path; // Cloudinary full URL
};

// configureStaticFileServing — no longer needed but keeping to avoid breaking imports
export const configureStaticFileServing = (app: any) => {
  console.log('Static file serving is now handled by Cloudinary');
};

// addDocument — unchanged
export const addDocument = async (
  userId: string,
  document: {
    title: string;
    type: 'ID' | 'CERTIFICATE' | 'LICENSE' | 'RESUME' | 'OTHER';
    fileUrl: string;
  }
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { serviceProvider: true },
    });

    if (!user) throw new Error('User not found');
    if (!user.serviceProvider) throw new Error('Provider profile not found');

    const newDocument = await prisma.document.create({
      data: {
        serviceProviderId: user.serviceProvider.id,
        title: document.title,
        type: document.type,
        fileUrl: document.fileUrl,
        isVerified: false,
      },
    });

    return newDocument;
  } catch (error) {
    throw error;
  }
};