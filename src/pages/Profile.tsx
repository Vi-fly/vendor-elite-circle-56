import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Fetch user profile data including phone number
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchProfile();
  }, [user?.id, toast]);
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to view your profile.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);
  
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          email,
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch(user.role) {
      case 'admin':
        return '/admin';
      case 'school':
        return '/school-dashboard';
      case 'supplier':
        return '/supplier-dashboard';
      default:
        return '/';
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // If no user, show loading or redirect
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Redirecting to login...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-navy">My Profile</h1>
              <Button 
                variant="outline"
                onClick={() => navigate(getDashboardLink())}
              >
                Back to Dashboard
              </Button>
            </div>
            
            <Card className="mb-8 border-0 shadow-md">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-teal">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-teal to-primary text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl text-navy">{user.name}</CardTitle>
                    <CardDescription className="text-gray-600">{user.email}</CardDescription>
                    <span className="inline-block mt-2 px-3 py-1 bg-teal/20 text-teal text-sm rounded-full">
                      {user.role === 'admin' ? 'Administrator' : 
                       user.role === 'school' ? 'School User' : 
                       user.role === 'supplier' ? 'Supplier' : 'User'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Separator className="mb-6" />
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded">{user.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded">{user.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="mt-1"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded">{phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Account Type</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded">
                      {user.role === 'admin' ? 'Administrator' : 
                       user.role === 'school' ? 'School User' : 
                       user.role === 'supplier' ? 'Supplier' : 'Standard User'}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Account ID</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded font-mono text-sm text-gray-600">
                      {user.id}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={logout}
                    >
                      Sign Out
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                    <div>
                      <h4 className="font-medium text-navy">Password</h4>
                      <p className="text-sm text-gray-600">Last changed: Never</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                    <div>
                      <h4 className="font-medium text-navy">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Enhance your account security</p>
                    </div>
                    <Button variant="outline">Set Up</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
