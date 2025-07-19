const API_BASE_URL = 'http://localhost:5500/api';
export const FILE_SERVER_URL = 'http://localhost:5500';

// Helper function to convert relative file paths to absolute URLs
const getFileUrl = (relativePath) => {
  // If the path is already a full URL, return it as is
  if (relativePath && (relativePath.startsWith('http://') || relativePath.startsWith('https://'))) {
    return relativePath;
  }
  
  // Otherwise, prepend the file server URL to make it absolute
  if (relativePath && relativePath.startsWith('/')) {
    return `${FILE_SERVER_URL}${relativePath}`;
  }
  
  // If path is empty or undefined, return a placeholder
  return relativePath || '';
};

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  return { 
    success: false, 
    message: error.message || 'An unknown error occurred',
    data: null
  };
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No authentication token found in localStorage');
    return {
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Auth related functions
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  changePassword: async (currentPassword, newPassword, token) => {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.json();
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  resetPassword: async (email, token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword })
    });
    return response.json();
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  verifyEmail: async (email, code) => {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    return response.json();
  }
};

// User profile functions
export const userService = {
  getMe: async (token) => {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};

// Service related functions
export const serviceService = {
  getAll : async (filters = {}, pagination = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
    if (filters.skillIds) {
      filters.skillIds.forEach(id => queryParams.append('skillIds', id));
    }
    if (pagination.page) queryParams.append('page', pagination.page);
    if (pagination.limit) queryParams.append('limit', pagination.limit);

    const response = await fetch(`${API_BASE_URL}/services?${queryParams}`);
    return response.json();
  },

  getServiceDetails: async (serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}`);
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getCategoriesWithServices: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories-with-services`);
      const data = await handleApiResponse(response);
      
      // Process image URLs for categories if response is successful
      if (data.success && Array.isArray(data.data)) {
        data.data = data.data.map(category => {
          if (category.imageUrl) {
            category.imageUrl = getFileUrl(category.imageUrl);
          }
          
          // Also process services within each category
          if (category.services && Array.isArray(category.services)) {
            category.services = category.services.map(service => {
              if (service.imageUrls && Array.isArray(service.imageUrls)) {
                service.imageUrls = service.imageUrls.map(url => getFileUrl(url));
              }
              
              if (service.provider && service.provider.profilePicture) {
                service.provider.profilePicture = getFileUrl(service.provider.profilePicture);
              }
              
              return service;
            });
          }
          
          return category;
        });
      }
      
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Provider related functions
export const providerService = {
  searchProviders: async (query = {}, pagination = {}) => {
    const queryParams = new URLSearchParams();
    
    if (query.searchTerm) queryParams.append('searchTerm', query.searchTerm);
    if (query.categoryId) queryParams.append('categoryId', query.categoryId);
    if (query.skillIds) {
      query.skillIds.forEach(id => queryParams.append('skillIds', id));
    }
    if (pagination.page) queryParams.append('page', pagination.page);
    if (pagination.limit) queryParams.append('limit', pagination.limit);

    const response = await fetch(`${API_BASE_URL}/providers/search?${queryParams}`);
    return response.json();
  },

  getProviderDetails: async (providerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderDocuments: async (providerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/documents`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderPortfolio: async (providerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/portfolio`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderAvailability: async (providerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/availability`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Registration and Profile
  registerProvider: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/register`, {
        method: 'POST',
        body: formData // FormData containing user details and ID document
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProviderProfile: async (profileData) => {
    try {
      console.log('API Service: Profile data received:', profileData);
      
      // Create a clean object with only valid fields
      const cleanData = {};
      if (profileData) {
        // Only add defined values to the request
        if (profileData.firstName !== undefined) cleanData.firstName = profileData.firstName;
        if (profileData.lastName !== undefined) cleanData.lastName = profileData.lastName;
        if (profileData.phone !== undefined) cleanData.phone = profileData.phone;
        if (profileData.bio !== undefined) cleanData.bio = profileData.bio;
        if (profileData.headline !== undefined) cleanData.headline = profileData.headline;
        if (profileData.hourlyRate !== undefined) cleanData.hourlyRate = profileData.hourlyRate;
        // Add any other fields that might be needed
      }
      
      console.log('API Service: Clean data to send:', cleanData);
      
      // Verify we have data to send
      if (Object.keys(cleanData).length === 0) {
        console.error('API Service: No data to update');
        return {
          success: false,
          message: 'At least one field is required for update'
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/provider/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanData)
      });
      
      console.log('API Service: Response status:', response.status);
      return await handleApiResponse(response);
    } catch (error) {
      console.error('API Service: Error in updateProviderProfile:', error);
      return handleApiError(error);
    }
  },

  getVerificationStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/verification-status`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Experience and Education
  addWorkExperience: async (experienceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/experience`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(experienceData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  addEducation: async (educationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/education`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(educationData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  addSkill: async (skillData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/skill`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(skillData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Portfolio and Documents
  addPortfolio: async (portfolioData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/portfolio`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(portfolioData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  addPortfolioWithFiles: async (formData) => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      // For FormData, don't set Content-Type header - browser will set it with boundary
      const response = await fetch(`${API_BASE_URL}/provider/portfolio/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // FormData containing portfolio details and files
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  addDocument: async (formData) => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      // For FormData, don't set Content-Type header - browser will set it with boundary
      const response = await fetch(`${API_BASE_URL}/provider/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // FormData containing document details and file
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Services
  createService: async (serviceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/service`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderServices: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/services`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProviderService: async (serviceId, serviceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/services/${serviceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/categories`, {
        method: 'GET'
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Bookings
  getProviderBookings: async (status) => {
    try {
      const url = new URL(`${API_BASE_URL}/provider/bookings`);
      if (status) url.searchParams.append('status', status);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderBookingDetails: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  acceptBooking: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  declineBooking: async (bookingId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/decline`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  startService: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/start`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  completeService: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add function to mark payment as received
  markPaymentReceived: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/payment/complete`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Contracts
  getContract: async (contractId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/contracts/${contractId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createContract: async (bookingId, contractData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/contracts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contractData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateContract: async (contractId, contractData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/contracts/${contractId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(contractData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  signContract: async (contractId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Reviews
  createReview: async (bookingId, reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/bookings/${bookingId}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getReviewsReceived: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/reviews/received`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getReviewsGiven: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/reviews/given`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProviderReviews: async (providerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/reviews`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Availability
  addAvailabilitySlot: async (availabilityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/availability`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(availabilityData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAvailability: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/availability`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateAvailabilitySlot: async (slotId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/availability/${slotId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteAvailabilitySlot: async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/provider/availability/${slotId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Chat related functions
export const chatService = {
  getConversations: async (token) => {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getConversationMessages: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      // If request was successful but response format has changed
      if (data.success && Array.isArray(data.data)) {
        // Support legacy format (just array of messages)
        return data;
      } else {
        // Return data as is (new format with messages and conversationStatus)
        return data;
      }
    } catch (error) {
      console.error('Error in getConversationMessages:', error);
      return {
        success: false,
        message: error.message || 'Failed to load messages',
        data: []
      };
    }
  },

  sendMessage: async (conversationId, content, imageUrl, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, imageUrl })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: error.message || 'Failed to send message'
      };
    }
  },

  uploadImage: async (imageFile, token) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  }
};

// Client related functions
export const clientService = {
  registerClient: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getClientProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateClientProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/address`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/address/${addressId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/address/${addressId}/default`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/address/${addressId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Booking Management
  bookService: async (bookingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/booking`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getBookings: async (status) => {
    try {
      const url = status 
        ? `${API_BASE_URL}/client/booking?status=${status}`
        : `${API_BASE_URL}/client/booking`;

      const response = await fetch(url, {
        headers: {
          ...getAuthHeaders()
        }
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getBookingDetails: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/booking/${bookingId}`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/booking/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        }
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Payment Management
  processPayment: async (bookingId, paymentProofFile) => {
    try {
      const formData = new FormData();
      if (paymentProofFile) {
        formData.append('paymentProof', paymentProofFile);
      }

      const response = await fetch(`${API_BASE_URL}/client/booking/${bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  markPaymentCompleted: async (bookingId, token) => {
    const response = await fetch(`${API_BASE_URL}/client/booking/${bookingId}/payment/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // Contract Management
  getContracts: async (token) => {
    const response = await fetch(`${API_BASE_URL}/client/contracts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getContractDetails: async (contractId, token) => {
    const response = await fetch(`${API_BASE_URL}/client/contracts/${contractId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  signContract: async (contractId, token) => {
    const response = await fetch(`${API_BASE_URL}/client/contracts/${contractId}/sign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // Review Management
  submitReview: async (bookingId, reviewData, imageFiles = []) => {
    try {
      const formData = new FormData();
      // Convert rating to float
      formData.append('rating', parseFloat(reviewData.rating));
      if (reviewData.comment) {
        formData.append('comment', reviewData.comment);
      }
      formData.append('bookingId', bookingId); // Add the bookingId to the form data
      
      // Append multiple images if provided
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/client/bookings/${bookingId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getReviewsReceived: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/reviews/received`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getReviewsGiven: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/reviews/given`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Notification related functions
export const notificationService = {
  getNotifications: async (page = 1, limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders()
      });
      const result = await handleApiResponse(response);
      
      // Check if there's an error related to user not found
      if (!result.success && result.message === 'User not found') {
        console.warn('User not found when fetching notifications, returning empty list');
        return { 
          success: true, 
          data: { 
            notifications: [],
            totalCount: 0,
            hasMore: false,
            page,
            limit
          } 
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error in getNotifications:', error);
      // Return a successful response with empty notifications to prevent UI errors
      return { 
        success: true, 
        data: { 
          notifications: [],
          totalCount: 0,
          hasMore: false,
          page,
          limit
        } 
      };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/count`, {
        headers: getAuthHeaders()
      });
      const result = await handleApiResponse(response);
      
      // Check if there's an error related to user not found
      if (!result.success && result.message === 'User not found') {
        console.warn('User not found when fetching notification count, returning 0');
        return { success: true, data: { count: 0 } };
      }
      
      return result;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      // Return a successful response with count 0 to prevent UI errors
      return { success: true, data: { count: 0 } };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Profile picture upload function (can be used by both client and provider)
export const uploadProfilePicture = async (file) => {
  try {
    if (!file) {
      console.error('No file provided to uploadProfilePicture');
      throw new Error('Profile picture file is required');
    }
    
    console.log('Creating FormData for file:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('profilePicture', file, file.name);
    
    // Log FormData contents (can only check keys, not values)
    for (let pair of formData.entries()) {
      console.log('FormData contains:', pair[0], pair[1]);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    console.log('Sending profile picture upload request to:', `${API_BASE_URL}/upload-profile-picture`);
    const response = await fetch(`${API_BASE_URL}/upload-profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Profile picture upload response status:', response.status);
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    return handleApiError(error);
  }
};

// Export all services
export default {
  auth: authService,
  user: userService,
  service: serviceService,
  provider: providerService,
  chat: chatService,
  client: clientService,
  notifications: notificationService,
  uploadProfilePicture,
  getFileUrl
};

export { getFileUrl };