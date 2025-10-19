import React, { useState } from 'react';
import { Payment } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, DollarSign, Calendar, CreditCard, FileText, User, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { photographerJobs } from '../../lib/photographerMockData';
import { photographers } from '../../lib/mockData';

interface PaymentDetailProps {
  paymentId: string;
  payments: Payment[];
  onBack: () => void;
  onSave: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
  onViewInvoice?: (orderId: string) => void;
  onViewJob?: (jobId: string) => void;
}

export const PaymentDetail: React.FC<PaymentDetailProps> = ({
  paymentId,
  payments,
  onBack,
  onSave,
  onDelete,
  onViewInvoice,
  onViewJob,
}) => {
  const { orders, properties } = useApp();
  const isNew = paymentId === 'new';
  const existingPayment = payments.find((p) => p.id === paymentId);

  const [formData, setFormData] = useState<Payment>(
    existingPayment || {
      id: `payment_${Date.now()}`,
      orderId: '',
      amount: 0,
      travelFee: 0,
      paymentDate: new Date(),
      status: 'pending',
      paymentMethod: 'credit_card',
      paidToPhotographer: false,
    }
  );

  const [isEditing, setIsEditing] = useState(isNew);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(formData.id);
    onBack();
  };

  const handleMarkAsPaid = () => {
    setFormData({
      ...formData,
      status: 'paid',
      paymentDate: new Date(),
    });
  };

  const handleMarkPhotographerPaid = () => {
    setFormData({
      ...formData,
      paidToPhotographer: true,
      photographerPaymentDate: new Date(),
    });
  };

  // Get related data
  const order = orders.find((o) => o.id === formData.orderId);
  const property = order ? properties.find((p) => p.id === order.propertyId) : null;
  const job = formData.jobId ? photographerJobs.find((j) => j.id === formData.jobId) : null;
  const photographer = formData.photographerId
    ? photographers.find((p) => p.id === formData.photographerId)
    : null;

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'refunded':
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
      case 'refunded':
        return 'bg-orange-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1>{isNew ? 'New Payment' : `Payment #${formData.id}`}</h1>
              <p className="text-gray-600 mt-1">
                {isNew ? 'Record a new payment' : 'View and manage payment details'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && !isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Payment
                </Button>
                {formData.status !== 'paid' && (
                  <Button onClick={handleMarkAsPaid} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Mark as Paid
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <Button variant="outline" onClick={isNew ? onBack : () => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Payment</Button>
              </>
            )}
          </div>
        </div>

        {/* Payment Status Overview */}
        {!isNew && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-600">Total Amount</p>
              </div>
              <p className="text-3xl">${(formData.amount + (formData.travelFee || 0)).toLocaleString()}</p>
              <p className="text-gray-600 mt-1">
                ${formData.amount} + ${formData.travelFee || 0} travel fee
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {getStatusIcon(formData.status)}
                </div>
                <p className="text-gray-600">Payment Status</p>
              </div>
              <Badge className={`${getStatusColor(formData.status)} mt-2`}>
                {formData.status.toUpperCase()}
              </Badge>
              {formData.status === 'paid' && (
                <p className="text-gray-600 mt-2">
                  Paid on {formData.paymentDate.toLocaleDateString()}
                </p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-gray-600">Photographer Status</p>
              </div>
              {formData.paidToPhotographer ? (
                <>
                  <Badge className="bg-green-500 mt-2">PAID</Badge>
                  {formData.photographerPaymentDate && (
                    <p className="text-gray-600 mt-2">
                      Paid on {formData.photographerPaymentDate.toLocaleDateString()}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Badge className="bg-yellow-500 mt-2">PENDING</Badge>
                  {formData.status === 'paid' && (
                    <Button
                      onClick={handleMarkPhotographerPaid}
                      variant="outline"
                      className="mt-2 gap-2"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Paid
                    </Button>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        {/* Related Information */}
        {!isNew && (order || job) && (
          <Card className="p-6 mb-6">
            <h2 className="mb-4">Related Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order && (
                <div>
                  <p className="text-gray-600 mb-2">Invoice Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Invoice ID:</span>
                      <span className="font-medium">#{order.id}</span>
                    </div>
                    {property && (
                      <div className="flex items-center justify-between">
                        <span>Property:</span>
                        <span className="font-medium">
                          {property.address}, {property.city}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Invoice Total:</span>
                      <span className="font-medium">${order.totalAmount.toLocaleString()}</span>
                    </div>
                    {onViewInvoice && (
                      <Button
                        onClick={() => onViewInvoice(order.id)}
                        variant="outline"
                        className="w-full mt-2 gap-2"
                        size="sm"
                      >
                        <FileText className="w-4 h-4" />
                        View Invoice
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {job && (
                <div>
                  <p className="text-gray-600 mb-2">Job Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Job ID:</span>
                      <span className="font-medium">#{job.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Property:</span>
                      <span className="font-medium">{job.propertyAddress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{job.serviceType}</span>
                    </div>
                    {onViewJob && (
                      <Button
                        onClick={() => onViewJob(job.id)}
                        variant="outline"
                        className="w-full mt-2 gap-2"
                        size="sm"
                      >
                        <FileText className="w-4 h-4" />
                        View Job
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {photographer && (
                <div>
                  <p className="text-gray-600 mb-2">Photographer</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{photographer.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{photographer.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{photographer.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Payment Details Form */}
        <Card className="p-6 mb-6">
          <h2 className="mb-6">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="orderId">Order/Invoice ID *</Label>
              <Select
                value={formData.orderId}
                onValueChange={(value) => setFormData({ ...formData, orderId: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="orderId">
                  <SelectValue placeholder="Select an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => {
                    const prop = properties.find((p) => p.id === order.propertyId);
                    return (
                      <SelectItem key={order.id} value={order.id}>
                        Invoice #{order.id} - {prop?.address || 'N/A'} - ${order.totalAmount}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Payment Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Payment['status']) => setFormData({ ...formData, status: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Service Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="travelFee">Travel Fee</Label>
              <Input
                id="travelFee"
                type="number"
                value={formData.travelFee || 0}
                onChange={(e) => setFormData({ ...formData, travelFee: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod || 'credit_card'}
                onValueChange={(value: Payment['paymentMethod']) =>
                  setFormData({ ...formData, paymentMethod: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={formData.transactionId || ''}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., TXN123456789"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={!isEditing}
                placeholder="Add any additional notes about this payment..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Delete Section */}
        {!isNew && (
          <Card className="p-6 border-red-200">
            <h2 className="mb-4 text-red-600">Danger Zone</h2>
            {showDeleteConfirm ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this payment record? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Payment
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
