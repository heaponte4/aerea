import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { UserPlus, Building2, Camera, X } from 'lucide-react';

interface SignupProps {
  onLoginClick: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onLoginClick }) => {
  const { signup, signupPhotographer } = useAuth();
  const [accountType, setAccountType] = useState<'broker' | 'photographer'>('broker');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    bio: '',
    travelFee: '50',
  });
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (accountType === 'photographer' && specialties.length === 0) {
      setError('Please select at least one specialty');
      return;
    }

    setIsLoading(true);

    try {
      let success;
      if (accountType === 'photographer') {
        success = await signupPhotographer(
          formData.email,
          formData.password,
          formData.name,
          formData.phone,
          formData.bio,
          specialties,
          parseInt(formData.travelFee)
        );
      } else {
        success = await signup(
          formData.email,
          formData.password,
          formData.name,
          formData.company
        );
      }
      if (!success) {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            {accountType === 'photographer' ? (
              <Camera className="w-8 h-8 text-white" />
            ) : (
              <Building2 className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="mb-2">Create Account</h1>
          <p className="text-gray-600">Join Real Estate Media Portal</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={accountType} onValueChange={(v) => setAccountType(v as 'broker' | 'photographer')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="broker" className="gap-2">
              <Building2 className="w-4 h-4" />
              Real Estate Broker
            </TabsTrigger>
            <TabsTrigger value="photographer" className="gap-2">
              <Camera className="w-4 h-4" />
              Photographer
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="broker@example.com"
              required
              autoComplete="email"
            />
          </div>

          {accountType === 'broker' ? (
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Your Real Estate Company"
              />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(305) 555-0100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell clients about your experience and expertise..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialties">Specialties *</Label>
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
                          {specialty}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveSpecialty(specialty)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="travelFee">Travel Fee ($) *</Label>
                <Input
                  id="travelFee"
                  type="number"
                  value={formData.travelFee}
                  onChange={(e) => setFormData({ ...formData, travelFee: e.target.value })}
                  placeholder="50"
                  required
                  min="0"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};
