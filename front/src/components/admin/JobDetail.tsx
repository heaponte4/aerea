import React, { useState } from 'react';
import { PhotographerJob } from '../../lib/photographerMockData';
import { photographerPayments } from '../../lib/photographerMockData';
import { photographers, availableServices } from '../../lib/mockData';
import { useApp } from '../../contexts/AppContext';
import { Order, PropertyService } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  DollarSign,
  MapPin,
  User,
  Trash2,
  AlertTriangle,
  Camera,
  Clock,
  Plus,
  Minus,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface JobDetailProps {
  jobId: string | 'new';
  jobs: PhotographerJob[];
  onBack: () => void;
  onSave: (job: PhotographerJob) => void;
  onDelete?: (jobId: string) => void;
  onViewInvoice?: (orderId: string) => void;
}

const SERVICE_TYPES = [
  'Photography',
  'Videography',
  '3D Scanning',
  'Drone',
  'Twilight Photos',
  'Virtual Staging',
  'Floor Plan',
];

const STATUS_OPTIONS: Array<'upcoming' | 'in-progress' | 'completed' | 'cancelled'> = [
  'upcoming',
  'in-progress',
  'completed',
  'cancelled',
];

const ADDON_OPTIONS = [
  { name: 'Virtual Staging', price: 125 },
  { name: 'Floor Plan', price: 75 },
  { name: 'Advanced Editing', price: 80 },
  { name: 'Drone Video Clip', price: 100 },
  { name: 'Twilight Shots', price: 150 },
  { name: '360° Virtual Tour', price: 200 },
];

