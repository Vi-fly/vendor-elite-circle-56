import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Award, Bell, CheckCircle, Clock, Eye, FileText, PenLine, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Use the database types
type SupplierApplication = Database['public']['Tables']['supplier_applications']['Row'];

interface SupplierProfile {
  id: string;
  user_id: string;
  org_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'waiting';
  submission_date?: string;
  last_updated?: string;
  profile_visibility: boolean;
  account_type: 'basic' | 'premium';
  created_at: string;
  updated_at: string;
  supplier_type: string;
  hq_city: string;
  year_started: number;
  audience_schools: boolean;
  audience_teachers: boolean;
  audience_students: boolean;
  audience_parents: boolean;
}

// Helper function to convert database status to our typed status
const getTypedStatus = (status: string | null): SupplierProfile['status'] => {
  if (!status) return 'not_submitted';
  switch (status.toLowerCase()) {
    case 'pending':
    case 'approved':
    case 'rejected':
    case 'waiting':
      return status.toLowerCase() as SupplierProfile['status'];
    default:
      return 'not_submitted';
  }
};

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }>({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: {}
  });
  
  // Fetch rating data
  const fetchRatingData = async (supplierId: string) => {
    try {
      const { data: ratingAverages, error: averagesError } = await supabase
        .from('supplier_rating_averages')
        .select('ratings')
        .eq('supplier_id', supplierId)
        .single();

      if (averagesError && averagesError.code !== 'PGRST116') {
        throw averagesError;
      }

      if (ratingAverages) {
        const ratings = ratingAverages.ratings as RatingAverages;
        let totalWeight = 0;
        let weightedSum = 0;
        let totalRatings = 0;
        const distribution: { [key: number]: number } = {};

        Object.entries(ratings).forEach(([_, data]) => {
          if (data.average && data.weight) {
            weightedSum += data.average * data.weight;
            totalWeight += data.weight;
            totalRatings++;
            
            // Round to nearest whole number for distribution
            const roundedRating = Math.round(data.average);
            distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
          }
        });

        const averageRating = totalWeight > 0 ? weightedSum / totalWeight : 0;

        setRatingStats({
          averageRating,
          totalRatings,
          ratingDistribution: distribution
        });
      }
    } catch (error) {
      console.error('Error fetching rating data:', error);
    }
  };

  // Fetch supplier data
  const fetchSupplierData = async () => {
    if (!user) return;

    try {
      // Fetch supplier profile with all needed fields
      const { data: profile, error: profileError } = await supabase
        .from('supplier_applications')
        .select(`
          id,
          user_id,
          org_name,
          status,
          submission_date,
          created_at,
          updated_at,
          supplier_type,
          hq_city,
          year_started,
          audience_schools,
          audience_teachers,
          audience_students,
          audience_parents,
          company_type,
          contact_name,
          email,
          phone,
          website,
          operational_cities,
          states_covered,
          full_desc,
          short_desc,
          pitch,
          payment_modes,
          refund_policy,
          service_details
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found, set status to not_submitted
          setSupplierProfile({
            id: '',
            user_id: user.id,
            org_name: '',
            status: 'not_submitted',
            profile_visibility: false,
            account_type: 'basic',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            supplier_type: '',
            hq_city: '',
            year_started: 0,
            audience_schools: false,
            audience_teachers: false,
            audience_students: false,
            audience_parents: false
          });
        } else {
          throw profileError;
        }
      } else if (profile) {
        // Profile found, convert database status to typed status
        const typedStatus = getTypedStatus(profile.status);
        
        // Create a properly typed profile object
        const typedProfile: SupplierProfile = {
          id: profile.id,
          user_id: profile.user_id,
          org_name: profile.org_name || '',
          status: typedStatus,
          submission_date: profile.submission_date || undefined,
          last_updated: profile.updated_at || undefined,
          profile_visibility: false, // Default value since it's not in the database
          account_type: 'basic', // Default value since it's not in the database
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          supplier_type: profile.supplier_type || '',
          hq_city: profile.hq_city || '',
          year_started: profile.year_started || 0,
          audience_schools: profile.audience_schools || false,
          audience_teachers: profile.audience_teachers || false,
          audience_students: profile.audience_students || false,
          audience_parents: profile.audience_parents || false
        };

        setSupplierProfile(typedProfile);
        
        // Fetch ratings after setting profile
        await fetchRatingData(profile.id);
      }

    } catch (error: any) {
      console.error('Error fetching supplier data:', error);
      toast({
        title: "Error",
        description: "Failed to load supplier data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || user.role !== 'supplier') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the supplier dashboard.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  
    fetchSupplierData();

    // Subscribe to real-time updates
    const profileSubscription = supabase
      .channel('supplier_profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'supplier_applications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchSupplierData();
      })
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, [user, navigate, toast]);
  
  // If no user or not a supplier, show access denied
  if (!user || user.role !== 'supplier') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You must be logged in as a supplier to access this page.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-teal to-primary text-white"
                  >
                    Log In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  const getStatusDisplay = () => {
    if (!supplierProfile) return null;

    switch (supplierProfile.status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Under Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Not Approved
          </Badge>
        );
      case 'waiting':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Updates Requested
          </Badge>
        );
      case 'not_submitted':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Not Submitted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Not Submitted
          </Badge>
        );
    }
  };

  const renderStatusCard = () => {
    if (!supplierProfile) return null;

    if (supplierProfile.status === 'not_submitted') {
  return (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-8 animate-fade-in">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                <h2 className="text-2xl font-bold mb-2">Complete Your Supplier Profile</h2>
                    <p className="text-indigo-100 max-w-2xl">
                  You haven't submitted your supplier details yet. Complete your profile to get approved and become visible to schools.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-100 px-8 whitespace-nowrap"
                    onClick={() => navigate('/join')}
                  >
                Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
      );
    }

    
          
    if (supplierProfile.status === 'rejected') {
      return (
            <Card className="border-0 shadow-lg border-l-4 border-red-500 mb-8 animate-fade-in">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-red-600">Your application wasn't approved</h2>
                    <p className="text-gray-600 max-w-2xl">
                      Unfortunately, your supplier application wasn't approved at this time. You may reapply with updated information.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => navigate('/join')}
                  >
                    Reapply
                  </Button>
                </div>
              </CardContent>
            </Card>
      );
    }
          
    if (supplierProfile.status === 'pending') {
      return (
            <Card className="border-0 shadow-lg border-l-4 border-yellow-500 mb-8 animate-fade-in">
              <CardContent className="p-8">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">Your Application is Under Review</h2>
                    <p className="text-gray-600 mb-2">
                      Our team is currently reviewing your supplier application. This process typically takes 2-3 business days.
                    </p>
                    <p className="text-sm text-gray-500">
                  Submission date: {supplierProfile.submission_date ? new Date(supplierProfile.submission_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
      );
    }

    return null;
  };

  const renderDashboardContent = () => {
    if (!supplierProfile) return null;

    return (
      <div className="space-y-8">
        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Views</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
                </CardContent>
              </Card>
              
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Listings</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
                </CardContent>
              </Card>
              
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">
                      {ratingStats.averageRating ? ratingStats.averageRating.toFixed(1) : 'N/A'}
                    </h3>
                    {ratingStats.totalRatings > 0 && (
                      <span className="text-sm text-gray-500">
                        ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'rating' : 'ratings'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
                </CardContent>
              </Card>
            </div>
          
        {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Status Card */}
            <Card className="border-0 shadow-lg">
                  <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Organization Name</p>
                      <p className="font-medium">{supplierProfile.org_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Supplier Type</p>
                      <p className="font-medium">{supplierProfile.supplier_type || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{supplierProfile.hq_city || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium">{supplierProfile.year_started ? `${new Date().getFullYear() - supplierProfile.year_started} years` : 'Not set'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Target Audience</h4>
                    <div className="flex flex-wrap gap-2">
                      {supplierProfile.audience_schools && <Badge variant="secondary">Schools</Badge>}
                      {supplierProfile.audience_teachers && <Badge variant="secondary">Teachers</Badge>}
                      {supplierProfile.audience_students && <Badge variant="secondary">Students</Badge>}
                      {supplierProfile.audience_parents && <Badge variant="secondary">Parents</Badge>}
                      {!supplierProfile.audience_schools && !supplierProfile.audience_teachers && 
                       !supplierProfile.audience_students && !supplierProfile.audience_parents && (
                        <p className="text-gray-500">No target audience specified</p>
                      )}
                    </div>
                          </div>

                  {/* Rating Distribution */}
                  {ratingStats.totalRatings > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Rating Distribution</h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-8">{rating}★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-400 rounded-full"
                                style={{ 
                                  width: `${(ratingStats.ratingDistribution[rating] || 0) / ratingStats.totalRatings * 100}%` 
                                }}
                              />
                          </div>
                            <span className="text-sm text-gray-500 w-12">
                              {ratingStats.ratingDistribution[rating] || 0}
                            </span>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}
                    </div>
                  </CardContent>
                </Card>
              
            {/* Recent Activity Card */}
            <Card className="border-0 shadow-lg">
                  <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
              <CardContent>
                    <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Profile Created</p>
                      <p className="text-sm text-gray-600">
                        {supplierProfile.created_at ? new Date(supplierProfile.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {supplierProfile.updated_at ? new Date(supplierProfile.updated_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                      </div>
                  {supplierProfile.submission_date && (
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-gray-600">
                          {new Date(supplierProfile.submission_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                    </div>
                  </CardContent>
                </Card>
          </div>
                
          {/* Right Column - Quick Actions and Tips */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/application-review')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View/Edit Application
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/pricing-management')}
                  >
                    <PenLine className="w-4 h-4 mr-2" />
                    Manage Pricing
                      </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/legal-complaint')}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle>Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-full mt-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Complete your profile with detailed information about your services and expertise.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-full mt-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Keep your pricing and service information up to date to attract more schools.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-full mt-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Maintain high ratings by providing excellent service and responding to feedback.
                    </p>
              </div>
            </div>
                </CardContent>
              </Card>
                        </div>
                      </div>
                      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal to-primary flex items-center justify-center text-white font-bold text-2xl">
                  {supplierProfile?.org_name?.charAt(0) || 'S'}
                        </div>
                      </div>
                      <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-navy">{supplierProfile?.org_name}</h1>
                  {getStatusDisplay()}
                      </div>
                <p className="text-gray-600">Supplier Dashboard</p>
                        </div>
                      </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Logged in as <span className="font-semibold">{user.name}</span>
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
              >
                Log Out
              </Button>
            </div>
          </div>
          
          {/* Status Card */}
          {renderStatusCard()}

          {/* Main Dashboard Content */}
          {supplierProfile?.status !== 'not_submitted' && renderDashboardContent()}
        </div>
      </div>
    </Layout>
  );
};

export default SupplierDashboard;
