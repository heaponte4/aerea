import React, { useState } from 'react';
import { Photographer } from '../../types';
import { photographerJobs, photographerPayments } from '../../lib/photographerMockData';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar } from '../ui/calendar';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Camera,
  Calendar as CalendarIcon,
  DollarSign,
  Star,
  Award,
  User,
  Trash2,
  AlertTriangle,
  MapPin,
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

interface PhotographerDetailProps {
  photographerId: string | 'new';
  photographers: Photographer[];
  onBack: () => void;
  onSave: (photographer: Photographer) => void;
  onDelete?: (photographerId: string) => void;
}

const SPECIALTY_OPTIONS = [
  'Photography',
  'Videography',
  '3D Scanning',
  'Drone',
  'Twilight',
  'Interior',
  'Exterior',
  'Aerial',
];

export const PhotographerDetail: React.FC<PhotographerDetailProps> = ({
  photographerId,
  photographers,
  onBack,
  onSave,
  onDelete,
}) => {
  const isNewPhotographer = photographerId === 'new';
  const existingPhotographer = isNewPhotographer
    ? null
    : photographers.find((p) => p.id === photographerId);

  const [isEditMode, setIsEditMode] = useState(isNewPhotographer);
  const [editedPhotographer, setEditedPhotographer] = useState<Photographer>(
    existingPhotographer || {
      id: `photographer_${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      avatar: '',
      bio: '',
      specialties: [],
      rating: 5.0,
      completedJobs: 0,
      availableDates: [],
      travelFee: 0,
    }
  );
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    existingPhotographer?.availableDates || []
  );

  if (!isNewPhotographer && !existingPhotographer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Photographer not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // Validate required fields
    if (!editedPhotographer.name || !editedPhotographer.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedPhotographer.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate rating
    if (editedPhotographer.rating < 0 || editedPhotographer.rating > 5) {
      toast.error('Rating must be between 0 and 5');
      return;
    }

    onSave({ ...editedPhotographer, availableDates: selectedDates });
    toast.success(
      isNewPhotographer ? 'Photographer created successfully!' : 'Photographer updated successfully!'
    );
    if (isNewPhotographer) {
      onBack();
    } else {
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (isNewPhotographer) {
      onBack();
    } else {
      setEditedPhotographer(existingPhotographer!);
      setSelectedDates(existingPhotographer!.availableDates);
      setIsEditMode(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && !isNewPhotographer) {
      onDelete(editedPhotographer.id);
      toast.success('Photographer deleted successfully');
      onBack();
    }
  };

  const updateField = (field: keyof Photographer, value: any) => {
    setEditedPhotographer({ ...editedPhotographer, [field]: value });
  };

  const toggleSpecialty = (specialty: string) => {
    const currentSpecialties = editedPhotographer.specialties;
    if (currentSpecialties.includes(specialty)) {
      updateField(
        'specialties',
        currentSpecialties.filter((s) => s !== specialty)
      );
    } else {
      updateField('specialties', [...currentSpecialties, specialty]);
    }
  };

  // Get photographer's jobs and payments
  const photographerJobsList = isNewPhotographer
    ? []
    : photographerJobs.filter((j) => {
        // Mock: match by specialty
        return editedPhotographer.specialties.some((s) =>
          j.serviceType.toLowerCase().includes(s.toLowerCase())
        );
      });

  const photographerPaymentsList = isNewPhotographer
    ? []
    : photographerPayments.filter((p) => {
        // Mock: match by photographer ID or specialty
        return editedPhotographer.specialties.some((s) =>
          s.toLowerCase().includes('photo')
        );
      });

  const totalEarnings = photographerPaymentsList
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount + p.travelFee, 0);

  const pendingPayments = photographerPaymentsList.filter((p) => p.status === 'pending');
  const upcomingJobs = photographerJobsList.filter((j) => j.status === 'upcoming');
  const completedJobsCount = photographerJobsList.filter((j) => j.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Photographers
          </Button>
          <div className="flex gap-2">
            {!isNewPhotographer && !isEditMode && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Photographer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {editedPhotographer.name} and all associated
                      data. This action cannot be undone.
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
                Edit Photographer
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isNewPhotographer ? 'Create Photographer' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photographer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="w-24 h-24">
                  {editedPhotographer.avatar && (
                    <AvatarImage src={editedPhotographer.avatar} alt={editedPhotographer.name} />
                  )}
                  <AvatarFallback className="text-2xl">
                    {editedPhotographer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="name">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={editedPhotographer.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                          id="avatar"
                          value={editedPhotographer.avatar}
                          onChange={(e) => updateField('avatar', e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="mb-2">{editedPhotographer.name}</h1>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xl">{editedPhotographer.rating.toFixed(1)}</span>
                        </div>
                        {!isNewPhotographer && (
                          <Badge variant="outline">
                            {editedPhotographer.completedJobs} jobs completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    {isEditMode ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedPhotographer.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedPhotographer.email}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditMode ? (
                      <Input
                        id="phone"
                        value={editedPhotographer.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedPhotographer.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Bio */}
            <Card className="p-6">
              <h3 className="mb-4">Bio</h3>
              {isEditMode ? (
                <Textarea
                  value={editedPhotographer.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell us about your photography experience..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{editedPhotographer.bio || 'No bio added'}</p>
              )}
            </Card>

            {/* Specialties */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5" />
                <h3>Specialties</h3>
              </div>
              {isEditMode ? (
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={
                        editedPhotographer.specialties.includes(specialty) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editedPhotographer.specialties.length > 0 ? (
                    editedPhotographer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-600">No specialties selected</p>
                  )}
                </div>
              )}
            </Card>

            {/* Pricing & Performance */}
            <Card className="p-6">
              <h3 className="mb-4">Pricing & Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="travelFee">Travel Fee ($)</Label>
                  {isEditMode ? (
                    <Input
                      id="travelFee"
                      type="number"
                      min="0"
                      value={editedPhotographer.travelFee}
                      onChange={(e) => updateField('travelFee', parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-700">${editedPhotographer.travelFee}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  {isEditMode ? (
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={editedPhotographer.rating}
                      onChange={(e) => updateField('rating', parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <p className="text-gray-700">{editedPhotographer.rating.toFixed(1)} / 5.0</p>
                    </div>
                  )}
                </div>

                {!isNewPhotographer && (
                  <div>
                    <Label>Completed Jobs</Label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        min="0"
                        value={editedPhotographer.completedJobs}
                        onChange={(e) =>
                          updateField('completedJobs', parseInt(e.target.value) || 0)
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedPhotographer.completedJobs}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Available Dates */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5" />
                <h3>Available Dates</h3>
              </div>
              {isEditMode ? (
                <div>
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    className="rounded-md border"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              ) : (
                <div>
                  {selectedDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.slice(0, 10).map((date, index) => (
                        <Badge key={index} variant="outline">
                          {date ? date.toLocaleDateString() : 'Invalid date'}
                        </Badge>
                      ))}
                      {selectedDates.length > 10 && (
                        <Badge variant="outline">+{selectedDates.length - 10} more</Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">No available dates set</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-6">
            {!isNewPhotographer && (
              <>
                {/* Statistics */}
                <Card className="p-6">
                  <h3 className="mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 mb-1">Total Earnings</p>
                      <p className="text-3xl text-green-600">${totalEarnings.toLocaleString()}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-gray-600 mb-1">Upcoming Jobs</p>
                      <p className="text-3xl text-blue-600">{upcomingJobs.length}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-gray-600 mb-1">Completed Jobs</p>
                      <p className="text-3xl">{completedJobsCount}</p>
                    </div>
                  </div>
                </Card>

                {/* Payment Status */}
                <Card className="p-6">
                  <h3 className="mb-4">Payments</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid</span>
                      <Badge className="bg-green-500">
                        {photographerPaymentsList.filter((p) => p.status === 'paid').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <Badge className="bg-yellow-500">{pendingPayments.length}</Badge>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full gap-2">
                      <Mail className="w-4 h-4" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      View Schedule
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <DollarSign className="w-4 h-4" />
                      Process Payment
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Activity Tabs - Only show for existing photographers */}
        {!isNewPhotographer && (
          <Card className="mt-6 p-6">
            <Tabs defaultValue="jobs">
              <TabsList>
                <TabsTrigger value="jobs">Jobs ({photographerJobsList.length})</TabsTrigger>
                <TabsTrigger value="payments">
                  Payments ({photographerPaymentsList.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="mt-4">
                {photographerJobsList.length > 0 ? (
                  <div className="space-y-3">
                    {photographerJobsList.map((job) => (
                      <Card key={job.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3>{job.propertyAddress}</h3>
                              <Badge
                                className={
                                  job.status === 'completed'
                                    ? 'bg-green-500'
                                    : job.status === 'upcoming'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                                }
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{job.serviceType}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>
                                  {job.scheduledDate ? job.scheduledDate.toLocaleDateString() : 'TBD'} at {job.scheduledTime || 'TBD'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.propertyCity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl">${job.servicePrice}</p>
                            {job.addons.length > 0 && (
                              <p className="text-sm text-gray-600">+{job.addons.length} add-ons</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No jobs yet</p>
                )}
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                {photographerPaymentsList.length > 0 ? (
                  <div className="space-y-3">
                    {photographerPaymentsList.map((payment) => (
                      <Card key={payment.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3>Payment #{payment.id}</h3>
                              <Badge
                                className={
                                  payment.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{payment.propertyAddress}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {payment.date ? payment.date.toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl">${(payment.amount + payment.travelFee).toLocaleString()}</p>
                            <p className="text-sm text-gray-600">
                              Service: ${payment.amount}
                            </p>
                            <p className="text-sm text-gray-600">Travel: ${payment.travelFee}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No payments yet</p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};
