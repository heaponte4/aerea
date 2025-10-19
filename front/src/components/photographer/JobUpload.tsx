import React, { useState, useRef } from 'react';
import { PhotographerJob, UploadedFile } from '../../lib/photographerMockData';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowLeft, Upload, Image, Video, FileText, X, Check, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface JobUploadProps {
  job: PhotographerJob;
  onBack: () => void;
  onUploadComplete: (jobId: string, files: UploadedFile[]) => void;
}

export const JobUpload: React.FC<JobUploadProps> = ({ job, onBack, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(job.uploadedFiles || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveUploaded = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload process
    const uploadPromises = selectedFiles.map(async (file, index) => {
      // Simulate upload delay
      await new Promise((resolve) => {
        setTimeout(() => {
          setUploadProgress(((index + 1) / selectedFiles.length) * 100);
          resolve(true);
        }, 500);
      });

      // Create uploaded file object with mock URL
      const uploadedFile: UploadedFile = {
        id: `file${Date.now()}${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In production, this would be a server URL
        uploadedAt: new Date(),
        thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };

      return uploadedFile;
    });

    try {
      const newFiles = await Promise.all(uploadPromises);
      const allFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(allFiles);
      setSelectedFiles([]);
      setUploadProgress(100);
      
      // Call the callback to update parent
      onUploadComplete(job.id, allFiles);
      
      toast.success(`Successfully uploaded ${newFiles.length} file(s)`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalAddons = job.addons.reduce((sum, addon) => sum + addon.price, 0);
  const totalAmount = job.servicePrice + totalAddons;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>

        {/* Job Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1>{job.propertyAddress}</h1>
                <Badge className="bg-green-500">{job.status}</Badge>
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
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl">${totalAmount}</p>
              <p className="text-gray-600">Service: {job.serviceType}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-gray-600 mb-2">Client: {job.clientName}</p>
            <div className="flex gap-4 text-gray-600">
              <span>{job.clientEmail}</span>
              <span>{job.clientPhone}</span>
            </div>
          </div>
        </Card>

        {/* Upload Section */}
        <Card className="p-6 mb-6">
          <h2 className="mb-4">Upload Files</h2>
          
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="mb-2">Click to select files or drag and drop</p>
            <p className="text-gray-600">Photos, videos, and documents accepted</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Selected Files ({selectedFiles.length})</h3>
                <Button onClick={handleUpload} disabled={uploading} className="gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload All'}
                </Button>
              </div>

              {uploading && (
                <div className="mb-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-gray-600 mt-2">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}

              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p>{file.name}</p>
                          <p className="text-gray-600">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSelected(index)}
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2>Uploaded Files ({uploadedFiles.length})</h2>
              <Badge className="bg-green-500 gap-1">
                <Check className="w-4 h-4" />
                Delivered
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <Card key={file.id} className="overflow-hidden">
                    {file.thumbnailUrl ? (
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="truncate mb-1">{file.name}</p>
                      <p className="text-gray-600">{formatFileSize(file.size)}</p>
                      <p className="text-gray-600 mt-2">
                        {file.uploadedAt.toLocaleDateString()} at {file.uploadedAt.toLocaleTimeString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleRemoveUploaded(file.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {uploadedFiles.length === 0 && selectedFiles.length === 0 && (
          <Card className="p-12 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No files uploaded yet. Upload your completed work above.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
