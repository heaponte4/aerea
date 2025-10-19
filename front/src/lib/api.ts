/**
 * API Service Layer
 * 
 * This module provides a unified interface for all API calls.
 * When USE_MOCK_DATA is true, it uses localStorage and mock data.
 * When false, it makes real HTTP requests to Django backend.
 */

import API_CONFIG from './apiConfig';
import { 
  User, 
  Property, 
  Service, 
  AddonService, 
  PropertyService, 
  Order, 
  Media, 
  Customer, 
  Photographer 
} from '../types';
import { 
  availableServices, 
  addonServices, 
  photographers as mockPhotographers,
  mockCustomers,
  mockMedia 
} from './mockData';
import { 
  photographerJobs as mockPhotographerJobs,
  photographerPayments as mockPhotographerPayments 
} from './photographerMockData';

// ============================================================================
// HTTP Client
// ============================================================================

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.API_BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T,>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }
    return response.json();
  }

  async get<T,>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    return this.handleResponse<T>(response);
  }

  async post<T,>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout),
    });
    return this.handleResponse<T>(response);
  }

  async put<T,>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T,>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T,>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    return this.handleResponse<T>(response);
  }

  async uploadFile<T,>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
      signal: AbortSignal.timeout(this.timeout * 2), // Longer timeout for uploads
    });
    return this.handleResponse<T>(response);
  }
}

const apiClient = new ApiClient();

// ============================================================================
// Mock Data Helpers (for USE_MOCK_DATA = true)
// ============================================================================

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Default mock users for demo purposes
const defaultMockUsers: User[] = [
  {
    id: 'user_admin',
    email: 'admin@realestate.com',
    name: 'Admin User',
    role: 'admin',
    company: 'RE Media Portal',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user_broker',
    email: 'broker@realestate.com',
    name: 'John Broker',
    role: 'broker',
    company: 'Premium Realty',
    phone: '555-1234',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user_photographer',
    email: 'photographer@realestate.com',
    name: 'Sarah Photographer',
    role: 'photographer',
    company: 'Pro Photos',
    phone: '555-5678',
    createdAt: new Date('2024-02-01'),
  },
];

// Helpers to convert date strings to Date objects
const deserializeUser = (user: any): User => {
  if (!user) return user;
  return {
    ...user,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
  };
};

const deserializeProperty = (property: any): Property => {
  if (!property) return property;
  return {
    ...property,
    createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
  };
};

const deserializeOrder = (order: any): Order => {
  if (!order) return order;
  return {
    ...order,
    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
    dueDate: order.dueDate ? new Date(order.dueDate) : undefined,
    services: order.services?.map((service: any) => ({
      ...service,
      scheduledDate: service.scheduledDate ? new Date(service.scheduledDate) : undefined,
    })) || [],
  };
};

const deserializeMedia = (media: any): Media => {
  if (!media) return media;
  return {
    ...media,
    uploadedAt: media.uploadedAt ? new Date(media.uploadedAt) : new Date(),
  };
};

const deserializeCustomer = (customer: any): Customer => {
  if (!customer) return customer;
  return {
    ...customer,
    createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
  };
};