export const JobDetail: React.FC<JobDetailProps> = ({
  jobId,
  jobs,
  onBack,
  onSave,
  onDelete,
  onViewInvoice,
}) => {
  const { properties, addProperty, createOrder, orders, addServiceToProperty } = useApp();
  const isNewJob = jobId === 'new';
  const existingJob = isNewJob ? null : jobs.find((j) => j.id === jobId);

  const [isEditMode, setIsEditMode] = useState(isNewJob);
  const [editedJob, setEditedJob] = useState<PhotographerJob>(
    existingJob || {
      id: `job_${Date.now()}`,
      propertyAddress: '',
      propertyCity: '',
      propertyState: '',
      serviceType: 'Photography',
      scheduledDate: new Date(),
      scheduledTime: '10:00 AM',
      status: 'upcoming',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      servicePrice: 0,
      addons: [],
      notes: '',
    }
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    existingJob?.scheduledDate || new Date()
  );

  if (!isNewJob && !existingJob) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Job not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // Validate required fields
    if (
      !editedJob.propertyAddress ||
      !editedJob.clientName ||
      !editedJob.clientEmail ||
      !editedJob.servicePrice
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedJob.clientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate price
    if (editedJob.servicePrice < 0) {
      toast.error('Service price must be positive');
      return;
    }

    onSave({ ...editedJob, scheduledDate: selectedDate || new Date() });
    toast.success(isNewJob ? 'Job created successfully!' : 'Job updated successfully!');
    if (isNewJob) {
      onBack();
    } else {
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (isNewJob) {
      onBack();
    } else {
      setEditedJob(existingJob!);
      setSelectedDate(existingJob!.scheduledDate);
      setIsEditMode(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && !isNewJob) {
      onDelete(editedJob.id);
      toast.success('Job deleted successfully');
      onBack();
    }
  };

  const handleCreateInvoice = () => {
    // Check if invoice already exists for this job
    const existingOrder = orders.find(order => 
      order.services.some(service => 
        service.notes && service.notes.includes(editedJob.id)
      )
    );

    if (existingOrder) {
      toast.error('Invoice already exists for this job');
      if (onViewInvoice) {
        onViewInvoice(existingOrder.id);
      }
      return;
    }

    // Find or create property
    let propertyId = properties.find(p => 
      p.address === editedJob.propertyAddress && 
      p.city === editedJob.propertyCity &&
      p.state === editedJob.propertyState
    )?.id;

    // Create property if it doesn't exist
    if (!propertyId) {
      propertyId = `p${Date.now()}`;
      addProperty({
        id: propertyId,
        address: editedJob.propertyAddress,
        city: editedJob.propertyCity,
        state: editedJob.propertyState,
        zipCode: '',
        propertyType: 'house',
        createdAt: new Date(),
        status: editedJob.status === 'completed' ? 'completed' : 'in-progress',
      });
    }

    // Map job service type to service ID
    const serviceMapping: { [key: string]: string } = {
      'Photography': 'photo',
      'Videography': 'video',
      '3D Scanning': '3d-scan',
      'Drone': 'drone',
      'Twilight Photos': 'twilight',
    };

    const serviceId = serviceMapping[editedJob.serviceType] || 'photo';
    const service = availableServices.find(s => s.id === serviceId);

    // Create property service
    const propertyService: PropertyService = {
      propertyId,
      serviceId,
      scheduledDate: editedJob.scheduledDate,
      scheduledTime: editedJob.scheduledTime,
      status: editedJob.status === 'completed' ? 'completed' : 'scheduled',
      notes: `Created from job ${editedJob.id}`,
    };

    addServiceToProperty(propertyService);

    // Find photographer for travel fee
    const photographer = photographers.find(p => 
      p.specialties.some(s => s.toLowerCase().includes(editedJob.serviceType.toLowerCase()))
    );

    // Create order/invoice
    const orderId = `o${Date.now()}`;
    const order: Order = {
      id: orderId,
      propertyId,
      services: [propertyService],
      totalAmount: totalPrice + (photographer?.travelFee || 50),
      travelFees: photographer ? [{ photographerId: photographer.id, fee: photographer.travelFee }] : [],
      status: 'pending',
      createdAt: new Date(),
      dueDate: editedJob.scheduledDate,
    };

    createOrder(order);
    
    toast.success('Invoice created successfully!', {
      description: `Invoice #${orderId} has been created for this job.`,
    });

    if (onViewInvoice) {
      onViewInvoice(orderId);
    }
  };

  const updateField = (field: keyof PhotographerJob, value: any) => {
    setEditedJob({ ...editedJob, [field]: value });
  };

  const addAddon = (addon: { name: string; price: number }) => {
    if (!editedJob.addons.some((a) => a.name === addon.name)) {
      updateField('addons', [...editedJob.addons, addon]);
    }
  };

  const removeAddon = (addonName: string) => {
    updateField(
      'addons',
      editedJob.addons.filter((a) => a.name !== addonName)
    );
  };

  // Get related payment
  const relatedPayment = isNewJob
    ? null
    : photographerPayments.find((p) => p.jobId === editedJob.id);

  // Calculate total price
  const addonTotal = editedJob.addons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = editedJob.servicePrice + addonTotal;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Button>
          <div className="flex gap-2">
            {!isNewJob && !isEditMode && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Job
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this job and all associated data. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!isEditMode ? (
              <Button onClick={() => setIsEditMode(true)} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Job
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isNewJob ? 'Create Job' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="space-y-2">
                      <Label htmlFor="propertyAddress">
                        Property Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="propertyAddress"
                        value={editedJob.propertyAddress}
                        onChange={(e) => updateField('propertyAddress', e.target.value)}
                        placeholder="123 Ocean Drive"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="mb-2">{editedJob.propertyAddress}</h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {editedJob.propertyCity}, {editedJob.propertyState}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {!isEditMode && (
                  <Badge className={getStatusColor(editedJob.status)}>{editedJob.status}</Badge>
                )}
              </div>

              {isEditMode && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyCity">City</Label>
                      <Input
                        id="propertyCity"
                        value={editedJob.propertyCity}
                        onChange={(e) => updateField('propertyCity', e.target.value)}
                        placeholder="Miami Beach"
                      />
                    </div>
                    <div>
                      <Label htmlFor="propertyState">State</Label>
                      <Input
                        id="propertyState"
                        value={editedJob.propertyState}
                        onChange={(e) => updateField('propertyState', e.target.value)}
                        placeholder="FL"
                      />
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Service Information */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Service Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceType">
                      Service Type <span className="text-red-500">*</span>
                    </Label>
                    {isEditMode ? (
                      <Select
                        value={editedJob.serviceType}
                        onValueChange={(value) => updateField('serviceType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-700">{editedJob.serviceType}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="servicePrice">
                      Service Price ($) <span className="text-red-500">*</span>
                    </Label>
                    {isEditMode ? (
                      <Input
                        id="servicePrice"
                        type="number"
                        min="0"
                        value={editedJob.servicePrice}
                        onChange={(e) => updateField('servicePrice', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">${editedJob.servicePrice}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <Label>Add-ons</Label>
                  {isEditMode ? (
                    <div className="space-y-2 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {ADDON_OPTIONS.map((addon) => {
                          const isSelected = editedJob.addons.some((a) => a.name === addon.name);
                          return (
                            <Badge
                              key={addon.name}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                isSelected ? removeAddon(addon.name) : addAddon(addon)
                              }
                            >
                              {addon.name} (${addon.price})
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      {editedJob.addons.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editedJob.addons.map((addon, index) => (
                            <Badge key={index} variant="outline">
                              {addon.name} - ${addon.price}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No add-ons</p>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="text-2xl">${totalPrice}</span>
                </div>
              </div>
            </Card>

            {/* Schedule */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Schedule
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Scheduled Date</Label>
                    {isEditMode ? (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border mt-2"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">
                          {editedJob.scheduledDate
                            ? editedJob.scheduledDate.toLocaleDateString()
                            : 'Not set'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="scheduledTime">Time</Label>
                    {isEditMode ? (
                      <Input
                        id="scheduledTime"
                        value={editedJob.scheduledTime}
                        onChange={(e) => updateField('scheduledTime', e.target.value)}
                        placeholder="10:00 AM"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedJob.scheduledTime}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isEditMode && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editedJob.status}
                      onValueChange={(value: any) => updateField('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>

            {/* Client Information */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientName">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <Input
                      id="clientName"
                      value={editedJob.clientName}
                      onChange={(e) => updateField('clientName', e.target.value)}
                      placeholder="John Doe"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{editedJob.clientName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientEmail">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    {isEditMode ? (
                      <Input
                        id="clientEmail"
                        type="email"
                        value={editedJob.clientEmail}
                        onChange={(e) => updateField('clientEmail', e.target.value)}
                        placeholder="john@example.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedJob.clientEmail}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    {isEditMode ? (
                      <Input
                        id="clientPhone"
                        value={editedJob.clientPhone}
                        onChange={(e) => updateField('clientPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedJob.clientPhone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </h3>
              {isEditMode ? (
                <Textarea
                  value={editedJob.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add any special instructions or notes..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{editedJob.notes || 'No notes added'}</p>
              )}
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <Card className="p-6">
              <h3 className="mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <Badge className={getStatusColor(editedJob.status)}>{editedJob.status}</Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-gray-600 text-sm">Total Amount</p>
                  <p className="text-2xl">${totalPrice}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-gray-600 text-sm">Date & Time</p>
                  <p className="text-sm">
                    {editedJob.scheduledDate
                      ? editedJob.scheduledDate.toLocaleDateString()
                      : 'Not set'}
                  </p>
                  <p className="text-sm text-gray-600">{editedJob.scheduledTime}</p>
                </div>
                {editedJob.addons.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-gray-600 text-sm">Add-ons</p>
                      <p className="text-sm">{editedJob.addons.length} selected</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Payment Status */}
            {!isNewJob && relatedPayment && (
              <Card className="p-6">
                <h3 className="mb-4">Payment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <Badge
                      className={
                        relatedPayment.status === 'paid'
                          ? 'bg-green-500'
                          : relatedPayment.status === 'processing'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }
                    >
                      {relatedPayment.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span>${relatedPayment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travel Fee</span>
                    <span>${relatedPayment.travelFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-xl">
                      ${relatedPayment.amount + relatedPayment.travelFee}
                    </span>
                  </div>
                  {relatedPayment.date && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-gray-600 text-sm">Payment Date</p>
                        <p className="text-sm">{relatedPayment.date.toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {!isNewJob && (
                  <Button 
                    onClick={handleCreateInvoice}
                    className="w-full gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    Create Invoice
                  </Button>
                )}
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Email Client
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Call Client
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <MapPin className="w-4 h-4" />
                  View Location
                </Button>
                {editedJob.status === 'completed' && (
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    View Deliverables
                  </Button>
                )}
              </div>
            </Card>

            {/* Delivery Info */}
            {!isNewJob && editedJob.deliveredAt && (
              <Card className="p-6">
                <h3 className="mb-4">Delivery</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Delivered</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {editedJob.deliveredAt.toLocaleDateString()}
                  </p>
                  {editedJob.uploadedFiles && editedJob.uploadedFiles.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {editedJob.uploadedFiles.length} file(s) uploaded
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
