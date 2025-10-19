import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowLeft, User, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AdminProfileProps {
  onBack: () => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ onBack }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Admin',
    email: user?.email || 'admin@realmedia.com',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Profile updated successfully!');
  };

  if (!user) return null;

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
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">AD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="mb-1">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500 mt-1 capitalize">{user.role}</p>
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
                placeholder="Admin"
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
                placeholder="admin@realmedia.com"
                required
              />
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
            <h3 className="mb-2">Account Information</h3>
            <div className="space-y-2 text-gray-600">
              <p>Role: Administrator</p>
              <p>Account ID: {user.id}</p>
              <p>Member since: {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