const deserializePhotographer = (photographer: any): Photographer => {
  if (!photographer) return photographer;
  return {
    ...photographer,
    availableDates: photographer.availableDates?.map((date: any) => new Date(date)) || [],
  };
};

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Initialize users array with default users if it doesn't exist
      let users = getFromLocalStorage<User[]>('users', []);
      
      if (users.length === 0) {
        users = [...defaultMockUsers];
        saveToLocalStorage('users', users);
      }
      
      // Find user by email (password is ignored in mock mode)
      // Normalize email for case-insensitive comparison
      const normalizedEmail = email.toLowerCase().trim();
      let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
      
      // If user not found in default users, create a new broker user
      if (!user) {
        // Determine role based on email
        let role: 'broker' | 'photographer' | 'admin' = 'broker';
        if (normalizedEmail.includes('admin')) {
          role = 'admin';
        } else if (normalizedEmail.includes('photographer') || normalizedEmail.includes('photo')) {
          role = 'photographer';
        }
        
        user = {
          id: `user_${Date.now()}`,
          email: email.trim(),
          name: email.split('@')[0],
          role: role,
          company: 'Demo Company',
          createdAt: new Date(),
        };
        
        users.push(user);
        saveToLocalStorage('users', users);
      }

      const accessToken = 'mock_access_token_' + Date.now();
      const refreshToken = 'mock_refresh_token_' + Date.now();
      
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));

      return { user: deserializeUser(user), accessToken, refreshToken };
    }

    const response = await apiClient.post<{ user: User; access: string; refresh: string }>(
      API_CONFIG.ENDPOINTS.LOGIN,
      { email, password }
    );

    localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.access);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refresh);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));

    return {
      user: deserializeUser(response.user),
      accessToken: response.access,
      refreshToken: response.refresh,
    };
  },

  async signup(userData: {
    email: string;
    password: string;
    name: string;
    role: 'broker' | 'photographer';
    company?: string;
    phone?: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const users = getFromLocalStorage<User[]>('users', []);
      
      if (users.some(u => u.email === userData.email)) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company: userData.company,
        phone: userData.phone,
        createdAt: new Date(),
      };

      users.push(newUser);
      saveToLocalStorage('users', users);

      const accessToken = 'mock_access_token_' + Date.now();
      const refreshToken = 'mock_refresh_token_' + Date.now();
      
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(newUser));

      return { user: newUser, accessToken, refreshToken };
    }

    const response = await apiClient.post<{ user: User; access: string; refresh: string }>(
      API_CONFIG.ENDPOINTS.SIGNUP,
      userData
    );

    localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.access);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refresh);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));

    return {
      user: deserializeUser(response.user),
      accessToken: response.access,
      refreshToken: response.refresh,
    };
  },

  async logout(): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
      return;
    }

    await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {
      refresh: localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN),
    });

    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
  },

  async getCurrentUser(): Promise<User | null> {
    const stored = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
    if (!stored) return null;

    if (API_CONFIG.USE_MOCK_DATA) {
      const userData = JSON.parse(stored);
      return deserializeUser(userData);
    }

    try {
      const user = await apiClient.get<User>(API_CONFIG.ENDPOINTS.CURRENT_USER);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
      return deserializeUser(user);
    } catch (error) {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
      return null;
    }
  },

  async refreshToken(): Promise<string> {
    const refresh = localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    if (!refresh) throw new Error('No refresh token');

    if (API_CONFIG.USE_MOCK_DATA) {
      const newToken = 'mock_access_token_' + Date.now();
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, newToken);
      return newToken;
    }

    const response = await apiClient.post<{ access: string }>(
      API_CONFIG.ENDPOINTS.REFRESH_TOKEN,
      { refresh }
    );

    localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.access);
    return response.access;
  },
};

// ============================================================================
// Properties API
// ============================================================================

export const propertiesApi = {
  async getAll(): Promise<Property[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const properties = getFromLocalStorage<Property[]>('properties', []);
      return properties.map(deserializeProperty);
    }
    const properties = await apiClient.get<Property[]>(API_CONFIG.ENDPOINTS.PROPERTIES);
    return properties.map(deserializeProperty);
  },

  async getById(id: string): Promise<Property> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const properties = getFromLocalStorage<Property[]>('properties', []);
      const property = properties.find(p => p.id === id);
      if (!property) throw new Error('Property not found');
      return deserializeProperty(property);
    }
    const property = await apiClient.get<Property>(API_CONFIG.ENDPOINTS.PROPERTY_DETAIL(id));
    return deserializeProperty(property);
  },

  async create(property: Property): Promise<Property> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const properties = getFromLocalStorage<Property[]>('properties', []);
      properties.push(property);
      saveToLocalStorage('properties', properties);
      return deserializeProperty(property);
    }
    const created = await apiClient.post<Property>(API_CONFIG.ENDPOINTS.PROPERTIES, property);
    return deserializeProperty(created);
  },

  async update(id: string, updates: Partial<Property>): Promise<Property> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const properties = getFromLocalStorage<Property[]>('properties', []);
      const index = properties.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Property not found');
      
      properties[index] = { ...properties[index], ...updates };
      saveToLocalStorage('properties', properties);
      return deserializeProperty(properties[index]);
    }
    const updated = await apiClient.patch<Property>(API_CONFIG.ENDPOINTS.PROPERTY_DETAIL(id), updates);
    return deserializeProperty(updated);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const properties = getFromLocalStorage<Property[]>('properties', []);
      saveToLocalStorage('properties', properties.filter(p => p.id !== id));
      return;
    }
    await apiClient.delete(API_CONFIG.ENDPOINTS.PROPERTY_DETAIL(id));
  },
};

// ============================================================================
// Services API
// ============================================================================

