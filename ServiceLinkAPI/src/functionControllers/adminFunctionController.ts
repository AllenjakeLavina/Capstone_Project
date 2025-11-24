import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendProviderVerificationEmail } from '../services/emailService';

const prisma = new PrismaClient();

export const setPassword = async (email: string, newPassword: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error setting password:', error);
    throw error;
  }
};

export const createAdminUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string
) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const newAdmin = await prisma.user.create({
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
    const { password: _, ...adminWithoutPassword } = newAdmin;
    return adminWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Change a user's password (by admin)
export const changeUserPassword = async (
  userId: string,
  newPassword: string,
  adminId: string
) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { 
        id: adminId,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      throw new Error('Admin not found or unauthorized');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        receiverId: userId,
        type: 'GENERAL',
        title: 'Password Changed',
        message: 'Your password has been changed by an administrator. If you did not request this change, please contact support immediately.',
        isRead: false
      }
    });

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    throw error;
  }
};

// Get all clients
export const getAllClients = async () => {
  try {
    const clients = await prisma.client.findMany({
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
  } catch (error) {
    throw error;
  }
};

// Get all active providers with their services, skills, etc.
export const getAllProviders = async () => {
  try {
    const providers = await prisma.serviceProvider.findMany({
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
  } catch (error) {
    throw error;
  }
};

// Get all providers including rejected ones (for admin management)
export const getAllProvidersWithStatus = async () => {
  try {
    const providers = await prisma.serviceProvider.findMany({
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
    const providersWithStatus = providers.map(provider => ({
      ...provider,
      status: provider.isProviderVerified 
        ? 'Verified' 
        : provider.user.isActive 
          ? 'Pending Verification' 
          : 'Rejected'
    }));

    return providersWithStatus;
  } catch (error) {
    throw error;
  }
};

// Verify a provider's account and ID documents
export const verifyProviderAccount = async (
  providerId: string,
  adminId: string,
  documentId?: string // If verifying a specific document
) => {
  try {
    // Find the provider by ID
    const provider = await prisma.serviceProvider.findUnique({
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
    const updatedProvider = await prisma.serviceProvider.update({
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
      await prisma.document.update({
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
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              isVerified: true
            }
          });
        }
      }
    }

    // Create a notification for the provider
    await prisma.notification.create({
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
      await sendProviderVerificationEmail(
        provider.user.email,
        provider.user.firstName
      );
    }

    // Excluding sensitive information
    const { user, ...providerData } = updatedProvider;
    const { password, ...userData } = user;

    return {
      ...providerData,
      user: userData
    };
  } catch (error) {
    throw error;
  }
};

// Reject a provider's account verification
export const rejectProviderVerification = async (
  providerId: string,
  adminId: string,
  reason: string
) => {
  try {
    // Find the provider by ID
    const provider = await prisma.serviceProvider.findUnique({
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
    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        isProviderVerified: false,
        // We'll use a custom field to track rejection status
        // For now, we'll store rejection info in a comment field or use a different approach
      }
    });

    // Temporarily deactivate the user account to prevent them from appearing in unverified list
    // This gives them time to fix their information before reapplying
    await prisma.user.update({
      where: { id: provider.userId },
      data: { isActive: false }
    });

    // Create a notification for the provider
    await prisma.notification.create({
      data: {
        receiverId: provider.userId,
        type: 'GENERAL',
        title: 'Verification Rejected',
        message: `Your service provider verification was rejected. Reason: ${reason}. Your account has been temporarily deactivated. Please update your information and contact support to reactivate your account.`,
        isRead: false
      }
    });

    // Return the provider (excluding sensitive information)
    const { user, ...providerData } = provider;
    const { password, ...userData } = user;

    return {
      ...providerData,
      user: userData
    };
  } catch (error) {
    throw error;
  }
};

// Get all unverified providers
export const getUnverifiedProviders = async () => {
  try {
    const providers = await prisma.serviceProvider.findMany({
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
  } catch (error) {
    throw error;
  }
};

// Get all unverified clients
// Note: This includes clients who have verified their email but haven't been admin-approved yet
// We check for clients where isVerified is false OR where they haven't been explicitly admin-approved
// Since we don't have a separate isClientVerified field, we'll use a different approach:
// Clients with isVerified: false are considered unverified (includes both email-unverified and admin-unverified)
export const getUnverifiedClients = async () => {
  try {
    // For now, we'll show clients where isVerified is false
    // After admin approval, isVerified will be set to true
    // This means clients need to verify email first, then admin approves
    // But if we want clients to appear even after email verification, we need a different approach
    // For simplicity, we'll show clients where isVerified is false
    // The admin will approve them, which sets isVerified to true
    const clients = await prisma.client.findMany({
      where: {
        user: {
          isVerified: false,
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
  } catch (error) {
    throw error;
  }
};

// Get all unverified users (both clients and providers)
export const getUnverifiedUsers = async () => {
  try {
    const [providers, clients] = await Promise.all([
      getUnverifiedProviders(),
      getUnverifiedClients()
    ]);

    // Format providers with type indicator
    const formattedProviders = providers.map(provider => ({
      ...provider,
      userType: 'PROVIDER',
      id: provider.id,
      userId: provider.userId
    }));

    // Format clients with type indicator
    const formattedClients = clients.map(client => ({
      ...client,
      userType: 'CLIENT',
      id: client.id,
      userId: client.userId
    }));

    // Combine and return
    return [...formattedProviders, ...formattedClients];
  } catch (error) {
    throw error;
  }
};

// Verify a client's account
export const verifyClientAccount = async (
  clientId: string,
  adminId: string
) => {
  try {
    // Find the client by ID
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true
      }
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Verify the client by updating user's isVerified status
    await prisma.user.update({
      where: { id: client.userId },
      data: {
        isVerified: true
      }
    });

    // Create a notification for the client
    await prisma.notification.create({
      data: {
        receiverId: client.userId,
        type: 'GENERAL',
        title: 'Account Verified',
        message: 'Your client account has been verified by an admin. You can now use all features of the platform.',
        isRead: false
      }
    });

    // Get updated client data
    const updatedClient = await prisma.client.findUnique({
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
  } catch (error) {
    throw error;
  }
};

// Reject a client's account verification
export const rejectClientVerification = async (
  clientId: string,
  adminId: string,
  reason: string
) => {
  try {
    // Find the client by ID
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true
      }
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Temporarily deactivate the user account to prevent them from appearing in unverified list
    await prisma.user.update({
      where: { id: client.userId },
      data: { isActive: false }
    });

    // Create a notification for the client
    await prisma.notification.create({
      data: {
        receiverId: client.userId,
        type: 'GENERAL',
        title: 'Verification Rejected',
        message: `Your client verification was rejected. Reason: ${reason}. Your account has been temporarily deactivated. Please update your information and contact support to reactivate your account.`,
        isRead: false
      }
    });

    // Return the client (excluding sensitive information)
    const { user, ...clientData } = client;
    const { password, ...userData } = user;

    return {
      ...clientData,
      user: userData
    };
  } catch (error) {
    throw error;
  }
};

// Get detailed profile of unverified client for admin review
export const getUnverifiedClientDetails = async (clientId: string) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        user: {
          isVerified: false,
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
        addresses: true
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
      createdAt: client.user.createdAt
    };

    return transformedClient;
  } catch (error) {
    throw error;
  }
};

// Get detailed profile of unverified provider for admin review
export const getUnverifiedProviderDetails = async (providerId: string) => {
  try {
    const provider = await prisma.serviceProvider.findFirst({
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
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (
  name: string,
  description?: string,
  imageUrl?: string
) => {
  try {
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    // Create category
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        imageUrl
      }
    });

    return newCategory;
  } catch (error) {
    throw error;
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return categories;
  } catch (error) {
    throw error;
  }
};

// Edit an existing category
export const editCategory = async (
  categoryId: string,
  updateData: {
    name?: string;
    description?: string;
    imageUrl?: string;
  }
) => {
  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if name is being updated and if it's already in use
    if (updateData.name && updateData.name !== existingCategory.name) {
      const categoryWithSameName = await prisma.category.findFirst({
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
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    return updatedCategory;
  } catch (error) {
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string) => {
  try {
    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Optional safeguard: prevent delete if referenced by services
    // If you want stricter enforcement, uncomment below and adjust relation as needed
    // const relatedServiceCount = await prisma.service.count({ where: { categoryId } });
    // if (relatedServiceCount > 0) {
    //   throw new Error('Cannot delete category with existing services');
    // }

    await prisma.category.delete({ where: { id: categoryId } });
    return { id: categoryId };
  } catch (error) {
    throw error;
  }
};

// Toggle client account status (Active/Inactive)
export const toggleClientStatus = async (clientId: string, isActive: boolean) => {
  try {
    // Find the client by ID
    const client = await prisma.client.findUnique({
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
    const updatedUser = await prisma.user.update({
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

    await prisma.notification.create({
      data: {
        receiverId: client.userId,
        type: 'GENERAL',
        title: isActive ? 'Account Reactivated' : 'Account Suspended',
        message: notificationMessage,
        isRead: false
      }
    });

    // Return the updated client data
    return {
      ...client,
      user: updatedUser
    };
  } catch (error) {
    throw error;
  }
};

// Toggle provider account status (Active/Inactive)
export const toggleProviderStatus = async (providerId: string, isActive: boolean) => {
  try {
    // Find the provider by ID
    const provider = await prisma.serviceProvider.findUnique({
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
    const updatedUser = await prisma.user.update({
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

    await prisma.notification.create({
      data: {
        receiverId: provider.userId,
        type: 'GENERAL',
        title: isActive ? 'Account Reactivated' : 'Account Suspended',
        message: notificationMessage,
        isRead: false
      }
    });

    // Return the updated provider data
    return {
      ...provider,
      user: updatedUser
    };
  } catch (error) {
    throw error;
  }
};

// Dashboard Statistics Functions
export const getDashboardStats = async () => {
  try {
    // Get total counts
    const totalBookings = await prisma.serviceBooking.count();
    const totalClients = await prisma.client.count();
    const totalProviders = await prisma.serviceProvider.count();
    
    // Calculate total revenue from completed bookings
    const completedBookings = await prisma.serviceBooking.findMany({
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
    
    const bookingsLast7Days = await prisma.serviceBooking.findMany({
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
    const bookingsByDate: { [key: string]: number } = {};
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
    const bookingStatusCounts = await prisma.serviceBooking.groupBy({
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
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

export const getRecentBookings = async (limit = 10) => {
  try {
    const recentBookings = await prisma.serviceBooking.findMany({
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
  } catch (error) {
    console.error('Error getting recent bookings:', error);
    throw error;
  }
};

export const getProviderRatings = async () => {
  try {
    // Get all providers with their user data and received reviews
    const providersWithReviews = await prisma.serviceProvider.findMany({
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
        ? provider.user.receivedReviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / totalReviews
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
          .reduce((sum: number, p: { averageRating: number }) => sum + p.averageRating, 0) / providersWithReviewsCount
      : 0;

    return {
      providers: providersWithRatings,
      statistics: {
        totalProviders,
        providersWithReviews: providersWithReviewsCount,
        overallAverageRating: parseFloat(overallAverageRating.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Error getting provider ratings:', error);
    throw error;
  }
};

export const getProviderDetailsForAdmin = async (providerId: string) => {
  try {
    const provider = await prisma.serviceProvider.findFirst({
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
  } catch (error) {
    throw error;
  }
};

// Get all services for admin monitoring (pending and approved)
export const getPendingServices = async () => {
  try {
    const services = await prisma.service.findMany({
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
      let imageUrls: string[] = [];
      if (service.imageUrls) {
        try {
          imageUrls = JSON.parse(service.imageUrls);
        } catch (error) {
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
  } catch (error) {
    throw error;
  }
};

// Approve a service
export const approveService = async (serviceId: string, adminId: string) => {
  try {
    // Find the service
    const service = await prisma.service.findUnique({
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
    const updatedService = await prisma.service.update({
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
    await prisma.notification.create({
      data: {
        receiverId: service.serviceProvider.userId,
        type: 'GENERAL',
        title: 'Service Approved',
        message: `Your service "${service.title}" has been approved by an admin and is now visible to clients.`,
        isRead: false
      }
    });

    // Process image URLs
    let imageUrls: string[] = [];
    if (updatedService.imageUrls) {
      try {
        imageUrls = JSON.parse(updatedService.imageUrls);
      } catch (error) {
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
  } catch (error) {
    throw error;
  }
};

// Reject a service
export const rejectService = async (serviceId: string, adminId: string, reason: string) => {
  try {
    // Find the service
    const service = await prisma.service.findUnique({
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
    const updatedService = await prisma.service.update({
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
    await prisma.notification.create({
      data: {
        receiverId: service.serviceProvider.userId,
        type: 'GENERAL',
        title: 'Service Rejected',
        message: `Your service "${service.title}" has been rejected by an admin. Reason: ${reason}. You can update the service and resubmit it for review.`,
        isRead: false
      }
    });

    // Process image URLs
    let imageUrls: string[] = [];
    if (updatedService.imageUrls) {
      try {
        imageUrls = JSON.parse(updatedService.imageUrls);
      } catch (error) {
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
  } catch (error) {
    throw error;
  }
};