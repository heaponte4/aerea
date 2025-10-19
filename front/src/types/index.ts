export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  avatar?: string;
  role: 'broker' | 'photographer' | 'admin';
  createdAt: Date;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'house' | 'condo' | 'apartment' | 'commercial';
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  createdAt: Date;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed';
  landingPageTemplate?: 'modern' | 'luxury' | 'classic';
  description?: string;
  price?: number;
  yearBuilt?: number;
  lotSize?: number;
  features?: string[];
}

export interface AddonService {
  id: string;
  name: string;
  description: string;
  price: number;
  applicableServices: string[]; // Service IDs this addon applies to
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export interface Photographer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  specialties: string[];
  rating: number;
  completedJobs: number;
  availableDates: Date[];
  travelFee: number;
}

export interface PropertyService {
  propertyId: string;
  serviceId: string;
  photographerId?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  status: 'pending' | 'scheduled' | 'completed';
  notes?: string;
  addonIds?: string[]; // Selected addon service IDs
}

export interface Order {
  id: string;
  propertyId: string;
  customerId?: string;
  services: PropertyService[];
  totalAmount: number;
  travelFees: { photographerId: string; fee: number }[];
  status: 'draft' | 'pending' | 'paid' | 'completed';
  createdAt: Date;
  dueDate?: Date;
}

export interface Media {
  id: string;
  propertyId: string;
  serviceId: string;
  type: 'photo' | 'video' | '3d-scan';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  jobId?: string;
  customerId?: string;
  photographerId?: string;
  amount: number;
  travelFee?: number;
  paymentDate: Date;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'check';
  transactionId?: string;
  notes?: string;
  paidToPhotographer?: boolean;
  photographerPaymentDate?: Date;
}
