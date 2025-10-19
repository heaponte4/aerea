import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { LogIn, Building2 } from 'lucide-react';

interface LoginProps {
  onSignupClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSignupClick }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password. Try one of the demo accounts below.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Real Estate Media Portal</h1>
          <p className="text-gray-600">Sign in to manage your property media</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="broker@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSignupClick}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs mb-2 text-center">Demo Mode - Use any email to login (password ignored)</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 text-center">
              <strong>Admin:</strong> admin@realestate.com
            </p>
            <p className="text-xs text-gray-600 text-center">
              <strong>Broker:</strong> broker@realestate.com
            </p>
            <p className="text-xs text-gray-600 text-center">
              <strong>Photographer:</strong> photographer@realestate.com
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Or use any other email - role determined by email content
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
