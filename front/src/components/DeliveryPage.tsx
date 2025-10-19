import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { availableServices } from '../lib/mockData';
import { Media } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Download, Eye, Image, Video, Box, MapPin, Palette } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { TemplateGallery } from './TemplateGallery';
import { TemplateEditor } from './TemplateEditor';
import { Template } from '../lib/templates';

interface DeliveryPageProps {
  propertyId: string;
  onBack: () => void;
}

export const DeliveryPage: React.FC<DeliveryPageProps> = ({ propertyId, onBack }) => {
  const { getPropertyById, getMediaByPropertyId, getServicesByPropertyId } = useApp();
  const property = getPropertyById(propertyId);
  const allMedia = getMediaByPropertyId(propertyId);
  const propertyServices = getServicesByPropertyId(propertyId);

  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (!property) {
    return <div>Property not found</div>;
  }

  const photos = allMedia.filter((m) => m.type === 'photo');
  const videos = allMedia.filter((m) => m.type === 'video');
  const scans3d = allMedia.filter((m) => m.type === '3d-scan');

  const handlePreview = (media: Media) => {
    setSelectedMedia(media);
    setPreviewOpen(true);
  };

  const handleDownload = (media: Media) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const MediaGrid = ({ mediaList }: { mediaList: Media[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mediaList.map((media) => (
        <Card key={media.id} className="overflow-hidden">
          <div className="aspect-video bg-gray-100 relative group cursor-pointer">
            <img
              src={media.thumbnailUrl || media.url}
              alt={media.fileName}
              className="w-full h-full object-cover"
              onClick={() => handlePreview(media)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(media);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="mb-1 truncate">{media.fileName}</h3>
            <p className="text-gray-600 mb-3">{formatFileSize(media.fileSize)}</p>
            <Button
              onClick={() => handleDownload(media)}
              variant="outline"
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1>Media Delivery</h1>
              <h2 className="mt-2">{property.address}</h2>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{property.city}, {property.state} {property.zipCode}</span>
              </div>
            </div>
            <Badge className="bg-green-500">Completed</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Photos</p>
                <p className="text-2xl">{photos.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Videos</p>
                <p className="text-2xl">{videos.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Box className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">3D Scans</p>
                <p className="text-2xl">{scans3d.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex gap-3">
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download All Files
            </Button>
            <Button 
              className="gap-2" 
              variant="outline"
              onClick={() => setShowTemplateGallery(true)}
            >
              <Palette className="w-4 h-4" />
              Create Social Media Post
            </Button>
          </div>
        </Card>

        {/* Media Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Media ({allMedia.length})</TabsTrigger>
            <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
            <TabsTrigger value="3d">3D Scans ({scans3d.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <MediaGrid mediaList={allMedia} />
          </TabsContent>

          <TabsContent value="photos">
            {photos.length > 0 ? (
              <MediaGrid mediaList={photos} />
            ) : (
              <Card className="p-12 text-center">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No photos available</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="videos">
            {videos.length > 0 ? (
              <MediaGrid mediaList={videos} />
            ) : (
              <Card className="p-12 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No videos available</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="3d">
            {scans3d.length > 0 ? (
              <MediaGrid mediaList={scans3d} />
            ) : (
              <Card className="p-12 text-center">
                <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No 3D scans available</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.fileName}</DialogTitle>
            </DialogHeader>
            {selectedMedia && (
              <div className="space-y-4">
                {selectedMedia.type === 'photo' && (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.fileName}
                    className="w-full rounded-lg"
                  />
                )}
                {selectedMedia.type === 'video' && (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
                    <Video className="w-16 h-16 text-gray-400" />
                    <p className="ml-4 text-gray-600">Video preview placeholder</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={() => handleDownload(selectedMedia)} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Gallery */}
      {showTemplateGallery && (
        <TemplateGallery
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setShowTemplateGallery(false);
          }}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Template Editor */}
      {selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          propertyImages={photos.map((p) => p.url)}
          propertyData={{
            address: property.address,
            city: property.city,
            state: property.state,
            price: 2500000, // This should come from property data if available
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            squareFeet: property.squareFeet,
          }}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
};
