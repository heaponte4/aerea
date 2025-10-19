import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { Dashboard } from './components/Dashboard';
import { AddPropertyForm } from './components/AddPropertyForm';
import { CreateJobForm } from './components/CreateJobForm';
import { PropertyDetail } from './components/PropertyDetail';
import { DeliveryPage } from './components/DeliveryPage';
import { PropertyLandingPage } from './components/PropertyLandingPage';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Profile } from './components/Profile';
import { PhotographerDashboard } from './components/photographer/PhotographerDashboard';
import { PhotographerProfile } from './components/photographer/PhotographerProfile';
import { JobUpload } from './components/photographer/JobUpload';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProfile } from './components/admin/AdminProfile';
import { PhotographerJob, UploadedFile } from './lib/photographerMockData';
import { Media } from './types';
import { Toaster } from './components/ui/sonner';

type BrokerView = 
  | { type: 'dashboard' }
  | { type: 'add-property' }
  | { type: 'create-job' }
  | { type: 'property-detail'; propertyId: string }
  | { type: 'delivery'; propertyId: string }
  | { type: 'profile' };

type PhotographerView = 
  | { type: 'dashboard' }
  | { type: 'profile' }
  | { type: 'upload'; job: PhotographerJob };

type AdminView =
  | { type: 'dashboard' }
  | { type: 'profile' };

type AuthView = 'login' | 'signup';

// Public Property Landing Page Component
function PublicPropertyPage({ propertyId }: { propertyId: string }) {
  const { getPropertyById } = useApp();
  const property = getPropertyById(propertyId);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Mock media data for demonstration
  const mockMedia: Media[] = [
    {
      id: 'media1',
      propertyId: property.id,
      serviceId: 'service1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      fileName: 'exterior-1.jpg',
      fileSize: 2048000,
      uploadedAt: new Date(),
    },
    {
      id: 'media2',
      propertyId: property.id,
      serviceId: 'service1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      fileName: 'living-room.jpg',
      fileSize: 1920000,
      uploadedAt: new Date(),
    },
    {
      id: 'media3',
      propertyId: property.id,
      serviceId: 'service1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200',
      fileName: 'kitchen.jpg',
      fileSize: 2150000,
      uploadedAt: new Date(),
    },
    {
      id: 'media4',
      propertyId: property.id,
      serviceId: 'service1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      fileName: 'bedroom.jpg',
      fileSize: 1850000,
      uploadedAt: new Date(),
    },
    {
      id: 'media5',
      propertyId: property.id,
      serviceId: 'service1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200',
      fileName: 'bathroom.jpg',
      fileSize: 1750000,
      uploadedAt: new Date(),
    },
  ];

  return (
    <PropertyLandingPage
      property={property}
      media={mockMedia}
      agentName="John Doe"
      agentEmail="john@luxuryrealty.com"
      agentPhone="(305) 555-0100"
    />
  );
}

function AppContent() {
  const { user } = useAuth();
  const [brokerView, setBrokerView] = useState<BrokerView>({ type: 'dashboard' });
  const [photographerView, setPhotographerView] = useState<PhotographerView>({ type: 'dashboard' });
  const [adminView, setAdminView] = useState<AdminView>({ type: 'dashboard' });
  const [authView, setAuthView] = useState<AuthView>('login');

  // Check if accessing a public property page
  const path = window.location.pathname;
  const propertyMatch = path.match(/^\/property\/(.+)$/);

  // Public property landing page (no auth required)
  if (propertyMatch) {
    const propertyId = propertyMatch[1];
    return (
      <AppProvider>
        <PublicPropertyPage propertyId={propertyId} />
      </AppProvider>
    );
  }

  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <Login onSignupClick={() => setAuthView('signup')} />
        ) : (
          <Signup onLoginClick={() => setAuthView('login')} />
        )}
      </>
    );
  }

  // Admin Portal
  if (user.role === 'admin') {
    const renderAdminView = () => {
      switch (adminView.type) {
        case 'dashboard':
          return (
            <AdminDashboard
              onViewProfile={() => setAdminView({ type: 'profile' })}
            />
          );
        case 'profile':
          return (
            <AdminProfile
              onBack={() => setAdminView({ type: 'dashboard' })}
            />
          );
      }
    };

    return (
      <AppProvider>
        {renderAdminView()}
      </AppProvider>
    );
  }

  // Photographer Portal
  if (user.role === 'photographer') {
    const handleUploadComplete = (jobId: string, files: UploadedFile[]) => {
      // In production, this would update the job in the database
      // For now, we'll just update local state
      console.log('Files uploaded for job:', jobId, files);
    };

    const renderPhotographerView = () => {
      switch (photographerView.type) {
        case 'dashboard':
          return (
            <PhotographerDashboard
              onViewProfile={() => setPhotographerView({ type: 'profile' })}
              onUploadFiles={(job) => setPhotographerView({ type: 'upload', job })}
            />
          );
        case 'profile':
          return (
            <PhotographerProfile
              onBack={() => setPhotographerView({ type: 'dashboard' })}
            />
          );
        case 'upload':
          return (
            <JobUpload
              job={photographerView.job}
              onBack={() => setPhotographerView({ type: 'dashboard' })}
              onUploadComplete={handleUploadComplete}
            />
          );
      }
    };

    return renderPhotographerView();
  }

  // Broker Portal
  const renderBrokerView = () => {
    switch (brokerView.type) {
      case 'dashboard':
        return (
          <Dashboard
            onAddProperty={() => setBrokerView({ type: 'add-property' })}
            onCreateJob={() => setBrokerView({ type: 'create-job' })}
            onViewProperty={(id) => setBrokerView({ type: 'property-detail', propertyId: id })}
            onViewDelivery={(id) => setBrokerView({ type: 'delivery', propertyId: id })}
            onViewProfile={() => setBrokerView({ type: 'profile' })}
          />
        );
      case 'add-property':
        return (
          <AddPropertyForm
            onBack={() => setBrokerView({ type: 'dashboard' })}
            onSuccess={(propertyId) => setBrokerView({ type: 'property-detail', propertyId })}
          />
        );
      case 'create-job':
        return (
          <CreateJobForm
            onBack={() => setBrokerView({ type: 'dashboard' })}
            onSuccess={(propertyId) => setBrokerView({ type: 'property-detail', propertyId })}
          />
        );
      case 'property-detail':
        return (
          <PropertyDetail
            propertyId={brokerView.propertyId}
            onBack={() => setBrokerView({ type: 'dashboard' })}
          />
        );
      case 'delivery':
        return (
          <DeliveryPage
            propertyId={brokerView.propertyId}
            onBack={() => setBrokerView({ type: 'dashboard' })}
          />
        );
      case 'profile':
        return (
          <Profile
            onBack={() => setBrokerView({ type: 'dashboard' })}
          />
        );
    }
  };

  return (
    <AppProvider>
      {renderBrokerView()}
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
