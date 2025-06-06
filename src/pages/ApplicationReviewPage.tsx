
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Application {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  supplier_type: string;
  status: string;
  submission_date: string;
  short_desc: string;
  service_details?: any;
}

const ApplicationReviewPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_applications')
        .select('*')
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('supplier_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await fetchApplications();
      toast({
        title: 'Success',
        description: `Application ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    }
  };

  const handleServiceDetailsChange = (serviceDetails: any) => {
    if (serviceDetails && typeof serviceDetails === 'object') {
      // Handle service_details as an object and extract rating information
      const newRatings: { [key: string]: number } = {};
      
      // Process service details if they contain rating information
      Object.entries(serviceDetails).forEach(([key, value]) => {
        if (typeof value === 'number') {
          newRatings[key] = value;
        }
      });
      
      setRatings(prevRatings => ({ ...prevRatings, ...newRatings }));
    }
  };

  useEffect(() => {
    if (selectedApp?.service_details) {
      handleServiceDetailsChange(selectedApp.service_details);
    }
  }, [selectedApp]);

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
          <div className="text-lg">Loading applications...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600 mt-2">Review and manage supplier applications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Applications ({applications.length})</CardTitle>
                <CardDescription>Click on an application to review details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedApp?.id === app.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <div>
                          <p className="font-medium text-sm">{app.org_name}</p>
                          <p className="text-xs text-gray-500">{app.supplier_type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No applications found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(selectedApp.status)}
                        {selectedApp.org_name}
                      </CardTitle>
                      <CardDescription>{selectedApp.supplier_type}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedApp.status)}>
                      {selectedApp.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Contact Person:</span> {selectedApp.contact_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedApp.email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedApp.phone}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{' '}
                        {new Date(selectedApp.submission_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-sm text-gray-700">{selectedApp.short_desc}</p>
                  </div>

                  {/* Service Details */}
                  {selectedApp.service_details && (
                    <div>
                      <h3 className="font-semibold mb-3">Service Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(selectedApp.service_details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedApp.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4" />
                    <p>Select an application to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationReviewPage;
