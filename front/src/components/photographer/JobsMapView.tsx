import React from 'react';
import { PhotographerJob } from '../../lib/photographerMockData';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Camera, DollarSign, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

interface JobsMapViewProps {
  jobs: PhotographerJob[];
  onViewJob: (job: PhotographerJob) => void;
}

export const JobsMapView: React.FC<JobsMapViewProps> = ({ jobs, onViewJob }) => {
  // Filter jobs that have coordinates
  const jobsWithCoordinates = jobs.filter(job => job.coordinates);

  if (jobsWithCoordinates.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600">No job locations to display</p>
      </Card>
    );
  }

  // Calculate center point
  const centerLat = jobsWithCoordinates.reduce((sum, job) => sum + (job.coordinates?.lat || 0), 0) / jobsWithCoordinates.length;
  const centerLng = jobsWithCoordinates.reduce((sum, job) => sum + (job.coordinates?.lng || 0), 0) / jobsWithCoordinates.length;

  return (
    <div className="space-y-4">
      {/* Map Preview Card */}
      <Card className="overflow-hidden">
        <div className="relative" style={{ height: '500px', width: '100%' }}>
          {/* Static map using OpenStreetMap */}
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.1},${centerLat - 0.1},${centerLng + 0.1},${centerLat + 0.1}&layer=mapnik&marker=${centerLat},${centerLng}`}
            title="Job Locations Map"
          />
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{jobsWithCoordinates.length} Job{jobsWithCoordinates.length > 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-gray-600">View details below</p>
          </div>
        </div>
      </Card>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobsWithCoordinates.map((job) => {
          const totalAddons = job.addons.reduce((sum, addon) => sum + addon.price, 0);
          const totalAmount = job.servicePrice + totalAddons;

          return (
            <Card key={job.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base">{job.propertyAddress}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {job.propertyCity}, {job.propertyState}
                  </p>
                  {job.coordinates && (
                    <p className="text-xs text-gray-500 mb-3">
                      {job.coordinates.lat.toFixed(4)}, {job.coordinates.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <Badge className={job.status === 'upcoming' ? 'bg-blue-500' : 'bg-green-500'}>
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{job.scheduledDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{job.scheduledTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Camera className="w-4 h-4" />
                  <span>{job.serviceType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span>${totalAmount} + $50 travel</span>
                </div>
              </div>

              {job.addons.length > 0 && (
                <div className="mb-4 pb-4 border-t pt-4">
                  <p className="text-xs text-gray-600 mb-2">Add-ons:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.addons.map((addon, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {addon.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => onViewJob(job)}
                size="sm"
                className="w-full"
              >
                View Details
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
