import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Building,
    Calendar,
    ExternalLink,
    Globe,
    Linkedin,
    Loader2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    SendHorizontal,
    Settings,
    Star,
    Tag,
    User
} from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import SupplierRatingConfiguration from "./SupplierRatingConfiguration";

// Define a type specifically for the review data
interface ReviewData {
  comment: string;
  fields: string[];
  rating?: number;
  is_issue?: boolean;
  field_issue?: string;
}

// Update the Supplier interface to properly handle the service_details and review properties
interface Supplier {
  id?: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  supplier_type: string;
  submission_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'waiting';
  review?: ReviewData;
  service_details?: Record<string, any> | null;
  additional_info?: Record<string, any> | null;
  [key: string]: any;
}

// Field feedback interface
interface FieldFeedback {
  field: string;
  message: string;
}

// Schema for the review form
const reviewSchema = z.object({
  comment: z.string().min(1, "Review comment is required"),
  fields: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
});

// Schema for field feedback
const fieldFeedbackSchema = z.object({
  message: z.string().min(1, "Feedback message is required"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;
type FieldFeedbackValues = z.infer<typeof fieldFeedbackSchema>;

const SupplierApproval: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [activeFieldFeedback, setActiveFieldFeedback] = useState<string | null>(null);
  const [fieldFeedbackMessage, setFieldFeedbackMessage] = useState('');
  const [isRatingConfigOpen, setIsRatingConfigOpen] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: "",
      fields: [],
      rating: 0,
    },
  });

  const fieldFeedbackForm = useForm<FieldFeedbackValues>({
    resolver: zodResolver(fieldFeedbackSchema),
    defaultValues: {
      message: "",
    },
  });

  // Fetch suppliers from Supabase
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('supplier_applications')
          .select('*')
          .order('submission_date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Process and format supplier data
        const formattedSuppliers = data.map(supplier => {
          // Parse service_details if it's a string
          let parsedServiceDetails: Record<string, any> | null = null;
          if (supplier.service_details) {
            if (typeof supplier.service_details === 'string') {
              try {
                parsedServiceDetails = JSON.parse(supplier.service_details as string);
              } catch (e) {
                console.error('Error parsing service_details:', e);
              }
            } else if (typeof supplier.service_details === 'object') {
              // If it's already an object, use it directly
              parsedServiceDetails = supplier.service_details as Record<string, any>;
            }
          }

          // Parse review data from additional_info
          let reviewData: ReviewData | undefined = undefined;
          let additionalInfoObj: Record<string, any> = {};
          
          if (supplier.additional_info) {
            // Handle various scenarios of additional_info
            if (typeof supplier.additional_info === 'string') {
              try {
                additionalInfoObj = JSON.parse(supplier.additional_info) || {};
              } catch (e) {
                console.error('Error parsing additional_info:', e);
                additionalInfoObj = {};
              }
            } else if (typeof supplier.additional_info === 'object') {
              additionalInfoObj = supplier.additional_info as Record<string, any>;
            }
            
            // Try to extract review data
            if (additionalInfoObj && additionalInfoObj.review) {
              try {
                if (typeof additionalInfoObj.review === 'string') {
                  reviewData = JSON.parse(additionalInfoObj.review);
                } else if (typeof additionalInfoObj.review === 'object') {
                  reviewData = additionalInfoObj.review as ReviewData;
                }
              } catch (e) {
                console.error('Error parsing review data:', e);
              }
            }
          }
          
          // Create the formatted supplier object
          return {
            ...supplier,
            status: supplier.status as 'pending' | 'approved' | 'rejected' | 'waiting',
            service_details: parsedServiceDetails,
            review: reviewData,
            additional_info: additionalInfoObj
          };
        });
        
        setSuppliers(formattedSuppliers);
        setFilteredSuppliers(formattedSuppliers);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast({
          title: 'Failed to load suppliers',
          description: 'There was an error loading supplier data.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [toast]);

  // Filter suppliers whenever tab or search changes
  useEffect(() => {
    let result = [...suppliers];
    
    // Apply status filter based on tab
    if (currentTab !== 'all') {
      result = result.filter(supplier => supplier.status === currentTab);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(supplier => 
        supplier.org_name.toLowerCase().includes(term) ||
        supplier.contact_name.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredSuppliers(result);
  }, [suppliers, currentTab, searchTerm]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsReviewMode(false);
    
    // Reset form if we have a review for this supplier
    if (supplier.review) {
      form.reset({
        comment: supplier.review.comment,
        fields: supplier.review.fields
      });
      setSelectedFields(supplier.review.fields || []);
    } else {
      form.reset({
        comment: "",
        fields: []
      });
      setSelectedFields([]);
    }
    setRating(0);
    setActiveFieldFeedback(null);
  };

  const handleApprove = async (supplier: Supplier) => {
    await updateSupplierStatus(supplier, 'approved');
  };

  const handleReject = async (supplier: Supplier) => {
    await updateSupplierStatus(supplier, 'rejected');
  };
  
  const handleSetWaiting = async (supplier: Supplier) => {
    await updateSupplierStatus(supplier, 'waiting');
  };
  
  const updateSupplierStatus = async (supplier: Supplier, newStatus: 'approved' | 'rejected' | 'waiting' | 'pending') => {
    try {
      // Update the supplier status in the database
      const { error } = await supabase
        .from('supplier_applications')
        .update({ status: newStatus })
        .eq('id', supplier.id);
        
      if (error) throw error;
      
      // Update the local state
      const updatedSuppliers = suppliers.map(s => {
        if (s.id === supplier.id) {
          return { ...s, status: newStatus };
        }
        return s;
      });
      
      setSuppliers(updatedSuppliers);
      
      const statusMessages = {
        approved: "Supplier Approved",
        rejected: "Supplier Rejected",
        waiting: "Supplier Set to Waiting",
        pending: "Supplier Set to Pending"
      };
      
      toast({
        title: statusMessages[newStatus],
        description: `${supplier.org_name} has been ${newStatus === 'waiting' ? 'moved to waiting list' : newStatus}.`
      });
      
      // Update the selected supplier if it's currently being viewed
      if (selectedSupplier && selectedSupplier.id === supplier.id) {
        setSelectedSupplier({ ...selectedSupplier, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating supplier status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update supplier status',
        variant: 'destructive'
      });
    }
  };

  const handleReviewMode = () => {
    setIsReviewMode(true);
  };

  const handleFieldSelection = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
    
    // Update form value
    form.setValue('fields', selectedFields.includes(field) 
      ? selectedFields.filter(f => f !== field)
      : [...selectedFields, field]
    );
  };

  // Handle opening the field feedback popover
  const handleFieldFeedback = (field: string) => {
    setActiveFieldFeedback(field);
    setFieldFeedbackMessage('');
    fieldFeedbackForm.reset({ message: '' });
  };

  // Handle submitting field-specific feedback
  const handleSubmitFieldFeedback = async () => {
    if (!selectedSupplier || !activeFieldFeedback) return;
    
    try {
      const message = fieldFeedbackForm.getValues('message');
      if (!message.trim()) {
        toast({
          title: "Error",
          description: "Feedback message cannot be empty",
          variant: "destructive"
        });
        return;
      }

      // Save in the supplier_feedback table
      const { error: feedbackError } = await supabase
        .from('supplier_feedback')
        .insert({
          supplier_id: selectedSupplier.id,
          school_id: (await supabase.auth.getUser()).data.user?.id || 'admin',
          feedback_type: 'field_issue',
          subject: `Issue with ${activeFieldFeedback}`,
          message: message,
          is_anonymous: false,
          status: 'pending'
        });
        
      if (feedbackError) {
        console.error('Error storing field feedback:', feedbackError);
        throw feedbackError;
      }
      
      // Update status to waiting
      await updateSupplierStatus(selectedSupplier, 'waiting');
      
      // Close the popover and reset form
      setActiveFieldFeedback(null);
      fieldFeedbackForm.reset();
      
      toast({
        title: "Feedback Sent",
        description: `Your feedback about ${activeFieldFeedback.replace(/([A-Z])/g, ' $1').trim()} has been sent to ${selectedSupplier.org_name}`,
      });
    } catch (error) {
      console.error('Error submitting field feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit field feedback',
        variant: 'destructive'
      });
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    form.setValue('rating', newRating);
  };

  const handleSubmitReview = async (values: ReviewFormValues) => {
    if (!selectedSupplier) return;
    
    try {
      const reviewData: ReviewData = {
        comment: values.comment,
        fields: selectedFields,
        rating: values.rating || 0,
        is_issue: selectedFields.length > 0
      };
      
      // Store in the supplier_feedback table
      const { error: feedbackError } = await supabase
        .from('supplier_feedback')
        .insert({
          supplier_id: selectedSupplier.id,
          school_id: (await supabase.auth.getUser()).data.user?.id || 'admin',
          feedback_type: selectedFields.length > 0 ? 'issue' : 'review',
          subject: selectedFields.length > 0 ? 'Application Review with Issues' : 'Application Review',
          message: values.comment,
          is_anonymous: false,
          status: 'pending'
        });
        
      if (feedbackError) {
        console.error('Error storing in supplier_feedback:', feedbackError);
        throw feedbackError;
      }
      
      // Also store in supplier_ratings if there's a rating
      if (values.rating && values.rating > 0) {
        const { error: ratingError } = await supabase
          .from('supplier_ratings')
          .insert({
            supplier_id: selectedSupplier.id,
            school_id: (await supabase.auth.getUser()).data.user?.id || 'admin',
            ratings: {
              overall: values.rating,
              fields: selectedFields.reduce((acc, field) => ({
                ...acc,
                [field]: values.rating
              }), {})
            }
          });
          
        if (ratingError) {
          console.error('Error storing rating:', ratingError);
        }
      }
      
      // Update the supplier status
      const { error } = await supabase
        .from('supplier_applications')
        .update({ 
          status: 'waiting',
          additional_info: JSON.stringify({
            ...selectedSupplier.additional_info,
            review: reviewData
          })
        })
        .eq('id', selectedSupplier.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedSupplier: Supplier = {
        ...selectedSupplier,
        additional_info: {
          ...selectedSupplier.additional_info,
          review: reviewData
        },
        status: 'waiting' as const
      };
      
      const updatedSuppliers = suppliers.map(s => 
        s.id === selectedSupplier.id ? updatedSupplier : s
      );
      
      setSuppliers(updatedSuppliers);
      setSelectedSupplier(updatedSupplier);
      setIsReviewMode(false);
      setRating(0);
      
      toast({
        title: "Review Submitted",
        description: `Feedback has been sent to ${updatedSupplier.org_name}`,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive'
      });
    }
  };

  const getSupplierTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'edtech': 'EdTech',
      'curriculum': 'Curriculum',
      'furniture': 'Furniture',
      'transport': 'Transport',
      'training': 'Training',
      'erp': 'ERP Software',
      'books': 'Books',
      'uniforms': 'Uniforms'
    };
    
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'waiting':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Waiting</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to safely render any value including objects
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    
    if (typeof value === 'object') {
      // Convert objects to string representation to avoid React errors when rendering
      return JSON.stringify(value);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return value.toString();
  };

  // Render field value with feedback option
  const renderFieldWithFeedback = (fieldName: string, value: any, isIssue: boolean = false) => {
    const displayValue = renderValue(value);
    const formattedFieldName = fieldName.replace(/([A-Z])/g, ' $1').trim();
    
    return (
      <div className="relative group">
        <p className={`font-medium ${isIssue ? 'text-red-600' : ''} group-hover:text-teal-600 transition-colors`}>
          {displayValue}
        </p>
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover open={activeFieldFeedback === fieldName}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 border-dashed border-teal-300 text-teal-600"
                onClick={() => handleFieldFeedback(fieldName)}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Feedback
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <Form {...fieldFeedbackForm}>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmitFieldFeedback();
              }}>
                <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Feedback on {formattedFieldName}</h4>
                  <p className="text-sm text-muted-foreground">Current value: {displayValue}</p>
                </div>
                <FormField
                  control={fieldFeedbackForm.control}
                  name="message"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Message</FormLabel>
                    <FormControl>
                    <Textarea 
                      placeholder={`What's the issue with this ${formattedFieldName}?`} 
                      className="min-h-[80px]"
                      {...field}
                      onChange={(e) => {
                      field.onChange(e);
                      setFieldFeedbackMessage(e.target.value);
                      }}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />
                <div>
                  <h4 className="text-sm font-medium mb-2">Rating</h4>
                  <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                    >
                    <Star
                      className={`h-6 w-6 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                    </button>
                  ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveFieldFeedback(null)}
                  >
                  Cancel
                  </Button>
                  <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-teal hover:bg-teal-dark"
                  disabled={!fieldFeedbackForm.getValues('message')?.trim()}
                  >
                  <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                  Send Feedback
                  </Button>
                </div>
                </div>
              </form>
              </Form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  // Function to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render supplier detail view
  const renderSupplierDetail = () => {
    if (!selectedSupplier) return null;
    
    // Calculate the average rating (mock data for now)
    const rating = 4.0;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto shadow-xl animate-scale-in">
          <CardHeader className="flex flex-row items-center gap-4 sticky top-0 bg-white z-10 border-b">
            <Avatar className="h-16 w-16 bg-navy text-white">
              <AvatarFallback>{getInitials(selectedSupplier.org_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{selectedSupplier.org_name}</CardTitle>
                {getStatusBadge(selectedSupplier.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{getSupplierTypeName(selectedSupplier.supplier_type)} Provider</span>
                <span>•</span>
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> Est. {selectedSupplier.year_started || 'N/A'}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" /> {selectedSupplier.hq_city || 'N/A'}
                </span>
              </div>
              
              {/* Rating display */}
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500 ml-1">(1 reviews)</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedSupplier(null)}
              className="rounded-full h-8 w-8"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </Button>
          </CardHeader>
          
          <CardContent className="p-0">
            {isReviewMode ? (
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitReview)} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-navy border-b pb-2">Review Submission</h3>
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feedback for Supplier</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide detailed feedback on what needs to be corrected" 
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Rating Section */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Rating</h4>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tag Problem Fields</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(selectedSupplier)
                          .filter(([key]) => {
                            const excludedFields = ['id', 'status', 'review', 'submission_date', 'additional_info'];
                            return !excludedFields.includes(key) && typeof key === 'string';
                          })
                          .map(([key]) => (
                            <div 
                              key={key}
                              onClick={() => handleFieldSelection(key)}
                              className={`
                                flex items-center p-2 rounded-md cursor-pointer
                                ${selectedFields.includes(key) 
                                  ? 'bg-blue-100 border border-blue-300' 
                                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                              `}
                            >
                              <Tag className={`h-4 w-4 mr-2 ${selectedFields.includes(key) ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsReviewMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Submit Review</Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <>
                {/* Review section if there's a review */}
                {selectedSupplier.review && (
                  <div className="mx-6 mt-6 mb-2 bg-amber-50 border border-amber-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-2 text-amber-800">Admin Review</h3>
                    <p className="text-amber-900">{selectedSupplier.review.comment}</p>
                    
                    {selectedSupplier.review.fields && selectedSupplier.review.fields.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-amber-800 mb-1">Problem Fields:</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedSupplier.review.fields.map((field: string) => (
                            <Badge key={field} variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                              {field.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tabs for different sections */}
                <Tabs defaultValue="about" className="w-full mt-4">
                  <TabsList className="w-full px-6 justify-start border-b rounded-none">
                    <TabsTrigger value="about" className="data-[state=active]:text-navy">About Us</TabsTrigger>
                    <TabsTrigger value="contact" className="data-[state=active]:text-navy">Contact Information</TabsTrigger>
                    <TabsTrigger value="services" className="data-[state=active]:text-navy">Services & Offerings</TabsTrigger>
                    <TabsTrigger value="location" className="data-[state=active]:text-navy">Location & Coverage</TabsTrigger>
                    <TabsTrigger value="policies" className="data-[state=active]:text-navy">Payment & Policies</TabsTrigger>
                  </TabsList>
                  
                  {/* About Us Tab */}
                  <TabsContent value="about" className="px-6 py-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Organization Details</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-gray-500">One-line Pitch</p>
                              {renderFieldWithFeedback('pitch', selectedSupplier.pitch || "Not provided", 
                                selectedSupplier.review?.fields?.includes('pitch'))}
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Year Started</p>
                              {renderFieldWithFeedback('year_started', selectedSupplier.year_started || "Not provided", 
                                selectedSupplier.review?.fields?.includes('year_started'))}
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Company Type</p>
                              {renderFieldWithFeedback('company_type', selectedSupplier.company_type || "Not provided", 
                                selectedSupplier.review?.fields?.includes('company_type'))}
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">GST Number</p>
                              {renderFieldWithFeedback('gst_number', selectedSupplier.gst_number || "Not provided", 
                                selectedSupplier.review?.fields?.includes('gst_number'))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Short Description</p>
                            {renderFieldWithFeedback('short_desc', selectedSupplier.short_desc || "Not provided", 
                              selectedSupplier.review?.fields?.includes('short_desc'))}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Full Description</p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {renderFieldWithFeedback('full_desc', selectedSupplier.full_desc || "Not provided", 
                                selectedSupplier.review?.fields?.includes('full_desc'))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Product Brochure</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {selectedSupplier.brochure_url ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                <div>
                                  <p className="font-medium">Brochure Available</p>
                                  <p className="text-sm text-gray-500">Click to view the product brochure</p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-teal text-teal hover:bg-teal-50"
                                onClick={() => window.open(selectedSupplier.brochure_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Brochure
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                              </svg>
                              <div>
                                <p className="font-medium">No Brochure Available</p>
                                <p className="text-sm text-gray-500">This supplier hasn't uploaded a brochure yet</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Contact Information Tab */}
                  <TabsContent value="contact" className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Contact Person</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex items-start">
                            <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                              <p className="font-medium">Contact Person</p>
                              {renderFieldWithFeedback('contact_name', selectedSupplier.contact_name, 
                                selectedSupplier.review?.fields?.includes('contact_name'))}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                              <p className="font-medium">Email</p>
                              {renderFieldWithFeedback('email', selectedSupplier.email, 
                                selectedSupplier.review?.fields?.includes('email'))}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                              <p className="font-medium">Phone</p>
                              {renderFieldWithFeedback('phone', selectedSupplier.phone, 
                                selectedSupplier.review?.fields?.includes('phone'))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Online Presence</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex items-start">
                            <Globe className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                              <p className="font-medium">Website</p>
                              <div className={`relative group ${selectedSupplier.review?.fields?.includes('website') ? 'text-red-600' : ''}`}>
                                {selectedSupplier.website ? (
                                  <a href={selectedSupplier.website} target="_blank" rel="noopener noreferrer" 
                                    className="text-blue-600 hover:underline flex items-center">
                                    {selectedSupplier.website}
                                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                  </a>
                                ) : "Not provided"}
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Popover open={activeFieldFeedback === 'website'}>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 px-2 border-dashed border-teal-300 text-teal-600"
                                        onClick={() => handleFieldFeedback('website')}
                                      >
                                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                        Feedback
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80" align="end">
                                      <div>
                                        <h4 className="font-medium">Feedback on Website</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                          Current value: {selectedSupplier.website || "Not provided"}
                                        </p>
                                        <form onSubmit={(e) => {
                                          e.preventDefault(); 
                                          handleSubmitFieldFeedback();
                                        }}>
                                          <div className="space-y-3">
                                            <div className="space-y-1">
                                              <label className="text-sm font-medium">Feedback Message</label>
                                              <Textarea 
                                                placeholder="What's the issue with the website field?" 
                                                className="min-h-[80px]"
                                                value={fieldFeedbackMessage}
                                                onChange={(e) => setFieldFeedbackMessage(e.target.value)}
                                              />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                              <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setActiveFieldFeedback(null)}
                                              >
                                                Cancel
                                              </Button>
                                              <Button 
                                                type="submit" 
                                                size="sm" 
                                                className="bg-teal hover:bg-teal-dark"
                                                disabled={!fieldFeedbackMessage.trim()}
                                              >
                                                <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                                                Send Feedback
                                              </Button>
                                            </div>
                                          </div>
                                        </form>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>
                          </div>
                          {selectedSupplier.linkedin && (
                            <div className="flex items-start">
                              <Linkedin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                              <div>
                                <p className="font-medium">LinkedIn</p>
                                <a 
                                  href={selectedSupplier.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline flex items-center"
                                >
                                  {selectedSupplier.linkedin}
                                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Services & Offerings Tab */}
                  <TabsContent value="services" className="px-6 py-4">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        {getSupplierTypeName(selectedSupplier.supplier_type)} Services
                      </h3>
                      
                        {/* Service Details Accordion */}
                        <Accordion type="single" collapsible className="w-full" defaultValue="services">
                        {selectedSupplier.service_details && Object.keys(selectedSupplier.service_details).length > 0 && (
                          <AccordionItem value="services">
                          <AccordionTrigger className="text-md font-medium">Service Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                            {Object.entries(selectedSupplier.service_details).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              {renderFieldWithFeedback(`service_details.${key}`, value, 
                                selectedSupplier.review?.fields?.includes(`service_details.${key}`))}
                              </div>
                            ))}
                            </div>
                          </AccordionContent>
                          </AccordionItem>
                        )}                        
                        </Accordion>
                      
                      {/* Target Audience */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Target Audience</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.target_audience ? (
                            typeof selectedSupplier.target_audience === 'string' ? 
                              selectedSupplier.target_audience.split(',').map((audience: string, index: number) => (
                                <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-300">
                                  {audience.trim()}
                                </Badge>
                              ))
                            : Array.isArray(selectedSupplier.target_audience) ?
                              selectedSupplier.target_audience.map((audience: string, index: number) => (
                                <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-300">
                                  {audience}
                                </Badge>
                              ))
                            : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                Not specified
                              </Badge>
                            )
                          ) : (
                            <>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                Teachers
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                Students
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Institution Types */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Institution Types</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.institution_types ? (
                            typeof selectedSupplier.institution_types === 'string' ? 
                              selectedSupplier.institution_types.split(',').map((type: string, index: number) => (
                                <Badge key={index} className="bg-teal-100 text-teal-800 border-teal-300">
                                  {type.trim()}
                                </Badge>
                              ))
                            : Array.isArray(selectedSupplier.institution_types) ?
                              selectedSupplier.institution_types.map((type: string, index: number) => (
                                <Badge key={index} className="bg-teal-100 text-teal-800 border-teal-300">
                                  {type}
                                </Badge>
                              ))
                            : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                Not specified
                              </Badge>
                            )
                          ) : (
                            <>
                              <Badge className="bg-teal-100 text-teal-800 border-teal-300">
                                K-12
                              </Badge>
                              <Badge className="bg-teal-100 text-teal-800 border-teal-300">
                                Preschool
                              </Badge>
                              <Badge className="bg-teal-100 text-teal-800 border-teal-300">
                                Higher Ed
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Educational Boards */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Educational Boards Supported</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.educational_boards ? (
                            typeof selectedSupplier.educational_boards === 'string' ? 
                              selectedSupplier.educational_boards.split(',').map((board: string, index: number) => (
                                <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-300">
                                  {board.trim()}
                                </Badge>
                              ))
                            : Array.isArray(selectedSupplier.educational_boards) ?
                              selectedSupplier.educational_boards.map((board: string, index: number) => (
                                <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-300">
                                  {board}
                                </Badge>
                              ))
                            : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                Not specified
                              </Badge>
                            )
                          ) : (
                            <>
                              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                CBSE
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                State
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Location & Coverage Tab */}
                  <TabsContent value="location" className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Headquarters</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start">
                            <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                              <p className="font-medium">Headquarter City</p>
                              {renderFieldWithFeedback('hq_city', selectedSupplier.hq_city || "Not provided", 
                                selectedSupplier.review?.fields?.includes('hq_city'))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Coverage Area</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div>
                            <p className="font-medium">Operational Cities</p>
                            {renderFieldWithFeedback('operational_cities', selectedSupplier.operational_cities || "Not provided", 
                              selectedSupplier.review?.fields?.includes('operational_cities'))}
                          </div>
                          <div>
                            <p className="font-medium">States Covered</p>
                            {renderFieldWithFeedback('states_covered', selectedSupplier.states_covered || "Not provided", 
                              selectedSupplier.review?.fields?.includes('states_covered'))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Payment & Policies Tab */}
                  <TabsContent value="policies" className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Payment Options</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div>
                            <p className="font-medium">Payment Modes</p>
                            {renderFieldWithFeedback('payment_modes', selectedSupplier.payment_modes || "Not provided", 
                              selectedSupplier.review?.fields?.includes('payment_modes'))}
                          </div>
                          
                          {selectedSupplier.discounts && (
                            <div className="mt-3">
                              <p className="font-medium">Discounts Available</p>
                              {renderFieldWithFeedback('discounts', selectedSupplier.discounts, 
                                selectedSupplier.review?.fields?.includes('discounts'))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Policies</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div>
                            <p className="font-medium">Refund Policy</p>
                            {renderFieldWithFeedback('refund_policy', selectedSupplier.refund_policy || "Not provided", 
                              selectedSupplier.review?.fields?.includes('refund_policy'))}
                          </div>
                          
                          <div>
                            <p className="font-medium">Annual Contracts</p>
                            {renderFieldWithFeedback('annual_contracts', 
                              selectedSupplier.annual_contracts !== undefined ? (selectedSupplier.annual_contracts ? 'Yes' : 'No') : 'Not specified', 
                              selectedSupplier.review?.fields?.includes('annual_contracts'))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Resources */}
                      {(selectedSupplier.additional_info && typeof selectedSupplier.additional_info === 'object' && 
                      Object.keys(selectedSupplier.additional_info).filter(key => key !== 'review').length > 0) && (
                        <div className="col-span-1 md:col-span-2">
                          <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            {Object.entries(selectedSupplier.additional_info)
                              .filter(([key]) => key !== 'review')
                              .map(([key, value]) => (
                                <div key={key} className="mb-3">
                                  <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                  {renderFieldWithFeedback(`additional_info.${key}`, value, 
                                    selectedSupplier.review?.fields?.includes(`additional_info.${key}`))}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Action buttons at the bottom */}
                <div className="flex justify-end space-x-3 border-t p-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSupplier(null)}
                  >
                    Close
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleReviewMode}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    {selectedSupplier.review ? "Edit Review" : "Add Review"}
                  </Button>

                  {selectedSupplier.status === 'approved' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleOpenRatingConfig}
                        className="text-navy border-navy hover:bg-navy/5"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Rating
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedSupplier)}
                      >
                        Revoke Approval
                      </Button>
                    </>
                  )}
                  
                  {selectedSupplier.status === 'pending' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedSupplier)}
                      >
                        Reject
                      </Button>
                      <Button
                        className="bg-teal hover:bg-teal-dark"
                        onClick={() => handleApprove(selectedSupplier)}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  
                  {selectedSupplier.status === 'waiting' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedSupplier)}
                      >
                        Reject
                      </Button>
                      <Button
                        className="bg-teal hover:bg-teal-dark"
                        onClick={() => handleApprove(selectedSupplier)}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  
                  {selectedSupplier.status === 'rejected' && (
                    <>
                      <Button
                        variant="outline"
                        className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        onClick={() => handleSetWaiting(selectedSupplier)}
                      >
                        Set to Waiting
                      </Button>
                      <Button
                        className="bg-teal hover:bg-teal-dark"
                        onClick={() => handleApprove(selectedSupplier)}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Add this function to handle opening rating config
  const handleOpenRatingConfig = () => {
    setIsRatingConfigOpen(true);
  };

  // Add this function to handle closing rating config
  const handleCloseRatingConfig = () => {
    setIsRatingConfigOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Supplier Approval</h1>
          <p className="text-gray-600">Review and manage supplier applications</p>
        </div>
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:w-64"
          />
        </div>
      </div>
      
      {/* Render supplier detail modal if a supplier is selected */}
      {selectedSupplier && renderSupplierDetail()}
      
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all" className="data-[state=active]:text-teal">All</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:text-teal">Pending</TabsTrigger>
                <TabsTrigger value="waiting" className="data-[state=active]:text-teal">Waiting</TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:text-teal">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:text-teal">Rejected</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="m-0">
              <div className="rounded-md border">
                {renderSupplierTable()}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <div className="rounded-md border">
                {renderSupplierTable()}
              </div>
            </TabsContent>
            
            <TabsContent value="waiting" className="m-0">
              <div className="rounded-md border">
                {renderSupplierTable()}
              </div>
            </TabsContent>
            
            <TabsContent value="approved" className="m-0">
              <div className="rounded-md border">
                {renderSupplierTable()}
              </div>
            </TabsContent>
            
            <TabsContent value="rejected" className="m-0">
              <div className="rounded-md border">
                {renderSupplierTable()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Rating Configuration Dialog */}
      {isRatingConfigOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-fade-in">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto shadow-xl animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-navy" />
                <div>
                  <CardTitle className="text-xl">Rating Configuration</CardTitle>
                  <p className="text-sm text-gray-600">
                    Configure rating areas for {selectedSupplier.org_name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseRatingConfig}
                className="rounded-full h-8 w-8"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <SupplierRatingConfiguration 
                supplierId={selectedSupplier.id}
                onClose={handleCloseRatingConfig}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  function renderSupplierTable() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading suppliers...</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Organization</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id} className={supplier.review ? "bg-amber-50/30" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {supplier.org_name}
                    {supplier.review && (
                      <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-300">
                        Has Review
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getSupplierTypeName(supplier.supplier_type)}</TableCell>
                <TableCell>
                  <div>
                    <p>{supplier.contact_name}</p>
                    <p className="text-xs text-gray-500">{supplier.email}</p>
                  </div>
                </TableCell>
                <TableCell>{formatDate(supplier.submission_date)}</TableCell>
                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewSupplier(supplier)}
                    >
                      View
                    </Button>
                    
                    {supplier.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(supplier)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-teal hover:bg-teal-dark"
                          onClick={() => handleApprove(supplier)}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    
                    {supplier.status === 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        onClick={() => handleSetWaiting(supplier)}
                      >
                        Set to Waiting
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                {isLoading ? 'Loading suppliers...' : 'No suppliers found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }
};

export default SupplierApproval;
