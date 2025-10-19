import React, { useState } from 'react';
import { Property, Media } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import {
  Home,
  MapPin,
  Maximize,
  Bed,
  Bath,
  Calendar,
  DollarSign,
  Square,
  Ruler,
  Check,
  Download,
  Share2,
  Heart,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PropertyLandingPageProps {
  property: Property;
  media: Media[];
  template?: 'modern' | 'luxury' | 'classic';
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
}

// Utility function to copy text to clipboard with fallback
const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try modern Clipboard API first
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback to older method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      return false;
    }
  }
};

// Modern Template - Clean and minimalist
const ModernTemplate: React.FC<PropertyLandingPageProps> = ({
  property,
  media,
  agentName = 'Your Real Estate Agent',
  agentEmail = 'agent@realestate.com',
  agentPhone = '(555) 123-4567',
}) => {
  const photos = media.filter((m) => m.type === 'photo');
  const videos = media.filter((m) => m.type === 'video');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.address,
          text: `Check out this property: ${property.address}`,
          url: window.location.href,
        });
      } else {
        const success = await copyToClipboard(window.location.href);
        if (success) {
          toast.success('Link copied to clipboard!');
        } else {
          toast.error('Unable to copy link');
        }
      }
    } catch (error) {
      // User cancelled share, try clipboard as fallback
      const success = await copyToClipboard(window.location.href);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Unable to share or copy link');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[70vh]">
        {photos.length > 0 ? (
          <>
            <ImageWithFallback
              src={photos[currentImageIndex]?.url || ''}
              alt={property.address}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home className="w-24 h-24 text-gray-400" />
          </div>
        )}
        {property.price && (
          <div className="absolute top-6 left-6 bg-black text-white px-6 py-3 rounded-lg">
            <p className="text-3xl">${property.price.toLocaleString()}</p>
          </div>
        )}
        <div className="absolute top-6 right-6 flex gap-2">
          <Button
            onClick={handleShare}
            className="bg-white text-black hover:bg-gray-100 gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Property Info */}
        <div className="mb-12">
          <h1 className="mb-4">{property.address}</h1>
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <MapPin className="w-5 h-5" />
            <span>
              {property.city}, {property.state} {property.zipCode}
            </span>
          </div>

          <div className="flex gap-8 mb-8">
            {property.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-gray-600" />
                <span className="text-xl">{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-gray-600" />
                <span className="text-xl">{property.bathrooms} Baths</span>
              </div>
            )}
            {property.squareFeet && (
              <div className="flex items-center gap-2">
                <Square className="w-5 h-5 text-gray-600" />
                <span className="text-xl">{property.squareFeet.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          {property.description && (
            <p className="text-gray-700 leading-relaxed mb-8">{property.description}</p>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-8" />

          {/* Additional Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {property.yearBuilt && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Year Built</p>
                <p className="text-xl">{property.yearBuilt}</p>
              </div>
            )}
            {property.lotSize && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Lot Size</p>
                <p className="text-xl">{property.lotSize.toLocaleString()} sqft</p>
              </div>
            )}
            <div>
              <p className="text-gray-600 text-sm mb-1">Property Type</p>
              <p className="text-xl capitalize">{property.propertyType}</p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {photos.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.slice(0, 9).map((photo, index) => (
                <div
                  key={photo.id}
                  className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <video key={video.id} controls className="w-full rounded-lg">
                  <source src={video.url} type="video/mp4" />
                </video>
              ))}
            </div>
          </div>
        )}

        {/* Contact Agent */}
        <Card className="p-8 bg-gray-50">
          <h2 className="mb-6">Interested? Contact the Agent</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <p className="text-xl mb-2">{agentName}</p>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Phone className="w-4 h-4" />
                <span>{agentPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{agentEmail}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="gap-2">
                <Phone className="w-4 h-4" />
                Call Now
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Luxury Template - Elegant and premium
const LuxuryTemplate: React.FC<PropertyLandingPageProps> = ({
  property,
  media,
  agentName = 'Your Real Estate Agent',
  agentEmail = 'agent@realestate.com',
  agentPhone = '(555) 123-4567',
}) => {
  const photos = media.filter((m) => m.type === 'photo');
  const videos = media.filter((m) => m.type === 'video');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.address,
          text: `Check out this luxury property: ${property.address}`,
          url: window.location.href,
        });
      } else {
        const success = await copyToClipboard(window.location.href);
        if (success) {
          toast.success('Link copied to clipboard!');
        } else {
          toast.error('Unable to copy link');
        }
      }
    } catch (error) {
      // User cancelled share, try clipboard as fallback
      const success = await copyToClipboard(window.location.href);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Unable to share or copy link');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero */}
      <div className="relative h-screen">
        {photos.length > 0 ? (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={photos[0]?.url || ''}
              alt={property.address}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">
            Exclusive Listing
          </Badge>
          <h1 className="mb-4 text-white max-w-4xl">{property.address}</h1>
          <div className="flex items-center gap-2 text-white/80 mb-8">
            <MapPin className="w-5 h-5" />
            <span className="text-xl">
              {property.city}, {property.state}
            </span>
          </div>

          {property.price && (
            <div className="mb-8">
              <p className="text-5xl text-white mb-2">${property.price.toLocaleString()}</p>
              <p className="text-white/60">Exclusive Offering</p>
            </div>
          )}

          <div className="flex gap-6 text-white">
            {property.bedrooms && (
              <div className="text-center">
                <p className="text-3xl mb-1">{property.bedrooms}</p>
                <p className="text-white/60 text-sm">Bedrooms</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center border-x border-white/20 px-6">
                <p className="text-3xl mb-1">{property.bathrooms}</p>
                <p className="text-white/60 text-sm">Bathrooms</p>
              </div>
            )}
            {property.squareFeet && (
              <div className="text-center">
                <p className="text-3xl mb-1">{property.squareFeet.toLocaleString()}</p>
                <p className="text-white/60 text-sm">Square Feet</p>
              </div>
            )}
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share This Property
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Description */}
        {property.description && (
          <div className="text-center mb-20">
            <h2 className="mb-6 text-white">About This Property</h2>
            <p className="text-xl text-white/70 leading-relaxed max-w-4xl mx-auto">
              {property.description}
            </p>
          </div>
        )}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-10 text-center text-white">Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.features.map((feature, index) => (
                <Card key={index} className="bg-white/5 border-white/10 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white">{feature}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Property Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {property.yearBuilt && (
            <div className="text-center">
              <Calendar className="w-8 h-8 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-1">Year Built</p>
              <p className="text-2xl text-white">{property.yearBuilt}</p>
            </div>
          )}
          {property.lotSize && (
            <div className="text-center">
              <Ruler className="w-8 h-8 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-1">Lot Size</p>
              <p className="text-2xl text-white">{property.lotSize.toLocaleString()} sqft</p>
            </div>
          )}
          <div className="text-center">
            <Home className="w-8 h-8 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm mb-1">Type</p>
            <p className="text-2xl text-white capitalize">{property.propertyType}</p>
          </div>
        </div>

        {/* Gallery */}
        {photos.length > 1 && (
          <div className="mb-20">
            <h2 className="mb-10 text-center text-white">Exclusive Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photos.slice(1, 7).map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt="Property"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-10 text-center text-white">Virtual Tours</h2>
            <div className="grid grid-cols-1 gap-6">
              {videos.map((video) => (
                <video key={video.id} controls className="w-full rounded-lg">
                  <source src={video.url} type="video/mp4" />
                </video>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <Card className="bg-white/5 border-white/10 p-12 backdrop-blur text-center">
          <h2 className="mb-4 text-white">Schedule a Private Showing</h2>
          <p className="text-white/60 mb-8 text-xl">
            Contact {agentName} for an exclusive viewing
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2 text-white">
              <Phone className="w-5 h-5" />
              <span className="text-xl">{agentPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Mail className="w-5 h-5" />
              <span className="text-xl">{agentEmail}</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button className="bg-white text-black hover:bg-gray-100 gap-2">
              <Phone className="w-4 h-4" />
              Schedule Showing
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
              <Mail className="w-4 h-4" />
              Request Info
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Classic Template - Traditional and detailed
const ClassicTemplate: React.FC<PropertyLandingPageProps> = ({
  property,
  media,
  agentName = 'Your Real Estate Agent',
  agentEmail = 'agent@realestate.com',
  agentPhone = '(555) 123-4567',
}) => {
  const photos = media.filter((m) => m.type === 'photo');
  const videos = media.filter((m) => m.type === 'video');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.address,
          text: `Check out this property: ${property.address}`,
          url: window.location.href,
        });
      } else {
        const success = await copyToClipboard(window.location.href);
        if (success) {
          toast.success('Link copied to clipboard!');
        } else {
          toast.error('Unable to copy link');
        }
      }
    } catch (error) {
      // User cancelled share, try clipboard as fallback
      const success = await copyToClipboard(window.location.href);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Unable to share or copy link');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">{property.address}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>
                  {property.city}, {property.state} {property.zipCode}
                </span>
              </div>
            </div>
            {property.price && (
              <div className="text-right">
                <p className="text-gray-600 text-sm mb-1">Asking Price</p>
                <p className="text-4xl text-blue-600">${property.price.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Photo */}
            {photos.length > 0 && (
              <Card className="overflow-hidden">
                <div className="aspect-video">
                  <ImageWithFallback
                    src={photos[0]?.url || ''}
                    alt={property.address}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            )}

            {/* Property Overview */}
            <Card className="p-6">
              <h2 className="mb-4">Property Overview</h2>
              <div className="grid grid-cols-3 gap-6 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl mb-1">{property.bedrooms}</p>
                    <p className="text-gray-600 text-sm">Bedrooms</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl mb-1">{property.bathrooms}</p>
                    <p className="text-gray-600 text-sm">Bathrooms</p>
                  </div>
                )}
                {property.squareFeet && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl mb-1">{property.squareFeet.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">Sq Ft</p>
                  </div>
                )}
              </div>

              {property.description && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                  </div>
                </>
              )}
            </Card>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Gallery */}
            {photos.length > 1 && (
              <Card className="p-6">
                <h2 className="mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {photos.slice(1).map((photo) => (
                    <div key={photo.id} className="aspect-video rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={photo.url}
                        alt="Property"
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4">Video Tours</h2>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <video key={video.id} controls className="w-full rounded-lg">
                      <source src={video.url} type="video/mp4" />
                    </video>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Details & Contact */}
          <div className="space-y-6">
            {/* Property Details */}
            <Card className="p-6">
              <h3 className="mb-4">Property Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Type</span>
                  <span className="capitalize">{property.propertyType}</span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Year Built</span>
                    <span>{property.yearBuilt}</span>
                  </div>
                )}
                {property.squareFeet && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Square Feet</span>
                    <span>{property.squareFeet.toLocaleString()}</span>
                  </div>
                )}
                {property.lotSize && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Lot Size</span>
                    <span>{property.lotSize.toLocaleString()} sqft</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Bedrooms</span>
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Bathrooms</span>
                    <span>{property.bathrooms}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Agent */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="mb-4">Contact Agent</h3>
              <div className="mb-6">
                <p className="text-xl mb-3">{agentName}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{agentPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{agentEmail}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Call Agent
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
              </div>
            </Card>

            {/* Share */}
            <Card className="p-6">
              <h3 className="mb-4">Share Property</h3>
              <Button onClick={handleShare} variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Share Link
              </Button>
            </Card>

            {/* Listing Info */}
            <Card className="p-6 bg-gray-100">
              <p className="text-sm text-gray-600">
                Property ID: {property.id}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Listed: {property.createdAt.toLocaleDateString()}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const PropertyLandingPage: React.FC<PropertyLandingPageProps> = (props) => {
  const template = props.template || props.property.landingPageTemplate || 'modern';

  switch (template) {
    case 'luxury':
      return <LuxuryTemplate {...props} />;
    case 'classic':
      return <ClassicTemplate {...props} />;
    case 'modern':
    default:
      return <ModernTemplate {...props} />;
  }
};
