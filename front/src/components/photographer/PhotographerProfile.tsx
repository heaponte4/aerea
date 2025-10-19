import React, { useState, useEffect } from 'react';
import { photographers } from '../../lib/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowLeft, User, Mail, Phone, Save, Star, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface PhotographerProfileProps {
  onBack: () => void;
}

export const PhotographerProfile: React.FC<PhotographerProfileProps> = ({ onBack }) => {
  const { user, updateProfile } = useAuth();
  // In production, this would be based on the logged-in photographer
  const photographerData = photographers[0]; // Sarah Mitchell

  // Load photographer data from localStorage if available
  const [photographerDetails, setPhotographerDetails] = useState(() => {
    const saved = localStorage.getItem('photographerData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          bio: photographerData.bio,
          specialties: photographerData.specialties,
          travelFee: photographerData.travelFee,
        };
      }
    }
    return {
      bio: photographerData.bio,
      specialties: photographerData.specialties,
      travelFee: photographerData.travelFee,
    };
  });

  const [formData, setFormData] = useState({
    name: user?.name || photographerData.name,
    email: user?.email || photographerData.email,
    phone: user?.phone || photographerData.phone,
    bio: photographerDetails.bio,
    travelFee: photographerDetails.travelFee.toString(),
  });

  const [specialties, setSpecialties] = useState<string[]>(photographerDetails.specialties);

  const availableSpecialties = [
    'Photography',
    'Video Tour',
    '3D Scan',
    'Drone Photography',
    'Twilight Photos',
  ];

  const handleAddSpecialty = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      setSpecialties([...specialties, specialty]);
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user profile
    updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    // Update photographer-specific data
    const photographerData = {
      bio: formData.bio,
      specialties,
      travelFee: parseInt(formData.travelFee),
    };
    localStorage.setItem('photographerData', JSON.stringify(photographerData));
    setPhotographerDetails(photographerData);

    toast.success('Profile updated successfully!');
  };

  const initials = photographerData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-6 mb-8 pb-6 border-b">
            <Avatar className="w-24 h-24">
              <AvatarImage src={photographerData.avatar} alt={photographerData.name} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="mb-1">{photographerData.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{photographerData.rating} rating</span>
                <span>•</span>
                <span>{photographerData.completedJobs} jobs completed</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sarah Mitchell"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@realmedia.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(305) 555-0123"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell clients about your experience and expertise..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="travelFee">Travel Fee ($)</Label>
              <Input
                id="travelFee"
                type="number"
                value={formData.travelFee}
                onChange={(e) => setFormData({ ...formData, travelFee: e.target.value })}
                placeholder="50"
              />
            </div>

            <div>
              <Label className="mb-3 block">Specialties</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableSpecialties.map((specialty) => (
                    <Button
                      key={specialty}
                      type="button"
                      variant={specialties.includes(specialty) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (specialties.includes(specialty)) {
                          handleRemoveSpecialty(specialty);
                        } else {
                          handleAddSpecialty(specialty);
                        }
                      }}
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} className="gap-1">
                        <Camera className="w-3 h-3" />
                        {specialty}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveSpecialty(specialty)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t">
            <h3 className="mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Total Jobs</p>
                <p className="text-2xl">{photographerData.completedJobs}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <p className="text-2xl">{photographerData.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
