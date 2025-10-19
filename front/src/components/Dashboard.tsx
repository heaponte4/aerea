import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Home, MapPin, Calendar, DollarSign, User, LogOut, Briefcase } from 'lucide-react';

interface DashboardProps {
  onAddProperty: () => void;
  onCreateJob: () => void;
  onViewProperty: (id: string) => void;
  onViewDelivery: (id: string) => void;
  onViewProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAddProperty,
  onCreateJob,
  onViewProperty,
  onViewDelivery,
  onViewProfile,
}) => {
  const { properties, orders, getServicesByPropertyId } = useApp();
  const { user, logout } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'scheduled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedProperties = properties.filter((p) => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Real Estate Media Portal</h1>
            <p className="text-gray-600 mt-1">Manage your property media projects</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={onCreateJob} variant="default" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Create Job
            </Button>
            <Button onClick={onAddProperty} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              New Property
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p>{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onViewProfile}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Properties</p>
                <p className="text-2xl mt-1">{properties.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Completed</p>
                <p className="text-2xl mt-1">{completedProperties}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-2xl mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Properties List */}
        <div className="mb-6">
          <h2>Properties</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const services = getServicesByPropertyId(property.id);
            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3>{property.address}</h3>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.city}, {property.state}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {property.propertyType && (
                      <p className="text-gray-600">
                        Type: <span className="text-gray-900 capitalize">{property.propertyType}</span>
                      </p>
                    )}
                    {property.bedrooms && property.bathrooms && (
                      <p className="text-gray-600">
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </p>
                    )}
                    <p className="text-gray-600">
                      Services: <span className="text-gray-900">{services.length}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => onViewProperty(property.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      Manage
                    </Button>
                    {property.status === 'completed' && (
                      <Button
                        onClick={() => onViewDelivery(property.id)}
                        className="flex-1"
                      >
                        View Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {properties.length === 0 && (
          <Card className="p-12 text-center">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first property</p>
            <Button onClick={onAddProperty}>Add Property</Button>
          </Card>
        )}
      </div>
    </div>
  );
};
