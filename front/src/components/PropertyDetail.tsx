import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { availableServices, addonServices, photographers } from '../lib/mockData';
import { PropertyService, Media } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScheduleView } from './ScheduleView';
import { PropertyLandingPage } from './PropertyLandingPage';
import { ArrowLeft, MapPin, Home, Calendar, DollarSign, Check, Plus, Eye, Link2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as Icons from 'lucide-react';

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId, onBack }) => {
  const {
    getPropertyById,
    getServicesByPropertyId,
    getOrdersByPropertyId,
    addServiceToProperty,
    updatePropertyService,
    createOrder,
    updateProperty,
  } = useApp();

  const property = getPropertyById(propertyId);
  const propertyServices = getServicesByPropertyId(propertyId);
  const orders = getOrdersByPropertyId(propertyId);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [currentServiceForAddons, setCurrentServiceForAddons] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<{ [serviceId: string]: string[] }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'luxury' | 'classic'>(
    property.landingPageTemplate || 'modern'
  );
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  if (!property) {
    return <div>Property not found</div>;
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
  ];

  const publicUrl = `${window.location.origin}/property/${property.id}`;

  const handleCopyLink = async () => {
    // Try modern Clipboard API first
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      // Fallback to older method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = publicUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          toast.success('Link copied to clipboard!');
        } else {
          toast.error('Unable to copy link');
        }
      } catch (error) {
        toast.error('Unable to copy link');
      }
    }
  };

  const handleSaveTemplate = () => {
    updateProperty(property.id, { landingPageTemplate: selectedTemplate });
    toast.success('Landing page template updated!');
  };

  const handleServiceToggle = (serviceId: string) => {
    const isCurrentlySelected = selectedServices.includes(serviceId);
    
    if (isCurrentlySelected) {
      // Deselecting - remove service and its addons
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
      setSelectedAddons((prev) => {
        const newAddons = { ...prev };
        delete newAddons[serviceId];
        return newAddons;
      });
    } else {
      // Selecting - add service
      setSelectedServices((prev) => [...prev, serviceId]);
      
      // Check if service has applicable addons and open dialog
      const applicableAddons = getApplicableAddons(serviceId);
      if (applicableAddons.length > 0) {
        setCurrentServiceForAddons(serviceId);
        setAddonDialogOpen(true);
      }
    }
  };

  const handleAddServices = () => {
    selectedServices.forEach((serviceId) => {
      const newService: PropertyService = {
        propertyId: property.id,
        serviceId,
        scheduledDate: scheduleDate ? new Date(scheduleDate) : undefined,
        scheduledTime: scheduleTime || undefined,
        status: 'pending',
        addonIds: selectedAddons[serviceId] || [],
      };
      addServiceToProperty(newService);
    });
    setSelectedServices([]);
    setSelectedAddons({});
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleOpenAddonDialog = (serviceId: string) => {
    setCurrentServiceForAddons(serviceId);
    setAddonDialogOpen(true);
  };

  const handleToggleAddon = (serviceId: string, addonId: string) => {
    setSelectedAddons((prev) => {
      const currentAddons = prev[serviceId] || [];
      const newAddons = currentAddons.includes(addonId)
        ? currentAddons.filter((id) => id !== addonId)
        : [...currentAddons, addonId];
      return { ...prev, [serviceId]: newAddons };
    });
  };

  const getApplicableAddons = (serviceId: string) => {
    return addonServices.filter((addon) => addon.applicableServices.includes(serviceId));
  };

  const calculateServiceTotal = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    const addons = selectedAddons[serviceId] || [];
    const addonTotal = addons.reduce((sum, addonId) => {
      const addon = addonServices.find((a) => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return (service?.price || 0) + addonTotal;
  };

  const handleCreateInvoice = () => {
    const selectedServicesData = propertyServices
      .filter((ps) => selectedServices.includes(ps.serviceId))
      .map((ps) => ps);

    const total = selectedServicesData.reduce((sum, ps) => {
      const service = availableServices.find((s) => s.id === ps.serviceId);
      const serviceAddons = (ps.addonIds || [])
        .map((addonId) => addonServices.find((a) => a.id === addonId))
        .filter(Boolean);
      const addonTotal = serviceAddons.reduce((addonSum, addon) => addonSum + (addon?.price || 0), 0);
      return sum + (service?.price || 0) + addonTotal;
    }, 0);

    // Calculate unique travel fees (one per photographer)
    const photographerMap = new Map<string, number>();
    selectedServicesData.forEach((ps) => {
      if (ps.photographerId) {
        const photographer = photographers.find((p) => p.id === ps.photographerId);
        if (photographer && !photographerMap.has(photographer.id)) {
          photographerMap.set(photographer.id, photographer.travelFee);
        }
      }
    });

    const travelFees = Array.from(photographerMap.entries()).map(([photographerId, fee]) => ({
      photographerId,
      fee,
    }));

    const totalTravelFees = travelFees.reduce((sum, tf) => sum + tf.fee, 0);

    const newOrder = {
      id: `o${Date.now()}`,
      propertyId: property.id,
      services: selectedServicesData,
      totalAmount: total + totalTravelFees,
      travelFees,
      status: 'pending' as const,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    createOrder(newOrder);
    setSelectedServices([]);
  };

  const totalOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Property Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1>{property.address}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{property.city}, {property.state} {property.zipCode}</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                {property.bedrooms && (
                  <span className="text-gray-600">{property.bedrooms} bed</span>
                )}
                {property.bathrooms && (
                  <span className="text-gray-600">{property.bathrooms} bath</span>
                )}
                {property.squareFeet && (
                  <span className="text-gray-600">{property.squareFeet.toLocaleString()} sq ft</span>
                )}
              </div>
            </div>
            <Badge className={property.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
              {property.status}
            </Badge>
          </div>
        </Card>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="orders">Orders & Invoices</TabsTrigger>
            <TabsTrigger value="landing-page">Landing Page</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4">Add Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableServices.map((service) => {
                  const IconComponent = Icons[service.icon as keyof typeof Icons] as React.FC<{ className?: string }>;
                  const isAdded = propertyServices.some((ps) => ps.serviceId === service.id);
                  const isSelected = selectedServices.includes(service.id);
                  const applicableAddons = getApplicableAddons(service.id);
                  const serviceAddons = selectedAddons[service.id] || [];

                  return (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => !isAdded && handleServiceToggle(service.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isAdded}
                          onCheckedChange={() => !isAdded && handleServiceToggle(service.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {IconComponent && <IconComponent className="w-5 h-5 text-blue-600" />}
                            <h3>{service.name}</h3>
                            {isAdded && (
                              <Badge variant="outline" className="gap-1">
                                <Check className="w-3 h-3" />
                                Added
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{service.description}</p>
                          <p className="mt-2">
                            ${isSelected ? calculateServiceTotal(service.id) : service.price}
                            {isSelected && serviceAddons.length > 0 && (
                              <span className="text-gray-600"> (incl. {serviceAddons.length} addon{serviceAddons.length > 1 ? 's' : ''})</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Add-ons button */}
                      {isSelected && applicableAddons.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddonDialog(service.id);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Add-ons ({serviceAddons.length}/{applicableAddons.length})
                          </Button>
                          {serviceAddons.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {serviceAddons.map((addonId) => {
                                const addon = addonServices.find((a) => a.id === addonId);
                                return addon ? (
                                  <Badge key={addonId} variant="secondary" className="text-xs">
                                    {addon.name} (+${addon.price})
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{selectedServices.length} service(s) selected</p>
                      <p className="mt-1">
                        Total: ${selectedServices.reduce((sum, id) => {
                          return sum + calculateServiceTotal(id);
                        }, 0)}
                      </p>
                    </div>
                    <Button onClick={handleAddServices}>Add to Property</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Current Services */}
            {propertyServices.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4">Current Services</h2>
                <div className="space-y-3">
                  {propertyServices.map((ps) => {
                    const service = availableServices.find((s) => s.id === ps.serviceId);
                    if (!service) return null;

                    const serviceAddons = (ps.addonIds || [])
                      .map((addonId) => addonServices.find((a) => a.id === addonId))
                      .filter(Boolean);
                    const addonTotal = serviceAddons.reduce((sum, addon) => sum + (addon?.price || 0), 0);

                    return (
                      <div key={ps.serviceId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h3>{service.name}</h3>
                            <p className="text-gray-600">
                              ${service.price}
                              {addonTotal > 0 && (
                                <span> + ${addonTotal} (add-ons) = ${service.price + addonTotal}</span>
                              )}
                            </p>
                          </div>
                          <Badge className={ps.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {ps.status}
                          </Badge>
                        </div>
                        {serviceAddons.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-gray-600 mb-2">Add-ons:</p>
                            <div className="flex flex-wrap gap-1">
                              {serviceAddons.map((addon) => (
                                <Badge key={addon!.id} variant="secondary" className="text-xs">
                                  {addon!.name} (+${addon!.price})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <ScheduleView
              propertyServices={propertyServices}
              onUpdateService={updatePropertyService}
              propertyId={property.id}
              onCheckout={(scheduledServices) => {
                // Calculate order total
                const total = scheduledServices.reduce((sum, ps) => {
                  const service = availableServices.find((s) => s.id === ps.serviceId);
                  const serviceAddons = (ps.addonIds || [])
                    .map((addonId) => addonServices.find((a) => a.id === addonId))
                    .filter(Boolean);
                  const addonTotal = serviceAddons.reduce((addonSum, addon) => addonSum + (addon?.price || 0), 0);
                  return sum + (service?.price || 0) + addonTotal;
                }, 0);

                // Calculate travel fees
                const photographerMap = new Map<string, number>();
                scheduledServices.forEach((ps) => {
                  if (ps.photographerId) {
                    const photographer = photographers.find((p) => p.id === ps.photographerId);
                    if (photographer && !photographerMap.has(photographer.id)) {
                      photographerMap.set(photographer.id, photographer.travelFee);
                    }
                  }
                });

                const travelFees = Array.from(photographerMap.entries()).map(([photographerId, fee]) => ({
                  photographerId,
                  fee,
                }));

                const totalTravelFees = travelFees.reduce((sum, tf) => sum + tf.fee, 0);

                // Create order
                const newOrder = {
                  id: `o${Date.now()}`,
                  propertyId: property.id,
                  services: scheduledServices,
                  totalAmount: total + totalTravelFees,
                  travelFees,
                  status: 'pending' as const,
                  createdAt: new Date(),
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                };

                createOrder(newOrder);
                updateProperty(property.id, { status: 'scheduled' });
              }}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2>Orders & Invoices</h2>
                {propertyServices.length > 0 && (
                  <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                )}
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3>Order #{order.id}</h3>
                          <p className="text-gray-600 mt-1">
                            Created: {order.createdAt.toLocaleDateString()}
                          </p>
                          {order.dueDate && (
                            <p className="text-gray-600">
                              Due: {order.dueDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge className={order.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {order.status}
                        </Badge>
                      </div>

                      {order.travelFees && order.travelFees.length > 0 && (
                        <div className="mb-4 pb-4 border-b">
                          <p className="text-gray-600 mb-2">Travel Fees:</p>
                          {order.travelFees.map((tf) => {
                            const photographer = photographers.find((p) => p.id === tf.photographerId);
                            return photographer ? (
                              <div key={tf.photographerId} className="flex justify-between text-gray-700">
                                <span>{photographer.name}</span>
                                <span>${tf.fee}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-2xl">${order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span>Total Revenue</span>
                      <span className="text-2xl">${totalOrderAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No orders created yet</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Landing Page Tab */}
          <TabsContent value="landing-page">
            <div className="space-y-6">
              {/* Public URL */}
              <Card className="p-6">
                <h2 className="mb-4">Public Property Page</h2>
                <p className="text-gray-600 mb-4">
                  Share this link with potential buyers to showcase your property
                </p>
                <div className="flex gap-2">
                  <Input
                    value={publicUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyLink} className="gap-2 shrink-0">
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => window.open(publicUrl, '_blank')}
                    variant="outline"
                    className="gap-2 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </Button>
                </div>
              </Card>

              {/* Template Selection */}
              <Card className="p-6">
                <h2 className="mb-4">Choose Landing Page Template</h2>
                <p className="text-gray-600 mb-6">
                  Select a template that best showcases your property
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Modern Template */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedTemplate === 'modern'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate('modern')}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="mb-1">Modern</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Clean and minimalist design with focus on photos
                    </p>
                    {selectedTemplate === 'modern' && (
                      <Badge className="bg-blue-500">Selected</Badge>
                    )}
                  </div>

                  {/* Luxury Template */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedTemplate === 'luxury'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate('luxury')}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded mb-3 flex items-center justify-center">
                      <Home className="w-12 h-12 text-white/40" />
                    </div>
                    <h3 className="mb-1">Luxury</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Elegant premium design for high-end properties
                    </p>
                    {selectedTemplate === 'luxury' && (
                      <Badge className="bg-blue-500">Selected</Badge>
                    )}
                  </div>

                  {/* Classic Template */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedTemplate === 'classic'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate('classic')}
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 rounded mb-3 flex items-center justify-center border border-gray-200">
                      <Home className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="mb-1">Classic</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Traditional layout with detailed information
                    </p>
                    {selectedTemplate === 'classic' && (
                      <Badge className="bg-blue-500">Selected</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} className="gap-2">
                    <Check className="w-4 h-4" />
                    Save Template
                  </Button>
                  <Button
                    onClick={() => setShowTemplatePreview(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Template
                  </Button>
                </div>
              </Card>

              {/* Property Information for Landing Page */}
              <Card className="p-6">
                <h2 className="mb-4">Landing Page Information</h2>
                <p className="text-gray-600 mb-6">
                  Update property details to be displayed on the landing page
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">Listing Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price"
                      value={property.price || ''}
                      onChange={(e) =>
                        updateProperty(property.id, {
                          price: parseFloat(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Property Description</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-32 p-3 border rounded-lg"
                      placeholder="Describe this beautiful property..."
                      value={property.description || ''}
                      onChange={(e) =>
                        updateProperty(property.id, { description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        placeholder="e.g., 2020"
                        value={property.yearBuilt || ''}
                        onChange={(e) =>
                          updateProperty(property.id, {
                            yearBuilt: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lotSize">Lot Size (sqft)</Label>
                      <Input
                        id="lotSize"
                        type="number"
                        placeholder="e.g., 5000"
                        value={property.lotSize || ''}
                        onChange={(e) =>
                          updateProperty(property.id, {
                            lotSize: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="features">Property Features</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Enter features separated by commas (e.g., Pool, Garage, Garden)
                    </p>
                    <Input
                      id="features"
                      placeholder="Pool, Garage, Garden, Hardwood Floors"
                      value={(property.features || []).join(', ')}
                      onChange={(e) => {
                        const features = e.target.value
                          .split(',')
                          .map((f) => f.trim())
                          .filter(Boolean);
                        updateProperty(property.id, { features });
                      }}
                    />
                  </div>

                  <Button onClick={() => toast.success('Property information updated!')}>
                    <Check className="w-4 h-4 mr-2" />
                    Save Information
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add-ons Dialog */}
        <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add-ons for {currentServiceForAddons && availableServices.find((s) => s.id === currentServiceForAddons)?.name}
              </DialogTitle>
              <DialogDescription>
                Select optional add-ons to enhance this service (optional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {currentServiceForAddons &&
                getApplicableAddons(currentServiceForAddons).map((addon) => {
                  const isSelected = (selectedAddons[currentServiceForAddons] || []).includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleAddon(currentServiceForAddons, addon.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleAddon(currentServiceForAddons, addon.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3>{addon.name}</h3>
                            <span>+${addon.price}</span>
                          </div>
                          <p className="text-gray-600">{addon.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-gray-600">
                  {currentServiceForAddons && (selectedAddons[currentServiceForAddons] || []).length} add-on(s) selected
                </p>
                {currentServiceForAddons && (selectedAddons[currentServiceForAddons] || []).length > 0 && (
                  <p className="mt-1">
                    Additional: ${(selectedAddons[currentServiceForAddons] || []).reduce((sum, addonId) => {
                      const addon = addonServices.find((a) => a.id === addonId);
                      return sum + (addon?.price || 0);
                    }, 0)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAddonDialogOpen(false)}>Skip</Button>
                <Button onClick={() => setAddonDialogOpen(false)}>Continue</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
          <DialogContent className="max-w-[95vw] h-[90vh] p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Property Landing Page Preview</DialogTitle>
              <DialogDescription>
                Preview of the {selectedTemplate} template for this property
              </DialogDescription>
            </DialogHeader>
            <div className="h-full overflow-auto">
              <PropertyLandingPage
                property={property}
                media={mockMedia}
                template={selectedTemplate}
                agentName="John Doe"
                agentEmail="john@luxuryrealty.com"
                agentPhone="(305) 555-0100"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
