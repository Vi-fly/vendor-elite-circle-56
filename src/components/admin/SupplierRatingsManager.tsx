import { useAuth } from '@/components/auth/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AlertCircle, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type SupplierRating = Database['public']['Tables']['supplier_ratings']['Row'] & {
  school_name?: string;
  supplier_name?: string;
};

const SupplierRatingsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<SupplierRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<SupplierRating | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_ratings')
        .select(`
          *,
          supplier:supplier_id(org_name),
          school:school_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRatings = data.map(rating => ({
        ...rating,
        supplier_name: rating.supplier?.org_name,
        school_name: rating.school?.name,
      }));

      setRatings(formattedRatings);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      toast({
        title: "Error",
        description: "Failed to load ratings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRatings();
    }
  }, [user]);

  const handleDeleteRating = async () => {
    if (!selectedRating) return;

    try {
      const { error } = await supabase
        .from('supplier_ratings')
        .delete()
        .eq('id', selectedRating.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rating deleted successfully",
      });

      // Refresh the ratings list
      fetchRatings();
    } catch (error: any) {
      console.error('Error deleting rating:', error);
      toast({
        title: "Error",
        description: "Failed to delete rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRating(null);
    }
  };

  const getAverageRating = (ratings: any) => {
    try {
      const parsedRatings = typeof ratings === 'string' ? JSON.parse(ratings) : ratings;
      const values = Object.values(parsedRatings).filter(val => typeof val === 'number');
      if (values.length === 0) return 0;
      return values.reduce((a: number, b: number) => a + b, 0) / values.length;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You must be an admin to access this page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading ratings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Ratings Management</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No ratings found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => {
                const avgRating = getAverageRating(rating.ratings);
                return (
                  <Card key={rating.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{rating.supplier_name}</h3>
                            <Badge variant="outline">Rated by {rating.school_name}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{avgRating.toFixed(1)}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Dialog open={isDeleteDialogOpen && selectedRating?.id === rating.id} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setSelectedRating(rating)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Rating</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this rating? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsDeleteDialogOpen(false);
                                  setSelectedRating(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteRating}
                              >
                                Delete Rating
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierRatingsManager; 