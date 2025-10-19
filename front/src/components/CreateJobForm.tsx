import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Property, PropertyService, Order } from '../types';
import { availableServices, addonServices, photographers } from '../lib/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Camera, 
  Video, 
  Box, 
  Plane, 
  Sunset,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MapPin,
  User,
  Building,
  Check,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

interface CreateJobFormProps {
  onBack: () => void;
  onSuccess: (propertyId: string) => void;
}

const iconMap: { [key: string]: any } = {
  Camera,
  Video,
  Box,
  Plane,
  Sunset,
};

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export const CreateJobForm: React.FC<CreateJobFormProps> = ({ onBack, onSuccess }) => {
  const { properties, customers, addProperty, createOrder, addServiceToProperty, updateProperty } = useApp();
  const [step, setStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [propertyMode, setPropertyMode] = useState<'existing' | 'new'>('new');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  // Property form data
  const [propertyData, setPropertyData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'house' as Property['propertyType'],
    squareFeet: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    lotSize: '',
    price: '',
    description: '',
  });

  // Service selection
  const [selectedServices, setSelectedServices] = useState<{
    serviceId: string;
    addonIds: string[];
  }[]>([]);
  const [currentAddonDialog, setCurrentAddonDialog] = useState<string | null>(null);

  // Photographer & Scheduling
  const [selectedPhotographerId, setSelectedPhotographerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedPhotographer = photographers.find(p => p.id === selectedPhotographerId);

  const handleServiceToggle = (serviceId: string) => {
    const isSelected = selectedServices.some(s => s.serviceId === serviceId);
    
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.serviceId !== serviceId));
    } else {
      // Show addon dialog when adding a service
      setCurrentAddonDialog(serviceId);
      setSelectedServices([...selectedServices, { serviceId, addonIds: [] }]);
    }
  };

  const handleAddonToggle = (serviceId: string, addonId: string) => {
    setSelectedServices(selectedServices.map(s => {
      if (s.serviceId === serviceId) {
        const hasAddon = s.addonIds.includes(addonId);
        return {
          ...s,
          addonIds: hasAddon 
            ? s.addonIds.filter(id => id !== addonId)
            : [...s.addonIds, addonId]
        };
      }
      return s;
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    selectedServices.forEach(({ serviceId, addonIds }) => {
      const service = availableServices.find(s => s.id === serviceId);
      if (service) total += service.price;
      
      addonIds.forEach(addonId => {
        const addon = addonServices.find(a => a.id === addonId);
        if (addon) total += addon.price;
      });
    });

    if (selectedPhotographer) {
      total += selectedPhotographer.travelFee;
    }

    return total;
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    let propertyId = selectedPropertyId;

    // Create new property if needed
    if (propertyMode === 'new') {
      propertyId = `p${Date.now()}`;
      const newProperty: Property = {
        id: propertyId,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zipCode: propertyData.zipCode,
        propertyType: propertyData.propertyType,
        squareFeet: propertyData.squareFeet ? parseInt(propertyData.squareFeet) : undefined,
        bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : undefined,
        bathrooms: propertyData.bathrooms ? parseFloat(propertyData.bathrooms) : undefined,
        yearBuilt: propertyData.yearBuilt ? parseInt(propertyData.yearBuilt) : undefined,
        lotSize: propertyData.lotSize ? parseInt(propertyData.lotSize) : undefined,
        price: propertyData.price ? parseFloat(propertyData.price) : undefined,
        description: propertyData.description || undefined,
        createdAt: new Date(),
        status: 'scheduled',
      };
      addProperty(newProperty);
    } else {
      // Update existing property status
      updateProperty(propertyId, { status: 'scheduled' });
    }

    // Create property services
    const propertyServices: PropertyService[] = selectedServices.map(({ serviceId, addonIds }) => ({
      propertyId,
      serviceId,
      photographerId: selectedPhotographerId,
      scheduledDate,
      scheduledTime,
      status: 'scheduled' as const,
      notes,
      addonIds,
    }));

    propertyServices.forEach(service => {
      addServiceToProperty(service);
    });

    // Create order
    const order: Order = {
      id: `o${Date.now()}`,
      propertyId,
      customerId: selectedCustomerId,
      services: propertyServices,
      totalAmount: calculateTotal(),
      travelFees: selectedPhotographer ? [{ 
        photographerId: selectedPhotographerId, 
        fee: selectedPhotographer.travelFee 
      }] : [],
      status: 'pending',
      createdAt: new Date(),
      dueDate: scheduledDate,
    };

    createOrder(order);
    
    // Show success message
    toast.success('Job Created Successfully', {
      description: `Job has been scheduled for ${format(scheduledDate!, 'PPP')} at ${scheduledTime}`,
    });
    
    onSuccess(propertyId);
  };

  const getApplicableAddons = (serviceId: string) => {
    return addonServices.filter(addon => addon.applicableServices.includes(serviceId));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return selectedCustomerId !== '';
      case 2:
        if (propertyMode === 'existing') {
          return selectedPropertyId !== '';
        }
        return propertyData.address && propertyData.city && propertyData.state && propertyData.zipCode;
      case 3:
        return selectedServices.length > 0;
      case 4:
        return selectedPhotographerId && scheduledDate && scheduledTime;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Client', 'Property', 'Services', 'Schedule', 'Review'].map((label, idx) => (
              <div key={label} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${idx < 4 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > idx + 1 ? 'bg-green-500 text-white' :
                    step === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`hidden md:block ${
                    step === idx + 1 ? '' : 'text-gray-600'
                  }`}>{label}</span>
                </div>
                {idx < 4 && (
                  <div className={`h-1 flex-1 mx-2 ${
                    step > idx + 1 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8">
          {/* Step 1: Select Client */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Select Client</h2>
                <p className="text-gray-600">Choose the client for this job</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customers.map((customer) => (
                  <Card
                    key={customer.id}
                    className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                      selectedCustomerId === customer.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={customer.avatar} alt={customer.name} />
                        <AvatarFallback>
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p>{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.company}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                      {selectedCustomerId === customer.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Property Information</h2>
                <p className="text-gray-600">Add property details</p>
              </div>

              {/* Property Mode Selection */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={propertyMode === 'new' ? 'default' : 'outline'}
                  onClick={() => {
                    setPropertyMode('new');
                    setSelectedPropertyId('');
                  }}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Property
                </Button>
                <Button
                  type="button"
                  variant={propertyMode === 'existing' ? 'default' : 'outline'}
                  onClick={() => {
                    setPropertyMode('existing');
                    setPropertyData({
                      address: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      propertyType: 'house',
                      squareFeet: '',
                      bedrooms: '',
                      bathrooms: '',
                      yearBuilt: '',
                      lotSize: '',
                      price: '',
                      description: '',
                    });
                  }}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Existing Property
                </Button>
              </div>

              {propertyMode === 'existing' ? (
                <div className="space-y-4">
                  <Label>Select Property</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {properties.map((property) => (
                      <Card
                        key={property.id}
                        className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                          selectedPropertyId === property.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedPropertyId(property.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p>{property.address}</p>
                            <p className="text-sm text-gray-600">
                              {property.city}, {property.state} {property.zipCode}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {property.bedrooms && (
                                <Badge variant="secondary">{property.bedrooms} beds</Badge>
                              )}
                              {property.bathrooms && (
                                <Badge variant="secondary">{property.bathrooms} baths</Badge>
                              )}
                              {property.squareFeet && (
                                <Badge variant="secondary">{property.squareFeet} sq ft</Badge>
                              )}
                            </div>
                          </div>
                          {selectedPropertyId === property.id && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <Label htmlFor="address">Property Address *</Label>
                    <Input
                      id="address"
                      value={propertyData.address}
                      onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={propertyData.city}
                        onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                        placeholder="Miami"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={propertyData.state}
                        onChange={(e) => setPropertyData({ ...propertyData, state: e.target.value })}
                        placeholder="FL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={propertyData.zipCode}
                        onChange={(e) => setPropertyData({ ...propertyData, zipCode: e.target.value })}
                        placeholder="33139"
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={propertyData.propertyType}
                      onValueChange={(value) =>
                        setPropertyData({ ...propertyData, propertyType: value as Property['propertyType'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={propertyData.bedrooms}
                        onChange={(e) => setPropertyData({ ...propertyData, bedrooms: e.target.value })}
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        step="0.5"
                        value={propertyData.bathrooms}
                        onChange={(e) => setPropertyData({ ...propertyData, bathrooms: e.target.value })}
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="squareFeet">Square Feet</Label>
                      <Input
                        id="squareFeet"
                        type="number"
                        value={propertyData.squareFeet}
                        onChange={(e) => setPropertyData({ ...propertyData, squareFeet: e.target.value })}
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        value={propertyData.yearBuilt}
                        onChange={(e) => setPropertyData({ ...propertyData, yearBuilt: e.target.value })}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
                      <Input
                        id="lotSize"
                        type="number"
                        value={propertyData.lotSize}
                        onChange={(e) => setPropertyData({ ...propertyData, lotSize: e.target.value })}
                        placeholder="8500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={propertyData.price}
                        onChange={(e) => setPropertyData({ ...propertyData, price: e.target.value })}
                        placeholder="450000"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={propertyData.description}
                      onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                      placeholder="Property description..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Services */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Select Services</h2>
                <p className="text-gray-600">Choose the services you need for this property</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableServices.map((service) => {
                  const Icon = iconMap[service.icon] || Camera;
                  const isSelected = selectedServices.some(s => s.serviceId === service.id);
                  const selectedService = selectedServices.find(s => s.serviceId === service.id);
                  const applicableAddons = getApplicableAddons(service.id);

                  return (
                    <Card
                      key={service.id}
                      className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p>{service.name}</p>
                              <p className="text-sm text-gray-600">{service.description}</p>
                              <p className="text-blue-600 mt-1">${service.price}</p>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-blue-500" />}
                          </div>
                          
                          {isSelected && selectedService && applicableAddons.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm mb-2">
                                {selectedService.addonIds.length} addon(s) selected
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentAddonDialog(service.id);
                                }}
                              >
                                Manage Addons
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Schedule & Photographer */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Schedule & Photographer</h2>
                <p className="text-gray-600">Select a photographer and schedule the shoot</p>
              </div>

              {/* Photographer Selection */}
              <div>
                <Label>Select Photographer</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {photographers.map((photographer) => {
                    const canDoServices = selectedServices.every(({ serviceId }) => {
                      const service = availableServices.find(s => s.id === serviceId);
                      return service && photographer.specialties.includes(service.name);
                    });

                    return (
                      <Card
                        key={photographer.id}
                        className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                          selectedPhotographerId === photographer.id ? 'border-blue-500 bg-blue-50' : ''
                        } ${!canDoServices ? 'opacity-50' : ''}`}
                        onClick={() => canDoServices && setSelectedPhotographerId(photographer.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={photographer.avatar} alt={photographer.name} />
                            <AvatarFallback>
                              {photographer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p>{photographer.name}</p>
                              <Badge variant="secondary">★ {photographer.rating}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{photographer.completedJobs} jobs completed</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {photographer.specialties.map(specialty => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-blue-600 mt-1">
                              Travel Fee: ${photographer.travelFee}
                            </p>
                          </div>
                          {selectedPhotographerId === photographer.id && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection */}
              {selectedPhotographer && (
                <div>
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-2">
                        <CalendarIcon className="mr-2 w-4 h-4" />
                        {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => {
                          const dateStr = date.toDateString();
                          return !selectedPhotographer.availableDates.some(
                            d => d.toDateString() === dateStr
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-600 mt-1">
                    Only dates when {selectedPhotographer.name} is available are selectable
                  </p>
                </div>
              )}

              {/* Time Selection */}
              {scheduledDate && (
                <div>
                  <Label>Select Time</Label>
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for the photographer..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Review Job</h2>
                <p className="text-gray-600">Review all details before creating the job</p>
              </div>

              {/* Client Info */}
              {selectedCustomer && (
                <div>
                  <h3 className="mb-3">Client</h3>
                  <Card className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                        <AvatarFallback>
                          {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.company}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Property Info */}
              <div>
                <h3 className="mb-3">Property</h3>
                <Card className="p-4">
                  {propertyMode === 'existing' && selectedProperty ? (
                    <div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                        <div>
                          <p>{selectedProperty.address}</p>
                          <p className="text-sm text-gray-600">
                            {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {selectedProperty.bedrooms && (
                          <Badge variant="secondary">{selectedProperty.bedrooms} beds</Badge>
                        )}
                        {selectedProperty.bathrooms && (
                          <Badge variant="secondary">{selectedProperty.bathrooms} baths</Badge>
                        )}
                        {selectedProperty.squareFeet && (
                          <Badge variant="secondary">{selectedProperty.squareFeet} sq ft</Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                        <div>
                          <p>{propertyData.address}</p>
                          <p className="text-sm text-gray-600">
                            {propertyData.city}, {propertyData.state} {propertyData.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="secondary">{propertyData.propertyType}</Badge>
                        {propertyData.bedrooms && (
                          <Badge variant="secondary">{propertyData.bedrooms} beds</Badge>
                        )}
                        {propertyData.bathrooms && (
                          <Badge variant="secondary">{propertyData.bathrooms} baths</Badge>
                        )}
                        {propertyData.squareFeet && (
                          <Badge variant="secondary">{propertyData.squareFeet} sq ft</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Services */}
              <div>
                <h3 className="mb-3">Services</h3>
                <Card className="p-4 space-y-3">
                  {selectedServices.map(({ serviceId, addonIds }) => {
                    const service = availableServices.find(s => s.id === serviceId);
                    if (!service) return null;

                    return (
                      <div key={serviceId} className="pb-3 border-b last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p>{service.name}</p>
                            {addonIds.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {addonIds.map(addonId => {
                                  const addon = addonServices.find(a => a.id === addonId);
                                  return addon ? (
                                    <p key={addonId} className="text-sm text-gray-600 ml-4">
                                      + {addon.name}
                                    </p>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p>${service.price}</p>
                            {addonIds.map(addonId => {
                              const addon = addonServices.find(a => a.id === addonId);
                              return addon ? (
                                <p key={addonId} className="text-sm text-gray-600">
                                  +${addon.price}
                                </p>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>

              {/* Photographer & Schedule */}
              {selectedPhotographer && scheduledDate && scheduledTime && (
                <div>
                  <h3 className="mb-3">Schedule</h3>
                  <Card className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedPhotographer.avatar} alt={selectedPhotographer.name} />
                        <AvatarFallback>
                          {selectedPhotographer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{selectedPhotographer.name}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Badge variant="secondary">★ {selectedPhotographer.rating}</Badge>
                          <span>• {selectedPhotographer.completedJobs} jobs</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span>{format(scheduledDate, 'PPPP')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>Travel Fee: ${selectedPhotographer.travelFee}</span>
                      </div>
                    </div>
                    {notes && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <p className="text-sm mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-600">{notes}</p>
                        </div>
                      </>
                    )}
                  </Card>
                </div>
              )}

              {/* Total */}
              <div>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p>Total Amount</p>
                      <p className="text-sm text-gray-600">
                        Including services, addons, and travel fee
                      </p>
                    </div>
                    <p className="text-blue-600">${calculateTotal()}</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t mt-8">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 5 ? (
              <Button 
                type="button" 
                className="flex-1" 
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="button" 
                className="flex-1" 
                onClick={handleSubmit}
              >
                Create Job
              </Button>
            )}
          </div>
        </Card>

        {/* Addon Dialog */}
        <Dialog open={currentAddonDialog !== null} onOpenChange={(open) => !open && setCurrentAddonDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add-on Services</DialogTitle>
              <DialogDescription>
                Select additional services to enhance your order
              </DialogDescription>
            </DialogHeader>
            {currentAddonDialog && (
              <div className="space-y-3">
                {getApplicableAddons(currentAddonDialog).map((addon) => {
                  const selectedService = selectedServices.find(s => s.serviceId === currentAddonDialog);
                  const isSelected = selectedService?.addonIds.includes(addon.id);

                  return (
                    <Card
                      key={addon.id}
                      className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleAddonToggle(currentAddonDialog, addon.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p>{addon.name}</p>
                            {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                          <p className="text-blue-600 mt-2">+${addon.price}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            <Button onClick={() => setCurrentAddonDialog(null)} className="w-full">
              Done
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
