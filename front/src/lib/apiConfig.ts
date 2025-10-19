/**
 * API Configuration
 * 
 * Set USE_MOCK_DATA to false when Django backend is ready
 * Update API_BASE_URL to your Django backend URL
 */

// Check if process.env is available (for Create React App environments)
const getApiUrl = () => {
  try {
    return (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://127.0.0.1:8000/api';
  } catch {
    return 'http://127.0.0.1:8000/api';
  }
};

export const API_CONFIG = {
  USE_MOCK_DATA: false, // <-- cambiar a false
  API_BASE_URL: (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://127.0.0.1:8000/api',
  TIMEOUT: 30000,
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
  },
  ENDPOINTS: {
    PROPERTIES: '/properties/',
    PROPERTY_DETAIL: (id: string) => `/properties/${id}/`,
    SERVICES: '/services/',
    PROPERTY_SERVICES: (id: string) => `/properties/${id}/services/`,
    PROPERTY_MEDIA: (id: string) => `/properties/${id}/media/`,
    MEDIA: '/media/',
    ORDERS: '/orders/',
    ORDER_DETAIL: (id: string) => `/orders/${id}/`,
    CUSTOMERS: '/customers/',
    CUSTOMER_DETAIL: (id: string) => `/customers/${id}/`,
    LOGIN: '/auth/login/',
    SIGNUP: '/auth/signup/',
    LOGOUT: '/auth/logout/',
    CURRENT_USER: '/auth/me/',
    REFRESH_TOKEN: '/auth/refresh/',
    

    
    // Services

    ADDON_SERVICES: '/services/addons/',
    
    // Orders/Invoices
    // Photographers
    PHOTOGRAPHERS: '/photographers/',
    PHOTOGRAPHER_DETAIL: (id: string) => `/photographers/${id}/`,
    PHOTOGRAPHER_JOBS: '/photographers/jobs/',
    PHOTOGRAPHER_PAYMENTS: '/photographers/payments/',
    
    // Jobs
    JOBS: '/jobs/',
    JOB_DETAIL: (id: string) => `/jobs/${id}/`,
    JOB_UPLOAD: (id: string) => `/jobs/${id}/upload/`,
    
    // Payments
    PAYMENTS: '/payments/',
    PAYMENT_DETAIL: (id: string) => `/payments/${id}/`,
    
    // Media Upload
    MEDIA_UPLOAD: '/media/upload/',
    
    // Templates
    TEMPLATES: '/templates/',
  },
  
  // Request timeout in milliseconds

  
  // Local storage keys
};

export default API_CONFIG;
