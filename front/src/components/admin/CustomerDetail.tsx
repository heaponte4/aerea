import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Home,
  FileText,
  User,
  Trash2,
  AlertTriangle,
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

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  propertiesCount: number;
  totalSpent: number;
  joinedAt: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}

interface CustomerDetailProps {
  customerId: string | 'new';
  customers: Customer[];
  onBack: () => void;
  onSave: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customerId,
  customers,
  onBack,
  onSave,
  onDelete,
}) => {
  const { properties, orders } = useApp();
  
  const isNewCustomer = customerId === 'new';
  const existingCustomer = isNewCustomer ? null : customers.find((c) => c.id === customerId);

  const [isEditMode, setIsEditMode] = useState(isNewCustomer);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(
    existingCustomer || {
      id: `customer_${Date.now()}`,
      name: '',
      email: '',
      company: '',
      phone: '',
      propertiesCount: 0,
      totalSpent: 0,
      joinedAt: new Date(),
      status: 'active',
    }
  );

  if (!isNewCustomer && !existingCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Customer not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // Validate required fields
    if (!editedCustomer.name || !editedCustomer.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedCustomer.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    onSave(editedCustomer);
    toast.success(isNewCustomer ? 'Customer created successfully!' : 'Customer updated successfully!');
    if (isNewCustomer) {
      onBack();
    } else {
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (isNewCustomer) {
      onBack();
    } else {
      setEditedCustomer(existingCustomer!);
      setIsEditMode(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && !isNewCustomer) {
      onDelete(editedCustomer.id);
      toast.success('Customer deleted successfully');
      onBack();
    }
  };

  const updateField = (field: keyof Customer, value: any) => {
    setEditedCustomer({ ...editedCustomer, [field]: value });
  };

  // Get customer's properties and orders
  const customerProperties = properties.filter((p) => 
    orders.some((o) => o.propertyId === p.id)
  );
  
  const customerOrders = orders.filter((o) => 
    customerProperties.some((p) => p.id === o.propertyId)
  );

  const totalRevenue = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const paidOrders = customerOrders.filter((o) => o.status === 'paid');
  const pendingOrders = customerOrders.filter((o) => o.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Button>
          <div className="flex gap-2">
            {!isNewCustomer && !isEditMode && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Customer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {editedCustomer.name} and all associated data. This action cannot be undone.
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
                Edit Customer
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isNewCustomer ? 'Create Customer' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5" />
                <h2>{isNewCustomer ? 'New Customer' : 'Customer Information'}</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    {isEditMode ? (
                      <Input
                        id="name"
                        value={editedCustomer.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="John Doe"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{editedCustomer.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    {isEditMode ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedCustomer.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedCustomer.email}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditMode ? (
                      <Input
                        id="phone"
                        value={editedCustomer.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedCustomer.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    {isEditMode ? (
                      <Input
                        id="company"
                        value={editedCustomer.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        placeholder="Acme Real Estate"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700">{editedCustomer.company || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {!isNewCustomer && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {editedCustomer.joinedAt.toLocaleDateString()}</span>
                      </div>
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <Label htmlFor="status">Status:</Label>
                          <select
                            id="status"
                            value={editedCustomer.status}
                            onChange={(e) => updateField('status', e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      ) : (
                        <Badge className={editedCustomer.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {editedCustomer.status || 'active'}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Address Information */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Home className="w-5 h-5" />
                <h2>Address</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  {isEditMode ? (
                    <Input
                      id="address"
                      value={editedCustomer.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="123 Main St"
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{editedCustomer.address || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    {isEditMode ? (
                      <Input
                        id="city"
                        value={editedCustomer.city || ''}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Miami"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{editedCustomer.city || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    {isEditMode ? (
                      <Input
                        id="state"
                        value={editedCustomer.state || ''}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="FL"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{editedCustomer.state || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    {isEditMode ? (
                      <Input
                        id="zipCode"
                        value={editedCustomer.zipCode || ''}
                        onChange={(e) => updateField('zipCode', e.target.value)}
                        placeholder="33101"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{editedCustomer.zipCode || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5" />
                <h2>Notes</h2>
              </div>

              {isEditMode ? (
                <Textarea
                  value={editedCustomer.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add any notes about this customer..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{editedCustomer.notes || 'No notes added'}</p>
              )}
            </Card>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-6">
            {!isNewCustomer && (
              <>
                {/* Statistics */}
                <Card className="p-6">
                  <h3 className="mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 mb-1">Properties</p>
                      <p className="text-3xl">{customerProperties.length}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-gray-600 mb-1">Total Orders</p>
                      <p className="text-3xl">{customerOrders.length}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl text-green-600">${totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card className="p-6">
                  <h3 className="mb-4">Order Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Orders</span>
                      <Badge className="bg-green-500">{paidOrders.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Orders</span>
                      <Badge className="bg-yellow-500">{pendingOrders.length}</Badge>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Activity Tabs - Only show for existing customers */}
        {!isNewCustomer && (
          <Card className="mt-6 p-6">
            <Tabs defaultValue="properties">
              <TabsList>
                <TabsTrigger value="properties">Properties ({customerProperties.length})</TabsTrigger>
                <TabsTrigger value="orders">Orders ({customerOrders.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="mt-4">
                {customerProperties.length > 0 ? (
                  <div className="space-y-3">
                    {customerProperties.map((property) => (
                      <Card key={property.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-1">{property.address}</h3>
                            <p className="text-gray-600">
                              {property.city}, {property.state} {property.zipCode}
                            </p>
                            <div className="flex gap-3 mt-2">
                              {property.bedrooms && <span className="text-sm text-gray-600">{property.bedrooms} Bed</span>}
                              {property.bathrooms && <span className="text-sm text-gray-600">{property.bathrooms} Bath</span>}
                              {property.squareFeet && <span className="text-sm text-gray-600">{property.squareFeet.toLocaleString()} SF</span>}
                            </div>
                          </div>
                          <Badge variant="outline">{property.status}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No properties yet</p>
                )}
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                {customerOrders.length > 0 ? (
                  <div className="space-y-3">
                    {customerOrders.map((order) => {
                      const property = properties.find((p) => p.id === order.propertyId);
                      return (
                        <Card key={order.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3>Invoice #{order.id}</h3>
                                <Badge className={order.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                                  {order.status}
                                </Badge>
                              </div>
                              {property && (
                                <p className="text-gray-600">{property.address}</p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                {order.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-xl">${order.totalAmount.toLocaleString()}</p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No orders yet</p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};
