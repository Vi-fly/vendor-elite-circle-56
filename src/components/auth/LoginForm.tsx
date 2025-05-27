
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailVerificationRequired(false);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      
      // If login is successful, navigation will be handled in AuthContext based on role
      
    } catch (error: any) {
      console.error('Login submission error:', error);
      
      // Check if error is related to email verification
      if (error.message?.includes('Email not confirmed')) {
        setEmailVerificationRequired(true);
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = async (role: string) => {
    const demoUsers = {
      admin: {
        email: 'demo.admin@educonnect.com',
        password: 'demo123'
      },
      school: {
        email: 'demo.school@educonnect.com',
        password: 'demo123'
      },
      supplier: {
        email: 'demo.supplier@educonnect.com',
        password: 'demo123'
      }
    };
    
    try {
      setIsLoading(true); // Use isLoading instead of isSubmitting
      setEmailVerificationRequired(false);
      
      const credentials = demoUsers[role as keyof typeof demoUsers];
      
      // Set the form fields for better UX
      setEmail(credentials.email);
      setPassword(credentials.password);
      
      await login(credentials.email, credentials.password);
      
    } catch (error: any) {
      console.error('Demo login error:', error);
      
      // Check if error is related to email verification
      if (error.message?.includes('Email not confirmed')) {
        setEmailVerificationRequired(true);
      } else {
        toast({
          title: "Demo login unavailable",
          description: "Demo accounts need to be created first. Please register to continue.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false); // Use isLoading instead of isSubmitting
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailVerificationRequired && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please verify your email before logging in. Check your inbox for a verification link.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-animated"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button type="button" variant="link" className="text-xs p-0 h-auto text-teal">
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-animated"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal to-primary hover:from-teal-dark hover:to-primary-dark text-white btn-animated"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
        </div>
        
        
      </CardContent>
      <CardFooter className="flex justify-center flex-col space-y-2">
        <div className="text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto text-teal"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
