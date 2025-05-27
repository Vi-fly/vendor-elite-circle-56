import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import ApplicationReview from '@/components/supplier/ApplicationReview';
import SectionRating from '@/components/supplier/SectionRating';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Calendar, Loader2, MessageCircle, Trash2, User } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string;
  supplier_id: string;
  school_id: string;
  feedback_type: string;
  subject: string;
  message: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SectionRatingConfig {
  [key: string]: boolean;
}

interface RatingColumn {
  id: string;
  name: string;
  enabled: boolean;
}

const ApplicationReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reviews");
  const [sectionRatings, setSectionRatings] = useState<{[key: string]: number}>({});
  const [ratingColumns, setRatingColumns] = useState<RatingColumn[]>([
    { id: "organization", name: "Organization Information", enabled: true },
    { id: "business", name: "Business Details", enabled: true },
    { id: "coverage", name: "Service Coverage", enabled: true },
    { id: "education", name: "Educational Profile", enabled: true },
    { id: "reliability", name: "Reliability", enabled: true },
    { id: "responsiveness", name: "Responsiveness", enabled: true },
    { id: "customerService", name: "Customer Service", enabled: true },
    { id: "qualityOfService", name: "Quality of Service", enabled: true },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  
  const isAdmin = user?.role === 'admin';
  const isSupplier = user?.role === 'supplier';

  useEffect(() => {
    const fetchApplicationAndReviews = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching supplier application for", user.email);
        
        // Fetch the application
        const { data: applicationData, error: applicationError } = await supabase
          .from('supplier_applications')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();
          
        if (applicationError) {
          console.error('Error fetching application:', applicationError);
          toast({
            title: "Error",
            description: "Could not load your application.",
            variant: "destructive",
          });
          return;
        }

        setApplication(applicationData);
        
        // Now fetch any feedback for this application
        if (applicationData?.id) {
          const { data: feedbackData, error: feedbackError } = await supabase
            .from('supplier_feedback')
            .select('*')
            .eq('supplier_id', applicationData.id)
            .order('created_at', { ascending: false });
            
          if (feedbackError) {
            console.error('Error fetching feedback:', feedbackError);
          } else if (feedbackData) {
            console.log("Feedback loaded:", feedbackData.length);
            setReviews(feedbackData);
          }
          
          // Fetch ratings if they exist - Fixed query
          const { data: ratingsData, error: ratingsError } = await supabase
            .from('supplier_ratings')
            .select('*')  // Changed from 'select=ratings' to 'select=*'
            .eq('supplier_id', applicationData.id)
            .eq('school_id', user.id)
            .maybeSingle();  // Changed from single() to maybeSingle() to handle no ratings case
            
          if (!ratingsError && ratingsData) {
            // Handle the ratings data structure
            const ratings = ratingsData.ratings || {};
            setSectionRatings(ratings);
          } else if (ratingsError) {
            console.error('Error fetching ratings:', ratingsError);
          }
          
          // Load rating configuration
          const { data: configData, error: configError } = await supabase
            .from('rating_configurations')
            .select('config')
            .eq('supplier_id', applicationData.id)
            .maybeSingle();  // Changed to maybeSingle() to handle no config case
            
          if (!configError && configData) {
            const config = configData.config as { [key: string]: { enabled: boolean } };
            const updatedColumns = ratingColumns.map(column => ({
              ...column,
              enabled: config[column.id]?.enabled ?? column.enabled
            }));
            setRatingColumns(updatedColumns);
          } else if (configError) {
            console.error('Error fetching rating configuration:', configError);
          }
        }

        console.log("Application loaded:", applicationData);
      } catch (error) {
        console.error('Error in application fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicationAndReviews();
  }, [user, toast]);

  const handleEditRequest = () => {
    // Navigate to edit form or toggle edit mode
    navigate('/join', { state: { editMode: true, application } });
  };
  
  const handleRatingChange = (section: string, rating: number) => {
    setSectionRatings(prev => ({
      ...prev,
      [section]: rating
    }));
  };
  
  const handleRatingEnabledChange = (columnId: string, enabled: boolean) => {
    const updatedColumns = ratingColumns.map(column => 
      column.id === columnId ? { ...column, enabled } : column
    );
    setRatingColumns(updatedColumns);
    
    // Save to localStorage (would be DB in real implementation)
    if (application?.id) {
      try {
        const storedSettings = JSON.parse(localStorage.getItem('ratingSettings') || '{}');
        storedSettings[`${application.id}_${columnId}`] = enabled;
        localStorage.setItem('ratingSettings', JSON.stringify(storedSettings));
        
        toast({
          title: "Setting updated",
          description: `Rating for ${columnId} is now ${enabled ? 'enabled' : 'disabled'}`,
        });
      } catch (error) {
        console.error('Error saving rating setting:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteReview = async (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const { error } = await supabase
        .from('supplier_feedback')
        .delete()
        .eq('id', reviewToDelete.id);

      if (error) throw error;

      // Update local state
      setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewToDelete.id));
      
      toast({
        title: "Feedback deleted",
        description: "The feedback has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-gray-600">Loading your application...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Only show rating tab for admin, not for suppliers
  const tabs = isAdmin 
    ? ["application", "reviews", "ratings"] 
    : ["application", "reviews"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="application" className="data-[state=active]:text-navy">Application Details</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:text-navy">Feedback</TabsTrigger>
            {isAdmin && <TabsTrigger value="ratings" className="data-[state=active]:text-navy">Rating Settings</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="application">
            <ApplicationReview 
              application={application} 
              onEditRequest={handleEditRequest}
              fieldIssues={reviews.filter(r => r.feedback_type === 'issue').map(r => r.message)}
            />
            
            {!isAdmin && !isSupplier && application && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratingColumns.filter(col => col.enabled).map(column => (
                  <SectionRating
                    key={column.id}
                    supplierId={application.id}
                    sectionName={column.id}
                    sectionTitle={column.name}
                    initialRating={sectionRatings[column.id] || 0}
                    initialRatingEnabled={column.enabled}
                    onRatingChange={handleRatingChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            {reviews.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Feedback</h2>
                <div className="space-y-4">
                  {[...reviews]
                    .sort((a, b) => {
                      // First sort by admin status (admin reviews first)
                      const aIsAdmin = a.school_id === 'admin';
                      const bIsAdmin = b.school_id === 'admin';
                      if (aIsAdmin !== bIsAdmin) return bIsAdmin ? 1 : -1;
                      
                      // Then sort by date (newest first)
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    })
                    .map(review => (
                    <Card 
                      key={review.id} 
                      className={`${
                        review.feedback_type === 'issue' 
                          ? "border-amber-200 bg-amber-50/30" 
                          : review.school_id === 'admin'
                            ? "border-navy bg-navy/5"
                            : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              review.feedback_type === 'issue' 
                                ? "bg-amber-100" 
                                : review.school_id === 'admin'
                                  ? "bg-navy/10"
                                  : "bg-blue-100"
                            }`}>
                              {review.feedback_type === 'issue' 
                                ? <AlertCircle className="h-5 w-5 text-amber-600" />
                                : review.school_id === 'admin'
                                  ? <User className="h-5 w-5 text-navy" />
                                  : <MessageCircle className="h-5 w-5 text-blue-600" />
                              }
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                                {review.subject}
                                {review.school_id === 'admin' && (
                                  <Badge className="bg-navy/10 text-navy border-navy/20">
                                    Admin Review
                                  </Badge>
                                )}
                                {review.feedback_type === 'issue' && (
                                  <Badge className="bg-amber-100 border-amber-200 text-amber-800">
                                    Requires Attention
                                  </Badge>
                                )}
                                {review.status === 'pending' && (
                                  <Badge className="bg-blue-100 border-blue-200 text-blue-800">
                                    Pending Review
                                  </Badge>
                                )}
                              </CardTitle>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(review.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Show delete button only for suppliers and non-admin reviews */}
                          {isSupplier && review.school_id !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteReview(review)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-3">
                        {review.message && (
                          <div className={`text-gray-700 p-4 rounded-md border ${
                            review.school_id === 'admin' 
                              ? "bg-white border-navy/20" 
                              : "bg-white border-gray-100"
                          }`}>
                            {review.message}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-medium text-gray-600">No Feedback Yet</h2>
                <p className="text-gray-500 mt-2">There is no feedback for this application at this time.</p>
              </div>
            )}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="ratings">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Enable or disable rating options for different sections. Schools will only be able to rate sections that are enabled.
                  </p>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ratingColumns.map((column) => (
                        <TableRow key={column.id}>
                          <TableCell>{column.name}</TableCell>
                          <TableCell>
                            <Badge variant={column.enabled ? "outline" : "secondary"}>
                              {column.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`rating-switch-${column.id}`}
                                checked={column.enabled}
                                onCheckedChange={(checked) => handleRatingEnabledChange(column.id, checked)}
                              />
                              <Label htmlFor={`rating-switch-${column.id}`}>
                                {column.enabled ? "Disable" : "Enable"}
                              </Label>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        
        {/* Add Alert Dialog for delete confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this feedback? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteReview}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ApplicationReviewPage;
