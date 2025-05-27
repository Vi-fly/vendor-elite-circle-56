
import RatingConfiguration from '@/components/admin/RatingConfiguration';
import SupplierApproval from '@/components/admin/SupplierApproval';
import SupplierRatingConfiguration from '@/components/admin/SupplierRatingConfiguration';
import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Settings } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState({
    totalSuppliers: 0,
    pendingApproval: 0,
    schoolsRegistered: 0,
    activeConnections: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch dashboard stats from Supabase
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching admin dashboard stats...");
        
        // Get total suppliers (approved applications)
        const { data: approvedSuppliers, error: approvedError } = await supabase
          .from('supplier_applications')
          .select('count')
          .eq('status', 'approved');
          
        // Get pending applications
        const { data: pendingSuppliers, error: pendingError } = await supabase
          .from('supplier_applications')
          .select('count')
          .eq('status', 'pending');
          
        // Get waiting applications
        const { data: waitingSuppliers, error: waitingError } = await supabase
          .from('supplier_applications')
          .select('count')
          .eq('status', 'waiting');
          
        // Get school users count
        const { data: schoolUsers, error: schoolError } = await supabase
          .from('profiles')
          .select('count')
          .eq('role', 'school');
          
        // Get conversation count (active connections)
        const { data: connections, error: connectionsError } = await supabase
          .from('conversations')
          .select('count');
          
        if (approvedError || pendingError || waitingError || schoolError || connectionsError) {
          console.error('Error fetching data:', approvedError || pendingError || waitingError || schoolError || connectionsError);
          toast({
            title: "Data fetch error",
            description: "Could not load dashboard statistics",
            variant: "destructive",
          });
          return;
        }

        // Convert Supabase counts to numbers
        const approvedCount = approvedSuppliers?.[0]?.count ? Number(approvedSuppliers[0].count) : 0;
        const pendingCount = pendingSuppliers?.[0]?.count ? Number(pendingSuppliers[0].count) : 0;
        const waitingCount = waitingSuppliers?.[0]?.count ? Number(waitingSuppliers[0].count) : 0;
        const schoolCount = schoolUsers?.[0]?.count ? Number(schoolUsers[0].count) : 0;
        const connectionCount = connections?.[0]?.count ? Number(connections[0].count) : 0;
        
        console.log("Admin dashboard stats loaded:", { 
          approved: approvedCount,
          pending: pendingCount,
          waiting: waitingCount,
          schools: schoolCount,
          connections: connectionCount 
        });
        
        setDashboardStats({
          totalSuppliers: approvedCount,
          pendingApproval: pendingCount + waitingCount, // Combine pending and waiting for the stats display
          schoolsRegistered: schoolCount,
          activeConnections: connectionCount
        });
      } catch (error) {
        console.error('Error in data fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user, toast]);
  
  // Redirect if not an admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  // If no user or not admin, show access denied
  if (!user || user.role !== 'admin') {
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
                  You must be logged in as an administrator to access this page.
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

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
              <p className="text-gray-600">Manage supplier applications and system settings</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="text-navy border-navy hover:bg-navy/10"
              >
                My Profile
              </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-20 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-navy">{dashboardStats.totalSuppliers}</p>
                    <p className="text-xs text-gray-500 mt-1">Approved suppliers</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-20 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-amber-600">{dashboardStats.pendingApproval}</p>
                    <p className="text-xs text-gray-500 mt-1">Waiting for review</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Schools Registered</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-20 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-teal">{dashboardStats.schoolsRegistered}</p>
                    <p className="text-xs text-gray-500 mt-1">Active school accounts</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-20 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-indigo-600">{dashboardStats.activeConnections}</p>
                    <p className="text-xs text-gray-500 mt-1">School-supplier relationships</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content - Tabs for different admin sections */}
          <Tabs defaultValue="approvals" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none">
              <TabsTrigger value="approvals" className="data-[state=active]:text-navy">Supplier Approvals</TabsTrigger>
              <TabsTrigger value="ratings" className="data-[state=active]:text-navy flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Global Rating Settings
              </TabsTrigger>
              
            </TabsList>
            
            <TabsContent value="approvals" className="mt-6">
              <SupplierApproval />
            </TabsContent>
            
            <TabsContent value="ratings" className="mt-6">
              <RatingConfiguration />
            </TabsContent>
            
            <TabsContent value="supplier-ratings" className="mt-6">
              <SupplierRatingConfiguration />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