export const servicesApi = {
  async getAll(): Promise<Service[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return availableServices;
    }
    return apiClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES);
  },

  async getAddons(): Promise<AddonService[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return addonServices;
    }
    return apiClient.get<AddonService[]>(API_CONFIG.ENDPOINTS.ADDON_SERVICES);
  },
};

// ============================================================================
// Property Services API
// ============================================================================

export const propertyServicesApi = {
  // get all property services (flat endpoint)
  async getAll(): Promise<PropertyService[]> {
    // Llamamos al endpoint raíz: /services/ o /property-services/
    const services = await apiClient.get<PropertyService[]>(API_CONFIG.ENDPOINTS.SERVICES);
    return services;
  },

  async getByPropertyId(propertyId: string): Promise<PropertyService[]> {
    // Si el backend acepta filtro por query param:
    // return apiClient.get<PropertyService[]>(`${API_CONFIG.ENDPOINTS.SERVICES}?property=${propertyId}`);
    // Si no, obtener todo y filtrar cliente:
    const all = await apiClient.get<PropertyService[]>(API_CONFIG.ENDPOINTS.SERVICES);
    return all.filter(s => s.propertyId === propertyId);
  },

  async create(service: PropertyService): Promise<PropertyService> {
    // crear a nivel raíz
    return apiClient.post<PropertyService>(API_CONFIG.ENDPOINTS.SERVICES, service);
  },

  async update(propertyId: string, serviceId: string, updates: Partial<PropertyService>): Promise<PropertyService> {
    // patch contra el detalle de service (si tu API expone /services/<id>/)
    return apiClient.patch<PropertyService>(`${API_CONFIG.ENDPOINTS.SERVICES}${serviceId}/`, updates);
  },
};

// ============================================================================
// Orders API
// ============================================================================

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const orders = getFromLocalStorage<Order[]>('orders', []);
      return orders.map(deserializeOrder);
    }
    const orders = await apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS);
    return orders.map(deserializeOrder);
  },

  async getById(id: string): Promise<Order> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const orders = getFromLocalStorage<Order[]>('orders', []);
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return deserializeOrder(order);
    }
    const order = await apiClient.get<Order>(API_CONFIG.ENDPOINTS.ORDER_DETAIL(id));
    return deserializeOrder(order);
  },

  async create(order: Order): Promise<Order> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const orders = getFromLocalStorage<Order[]>('orders', []);
      orders.push(order);
      saveToLocalStorage('orders', orders);
      return deserializeOrder(order);
    }
    const created = await apiClient.post<Order>(API_CONFIG.ENDPOINTS.ORDERS, order);
    return deserializeOrder(created);
  },

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const orders = getFromLocalStorage<Order[]>('orders', []);
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Order not found');
      
      orders[index] = { ...orders[index], ...updates };
      saveToLocalStorage('orders', orders);
      return deserializeOrder(orders[index]);
    }
    const updated = await apiClient.patch<Order>(API_CONFIG.ENDPOINTS.ORDER_DETAIL(id), updates);
    return deserializeOrder(updated);
  },
};

// ============================================================================
// Customers API
// ============================================================================

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const customers = getFromLocalStorage<Customer[]>('customers', mockCustomers);
      return customers.map(deserializeCustomer);
    }
    const customers = await apiClient.get<Customer[]>(API_CONFIG.ENDPOINTS.CUSTOMERS);
    return customers.map(deserializeCustomer);
  },

  async getById(id: string): Promise<Customer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const customers = getFromLocalStorage<Customer[]>('customers', mockCustomers);
      const customer = customers.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found');
      return deserializeCustomer(customer);
    }
    const customer = await apiClient.get<Customer>(API_CONFIG.ENDPOINTS.CUSTOMER_DETAIL(id));
    return deserializeCustomer(customer);
  },

  async create(customer: Customer): Promise<Customer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const customers = getFromLocalStorage<Customer[]>('customers', mockCustomers);
      customers.push(customer);
      saveToLocalStorage('customers', customers);
      return deserializeCustomer(customer);
    }
    const created = await apiClient.post<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS, customer);
    return deserializeCustomer(created);
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const customers = getFromLocalStorage<Customer[]>('customers', mockCustomers);
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      
      customers[index] = { ...customers[index], ...updates };
      saveToLocalStorage('customers', customers);
      return deserializeCustomer(customers[index]);
    }
    const updated = await apiClient.patch<Customer>(API_CONFIG.ENDPOINTS.CUSTOMER_DETAIL(id), updates);
    return deserializeCustomer(updated);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const customers = getFromLocalStorage<Customer[]>('customers', mockCustomers);
      saveToLocalStorage('customers', customers.filter(c => c.id !== id));
      return;
    }
    await apiClient.delete(API_CONFIG.ENDPOINTS.CUSTOMER_DETAIL(id));
  },
};

