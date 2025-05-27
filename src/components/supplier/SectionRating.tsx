
import { useAuth } from '@/components/auth/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";
import React, { useEffect, useState } from 'react';

export interface SectionRatingProps {
  supplierId: string;
  sectionName: string;
  sectionTitle: string;
  isAdmin?: boolean;
  initialRatingEnabled?: boolean;
  initialRating?: number;
  onRatingChange?: (section: string, rating: number) => void;
  onRatingEnabledChange?: (section: string, enabled: boolean) => void;
}

const SectionRating: React.FC<SectionRatingProps> = ({
  supplierId,
  sectionName,
  sectionTitle,
  isAdmin = false,
  initialRatingEnabled = true,
  initialRating = 0,
  onRatingChange,
  onRatingEnabledChange
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ratingEnabled, setRatingEnabled] = useState<boolean>(initialRatingEnabled);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  useEffect(() => {
    setRatingEnabled(initialRatingEnabled);
  }, [initialRatingEnabled]);

  const handleRatingSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate suppliers",
        variant: "destructive",
      });
      return;
    }

    if (!ratingEnabled) {
      toast({
        title: "Rating disabled",
        description: "This section is not available for rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now we'll use localStorage as a placeholder
      // In a real implementation, this would save to the database
      const storedRatings = JSON.parse(localStorage.getItem('sectionRatings') || '{}');
      const ratingKey = `${user.id}_${supplierId}_${sectionName}`;
      
      storedRatings[ratingKey] = rating;
      localStorage.setItem('sectionRatings', JSON.stringify(storedRatings));
      
      toast({
        title: "Rating submitted",
        description: `Your rating for ${sectionTitle} has been saved`,
      });
      
      if (onRatingChange) {
        onRatingChange(sectionName, rating);
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

  const handleRatingEnabledChange = (enabled: boolean) => {
    setRatingEnabled(enabled);
    
    if (onRatingEnabledChange) {
      onRatingEnabledChange(sectionName, enabled);
    }
    
    // In a real implementation, this would save to the database
    try {
      const storedSettings = JSON.parse(localStorage.getItem('ratingSettings') || '{}');
      storedSettings[`${supplierId}_${sectionName}`] = enabled;
      localStorage.setItem('ratingSettings', JSON.stringify(storedSettings));
      
      toast({
        title: "Setting updated",
        description: `Rating for ${sectionTitle} is now ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error saving rating setting:', error);
    }
  };

  if (isAdmin) {
    return (
      <div className="flex items-center space-x-2">
        <Switch
          id={`rating-switch-${sectionName}`}
          checked={ratingEnabled}
          onCheckedChange={handleRatingEnabledChange}
        />
        <Label htmlFor={`rating-switch-${sectionName}`}>
          Enable rating for {sectionTitle}
        </Label>
      </div>
    );
  }

  if (!ratingEnabled) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          Rate this {sectionTitle}
          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
            Feedback
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionRating;
