
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";
import React, { useEffect, useState } from 'react';

interface SupplierRatingProps {
  supplierId: string;
  initialRating?: number;
  onRatingSubmit?: (rating: number) => void;
}

export const SupplierRating: React.FC<SupplierRatingProps> = ({ 
  supplierId, 
  initialRating = 0,
  onRatingSubmit
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Since supplier_ratings table doesn't exist in our schema yet, we'll use localStorage as a temporary solution
  useEffect(() => {
    const fetchExistingRating = () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get ratings from localStorage
        const storedRatings = JSON.parse(localStorage.getItem('supplierRatings') || '{}');
        const ratingKey = `${user.id}_${supplierId}`;
        
        if (storedRatings[ratingKey]) {
          setExistingRating(storedRatings[ratingKey]);
          setRating(storedRatings[ratingKey]);
        } else {
          setExistingRating(null);
        }
      } catch (error) {
        console.error('Unexpected error fetching rating:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingRating();
  }, [supplierId, user?.id]);

  const handleRatingSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate suppliers",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store in localStorage instead of database
      const storedRatings = JSON.parse(localStorage.getItem('supplierRatings') || '{}');
      const ratingKey = `${user.id}_${supplierId}`;
      
      // Update rating
      storedRatings[ratingKey] = rating;
      localStorage.setItem('supplierRatings', JSON.stringify(storedRatings));
      
      setExistingRating(rating);
      
      toast({
        title: existingRating !== null ? "Rating updated" : "Rating submitted",
        description: existingRating !== null ? "Your rating has been updated successfully" : "Thank you for your feedback",
      });
      
      if (onRatingSubmit) {
        onRatingSubmit(rating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Rating failed",
        description: "There was a problem submitting your rating",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <Star key={starValue} className="h-5 w-5 text-gray-300 mx-0.5" />
          ))}
        </div>
        <p className="text-sm text-gray-500">Loading rating...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Button
            key={starValue}
            variant="ghost"
            size="sm"
            className="p-1"
            disabled={isSubmitting}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoveredRating(starValue)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            <Star 
              className={`h-5 w-5 ${(hoveredRating || rating) >= starValue 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-gray-300'
              }`} 
            />
          </Button>
        ))}
      </div>
      <Button 
        size="sm" 
        variant="outline"
        onClick={handleRatingSubmit}
        disabled={isSubmitting || rating === 0}
      >
        {isSubmitting ? 'Submitting...' : existingRating !== null ? 'Update Rating' : 'Submit Rating'}
      </Button>
      {existingRating !== null && (
        <p className="text-xs text-gray-500 mt-1">You have already rated this supplier. You can update your rating if needed.</p>
      )}
    </div>
  );
};

export default SupplierRating;