// ============================================================================
// Photographers API
// ============================================================================

export const photographersApi = {
  async getAll(): Promise<Photographer[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const photographers = getFromLocalStorage<Photographer[]>('photographers', mockPhotographers);
      // Initialize localStorage with mock data if empty
      if (photographers.length === 0 || photographers === mockPhotographers) {
        saveToLocalStorage('photographers', mockPhotographers);
        return mockPhotographers.map(deserializePhotographer);
      }
      return photographers.map(deserializePhotographer);
    }
    const photographers = await apiClient.get<Photographer[]>(API_CONFIG.ENDPOINTS.PHOTOGRAPHERS);
    return photographers.map(deserializePhotographer);
  },

  async getById(id: string): Promise<Photographer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const photographer = mockPhotographers.find(p => p.id === id);
      if (!photographer) throw new Error('Photographer not found');
      return deserializePhotographer(photographer);
    }
    const photographer = await apiClient.get<Photographer>(API_CONFIG.ENDPOINTS.PHOTOGRAPHER_DETAIL(id));
    return deserializePhotographer(photographer);
  },

  async getJobs(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return mockPhotographerJobs;
    }
    return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.PHOTOGRAPHER_JOBS);
  },

  async getPayments(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return mockPhotographerPayments;
    }
    return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.PHOTOGRAPHER_PAYMENTS);
  },

  async update(id: string, updates: Partial<Photographer>): Promise<Photographer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const photographers = getFromLocalStorage<Photographer[]>('photographers', mockPhotographers);
      const index = photographers.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Photographer not found');
      
      photographers[index] = { ...photographers[index], ...updates };
      saveToLocalStorage('photographers', photographers);
      return deserializePhotographer(photographers[index]);
    }
    const updated = await apiClient.patch<Photographer>(API_CONFIG.ENDPOINTS.PHOTOGRAPHER_DETAIL(id), updates);
    return deserializePhotographer(updated);
  },

  async addAvailableDate(id: string, date: Date): Promise<Photographer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const photographers = getFromLocalStorage<Photographer[]>('photographers', mockPhotographers);
      const index = photographers.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Photographer not found');
      
      const photographer = photographers[index];
      const availableDates = photographer.availableDates || [];
      // Check if date already exists
      const dateExists = availableDates.some(d => {
        const existingDate = new Date(d);
        return existingDate.toDateString() === date.toDateString();
      });
      
      if (!dateExists) {
        availableDates.push(date);
        photographer.availableDates = availableDates;
        photographers[index] = photographer;
        saveToLocalStorage('photographers', photographers);
      }
      
      return deserializePhotographer(photographer);
    }
    const updated = await apiClient.post<Photographer>(
      `${API_CONFIG.ENDPOINTS.PHOTOGRAPHER_DETAIL(id)}/available-dates/`,
      { date: date.toISOString() }
    );
    return deserializePhotographer(updated);
  },

  async addAvailableDates(id: string, dates: Date[]): Promise<Photographer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const photographers = getFromLocalStorage<Photographer[]>('photographers', mockPhotographers);
      const index = photographers.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Photographer not found');
      
      const photographer = photographers[index];
      const availableDates = photographer.availableDates || [];
      
      // Add only dates that don't already exist
      dates.forEach(date => {
        const dateExists = availableDates.some(d => {
          const existingDate = new Date(d);
          return existingDate.toDateString() === date.toDateString();
        });
        
        if (!dateExists) {
          availableDates.push(date);
        }
      });
      
      photographer.availableDates = availableDates;
      photographers[index] = photographer;
      saveToLocalStorage('photographers', photographers);
      
      return deserializePhotographer(photographer);
    }
    const updated = await apiClient.post<Photographer>(
      `${API_CONFIG.ENDPOINTS.PHOTOGRAPHER_DETAIL(id)}/available-dates/bulk/`,
      { dates: dates.map(d => d.toISOString()) }
    );
    return deserializePhotographer(updated);
  },

  async removeAvailableDate(id: string, date: Date): Promise<Photographer> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const photographers = getFromLocalStorage<Photographer[]>('photographers', mockPhotographers);
      const index = photographers.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Photographer not found');
      
      const photographer = photographers[index];
      photographer.availableDates = (photographer.availableDates || []).filter(d => {
        const existingDate = new Date(d);
        return existingDate.toDateString() !== date.toDateString();
      });
      photographers[index] = photographer;
      saveToLocalStorage('photographers', photographers);
      
      return deserializePhotographer(photographer);
    }
    const updated = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PHOTOGRAPHER_DETAIL(id)}/available-dates/?date=${date.toISOString()}`
    );
    return deserializePhotographer(updated);
  },
};

// ============================================================================
// Media API
// ============================================================================

export const mediaApi = {
  async getByPropertyId(propertyId: string): Promise<Media[]> {
    // Opción A: si backend soporta ?property=<id>
    // const all = await apiClient.get<Media[]>(`${API_CONFIG.ENDPOINTS.MEDIA}?property=${propertyId}`);
    // return all;
    // Opción B: si no soporta query, obtener todo y filtrar cliente
    const all = await apiClient.get<Media[]>(API_CONFIG.ENDPOINTS.MEDIA);
    return all.filter(m => m.propertyId === propertyId);
  },

  async upload(propertyId: string, serviceId: string, file: File, type: string): Promise<Media> {
    return apiClient.uploadFile<Media>(API_CONFIG.ENDPOINTS.MEDIA_UPLOAD, file, { propertyId, serviceId, type });
  },
};

// ============================================================================
// Jobs API (for photographers)
// ============================================================================

// Helper function to deserialize job dates
const deserializeJob = (job: any) => ({
  ...job,
  scheduledDate: new Date(job.scheduledDate),
  deliveredAt: job.deliveredAt ? new Date(job.deliveredAt) : undefined,
  comments: job.comments?.map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt),
  })) || [],
  checklist: job.checklist || [],
  rescheduleHistory: job.rescheduleHistory?.map((r: any) => ({
    ...r,
    oldDate: new Date(r.oldDate),
    newDate: new Date(r.newDate),
    rescheduledAt: new Date(r.rescheduledAt),
  })) || [],
});

export const jobsApi = {
  async getAll(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      
      // Initialize localStorage with mock data if empty
      if (jobs.length === 0) {
        saveToLocalStorage('photographerJobs', mockPhotographerJobs);
        jobs = mockPhotographerJobs;
      }
      
      // Always deserialize dates when loading from storage
      return jobs.map(deserializeJob);
    }
    return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.JOBS);
  },

  async getById(id: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const job = jobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      return deserializeJob(job);
    }
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.JOB_DETAIL(id));
  },

  async update(id: string, updates: any): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const index = jobs.findIndex(j => j.id === id);
      if (index === -1) throw new Error('Job not found');
      
      jobs[index] = { ...jobs[index], ...updates };
      saveToLocalStorage('photographerJobs', jobs);
      
      return deserializeJob(jobs[index]);
    }
    return apiClient.patch<any>(API_CONFIG.ENDPOINTS.JOB_DETAIL(id), updates);
  },

  async uploadFiles(jobId: string, files: File[]): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      return { success: true, uploaded: files.length };
    }
    
    // Upload files one by one
    const results = await Promise.all(
      files.map(file => apiClient.uploadFile(API_CONFIG.ENDPOINTS.JOB_UPLOAD(jobId), file))
    );
    
    return results;
  },

  async reschedule(jobId: string, newDate: Date, newTime: string, reason: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const index = jobs.findIndex(j => j.id === jobId);
      if (index === -1) throw new Error('Job not found');
      
      const job = jobs[index];
      const rescheduleEntry = {
        id: `reschedule_${Date.now()}`,
        oldDate: job.scheduledDate,
        oldTime: job.scheduledTime,
        newDate,
        newTime,
        reason,
        rescheduledAt: new Date(),
      };
      
      job.scheduledDate = newDate;
      job.scheduledTime = newTime;
      job.rescheduleHistory = [...(job.rescheduleHistory || []), rescheduleEntry];
      
      jobs[index] = job;
      saveToLocalStorage('photographerJobs', jobs);
      return deserializeJob(job);
    }
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.JOB_DETAIL(jobId)}/reschedule/`, {
      newDate: newDate.toISOString(),
      newTime,
      reason,
    });
  },

  async markAsCompleted(jobId: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const index = jobs.findIndex(j => j.id === jobId);
      if (index === -1) throw new Error('Job not found');
      
      jobs[index].status = 'completed';
      jobs[index].deliveredAt = new Date();
      
      saveToLocalStorage('photographerJobs', jobs);
      return deserializeJob(jobs[index]);
    }
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.JOB_DETAIL(jobId)}/complete/`, {});
  },

  async addComment(jobId: string, text: string, createdBy: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const index = jobs.findIndex(j => j.id === jobId);
      if (index === -1) throw new Error('Job not found');
      
      const comment = {
        id: `comment_${Date.now()}`,
        text,
        createdAt: new Date(),
        createdBy,
      };
      
      jobs[index].comments = [...(jobs[index].comments || []), comment];
      saveToLocalStorage('photographerJobs', jobs);
      return deserializeJob(jobs[index]);
    }
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.JOB_DETAIL(jobId)}/comments/`, {
      text,
      createdBy,
    });
  },

  async updateChecklist(jobId: string, checklist: any[]): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const index = jobs.findIndex(j => j.id === jobId);
      if (index === -1) throw new Error('Job not found');
      
      jobs[index].checklist = checklist;
      saveToLocalStorage('photographerJobs', jobs);
      return deserializeJob(jobs[index]);
    }
    return apiClient.patch<any>(`${API_CONFIG.ENDPOINTS.JOB_DETAIL(jobId)}/checklist/`, {
      checklist,
    });
  },

  async addChecklistItem(jobId: string, text: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      let jobs = getFromLocalStorage<any[]>('photographerJobs', []);
      if (jobs.length === 0) {
        jobs = mockPhotographerJobs;
      }
      const index = jobs.findIndex(j => j.id === jobId);
      if (index === -1) throw new Error('Job not found');
      
      const item = {
        id: `check_${Date.now()}`,
        text,
        completed: false,
      };
      
      jobs[index].checklist = [...(jobs[index].checklist || []), item];
      saveToLocalStorage('photographerJobs', jobs);
      return deserializeJob(jobs[index]);
    }
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.JOB_DETAIL(jobId)}/checklist/`, {
      text,
    });
  },
};

// ============================================================================
// Payments API
// ============================================================================

const deserializePayment = (payment: any): any => {
  if (!payment) return payment;
  return {
    ...payment,
    paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
    photographerPaymentDate: payment.photographerPaymentDate
      ? new Date(payment.photographerPaymentDate)
      : undefined,
  };
};

export const paymentsApi = {
  async getAll(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const payments = getFromLocalStorage<any[]>('payments', []);
      return payments.map(deserializePayment);
    }
    const payments = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.PAYMENTS || '/api/payments/');
    return payments.map(deserializePayment);
  },

  async getById(id: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const payments = getFromLocalStorage<any[]>('payments', []);
      const payment = payments.find(p => p.id === id);
      if (!payment) throw new Error('Payment not found');
      return deserializePayment(payment);
    }
    const payment = await apiClient.get<any>(`/api/payments/${id}/`);
    return deserializePayment(payment);
  },

  async create(payment: any): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const payments = getFromLocalStorage<any[]>('payments', []);
      payments.push(payment);
      saveToLocalStorage('payments', payments);
      return deserializePayment(payment);
    }
    const created = await apiClient.post<any>('/api/payments/', payment);
    return deserializePayment(created);
  },

  async update(id: string, updates: any): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const payments = getFromLocalStorage<any[]>('payments', []);
      const index = payments.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Payment not found');
      
      payments[index] = { ...payments[index], ...updates };
      saveToLocalStorage('payments', payments);
      return deserializePayment(payments[index]);
    }
    const updated = await apiClient.patch<any>(`/api/payments/${id}/`, updates);
    return deserializePayment(updated);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const payments = getFromLocalStorage<any[]>('payments', []);
      saveToLocalStorage('payments', payments.filter(p => p.id !== id));
      return;
    }
    await apiClient.delete(`/api/payments/${id}/`);
  },

  async getByOrderId(orderId: string): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const payments = getFromLocalStorage<any[]>('payments', []);
      return payments.filter(p => p.orderId === orderId).map(deserializePayment);
    }
    const payments = await apiClient.get<any[]>(`/api/orders/${orderId}/payments/`);
    return payments.map(deserializePayment);
  },
};

export default {
  auth: authApi,
  properties: propertiesApi,
  services: servicesApi,
  propertyServices: propertyServicesApi,
  orders: ordersApi,
  customers: customersApi,
  photographers: photographersApi,
  media: mediaApi,
  jobs: jobsApi,
  payments: paymentsApi,
};
