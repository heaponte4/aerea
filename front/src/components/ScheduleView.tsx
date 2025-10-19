import React, { useState } from 'react';
import { photographers, availableServices, addonServices } from '../lib/mockData';
import { Photographer, PropertyService } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Star, Calendar as CalendarIcon, Clock, CheckCircle2, Mail, Phone, ShoppingCart, AlertTriangle, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ScheduleViewProps {
  propertyServices: PropertyService[];
  onUpdateService: (propertyId: string, serviceId: string, updates: Partial<PropertyService>) => void;
  propertyId: string;
  onCheckout: (scheduledServices: PropertyService[]) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  propertyServices,
  onUpdateService,
  propertyId,
  onCheckout,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  const handleOpenScheduleDialog = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedPhotographer(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setDialogOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedServiceId && selectedPhotographer && selectedDate && selectedTime) {
      onUpdateService(propertyId, selectedServiceId, {
        photographerId: selectedPhotographer.id,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        status: 'scheduled',
      });
      setDialogOpen(false);
      setSelectedServiceId(null);
      setSelectedPhotographer(null);
      setSelectedDate(undefined);
      setSelectedTime('');
    }
  };

  const getFilteredPhotographers = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return [];

    return photographers.filter((photographer) =>
      photographer.specialties.includes(service.name)
    );
  };

  const timeSlots = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  const isDateAvailable = (date: Date, photographer: Photographer) => {
    return photographer.availableDates.some(
      (availableDate) =>
        availableDate.toDateString() === date.toDateString()
    );
  };

  const handleCompleteOrder = () => {
    setCheckoutDialogOpen(true);
  };

  const handleConfirmCheckout = () => {
    const scheduledServices = propertyServices.filter(
      (ps) => ps.status === 'scheduled' && ps.photographerId && ps.scheduledDate
    );

    if (scheduledServices.length === 0) {
      toast.error('Please schedule at least one service before completing the order');
      return;
    }

    onCheckout(scheduledServices);
    setCheckoutDialogOpen(false);
    toast.success('Order completed successfully!');
  };

  // Calculate totals
  const scheduledServices = propertyServices.filter(
    (ps) => ps.status === 'scheduled' && ps.photographerId && ps.scheduledDate
  );
  const unscheduledServices = propertyServices.filter(
    (ps) => ps.status === 'pending' || !ps.photographerId || !ps.scheduledDate
  );

  const calculateServiceTotal = (ps: PropertyService) => {
    const service = availableServices.find((s) => s.id === ps.serviceId);
    const serviceAddons = (ps.addonIds || [])
      .map((addonId) => addonServices.find((a) => a.id === addonId))
      .filter(Boolean);
    const addonTotal = serviceAddons.reduce((sum, addon) => sum + (addon?.price || 0), 0);
    return (service?.price || 0) + addonTotal;
  };

  const scheduledTotal = scheduledServices.reduce((sum, ps) => sum + calculateServiceTotal(ps), 0);

  // Calculate travel fees (unique photographers)
  const uniquePhotographers = new Map<string, number>();
  scheduledServices.forEach((ps) => {
    if (ps.photographerId) {
      const photographer = photographers.find((p) => p.id === ps.photographerId);
      if (photographer && !uniquePhotographers.has(photographer.id)) {
        uniquePhotographers.set(photographer.id, photographer.travelFee);
      }
    }
  });
  const totalTravelFees = Array.from(uniquePhotographers.values()).reduce((sum, fee) => sum + fee, 0);
  const grandTotal = scheduledTotal + totalTravelFees;

  return (
    <div className="space-y-4">
      {propertyServices.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No services added yet. Add services to schedule them.</p>
        </Card>
      ) : (
        propertyServices.map((ps) => {
          const service = availableServices.find((s) => s.id === ps.serviceId);
          const photographer = ps.photographerId
            ? photographers.find((p) => p.id === ps.photographerId)
            : null;

          if (!service) return null;

          return (
            <Card key={ps.serviceId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3>{service.name}</h3>
                    <Badge className={ps.status === 'completed' ? 'bg-green-500' : ps.status === 'scheduled' ? 'bg-blue-500' : 'bg-yellow-500'}>
                      {ps.status}
                    </Badge>
                  </div>

                  {photographer && ps.scheduledDate && ps.scheduledTime ? (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={photographer.avatar} alt={photographer.name} />
                          <AvatarFallback>{photographer.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p>{photographer.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{photographer.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{photographer.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{photographer.phone}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-1">Travel fee: ${photographer.travelFee}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t">
                        <div className="flex items-center gap-2 text-gray-700">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                          <span>{ps.scheduledDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span>{ps.scheduledTime}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-2">Not scheduled yet</p>
                  )}
                </div>

                {ps.status !== 'completed' && (
                  <Button onClick={() => handleOpenScheduleDialog(ps.serviceId)}>
                    {photographer ? 'Reschedule' : 'Schedule'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Schedule {selectedServiceId && availableServices.find((s) => s.id === selectedServiceId)?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Select Photographer */}
            <div>
              <h3 className="mb-4">Select Photographer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedServiceId &&
                  getFilteredPhotographers(selectedServiceId).map((photographer) => (
                    <Card
                      key={photographer.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedPhotographer?.id === photographer.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedPhotographer(photographer);
                        setSelectedDate(undefined);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={photographer.avatar} alt={photographer.name} />
                          <AvatarFallback>
                            {photographer.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="truncate">{photographer.name}</h3>
                            {selectedPhotographer?.id === photographer.id && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{photographer.rating}</span>
                            </div>
                            <span className="text-gray-600">• {photographer.completedJobs} jobs</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-2">{photographer.bio}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {photographer.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-gray-600">Travel fee: ${photographer.travelFee}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Step 2: Select Date */}
            {selectedPhotographer && (
              <div>
                <h3 className="mb-4">Select Available Date</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => !isDateAvailable(date, selectedPhotographer)}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="mb-3">Available Dates:</p>
                    <div className="space-y-2">
                      {selectedPhotographer.availableDates
                        .sort((a, b) => a.getTime() - b.getTime())
                        .map((date, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedDate?.toDateString() === date.toDateString()
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-600" />
                              <span>{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Select Time */}
            {selectedDate && selectedPhotographer && (
              <div>
                <h3 className="mb-4">Select Time Slot</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary & Confirm */}
            {selectedPhotographer && selectedDate && selectedTime && (
              <div className="pt-6 border-t">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="text-gray-600">Service:</span>{' '}
                      {selectedServiceId && availableServices.find((s) => s.id === selectedServiceId)?.name}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-600">Photographer:</span> {selectedPhotographer.name}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-600">Date:</span> {selectedDate.toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-600">Time:</span> {selectedTime}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-600">Travel Fee:</span> ${selectedPhotographer.travelFee}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleConfirmSchedule} className="flex-1">
                    Confirm Booking
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Order Section */}
      {propertyServices.length > 0 && (
        <Card className="p-6 mt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="mb-2">Order Summary</h3>
              <div className="space-y-2 text-gray-600">
                <p>Scheduled Services: {scheduledServices.length}</p>
                {unscheduledServices.length > 0 && (
                  <p className="text-yellow-600">Unscheduled Services: {unscheduledServices.length}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl">${scheduledTotal.toLocaleString()}</p>
              {totalTravelFees > 0 && (
                <p className="text-gray-600 mt-1">+ ${totalTravelFees} travel fees</p>
              )}
              <p className="text-2xl mt-2">Grand Total: ${grandTotal.toLocaleString()}</p>
            </div>
          </div>

          {unscheduledServices.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {unscheduledServices.length} service(s) are not scheduled yet. Only scheduled services will be included in this order.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleCompleteOrder} 
            className="w-full gap-2"
            disabled={scheduledServices.length === 0}
          >
            <ShoppingCart className="w-4 h-4" />
            Complete Order ({scheduledServices.length} service{scheduledServices.length !== 1 ? 's' : ''})
          </Button>
        </Card>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
            <DialogDescription>
              Review your order details and confirm your purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning for unscheduled services */}
            {unscheduledServices.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="mb-2">The following services are not scheduled and will NOT be included in this order:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {unscheduledServices.map((ps) => {
                      const service = availableServices.find((s) => s.id === ps.serviceId);
                      return service ? <li key={ps.serviceId}>{service.name}</li> : null;
                    })}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Order Details */}
            <div className="space-y-4">
              <h3>Order Details</h3>
              
              {scheduledServices.map((ps) => {
                const service = availableServices.find((s) => s.id === ps.serviceId);
                const photographer = ps.photographerId
                  ? photographers.find((p) => p.id === ps.photographerId)
                  : null;
                const serviceAddons = (ps.addonIds || [])
                  .map((addonId) => addonServices.find((a) => a.id === addonId))
                  .filter(Boolean);
                const serviceTotal = calculateServiceTotal(ps);

                return service ? (
                  <div key={ps.serviceId} className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4>{service.name}</h4>
                        {photographer && (
                          <p className="text-gray-600">Photographer: {photographer.name}</p>
                        )}
                        {ps.scheduledDate && (
                          <p className="text-gray-600">
                            {ps.scheduledDate.toLocaleDateString()} at {ps.scheduledTime}
                          </p>
                        )}
                      </div>
                      <p>${serviceTotal}</p>
                    </div>
                    {serviceAddons.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-gray-600 mb-1">Add-ons:</p>
                        {serviceAddons.map((addon) => (
                          <div key={addon!.id} className="flex justify-between text-gray-700">
                            <span className="text-sm">{addon!.name}</span>
                            <span className="text-sm">+${addon!.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            </div>

            <Separator />

            {/* Travel Fees */}
            {uniquePhotographers.size > 0 && (
              <div>
                <h4 className="mb-2">Travel Fees</h4>
                <div className="space-y-2">
                  {Array.from(uniquePhotographers.entries()).map(([photographerId, fee]) => {
                    const photographer = photographers.find((p) => p.id === photographerId);
                    return photographer ? (
                      <div key={photographerId} className="flex justify-between text-gray-700">
                        <span>{photographer.name}</span>
                        <span>${fee}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Services Total:</span>
                <span>${scheduledTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Travel Fees:</span>
                <span>${totalTravelFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl pt-2 border-t">
                <span>Grand Total:</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleConfirmCheckout} className="flex-1 gap-2">
                <CreditCard className="w-4 h-4" />
                Confirm & Checkout
              </Button>
              <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
