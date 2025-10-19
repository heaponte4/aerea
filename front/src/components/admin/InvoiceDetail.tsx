import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Order } from '../../types';
import { availableServices, addonServices, photographers } from '../../lib/mockData';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Alert, AlertDescription } from '../ui/alert';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  MapPin,
  User,
  Camera,
  Download,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface InvoiceDetailProps {
  orderId: string;
  onBack: () => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ orderId, onBack }) => {
  const { getPropertyById, updateOrder, orders } = useApp();
  const order = orders.find((o) => o.id === orderId);
  const property = order ? getPropertyById(order.propertyId) : null;

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(order || null);
  const [dueDate, setDueDate] = useState<Date | undefined>(order?.dueDate);
  const [notes, setNotes] = useState('');

  if (!order || !property || !editedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Invoice not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (editedOrder) {
      updateOrder(editedOrder.id, {
        ...editedOrder,
        dueDate,
      });
      toast.success('Invoice updated successfully!');
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedOrder(order);
    setDueDate(order.dueDate);
    setIsEditMode(false);
  };

  const updateStatus = (status: Order['status']) => {
    setEditedOrder({ ...editedOrder, status });
  };

  const updateTotalAmount = (amount: number) => {
    setEditedOrder({ ...editedOrder, totalAmount: amount });
  };

  // Calculate totals
  const servicesTotal = editedOrder.services.reduce((sum, ps) => {
    const service = availableServices.find((s) => s.id === ps.serviceId);
    const serviceAddons = (ps.addonIds || [])
      .map((addonId) => addonServices.find((a) => a.id === addonId))
      .filter(Boolean);
    const addonTotal = serviceAddons.reduce((addonSum, addon) => addonSum + (addon?.price || 0), 0);
    return sum + (service?.price || 0) + addonTotal;
  }, 0);

  const travelFeesTotal = editedOrder.travelFees.reduce((sum, tf) => sum + tf.fee, 0);
  const grandTotal = servicesTotal + travelFeesTotal;

  // Get unique photographers
  const uniquePhotographers = new Map<string, { name: string; services: string[] }>();
  editedOrder.services.forEach((ps) => {
    if (ps.photographerId) {
      const photographer = photographers.find((p) => p.id === ps.photographerId);
      const service = availableServices.find((s) => s.id === ps.serviceId);
      if (photographer && service) {
        if (uniquePhotographers.has(photographer.id)) {
          uniquePhotographers.get(photographer.id)?.services.push(service.name);
        } else {
          uniquePhotographers.set(photographer.id, {
            name: photographer.name,
            services: [service.name],
          });
        }
      }
    }
  });

  const handleDownloadPDF = () => {
    toast.success('Invoice PDF download started');
    // In a real app, this would generate and download a PDF
  };

  const handleSendEmail = () => {
    toast.success('Invoice email sent successfully');
    // In a real app, this would send an email
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
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
            Back to Invoices
          </Button>
          <div className="flex gap-2">
            {!isEditMode ? (
              <>
                <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button onClick={handleSendEmail} variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button onClick={() => setIsEditMode(true)} className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Invoice
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Invoice Header Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1>Invoice #{editedOrder.id}</h1>
                {isEditMode ? (
                  <Select value={editedOrder.status} onValueChange={(value) => updateStatus(value as Order['status'])}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(editedOrder.status)}>{editedOrder.status}</Badge>
                )}
              </div>
              <div className="text-gray-600 space-y-1">
                <p>Created: {editedOrder.createdAt.toLocaleDateString()}</p>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <Label>Due Date:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {dueDate ? dueDate.toLocaleDateString() : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  editedOrder.dueDate && <p>Due: {editedOrder.dueDate.toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 mb-1">Total Amount</p>
              {isEditMode ? (
                <Input
                  type="number"
                  value={editedOrder.totalAmount}
                  onChange={(e) => updateTotalAmount(parseFloat(e.target.value) || 0)}
                  className="text-3xl text-right"
                />
              ) : (
                <p className="text-4xl">${editedOrder.totalAmount.toLocaleString()}</p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Property Details
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>{property.address}</p>
                <p>
                  {property.city}, {property.state} {property.zipCode}
                </p>
                <div className="flex gap-4 mt-3">
                  {property.bedrooms && <p>{property.bedrooms} Bed</p>}
                  {property.bathrooms && <p>{property.bathrooms} Bath</p>}
                  {property.squareFeet && <p>{property.squareFeet.toLocaleString()} SqFt</p>}
                </div>
                <Badge variant="outline" className="mt-2">
                  {property.propertyType}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photographers
              </h3>
              <div className="space-y-2">
                {Array.from(uniquePhotographers.entries()).map(([id, data]) => (
                  <div key={id} className="text-gray-700">
                    <p>{data.name}</p>
                    <p className="text-sm text-gray-600">{data.services.join(', ')}</p>
                  </div>
                ))}
                {uniquePhotographers.size === 0 && (
                  <p className="text-gray-600">No photographers assigned</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Services Breakdown */}
        <Card className="p-8 mb-6">
          <h2 className="mb-4">Services</h2>
          <div className="space-y-4">
            {editedOrder.services.map((ps, index) => {
              const service = availableServices.find((s) => s.id === ps.serviceId);
              const photographer = ps.photographerId
                ? photographers.find((p) => p.id === ps.photographerId)
                : null;
              const serviceAddons = (ps.addonIds || [])
                .map((addonId) => addonServices.find((a) => a.id === addonId))
                .filter(Boolean);
              const addonTotal = serviceAddons.reduce(
                (addonSum, addon) => addonSum + (addon?.price || 0),
                0
              );
              const serviceTotal = (service?.price || 0) + addonTotal;

              return (
                <div key={index} className="pb-4 border-b last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3>{service?.name || 'Unknown Service'}</h3>
                        <Badge variant="outline" className={ps.status === 'completed' ? 'bg-green-100' : ''}>
                          {ps.status}
                        </Badge>
                      </div>
                      {photographer && (
                        <p className="text-gray-600 mb-1">Photographer: {photographer.name}</p>
                      )}
                      {ps.scheduledDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {ps.scheduledDate.toLocaleDateString()} at {ps.scheduledTime}
                          </span>
                        </div>
                      )}
                      {serviceAddons.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">Add-ons:</p>
                          {serviceAddons.map((addon) => (
                            <div key={addon!.id} className="flex items-center gap-2 text-sm text-gray-700 ml-4">
                              <span>• {addon!.name}</span>
                              <span className="text-gray-600">+${addon!.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl">${serviceTotal}</p>
                      {service && <p className="text-sm text-gray-600">Service: ${service.price}</p>}
                      {addonTotal > 0 && <p className="text-sm text-gray-600">Add-ons: ${addonTotal}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          {/* Travel Fees */}
          {editedOrder.travelFees.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="mb-3">Travel Fees</h3>
                <div className="space-y-2">
                  {editedOrder.travelFees.map((tf) => {
                    const photographer = photographers.find((p) => p.id === tf.photographerId);
                    return (
                      <div key={tf.photographerId} className="flex justify-between text-gray-700">
                        <span>{photographer?.name || 'Unknown Photographer'}</span>
                        <span>${tf.fee}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Services Subtotal:</span>
              <span>${servicesTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Travel Fees:</span>
              <span>${travelFeesTotal.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl pt-2">
              <span>Grand Total:</span>
              <span>${grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Notes Section */}
        <Card className="p-8">
          <h2 className="mb-4">Notes</h2>
          {isEditMode ? (
            <Textarea
              placeholder="Add notes about this invoice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          ) : (
            <p className="text-gray-600">{notes || 'No notes added'}</p>
          )}
        </Card>

        {/* Payment Status Alert */}
        {editedOrder.status === 'paid' && (
          <Alert className="mt-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              This invoice has been paid in full.
            </AlertDescription>
          </Alert>
        )}

        {editedOrder.status === 'pending' && editedOrder.dueDate && new Date() > editedOrder.dueDate && (
          <Alert className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This invoice is overdue. Payment was due on {editedOrder.dueDate.toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
