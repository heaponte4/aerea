import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { photographerJobs as initialJobs, photographerPayments, PhotographerJob } from '../../lib/photographerMockData';
import { photographers as initialPhotographers } from '../../lib/mockData';
import { Photographer, Payment } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, DollarSign, Camera, FileText, User, LogOut, TrendingUp, Building2, Calendar, MapPin, Mail, Phone, Star, Eye, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { InvoiceDetail } from './InvoiceDetail';
import { CustomerDetail } from './CustomerDetail';
import { PhotographerDetail } from './PhotographerDetail';
import { JobDetail } from './JobDetail';
import { PaymentDetail } from './PaymentDetail';
import { CreateJobForm } from '../CreateJobForm';

import {customersApi} from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  propertiesCount: number;
  totalSpent: number;
  joinedAt: Date;
  status?: 'active' | 'inactive';
}

interface AdminDashboardProps {
  onViewProfile: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewProfile }) => {
  const { user, logout } = useAuth();
  const { properties, orders} = useApp();
  const { customers: initialCustomers } = useApp();  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [customersData, setCustomersData] = useState<Customer[]>([]);

  const [photographersData, setPhotographersData] = useState<Photographer[]>([]);
  const [jobsData, setJobsData] = useState<PhotographerJob[]>([]);
  
  // Initialize payments data connected to orders
  const [paymentsData, setPaymentsData] = useState<Payment[]>(() => {
    // Generate payments for existing orders
    return orders.slice(0, 5).map((order, index) => ({
      id: `payment_${order.id}`,
      orderId: order.id,
      customerId: order.customerId,
      amount: order.totalAmount,
      travelFee: order.travelFees.reduce((sum, tf) => sum + tf.fee, 0),
      paymentDate: new Date(order.createdAt.getTime() + (index < 3 ? 86400000 : 0)), // First 3 are paid
      status: index < 3 ? 'paid' : 'pending',
      paymentMethod: index % 2 === 0 ? 'credit_card' : 'bank_transfer',
      transactionId: index < 3 ? `TXN${Date.now() + index}` : undefined,
      paidToPhotographer: index < 2,
      photographerPaymentDate: index < 2 ? new Date(order.createdAt.getTime() + 172800000) : undefined,
    })) as Payment[];
  });

  // If a payment is selected, show the detail view
  if (selectedPaymentId) {
    return (
      <PaymentDetail
        paymentId={selectedPaymentId}
        payments={paymentsData}
        onBack={() => setSelectedPaymentId(null)}
        onSave={(payment) => {
          if (selectedPaymentId === 'new') {
            setPaymentsData([...paymentsData, payment]);
          } else {
            setPaymentsData(paymentsData.map((p) => (p.id === payment.id ? payment : p)));
          }
          setSelectedPaymentId(null);
        }}
        onDelete={(paymentId) => {
          setPaymentsData(paymentsData.filter((p) => p.id !== paymentId));
          setSelectedPaymentId(null);
        }}
        onViewInvoice={(orderId) => {
          setSelectedPaymentId(null);
          setSelectedInvoiceId(orderId);
        }}
        onViewJob={(jobId) => {
          setSelectedPaymentId(null);
          setSelectedJobId(jobId);
        }}
      />
    );
  }

  // If an invoice is selected, show the detail view
  if (selectedInvoiceId) {
    return (
      <InvoiceDetail
        orderId={selectedInvoiceId}
        onBack={() => setSelectedInvoiceId(null)}
      />
    );
  }

  // If a customer is selected, show the detail view
  if (selectedCustomerId) {
    return (
      <CustomerDetail
        customerId={selectedCustomerId}
        customers={customersData}
        onBack={() => setSelectedCustomerId(null)}
        onSave={async(customer) => {
          if (selectedCustomerId === 'new') {
    
            setCustomersData([...customersData, customer]);
          } else {

            setCustomersData(customersData.map((c) => (c.id === customer.id ? customer : c)));
          }
        }}
        onDelete={(customerId) => {
          setCustomersData(customersData.filter((c) => c.id !== customerId));
        }}
      />
    );
  }

  // If a photographer is selected, show the detail view
  if (selectedPhotographerId) {
    return (
      <PhotographerDetail
        photographerId={selectedPhotographerId}
        photographers={photographersData}
        onBack={() => setSelectedPhotographerId(null)}
        onSave={(photographer) => {
          if (selectedPhotographerId === 'new') {
            setPhotographersData([...photographersData, photographer]);
          } else {
            setPhotographersData(
              photographersData.map((p) => (p.id === photographer.id ? photographer : p))
            );
          }
        }}
        onDelete={(photographerId) => {
          setPhotographersData(photographersData.filter((p) => p.id !== photographerId));
        }}
      />
    );
  }

  // If creating a job with the comprehensive form, show the CreateJobForm
  if (isCreatingJob) {
    return (
      <CreateJobForm
        onBack={() => setIsCreatingJob(false)}
        onSuccess={(propertyId) => {
          setIsCreatingJob(false);
        }}
      />
    );
  }

  // If a job is selected, show the detail view
  if (selectedJobId) {
    return (
      <JobDetail
        jobId={selectedJobId}
        jobs={jobsData}
        onBack={() => setSelectedJobId(null)}
        onSave={(job) => {
          if (selectedJobId === 'new') {
            setJobsData([...jobsData, job]);
          } else {
            setJobsData(jobsData.map((j) => (j.id === job.id ? job : j)));
          }
        }}
        onDelete={(jobId) => {
          setJobsData(jobsData.filter((j) => j.id !== jobId));
        }}
        onViewInvoice={(orderId) => {
          setSelectedJobId(null);
          setSelectedInvoiceId(orderId);
        }}
      />
    );
  }

  const customers = customersData;
  const photographers = photographersData;
  const allJobs = jobsData;
  const allPayments = paymentsData;

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalPaidRevenue = allPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount + (p.travelFee || 0), 0);
  const totalPhotographerPayments = allPayments
    .filter((p) => p.status === 'paid' && p.paidToPhotographer)
    .reduce((sum, p) => sum + p.amount + (p.travelFee || 0), 0);
  const pendingRevenue = allPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount + (p.travelFee || 0), 0);

  const upcomingJobs = allJobs.filter((j) => j.status === 'upcoming');
  const completedJobs = allJobs.filter((j) => j.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Admin Portal</h1>
            <p className="text-gray-600 mt-1">Manage Real Estate Media Portal</p>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p>{user?.name || 'Admin'}</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Customers</p>
                <p className="text-2xl mt-1">{customers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Photographers</p>
                <p className="text-2xl mt-1">{photographers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-2xl mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Jobs</p>
                <p className="text-2xl mt-1">{allJobs.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2>All Customers</h2>
                <Button onClick={() => setSelectedCustomerId('new')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Customer
                </Button>
              </div>
              {initialCustomers.length > 0 ? (
                <div className="space-y-4">
                  {initialCustomers.map((customer) => (
                    <Card key={customer.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar>
                              <AvatarFallback>
                                {customer.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3>{customer.name}</h3>
                                <h3>{customer.id}</h3>
                                {customer.status && (
                                  <Badge className={customer.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                    {customer.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600">{customer.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 mt-3">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                        
                          <Button
                            onClick={() => setSelectedCustomerId(customer.id)}
                            className="mt-4 gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No customers yet</p>
                  <Button onClick={() => setSelectedCustomerId('new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Customer
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Photographers Tab */}
          <TabsContent value="photographers">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2>All Photographers</h2>
                <Button onClick={() => setSelectedPhotographerId('new')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Photographer
                </Button>
              </div>
              {photographers.length > 0 ? (
                <div className="space-y-4">
                  {photographers.map((photographer) => (
                    <Card key={photographer.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={photographer.avatar} alt={photographer.name} />
                          <AvatarFallback>
                            {photographer.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>{photographer.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{photographer.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{photographer.bio}</p>
                          <div className="flex items-center gap-4 text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{photographer.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{photographer.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Camera className="w-4 h-4" />
                              <span>{photographer.completedJobs} jobs</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {photographer.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Travel Fee</p>
                          <p className="text-2xl">${photographer.travelFee}</p>
                          <Button
                            onClick={() => setSelectedPhotographerId(photographer.id)}
                            className="mt-4 gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No photographers yet</p>
                  <Button onClick={() => setSelectedPhotographerId('new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Photographer
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Total Jobs</p>
                <p className="text-3xl">{allJobs.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Upcoming</p>
                <p className="text-3xl text-blue-600">{upcomingJobs.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Completed</p>
                <p className="text-3xl text-green-600">{completedJobs.length}</p>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2>All Jobs</h2>
                <Button onClick={() => setIsCreatingJob(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Job
                </Button>
              </div>
              {allJobs.length > 0 ? (
                <div className="space-y-4">
                  {allJobs.map((job) => {
                    const photographer = photographers.find((p) => 
                      p.specialties.some((s) => s.toLowerCase().includes(job.serviceType.toLowerCase()))
                    );
                    const totalAddons = job.addons.reduce((sum, addon) => sum + addon.price, 0);
                    const totalAmount = job.servicePrice + totalAddons;

                    return (
                      <Card key={job.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3>{job.propertyAddress}</h3>
                              <Badge className={
                                job.status === 'completed' ? 'bg-green-500' :
                                job.status === 'upcoming' ? 'bg-blue-500' : 
                                job.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                              }>
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{job.propertyCity}, {job.propertyState}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{job.scheduledDate ? job.scheduledDate.toLocaleDateString() : 'Not set'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                <span>{job.serviceType}</span>
                              </div>
                            </div>
                            <div className="mt-3 text-gray-700">
                              <p>Client: {job.clientName}</p>
                              <p className="text-gray-600">{job.clientEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl">${totalAmount}</p>
                            <p className="text-gray-600">+ $50 travel</p>
                            {photographer && (
                              <p className="text-gray-600 mt-2">Photographer: {photographer.name}</p>
                            )}
                            <Button
                              onClick={() => setSelectedJobId(job.id)}
                              className="mt-4 gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No jobs yet</p>
                  <Button onClick={() => setIsCreatingJob(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Job
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl">${totalRevenue.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Pending</p>
                <p className="text-3xl text-yellow-600">${pendingRevenue.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Paid to Photographers</p>
                <p className="text-3xl text-purple-600">${totalPhotographerPayments.toLocaleString()}</p>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="mb-4">All Invoices</h2>
              <div className="space-y-4">
                {orders.map((order) => {
                  const property = properties.find((p) => p.id === order.propertyId);
                  
                  return (
                    <Card key={order.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>Invoice #{order.id}</h3>
                            <Badge className={order.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {order.status}
                            </Badge>
                          </div>
                          {property && (
                            <p className="text-gray-600 mb-2">
                              Property: {property.address}, {property.city}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {order.createdAt.toLocaleDateString()}</span>
                            </div>
                            {order.dueDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {order.dueDate.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl">${order.totalAmount.toLocaleString()}</p>
                          <Button
                            onClick={() => setSelectedInvoiceId(order.id)}
                            className="mt-4 gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      {order.travelFees && order.travelFees.length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-gray-600 mb-2">Travel Fees:</p>
                          <div className="space-y-1">
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
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Total Received</p>
                <p className="text-3xl text-green-600">${totalPaidRevenue.toLocaleString()}</p>
                <p className="text-gray-600 mt-1">From {allPayments.filter(p => p.status === 'paid').length} payments</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Pending</p>
                <p className="text-3xl text-yellow-600">${pendingRevenue.toLocaleString()}</p>
                <p className="text-gray-600 mt-1">From {allPayments.filter(p => p.status === 'pending').length} invoices</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Paid to Photographers</p>
                <p className="text-3xl text-purple-600">${totalPhotographerPayments.toLocaleString()}</p>
                <p className="text-gray-600 mt-1">
                  {allPayments.filter(p => p.paidToPhotographer).length} / {allPayments.filter(p => p.status === 'paid').length} paid
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 mb-1">Net Revenue</p>
                <p className="text-3xl text-blue-600">${(totalPaidRevenue - totalPhotographerPayments).toLocaleString()}</p>
                <p className="text-gray-600 mt-1">After photographer costs</p>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2>All Payments</h2>
                <Button onClick={() => setSelectedPaymentId('new')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Record Payment
                </Button>
              </div>
              {allPayments.length > 0 ? (
                <div className="space-y-4">
                  {allPayments.map((payment) => {
                    const order = orders.find((o) => o.id === payment.orderId);
                    const property = order ? properties.find((p) => p.id === order.propertyId) : null;
                    const totalAmount = payment.amount + (payment.travelFee || 0);

                    const getStatusIcon = (status: Payment['status']) => {
                      switch (status) {
                        case 'paid':
                          return <CheckCircle className="w-5 h-5 text-green-600" />;
                        case 'failed':
                          return <XCircle className="w-5 h-5 text-red-600" />;
                        case 'processing':
                          return <AlertCircle className="w-5 h-5 text-blue-600" />;
                        default:
                          return <AlertCircle className="w-5 h-5 text-yellow-600" />;
                      }
                    };

                    const getStatusColor = (status: Payment['status']) => {
                      switch (status) {
                        case 'paid':
                          return 'bg-green-500';
                        case 'failed':
                          return 'bg-red-500';
                        case 'processing':
                          return 'bg-blue-500';
                        default:
                          return 'bg-yellow-500';
                      }
                    };

                    return (
                      <Card key={payment.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(payment.status)}
                              <h3>Payment #{payment.id}</h3>
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status.toUpperCase()}
                              </Badge>
                              {payment.paidToPhotographer && (
                                <Badge className="bg-purple-500">
                                  Photographer Paid
                                </Badge>
                              )}
                            </div>
                            {property && (
                              <p className="text-gray-600 mb-2">
                                Property: {property.address}, {property.city}
                              </p>
                            )}
                            {order && (
                              <p className="text-gray-600 mb-2">
                                Invoice: #{order.id}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {payment.status === 'paid'
                                    ? `Paid: ${payment.paymentDate.toLocaleDateString()}`
                                    : 'Not paid yet'}
                                </span>
                              </div>
                              {payment.paymentMethod && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>
                                    {payment.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() +
                                      payment.paymentMethod.replace('_', ' ').slice(1)}
                                  </span>
                                </div>
                              )}
                              {payment.transactionId && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span>{payment.transactionId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl">${totalAmount.toLocaleString()}</p>
                            <p className="text-gray-600">
                              ${payment.amount} + ${payment.travelFee || 0} travel
                            </p>
                            {payment.paidToPhotographer && payment.photographerPaymentDate && (
                              <p className="text-gray-600 mt-1">
                                Photographer paid: {payment.photographerPaymentDate.toLocaleDateString()}
                              </p>
                            )}
                            <Button
                              onClick={() => setSelectedPaymentId(payment.id)}
                              className="mt-4 gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No payments recorded yet</p>
                  <Button onClick={() => setSelectedPaymentId('new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Record Your First Payment
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
