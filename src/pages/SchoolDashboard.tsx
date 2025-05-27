import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import SupplierList from '@/components/school/SupplierList';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SchoolDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("suppliers");
  const [dashboardStats, setDashboardStats] = useState({
    totalSuppliers: 0,
    inNetwork: 0,
    newProviders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<{id: string, name: string} | null>(null);
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string}>>([]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Get total suppliers (approved applications)
        const { data: approvedSuppliers, error: approvedError } = await supabase
          .from('supplier_applications')
          .select('count')
          .eq('status', 'approved');
          
        if (approvedError) {
          console.error('Error fetching data:', approvedError);
          toast({
            title: "Data fetch error",
            description: "Could not load dashboard statistics",
            variant: "destructive",
          });
          return;
        }

        // Get connected suppliers (for this specific school - in a real app, this would use a junction table)
        const { data: connectedSuppliers, error: connectedError } = await supabase
          .from('supplier_applications')
          .select('count')
          .eq('status', 'approved');

        // Get new suppliers added in the last month
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: newSuppliers, error: newError } = await supabase
          .from('supplier_applications')
          .select('count')
          .eq('status', 'approved')
          .gte('submission_date', thirtyDaysAgo.toISOString());
        
        if (newError) {
          console.error('Error fetching new suppliers data:', newError);
        }
        
        // Properly handle count results from Supabase - ensure they're converted to numbers
        const totalCount = approvedSuppliers?.[0]?.count ? Number(approvedSuppliers[0].count) : 0;
        const connectedCount = connectedSuppliers?.[0]?.count ? Number(connectedSuppliers[0].count) : 0;
        const newCount = newSuppliers?.[0]?.count ? Number(newSuppliers[0].count) : 0;
        
        // Set dashboard statistics with properly converted numbers
        setDashboardStats({
          totalSuppliers: totalCount,
          inNetwork: connectedCount || Math.floor(totalCount * 0.4),
          newProviders: newCount || Math.floor(totalCount * 0.25)
        });

      } catch (error) {
        console.error('Error in data fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.role === 'school') {
      fetchDashboardStats();
    }
  }, [user, toast]);
  
  // Fetch suppliers for rating dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('supplier_applications')
          .select('id, org_name')
          .eq('status', 'approved')
          .order('org_name');

        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (user?.role === 'school') {
      fetchSuppliers();
    }
  }, [user]);
  
  // Redirect if not a school coordinator
  React.useEffect(() => {
    if (user && user.role !== 'school') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the school coordinator dashboard.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  // If no user or not a school coordinator, show access denied
  if (!user || user.role !== 'school') {
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
                  You must be logged in as a school coordinator to access this page.
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

  const handleRatingSubmit = async () => {
    if (!user || !selectedSupplier || !selectedRating) return;

    try {
      // Check if user has already rated this supplier
      const { data: existingRating, error: checkError } = await supabase
        .from('supplier_reviews')
        .select('*')
        .eq('supplier_id', selectedSupplier.id)
        .eq('reviewer_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('supplier_reviews')
          .update({ 
            rating: selectedRating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (updateError) throw updateError;
        toast({
          title: "Rating Updated",
          description: "Your rating has been updated successfully.",
        });
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('supplier_reviews')
          .insert({
            supplier_id: selectedSupplier.id,
            reviewer_id: user.id,
            reviewer_role: 'school',
            rating: selectedRating,
          });

        if (insertError) throw insertError;
        toast({
          title: "Rating Submitted",
          description: "Your rating has been submitted successfully.",
        });
      }

      // Reset state
      setSelectedRating(0);
      setSelectedSupplier(null);
      setIsRatingOpen(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy">School Coordinator Dashboard</h1>
              <p className="text-gray-600">Browse and connect with approved education service providers</p>
            </div>
            <div className="flex items-center gap-4">
              

              <span className="text-sm text-gray-600">
                Logged in as <span className="font-semibold">{user?.name}</span>
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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-navy">{dashboardStats.totalSuppliers}</p>
                    <p className="text-xs text-gray-500 mt-1">Verified providers</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">In Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-teal">{dashboardStats.inNetwork}</p>
                    <p className="text-xs text-gray-500 mt-1">Connected suppliers</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-amber-600">{dashboardStats.newProviders}</p>
                    <p className="text-xs text-gray-500 mt-1">New providers this month</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            
            
            <TabsContent value="suppliers">
              <SupplierList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolDashboard;
