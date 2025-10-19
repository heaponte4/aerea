import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { photographerJobs, photographerPayments, PhotographerJob, UploadedFile } from '../../lib/photographerMockData';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, Camera, DollarSign, CheckCircle2, Clock, MapPin, User, LogOut, Phone, Mail, Star, Upload, Plus, Trash2, X, Eye, Map, List } from 'lucide-react';
import { photographers } from '../../lib/mockData';
import { photographersApi, jobsApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import { Photographer } from '../../types';
import { JobDetail } from './JobDetail';
import { JobsMapView } from './JobsMapView';

interface PhotographerDashboardProps {
  onViewProfile: () => void;
  onUploadFiles: (job: PhotographerJob) => void;
}

export const PhotographerDashboard: React.FC<PhotographerDashboardProps> = ({ onViewProfile, onUploadFiles }) => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<PhotographerJob[]>([]);
  const [photographerData, setPhotographerData] = useState<Photographer>(photographers[0]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isAddDateDialogOpen, setIsAddDateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PhotographerJob | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Load photographer data and jobs
  useEffect(() => {
    loadPhotographerData();
    loadJobs();
  }, []);

  const loadPhotographerData = async () => {
    try {
      // In production, this would use the logged-in photographer's ID
      const data = await photographersApi.getById(photographers[0].id);
      setPhotographerData(data);
    } catch (error) {
      console.error('Error loading photographer data:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await jobsApi.getAll();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleJobUpdate = (updatedJob: PhotographerJob) => {
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    setSelectedJob(updatedJob);
  };

  const handleViewJobDetail = (job: PhotographerJob) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const upcomingJobs = jobs.filter((job) => job.status === 'upcoming');
  const completedJobs = jobs.filter((job) => job.status === 'completed');
  const totalEarnings = photographerPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount + p.travelFee, 0);
  const pendingPayments = photographerPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount + p.travelFee, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddAvailableDates = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    setIsLoading(true);
    try {
      const updatedPhotographer = await photographersApi.addAvailableDates(photographerData.id, selectedDates);
      setPhotographerData(updatedPhotographer);
      setIsAddDateDialogOpen(false);
      setSelectedDates([]);
      toast.success(`${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} added successfully`);
    } catch (error) {
      toast.error('Failed to add available dates');
      console.error('Error adding available dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvailableDate = async (date: Date) => {
    setIsLoading(true);
    try {
      const updatedPhotographer = await photographersApi.removeAvailableDate(photographerData.id, date);
      setPhotographerData(updatedPhotographer);
      toast.success('Available date removed successfully');
    } catch (error) {
      toast.error('Failed to remove available date');
      console.error('Error removing available date:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDateBooked = (date: Date) => {
    return jobs.some(job => 
      job.status === 'upcoming' && 
      job.scheduledDate.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Photographer Portal</h1>
            <p className="text-gray-600 mt-1">Manage your photography assignments</p>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={photographerData.avatar} alt={photographerData.name} />
                  <AvatarFallback>
                    {photographerData.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p>{photographerData.name}</p>
                  <p className="text-xs text-gray-600">{photographerData.email}</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Upcoming Jobs</p>
                <p className="text-2xl mt-1">{upcomingJobs.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Completed</p>
                <p className="text-2xl mt-1">{completedJobs.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Earnings</p>
                <p className="text-2xl mt-1">${totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600">Pending</p>
                <p className="text-2xl mt-1">${pendingPayments.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Summary */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={photographerData.avatar} alt={photographerData.name} />
              <AvatarFallback className="text-xl">
                {photographerData.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2>{photographerData.name}</h2>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>{photographerData.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{photographerData.bio}</p>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{photographerData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{photographerData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>{photographerData.completedJobs} jobs completed</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {photographerData.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Jobs</TabsTrigger>
            <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Upcoming Jobs */}
          <TabsContent value="upcoming">
            <div className="space-y-4">
              {/* View Toggle */}
              {upcomingJobs.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-gray-900">{showMap ? 'Job Locations' : 'Job Details'}</h3>
                    <p className="text-gray-600">
                      {showMap ? 'View all upcoming jobs on the map' : 'Complete information for each upcoming job'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={showMap ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowMap(true)}
                      className="gap-2"
                    >
                      <Map className="w-4 h-4" />
                      Map
                    </Button>
                    <Button
                      variant={!showMap ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowMap(false)}
                      className="gap-2"
                    >
                      <List className="w-4 h-4" />
                      List
                    </Button>
                  </div>
                </div>
              )}

              {/* Map View */}
              {upcomingJobs.length > 0 && showMap && (
                <JobsMapView 
                  jobs={upcomingJobs} 
                  onViewJob={handleViewJobDetail}
                />
              )}

              {/* List View */}
              {upcomingJobs.length > 0 && !showMap ? (
                upcomingJobs.map((job) => {
                  const totalAddons = job.addons.reduce((sum, addon) => sum + addon.price, 0);
                  const totalAmount = job.servicePrice + totalAddons;

                  return (
                    <Card key={job.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>{job.propertyAddress}</h3>
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.propertyCity}, {job.propertyState}</span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{job.scheduledDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{job.scheduledTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4" />
                              <span>{job.serviceType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl">${totalAmount}</p>
                          <p className="text-gray-600">+ $50 travel</p>
                        </div>
                      </div>

                      {job.addons.length > 0 && (
                        <div className="mb-4 pb-4 border-t pt-4">
                          <p className="text-gray-600 mb-2">Add-ons:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.addons.map((addon, idx) => (
                              <Badge key={idx} variant="secondary">
                                {addon.name} (+${addon.price})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <Button onClick={() => handleViewJobDetail(job)} className="w-full gap-2">
                          <Eye className="w-4 h-4" />
                          View Details & Manage
                        </Button>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming jobs</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Completed Jobs */}
          <TabsContent value="completed">
            <div className="space-y-4">
              {completedJobs.map((job) => {
                const totalAddons = job.addons.reduce((sum, addon) => sum + addon.price, 0);
                const totalAmount = job.servicePrice + totalAddons;
                const uploadedCount = job.uploadedFiles?.length || 0;

                return (
                  <Card key={job.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3>{job.propertyAddress}</h3>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          {uploadedCount > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Upload className="w-3 h-3" />
                              {uploadedCount} file{uploadedCount > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.propertyCity}, {job.propertyState}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{job.scheduledDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            <span>{job.serviceType}</span>
                          </div>
                          {job.deliveredAt && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span>Delivered {job.deliveredAt.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl">${totalAmount}</p>
                        <p className="text-gray-600">+ $50 travel</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t flex gap-2">
                      <Button onClick={() => handleViewJobDetail(job)} variant="outline" className="flex-1 gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button onClick={() => onUploadFiles(job)} className="flex-1 gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadedCount > 0 ? 'Manage Files' : 'Upload Files'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2>Available Dates</h2>
                    <p className="text-gray-600 mt-1">Manage your availability for bookings</p>
                  </div>
                  <Button onClick={() => setIsAddDateDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Available Dates
                  </Button>
                </div>

                {photographerData.availableDates && photographerData.availableDates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {photographerData.availableDates
                      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                      .map((date, idx) => {
                        const dateObj = new Date(date);
                        const isBooked = isDateBooked(dateObj);
                        const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                        
                        return (
                          <div
                            key={idx}
                            className={`p-4 border rounded-lg relative group ${
                              isPast ? 'bg-gray-50 opacity-60' : isBooked ? 'border-green-500 bg-green-50' : 'hover:border-blue-500'
                            } transition-colors`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <Calendar className={`w-5 h-5 flex-shrink-0 ${isBooked ? 'text-green-600' : 'text-blue-600'}`} />
                                <div className="min-w-0">
                                  <p className={`truncate ${isPast ? 'text-gray-500' : ''}`}>
                                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                  {isBooked && (
                                    <Badge variant="outline" className="mt-1 bg-green-100 text-green-700 border-green-300">
                                      Booked
                                    </Badge>
                                  )}
                                  {isPast && !isBooked && (
                                    <Badge variant="outline" className="mt-1 bg-gray-100 text-gray-600 border-gray-300">
                                      Past
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {!isBooked && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAvailableDate(dateObj)}
                                  disabled={isLoading}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No available dates set</p>
                    <Button onClick={() => setIsAddDateDialogOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Your First Available Dates
                    </Button>
                  </div>
                )}
              </Card>

              {/* Upcoming Bookings */}
              <Card className="p-6">
                <h3 className="mb-4">Upcoming Bookings</h3>
                {upcomingJobs.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingJobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{job.propertyAddress}</p>
                            <div className="flex items-center gap-4 mt-2 text-gray-700">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{job.scheduledDate.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{job.scheduledTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Camera className="w-4 h-4" />
                                <span>{job.serviceType}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-blue-500">Upcoming</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No upcoming bookings</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Add Date Dialog */}
          <Dialog open={isAddDateDialogOpen} onOpenChange={setIsAddDateDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Available Dates</DialogTitle>
                <DialogDescription>
                  Select one or more dates when you're available for photography sessions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <CalendarComponent
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  disabled={(date) => {
                    // Disable past dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) return true;
                    
                    // Disable already available dates
                    return photographerData.availableDates?.some(d => {
                      const existingDate = new Date(d);
                      return existingDate.toDateString() === date.toDateString();
                    }) || false;
                  }}
                  className="rounded-md border mx-auto"
                />

                {selectedDates.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <p className="text-gray-700">
                      <span className="text-gray-600">Selected {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}:</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates
                        .sort((a, b) => a.getTime() - b.getTime())
                        .map((date, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-500" 
                              onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                            />
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddAvailableDates} 
                    disabled={selectedDates.length === 0 || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Adding...' : `Add ${selectedDates.length > 0 ? selectedDates.length : ''} Date${selectedDates.length !== 1 ? 's' : ''}`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDateDialogOpen(false);
                      setSelectedDates([]);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Payments */}
          <TabsContent value="payments">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Total Earnings</p>
                    <p className="text-3xl">${totalEarnings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Pending Payments</p>
                    <p className="text-3xl text-yellow-600">${pendingPayments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">This Month</p>
                    <p className="text-3xl">
                      ${photographerPayments
                        .filter((p) => {
                          const paymentMonth = p.date.getMonth();
                          const currentMonth = new Date().getMonth();
                          return paymentMonth === currentMonth;
                        })
                        .reduce((sum, p) => sum + p.amount + p.travelFee, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                {photographerPayments.map((payment) => (
                  <Card key={payment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3>{payment.propertyAddress}</h3>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{payment.date.toLocaleDateString()}</span>
                          </div>
                          {payment.method && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{payment.method}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl">${(payment.amount + payment.travelFee).toLocaleString()}</p>
                        <p className="text-gray-600">
                          ${payment.amount} + ${payment.travelFee} travel
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Job Detail Dialog */}
        {selectedJob && (
          <JobDetail
            job={selectedJob}
            open={isJobDetailOpen}
            onClose={() => {
              setIsJobDetailOpen(false);
              setSelectedJob(null);
            }}
            onUpdate={handleJobUpdate}
            onUploadFiles={onUploadFiles}
          />
        )}
      </div>
    </div>
  );
};
