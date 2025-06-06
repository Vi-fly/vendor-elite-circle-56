
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RatingAverages {
  [key: string]: {
    average: number;
    weight: number;
    count?: number;
  };
}

interface Application {
  id: string;
  org_name: string;
  status: string;
  submission_date: string;
  short_desc: string;
}

const SupplierDashboard = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [ratingAverages, setRatingAverages] = useState<RatingAverages>({});
  const [overallRating, setOverallRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSupplierData();
    }
  }, [user]);

  const fetchSupplierData = async () => {
    try {
      // Fetch supplier application
      const { data: appData, error: appError } = await supabase
        .from('supplier_applications')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (appError && appError.code !== 'PGRST116') {
        throw appError;
      }

      setApplication(appData);

      if (appData) {
        // Fetch rating averages
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('supplier_rating_averages')
          .select('*')
          .eq('supplier_id', appData.id)
          .single();

        if (ratingsError && ratingsError.code !== 'PGRST116') {
          console.error('Error fetching ratings:', ratingsError);
        } else if (ratingsData?.ratings) {
          const ratings = ratingsData.ratings as RatingAverages;
          setRatingAverages(ratings);

          // Calculate overall rating
          let totalWeightedScore = 0;
          let totalWeight = 0;
          let reviewCount = 0;

          Object.values(ratings).forEach((rating) => {
            if (rating && typeof rating === 'object' && rating.average && rating.weight) {
              totalWeightedScore += rating.average * rating.weight;
              totalWeight += rating.weight;
              reviewCount += rating.count || 0;
            }
          });

          setOverallRating(totalWeight > 0 ? totalWeightedScore / totalWeight : 0);
          setTotalReviews(reviewCount);
        }
      }
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch supplier data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Supplier Dashboard</h1>
            <p className="text-gray-600 mb-8">
              You haven't submitted a supplier application yet.
            </p>
            <Button onClick={() => navigate('/join')}>
              Submit Application
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {application.org_name}</p>
        </div>

        {/* Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Application Status</CardTitle>
              {getStatusIcon(application.status)}
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                out of 5.0
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                from schools
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Submitted on {new Date(application.submission_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Organization Name</h4>
                <p className="text-sm text-gray-700">{application.org_name}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-700">{application.short_desc}</p>
              </div>

              {application.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Your application is under review. We'll notify you once it's processed.
                  </p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Congratulations! Your application has been approved. You can now manage your profile and connect with schools.
                  </p>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    Your application was not approved. Please contact support for more information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
              <CardDescription>
                How schools rate your services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(ratingAverages).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(ratingAverages).map(([area, rating]) => (
                    <div key={area} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {area.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (rating?.average || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {rating?.average?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No ratings yet</p>
                  <p className="text-sm">Start connecting with schools to receive ratings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {application.status === 'approved' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/pricing-management')}
              >
                <DollarSign className="w-4 h-4" />
                Manage Pricing
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/messaging')}
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <FileText className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SupplierDashboard;
