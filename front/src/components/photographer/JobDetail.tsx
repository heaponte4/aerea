import React, { useState } from 'react';
import { PhotographerJob, ChecklistItem, JobComment } from '../../lib/photographerMockData';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  ListChecks,
  Upload,
  CalendarClock,
  X,
  Plus,
  History,
} from 'lucide-react';
import { jobsApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';

interface JobDetailProps {
  job: PhotographerJob;
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedJob: PhotographerJob) => void;
  onUploadFiles: (job: PhotographerJob) => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job, open, onClose, onUpdate, onUploadFiles }) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [comment, setComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(job.checklist || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const [showRescheduleHistory, setShowRescheduleHistory] = useState(false);

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  ];

  const totalAddons = job.addons.reduce((sum, addon) => sum + addon.price, 0);
  const totalAmount = job.servicePrice + totalAddons;

  const handleReschedule = async () => {
    if (!newDate || !newTime || !rescheduleReason.trim()) {
      toast.error('Please select a date, time, and provide a reason for rescheduling');
      return;
    }

    setIsLoading(true);
    try {
      const updatedJob = await jobsApi.reschedule(job.id, newDate, newTime, rescheduleReason);
      onUpdate(updatedJob);
      setIsRescheduling(false);
      setNewDate(undefined);
      setNewTime('');
      setRescheduleReason('');
      toast.success('Job rescheduled successfully');
    } catch (error) {
      toast.error('Failed to reschedule job');
      console.error('Error rescheduling job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    setIsLoading(true);
    try {
      const updatedJob = await jobsApi.markAsCompleted(job.id);
      onUpdate(updatedJob);
      toast.success('Job marked as completed');
    } catch (error) {
      toast.error('Failed to mark job as completed');
      console.error('Error marking job as completed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsLoading(true);
    try {
      const updatedJob = await jobsApi.addComment(job.id, comment, 'Sarah Mitchell');
      onUpdate(updatedJob);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);

    try {
      const updatedJob = await jobsApi.updateChecklist(job.id, updatedChecklist);
      onUpdate(updatedJob);
    } catch (error) {
      toast.error('Failed to update checklist');
      console.error('Error updating checklist:', error);
      // Revert on error
      setChecklist(job.checklist || []);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) {
      toast.error('Please enter a checklist item');
      return;
    }

    setIsLoading(true);
    try {
      const updatedJob = await jobsApi.addChecklistItem(job.id, newChecklistItem);
      onUpdate(updatedJob);
      setChecklist(updatedJob.checklist || []);
      setNewChecklistItem('');
      toast.success('Checklist item added');
    } catch (error) {
      toast.error('Failed to add checklist item');
      console.error('Error adding checklist item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveChecklistItem = async (itemId: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    setChecklist(updatedChecklist);

    try {
      const updatedJob = await jobsApi.updateChecklist(job.id, updatedChecklist);
      onUpdate(updatedJob);
      toast.success('Checklist item removed');
    } catch (error) {
      toast.error('Failed to remove checklist item');
      console.error('Error removing checklist item:', error);
      setChecklist(job.checklist || []);
    }
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const progressPercentage = checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle>{job.propertyAddress}</DialogTitle>
              <DialogDescription>
                {job.propertyCity}, {job.propertyState}
              </DialogDescription>
            </div>
            <Badge className={
              job.status === 'completed' ? 'bg-green-500' :
              job.status === 'upcoming' ? 'bg-blue-500' :
              job.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-500'
            }>
              {job.status}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Job Details */}
            <Card className="p-4">
              <h3 className="mb-4">Job Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p>{job.scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Time</p>
                    <p>{job.scheduledTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Service Type</p>
                    <p>{job.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Amount</p>
                    <p className="font-medium">${totalAmount}</p>
                  </div>
                </div>
              </div>

              {job.addons.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Add-ons:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.addons.map((addon, idx) => (
                      <Badge key={idx} variant="outline">
                        {addon.name} (+${addon.price})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Notes:</p>
                  <p className="text-gray-700">{job.notes}</p>
                </div>
              )}
            </Card>

            {/* Client Information */}
            <Card className="p-4">
              <h3 className="mb-4">Client Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span>{job.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <a href={`mailto:${job.clientEmail}`} className="text-blue-600 hover:underline">
                    {job.clientEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <a href={`tel:${job.clientPhone}`} className="text-blue-600 hover:underline">
                    {job.clientPhone}
                  </a>
                </div>
              </div>
            </Card>

            {/* Checklist */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-blue-600" />
                  <h3>Service Checklist</h3>
                  <Badge variant="outline">
                    {completedItems}/{checklist.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChecklist(!showChecklist)}
                >
                  {showChecklist ? 'Hide' : 'Show'}
                </Button>
              </div>

              {checklist.length > 0 && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{Math.round(progressPercentage)}% complete</p>
                </div>
              )}

              {showChecklist && (
                <>
                  <div className="space-y-2 mb-4">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 group"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleChecklistItem(item.id)}
                          disabled={job.status === 'completed'}
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.text}
                        </span>
                        {job.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {job.status !== 'completed' && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add checklist item..."
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddChecklistItem();
                          }
                        }}
                      />
                      <Button onClick={handleAddChecklistItem} disabled={isLoading} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Comments */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3>Comments</h3>
                  {job.comments && job.comments.length > 0 && (
                    <Badge variant="outline">{job.comments.length}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  {showComments ? 'Hide' : 'Show'}
                </Button>
              </div>

              {showComments && (
                <>
                  {job.comments && job.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {job.comments.map((c) => (
                        <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{c.createdBy}</span>
                            <span className="text-xs text-gray-600">
                              {c.createdAt.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddComment} disabled={isLoading} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Comment
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* Reschedule History */}
            {job.rescheduleHistory && job.rescheduleHistory.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    <h3>Reschedule History</h3>
                    <Badge variant="outline">{job.rescheduleHistory.length}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRescheduleHistory(!showRescheduleHistory)}
                  >
                    {showRescheduleHistory ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {showRescheduleHistory && (
                  <div className="space-y-3">
                    {job.rescheduleHistory.map((entry) => (
                      <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Rescheduled</span>
                          <span className="text-xs text-gray-600">
                            {entry.rescheduledAt.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                          <div>
                            <p className="text-gray-600">Original:</p>
                            <p>{entry.oldDate.toLocaleDateString()} at {entry.oldTime}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">New:</p>
                            <p>{entry.newDate.toLocaleDateString()} at {entry.newTime}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600">Reason:</p>
                          <p className="text-sm text-gray-700">{entry.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          {job.status === 'upcoming' && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsRescheduling(true)}
                className="gap-2"
              >
                <CalendarClock className="w-4 h-4" />
                Reschedule
              </Button>
              <Button
                onClick={handleMarkAsCompleted}
                disabled={isLoading}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Completed
              </Button>
            </>
          )}
          {job.status === 'completed' && (
            <Button onClick={() => onUploadFiles(job)} className="gap-2">
              <Upload className="w-4 h-4" />
              {job.uploadedFiles && job.uploadedFiles.length > 0 ? 'Manage Files' : 'Upload Files'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule Job</DialogTitle>
            <DialogDescription>
              Select a new date and time for this job. Please provide a reason for rescheduling.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Schedule</Label>
                <div className="p-3 bg-gray-50 rounded-lg mt-1">
                  <p className="text-sm">
                    {job.scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600">{job.scheduledTime}</p>
                </div>
              </div>
              <div>
                <Label>New Schedule</Label>
                <div className="p-3 bg-blue-50 rounded-lg mt-1">
                  {newDate ? (
                    <>
                      <p className="text-sm">
                        {newDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600">{newTime || 'Select time'}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">Select new date and time</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2">Select New Date</Label>
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md border mx-auto"
              />
            </div>

            {newDate && (
              <div>
                <Label className="mb-2">Select New Time</Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={newTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason for Rescheduling *</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you need to reschedule this job..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                This reason will be shared with the client
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduling(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newDate || !newTime || !rescheduleReason.trim() || isLoading}
            >
              {isLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
