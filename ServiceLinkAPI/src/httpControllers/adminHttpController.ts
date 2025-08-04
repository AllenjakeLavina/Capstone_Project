import { Request, Response } from 'express';
import { 
  setPassword, 
  createAdminUser, 
  getAllClients,
  getAllProvidersWithStatus,
  changeUserPassword,
  getUnverifiedProviders,
  verifyProviderAccount,
  rejectProviderVerification,
  createCategory,
  getAllCategories,
  editCategory,
  toggleClientStatus,
  toggleProviderStatus,
  getDashboardStats,
  getRecentBookings,
  getUnverifiedProviderDetails,
  getProviderDetailsForAdmin
} from '../functionControllers/adminFunctionController';

export const handleSetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
      return;
    }

    await setPassword(email, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleCreateAdmin = async (req: Request, res: Response) => {
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

    const admin = await createAdminUser(email, password, firstName, lastName, phone);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin
    }); 
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ 
      success: false, 
      message: errorMessage 
    }); 
    return;
  }
};

export const handleChangeUserPassword = async (req: Request, res: Response) => {
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

    const result = await changeUserPassword(userId, newPassword, adminId);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: result
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleGetAllClients = async (req: Request, res: Response) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can perform this action'
      });
      return;
    }

    const clients = await getAllClients();

    res.status(200).json({
      success: true,
      data: clients
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleGetAllProviders = async (req: Request, res: Response) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can perform this action'
      });
      return;
    }

    const providers = await getAllProvidersWithStatus();

    res.status(200).json({
      success: true,
      data: providers
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleGetUnverifiedProviders = async (req: Request, res: Response) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can perform this action'
      });
      return;
    }

    const providers = await getUnverifiedProviders();

    res.status(200).json({
      success: true,
      data: providers
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleVerifyProvider = async (req: Request, res: Response) => {
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

    const result = await verifyProviderAccount(providerId, adminId, documentId);

    res.status(200).json({
      success: true,
      message: 'Provider account verified successfully',
      data: result
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleRejectProviderVerification = async (req: Request, res: Response) => {
  try {
    const { providerId, reason } = req.body;
    const adminId = (req as any).user.id;

    if (!providerId || !reason) {
      res.status(400).json({
        success: false,
        message: 'Provider ID and rejection reason are required'
      });
      return;
    }

    const result = await rejectProviderVerification(providerId, adminId, reason);

    res.status(200).json({
      success: true,
      message: 'Provider verification rejected successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error rejecting provider verification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject provider verification'
    });
  }
};

export const handleGetUnverifiedProviderDetails = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      res.status(400).json({
        success: false,
        message: 'Provider ID is required'
      });
      return;
    }

    const providerDetails = await getUnverifiedProviderDetails(providerId);

    res.status(200).json({
      success: true,
      message: 'Provider details retrieved successfully',
      data: providerDetails
    });
  } catch (error: any) {
    console.error('Error getting unverified provider details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get provider details'
    });
  }
};

export const handleGetProviderDetailsForAdmin = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    if (!providerId) {
      res.status(400).json({ success: false, message: 'Provider ID is required' });
      return;
    }
    const providerDetails = await getProviderDetailsForAdmin(providerId);
    res.status(200).json({ success: true, message: 'Provider details retrieved successfully', data: providerDetails });
  } catch (error: any) {
    console.error('Error getting provider details for admin:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get provider details' });
  }
};

export const handleCreateCategory = async (req: Request, res: Response) => {
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
    const category = await createCategory(name, description, imageUrl);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
    return;
  } catch (error) {
    console.error('Error in handleCreateCategory:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleGetAllCategories = async (req: Request, res: Response) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can perform this action'
      });
      return;
    }

    const categories = await getAllCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
    return;
  }
};

export const handleEditCategory = async (req: Request, res: Response) => {
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

    const updatedCategory = await editCategory(categoryId, {
      name,
      description,
      imageUrl
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

export const handleToggleClientStatus = async (req: Request, res: Response) => {
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

    const updatedClient = await toggleClientStatus(clientId, isActive);

    res.status(200).json({
      success: true,
      message: `Client ${isActive ? 'enabled' : 'disabled'} successfully`,
      data: updatedClient
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

export const handleToggleProviderStatus = async (req: Request, res: Response) => {
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

    const updatedProvider = await toggleProviderStatus(providerId, isActive);

    res.status(200).json({
      success: true,
      message: `Provider ${isActive ? 'enabled' : 'disabled'} successfully`,
      data: updatedProvider
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

export const handleGetDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in handleGetDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

export const handleGetRecentBookings = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const bookings = await getRecentBookings(limit);

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in handleGetRecentBookings:', error);
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};
