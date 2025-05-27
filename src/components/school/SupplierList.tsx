import { useAuth } from '@/components/auth/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownAZ,
  ArrowUpAZ,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  SendHorizontal,
  Star,
  Users,
  XCircle
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import SupplierRating from './SupplierRating';

// Define type for supplier based on database schema

type Supplier = {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  supplier_type: string;
  pitch: string;
  short_desc: string;
  full_desc: string;
  status: "pending" | "approved" | "rejected" | "waiting";
  website: string | null;
  linkedin: string | null;
  year_started: number;
  hq_city: string;
  operational_cities: string;
  states_covered: string;
  company_type: string;
  payment_modes: string;
  refund_policy: string;
  gst_number: string | null;
  brochure_url: string | null;
  additional_info: string | null;
  discounts: boolean | null;
  annual_contracts: boolean | null;
  service_details: any;
  // Audience flags
  audience_schools: boolean | null;
  audience_teachers: boolean | null;
  audience_students: boolean | null;
  audience_parents: boolean | null;
  // Institution flags
  inst_k12: boolean | null;
  inst_preschool: boolean | null;
  inst_higher_ed: boolean | null;
  inst_coaching: boolean | null;
  inst_other: boolean | null;
  // Board flags
  board_cbse: boolean | null;
  board_icse: boolean | null;
  board_state: boolean | null;
  board_ib: boolean | null;
  board_cambridge: boolean | null;
  board_other: boolean | null;
  avgRating?: number;
  reviewCount?: number;
  ratingConfig?: {
    [key: string]: {
      weight: number;
      enabled: boolean;
    };
  };
  ratingAverages?: RatingAverages;
};

type SortOption = 
  | 'name_asc' 
  | 'name_desc' 
  | 'rating_desc' 
  | 'rating_asc'
  | 'age_desc'
  | 'age_asc';

// Add RatingArea interface
interface RatingArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
}

// Add type for rating averages
type RatingAverages = {
  [ratingArea: string]: {
    average: number;
    weight: number;
  };
};

// Add feedback schema
const feedbackSchema = z.object({
  message: z.string().min(1, "Feedback message is required"),
  rating: z.number().min(1).max(5).optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const SupplierList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingConfigs, setRatingConfigs] = useState<{[key: string]: RatingArea[]}>({});
  const [activeFieldFeedback, setActiveFieldFeedback] = useState<string | null>(null);
  const [fieldFeedbackMessage, setFieldFeedbackMessage] = useState('');
  const [fieldRating, setFieldRating] = useState<number>(0);
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>('all');
  const [minYears, setMinYears] = useState<number>(0);
  const [maxYears, setMaxYears] = useState<number>(15);
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');
  const currentYear = new Date().getFullYear();

  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      message: "",
      rating: 0,
    },
  });

  // Add function to map rating config to rating areas
  const mapConfigToRatingAreas = (config: any): RatingArea[] => {
    const areaMappings: {[key: string]: {name: string, description: string}} = {
      reliability: { name: "Reliability", description: "Service delivery consistency" },
      responsiveness: { name: "Responsiveness", description: "Communication speed" },
      service_details: { name: "Service Details", description: "Services and capabilities" },
      value_for_money: { name: "Value for Money", description: "Cost-effectiveness" },
      business_details: { name: "Business Details", description: "Company credentials" },
      customer_service: { name: "Customer Service", description: "Support quality" },
      service_coverage: { name: "Service Coverage", description: "Geographic coverage" },
      organization_info: { name: "Organization Information", description: "Company profile" },
      quality_of_service: { name: "Quality of Service", description: "Overall satisfaction" },
      educational_profile: { name: "Educational Profile", description: "Educational focus" }
    };

    return Object.entries(config).map(([id, data]: [string, any]) => ({
      id,
      name: areaMappings[id]?.name || id,
      description: areaMappings[id]?.description || "",
      enabled: data.enabled,
      weight: data.weight
    }));
  };

  // Update the fetchSuppliers function to include rating configurations
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('supplier_applications')
          .select('*')
          .eq('status', 'approved')
          .order('org_name', { ascending: true });

        if (suppliersError) throw suppliersError;

        // Fetch rating configurations
        const { data: ratingConfigsData, error: configsError } = await supabase
          .from('rating_configurations')
          .select('supplier_id, config');

        if (configsError) throw configsError;

        // Fetch rating averages from the view
        const { data: ratingAveragesData, error: averagesError } = await supabase
          .from('supplier_rating_averages')
          .select('supplier_id, ratings');

        if (averagesError) throw averagesError;

        // Process configurations and averages
        const configsMap: {[key: string]: RatingArea[]} = {};
        const averagesMap: {[key: string]: RatingAverages} = {};

        if (ratingConfigsData) {
          ratingConfigsData.forEach(config => {
            if (config.config) {
              configsMap[config.supplier_id] = mapConfigToRatingAreas(config.config);
            }
          });
        }

        if (ratingAveragesData) {
          ratingAveragesData.forEach(avg => {
            if (avg.ratings) {
              averagesMap[avg.supplier_id] = avg.ratings as RatingAverages;
            }
          });
        }

        // Process suppliers with their configurations and averages
        const suppliersWithData = suppliersData.map(supplier => {
          const supplierAverages = averagesMap[supplier.id];
          let avgRating = 0;
          let reviewCount = 0;

          if (supplierAverages) {
            // Calculate weighted average from the view data
            let totalWeight = 0;
            let weightedSum = 0;
            
            Object.entries(supplierAverages).forEach(([_, data]) => {
              if (data.average && data.weight) {
                weightedSum += data.average * data.weight;
                totalWeight += data.weight;
              }
            });
            
            avgRating = totalWeight > 0 ? weightedSum / totalWeight : 0;
            
            // Get review count from the number of rating areas
            reviewCount = Object.keys(supplierAverages).length;
          }

          return {
            ...supplier,
            avgRating,
            reviewCount,
            ratingConfig: configsMap[supplier.id],
            ratingAverages: supplierAverages
          };
        });

        setSuppliers(suppliersWithData);
        
        // Extract unique cities and states for filters
        const allCities = new Set<string>();
        const allStates = new Set<string>();
        
        suppliersWithData.forEach(supplier => {
          // Add cities
          if (supplier.operational_cities) {
            supplier.operational_cities.split(',')
              .map(city => city.trim())
              .filter(city => city)
              .forEach(city => allCities.add(city));
          }
            
          // Add states
          if (supplier.states_covered) {
            supplier.states_covered.split(',')
              .map(state => state.trim())
              .filter(state => state)
              .forEach(state => allStates.add(state));
          }
        });
        
        setCities(Array.from(allCities).sort());
        setStates(Array.from(allStates).sort());
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load suppliers. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [toast]);

  const handleRatingSubmit = async (supplierId: string, newRating: number) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a rating.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if user has already rated this supplier
      const { data: existingRating, error: checkError } = await supabase
        .from('supplier_reviews')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('reviewer_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let isUpdate = false;
      let oldRating = 0;

      if (existingRating) {
        // Update existing rating
        oldRating = existingRating.rating;
        const { error: updateError } = await supabase
          .from('supplier_reviews')
          .update({ rating: newRating, updated_at: new Date().toISOString() })
          .eq('id', existingRating.id);

        if (updateError) {
          throw updateError;
        }
        isUpdate = true;
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('supplier_reviews')
          .insert({
            supplier_id: supplierId,
            reviewer_id: user.id,
            reviewer_role: 'school', // Assuming the user is from a school
            rating: newRating,
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Update local state with new rating
      setSuppliers(currentSuppliers => 
        currentSuppliers.map(supplier => {
          if (supplier.id === supplierId) {
            const currentCount = supplier.reviewCount || 0;
            const currentTotal = (supplier.avgRating || 0) * currentCount;
            
            let newCount, newAvg;
            if (isUpdate) {
              // Replace old rating with new rating
              const newTotal = currentTotal - oldRating + newRating;
              newCount = currentCount;
              newAvg = currentCount > 0 ? newTotal / currentCount : newRating;
            } else {
              // Add new rating
              newCount = currentCount + 1;
              newAvg = (currentTotal + newRating) / newCount;
            }
            
            return {
              ...supplier,
              avgRating: newAvg,
              reviewCount: newCount
            };
          }
          return supplier;
        })
      );

      toast({
        title: 'Success',
        description: isUpdate ? 'Your rating has been updated successfully.' : 'Your rating has been submitted successfully.',
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeColor = (type: string) => {
    const colors: {[key: string]: string} = {
      'edtech': 'bg-blue-100 text-blue-800',
      'curriculum': 'bg-green-100 text-green-800',
      'facility': 'bg-amber-100 text-amber-800',
      'training': 'bg-purple-100 text-purple-800',
      'consulting': 'bg-teal-100 text-teal-800',
      'software': 'bg-indigo-100 text-indigo-800',
      'hardware': 'bg-red-100 text-red-800',
      'content': 'bg-pink-100 text-pink-800',
    };
    
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get unique supplier types for filter tabs
  const supplierTypes = ['all', ...Array.from(new Set(suppliers.map(s => s.supplier_type.toLowerCase())))];

  // Add new arrays for filter options
  const companyTypes = ['all', 'Private Limited', 'Public Limited','Startup', 'Partnership', 'Proprietorship', 'SME (Small/Medium Enterprise)','LLP','Enterprise', 'Trust/Society/NGO', 'Other'];
  const yearRanges = [
    'all',
    'Last 5 years',
    '5-10 years',
    '10-15 years',
    '15-20 years',
    '20+ years'
  ];
  const paymentModes = ['all', 'Online', 'Cash', 'Cheque', 'Bank Transfer', 'UPI'];

  // Apply filters and sorting
  const filteredSuppliers = useMemo(() => {
    let filtered = [...suppliers];
    
    // Apply search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier => 
        supplier.org_name.toLowerCase().includes(term) || 
        supplier.supplier_type.toLowerCase().includes(term) || 
        supplier.short_desc.toLowerCase().includes(term) ||
        supplier.operational_cities.toLowerCase().includes(term) ||
        supplier.states_covered.toLowerCase().includes(term) ||
        supplier.contact_name.toLowerCase().includes(term)
      );
    }
    
    // Apply type filtering
    if (activeFilter !== 'all') {
      filtered = filtered.filter(supplier => 
        supplier.supplier_type.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    
    // Apply city filtering
    if (cityFilter && cityFilter !== 'all') {
      filtered = filtered.filter(supplier => 
        supplier.operational_cities
          .toLowerCase()
          .split(',')
          .map(city => city.trim())
          .includes(cityFilter.toLowerCase())
      );
    }
    
    // Apply state filtering
    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(supplier => 
        supplier.states_covered
          .toLowerCase()
          .split(',')
          .map(state => state.trim())
          .includes(stateFilter.toLowerCase())
      );
    }
    
    // Apply company type filtering
    if (companyTypeFilter && companyTypeFilter !== 'all') {
      filtered = filtered.filter(supplier => 
        supplier.company_type.toLowerCase() === companyTypeFilter.toLowerCase()
      );
    }
    
    // Apply year range filtering based on company age
    if (minYears > 0 || maxYears < 15) {
      filtered = filtered.filter(supplier => {
        const companyAge = currentYear - supplier.year_started;
        return companyAge >= minYears && companyAge <= maxYears;
      });
    }
    
    // Apply payment mode filtering
    if (paymentModeFilter && paymentModeFilter !== 'all') {
      filtered = filtered.filter(supplier => 
        supplier.payment_modes.toLowerCase().includes(paymentModeFilter.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.org_name.localeCompare(b.org_name);
        case 'name_desc':
          return b.org_name.localeCompare(a.org_name);
        case 'rating_desc':
          return (b.avgRating || 0) - (a.avgRating || 0);
        case 'rating_asc':
          return (a.avgRating || 0) - (b.avgRating || 0);
        case 'age_desc':
          return (currentYear - a.year_started) - (currentYear - b.year_started);
        case 'age_asc':
          return (currentYear - b.year_started) - (currentYear - a.year_started);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [suppliers, searchTerm, activeFilter, cityFilter, stateFilter, companyTypeFilter, minYears, maxYears, paymentModeFilter, sortOption, currentYear]);

  // Display star rating
  const renderRatingStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">
          {rating ? rating.toFixed(1) : 'No ratings'}
        </span>
      </div>
    );
  };

  // Render audience badges
  const renderAudienceBadges = (supplier: Supplier) => {
    const audiences = [];
    if (supplier.audience_schools) audiences.push('Schools');
    if (supplier.audience_teachers) audiences.push('Teachers');
    if (supplier.audience_students) audiences.push('Students');
    if (supplier.audience_parents) audiences.push('Parents');
    
    return audiences.map(audience => (
      <Badge key={audience} variant="outline" className="text-xs">
        {audience}
      </Badge>
    ));
  };

  // Render institution badges
  const renderInstitutionBadges = (supplier: Supplier) => {
    const institutions = [];
    if (supplier.inst_k12) institutions.push('K-12');
    if (supplier.inst_preschool) institutions.push('Preschool');
    if (supplier.inst_higher_ed) institutions.push('Higher Ed');
    if (supplier.inst_coaching) institutions.push('Coaching');
    if (supplier.inst_other) institutions.push('Other');
    
    return institutions.map(inst => (
      <Badge key={inst} variant="secondary" className="text-xs">
        {inst}
      </Badge>
    ));
  };

  // Render board badges
  const renderBoardBadges = (supplier: Supplier) => {
    const boards = [];
    if (supplier.board_cbse) boards.push('CBSE');
    if (supplier.board_icse) boards.push('ICSE');
    if (supplier.board_state) boards.push('State');
    if (supplier.board_ib) boards.push('IB');
    if (supplier.board_cambridge) boards.push('Cambridge');
    if (supplier.board_other) boards.push('Other');
    
    return boards.map(board => (
      <Badge key={board} variant="outline" className="text-xs bg-blue-50 text-blue-700">
        {board}
      </Badge>
    ));
  };

  // Render service details
  const renderServiceDetails = (serviceDetails: any) => {
    if (!serviceDetails) return null;

    // Handle if serviceDetails is a string (parse it) or already an object
    let services;
    try {
      services = typeof serviceDetails === 'string' ? JSON.parse(serviceDetails) : serviceDetails;
    } catch (error) {
      console.error('Error parsing service details:', error);
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Service details are not properly formatted.</p>
        </div>
      );
    }

    if (!services || (Array.isArray(services) && services.length === 0)) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">No service details available.</p>
        </div>
      );
    }

    // If it's an array of services
    if (Array.isArray(services)) {
      return (
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-blue-900">
                  {service.name || service.serviceName || `Service ${index + 1}`}
                </h4>
                {service.price && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    {service.price}
                  </Badge>
                )}
              </div>
              {service.description && (
                <p className="text-sm text-blue-800 mb-3">{service.description}</p>
              )}
              {service.features && (
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(service.features) ? service.features : [service.features]).map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // If it's an object with service information
    return (
      <div className="space-y-4">
        {Object.entries(services).map(([key, value]) => (
          <div key={key} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 capitalize mb-2">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
            {typeof value === 'object' && value !== null ? (
              <div className="space-y-2">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="flex justify-between items-center">
                    <span className="text-sm text-blue-800 capitalize">
                      {subKey.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="text-sm font-medium text-blue-900">
                      {String(subValue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-blue-800">{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Update submitRating function to only handle rating submission
  const submitRating = async () => {
    if (!user || !selectedSupplier || Object.keys(ratings).length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingRating(true);

    try {
      // Check if user has already rated this supplier
      const { data: existingRating, error: checkError } = await supabase
        .from('supplier_ratings')
        .select('*')
        .eq('supplier_id', selectedSupplier.id)
        .eq('school_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Prepare ratings data
      const ratingsData = {
        ratings: {
          ...ratings,
          feedback: feedback,
          timestamp: new Date().toISOString()
        }
      };

      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('supplier_ratings')
          .update({
            ratings: ratingsData.ratings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (updateError) throw updateError;
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('supplier_ratings')
          .insert({
            supplier_id: selectedSupplier.id,
            school_id: user.id,
            ratings: ratingsData.ratings
          });

        if (insertError) throw insertError;
      }

      // After successful submission, fetch updated averages
      const { data: updatedAverages, error: averagesError } = await supabase
        .from('supplier_rating_averages')
        .select('ratings')
        .eq('supplier_id', selectedSupplier.id)
        .single();

      if (!averagesError && updatedAverages) {
        // Update local state with new averages
        setSuppliers(currentSuppliers => 
          currentSuppliers.map(supplier => {
            if (supplier.id === selectedSupplier.id) {
              const averages = updatedAverages.ratings as RatingAverages;
              // Calculate new overall average
              let totalWeight = 0;
              let weightedSum = 0;
              
              Object.entries(averages).forEach(([_, data]) => {
                if (data.average && data.weight) {
                  weightedSum += data.average * data.weight;
                  totalWeight += data.weight;
                }
              });
              
              const newAvgRating = totalWeight > 0 ? weightedSum / totalWeight : 0;
              
              return {
                ...supplier,
                avgRating: newAvgRating,
                ratingAverages: averages,
                // Increment review count since we just added a rating
                reviewCount: (supplier.reviewCount || 0) + 1
              };
            }
            return supplier;
          })
        );
      }

      toast({
        title: "Ratings Submitted",
        description: "Thank you for your feedback!",
      });

      setRatings({});
      setFeedback("");

    } catch (error) {
      console.error('Error in submitRating:', error);
      toast({
        title: "Error",
        description: "Failed to submit ratings",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Add renderStars function
  const renderStars = (areaId: string, interactive: boolean = false) => {
    const rating = ratings[areaId] || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setRatings(prev => ({...prev, [areaId]: star})) : undefined}
          />
        ))}
      </div>
    );
  };

  // Update the rating section in the dialog to use supplier-specific config
  const renderRatingSection = (supplier: Supplier) => {
    const ratingAreas = supplier.ratingConfig || [];
    const enabledAreas = Array.isArray(ratingAreas) ? ratingAreas.filter(area => area.enabled) : [];
    const ratingAverages = supplier.ratingAverages || {};

    if (enabledAreas.length === 0) {
      return (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 text-gray-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Rating is not available for this supplier.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Overall Rating</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-3xl font-bold text-blue-900">
                    {supplier.avgRating ? supplier.avgRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-5 w-5",
                          star <= Math.round(supplier.avgRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  Based on {supplier.reviewCount || 0} {supplier.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <h4 className="text-lg font-semibold text-green-900 mb-2">Rating Distribution</h4>
            <div className="space-y-3">
              {enabledAreas.map((area) => {
                const areaAverage = ratingAverages[area.id]?.average || 0;
                const currentRating = ratings[area.id] || 0;
                const displayRating = currentRating || areaAverage;
                
                return (
                  <div key={area.id} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-green-800">{area.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-700">
                          {displayRating.toFixed(1)}/5
                        </span>
                        {currentRating > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Your Rating
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={(displayRating / 5) * 100} 
                      className="h-2 bg-green-100"
                    />
                    {currentRating > 0 && areaAverage > 0 && (
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Community Average: {areaAverage.toFixed(1)}/5</span>
                        <span>Weight: {area.weight * 100}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rating Input Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Rate Different Aspects</h4>
            <div className="text-sm text-gray-500">
              Click stars to rate each aspect
            </div>
          </div>

          <div className="grid gap-6">
            {enabledAreas.map((area) => (
              <div 
                key={area.id} 
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">{area.name}</h5>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {area.weight * 100}% weight
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{area.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatings(prev => ({...prev, [area.id]: star}))}
                        className={cn(
                          "transition-colors hover:scale-110",
                          star <= (ratings[area.id] || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        )}
                      >
                        <Star className="h-6 w-6" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Section */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900">Additional Feedback</label>
                <p className="text-sm text-gray-500 mb-2">Share your experience with this supplier</p>
                <Textarea
                  placeholder="What went well? What could be improved? Share your thoughts..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRatings({});
                    setFeedback("");
                  }}
                  disabled={Object.keys(ratings).length === 0 && !feedback}
                >
                  Clear
                </Button>
                <Button 
                  onClick={submitRating}
                  disabled={Object.keys(ratings).length === 0 || isSubmittingRating}
                  className="min-w-[120px]"
                >
                  {isSubmittingRating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Submit Rating
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add handleFieldFeedback function
  const handleFieldFeedback = (field: string) => {
    setActiveFieldFeedback(field);
    setFieldFeedbackMessage('');
    setFieldRating(0);
    feedbackForm.reset({ message: '', rating: 0 });
  };

  // Add handleSubmitFieldFeedback function
  const handleSubmitFieldFeedback = async () => {
    if (!user || !selectedSupplier || !activeFieldFeedback) return;
    
    try {
      const message = feedbackForm.getValues('message');
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
          school_id: user.id,
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

      // If there's a rating, also save it in supplier_ratings
      if (fieldRating > 0) {
        const { error: ratingError } = await supabase
          .from('supplier_ratings')
          .insert({
            supplier_id: selectedSupplier.id,
            school_id: user.id,
            ratings: {
              [activeFieldFeedback]: fieldRating,
              feedback: message,
              timestamp: new Date().toISOString()
            }
          });

        if (ratingError) {
          console.error('Error storing rating:', ratingError);
        }
      }
      
      // Close the popover and reset form
      setActiveFieldFeedback(null);
      feedbackForm.reset();
      setFieldRating(0);
      
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

  // Update the renderFieldWithFeedback function to improve hover states
  const renderFieldWithFeedback = (fieldName: string, value: any) => {
    const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || 'Not provided');
    const formattedFieldName = fieldName.replace(/([A-Z])/g, ' $1').trim();
    
    return (
      <div className="relative group">
        <p className="font-medium group-hover:text-teal-600 transition-colors">
          {displayValue}
        </p>
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover open={activeFieldFeedback === fieldName}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 border-dashed border-teal-300 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => handleFieldFeedback(fieldName)}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Feedback
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <Form {...feedbackForm}>
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
                      control={feedbackForm.control}
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
                      <h4 className="text-sm font-medium mb-2">Rating (Optional)</h4>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setFieldRating(star);
                              feedbackForm.setValue('rating', star);
                            }}
                            className="focus:outline-none hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= fieldRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
                        disabled={!feedbackForm.getValues('message')?.trim()}
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers by name or description..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(cityFilter !== 'all' || stateFilter !== 'all' || companyTypeFilter !== 'all' || minYears > 0 || maxYears < 15 || paymentModeFilter !== 'all') && (
                    <Badge variant="secondary" className="ml-2">
                      {(cityFilter !== 'all' ? 1 : 0) + 
                       (stateFilter !== 'all' ? 1 : 0) + 
                       (companyTypeFilter !== 'all' ? 1 : 0) + 
                       (minYears > 0 ? 1 : 0) + 
                       (maxYears < 15 ? 1 : 0) + 
                       (paymentModeFilter !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Options</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Type</label>
                    <Select
                      value={companyTypeFilter}
                      onValueChange={setCompanyTypeFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === 'all' ? 'All Company Types' : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Years in Business</label>
                    <div className="space-y-4">
                      {/* Combined Slider Container */}
                      <div className="relative">
                        {/* Background Track */}
                        <div className="absolute inset-0 flex items-center">
                          <div className="h-1 w-full bg-gray-200 rounded-full"></div>
                        </div>
                        
                        {/* Sliders */}
                        <div className="relative flex items-center">
                          <Slider
                            defaultValue={[0]}
                            max={15}
                            min={0}
                            step={1}
                            value={[minYears]}
                            onValueChange={(value) => {
                              const newMin = value[0];
                              setMinYears(newMin);
                              if (newMin > maxYears) {
                                setMaxYears(newMin);
                              }
                            }}
                            className="w-full"
                          />
                          <Slider
                            defaultValue={[15]}
                            max={15}
                            min={0}
                            step={1}
                            value={[maxYears]}
                            onValueChange={(value) => {
                              const newMax = value[0];
                              setMaxYears(newMax);
                              if (newMax < minYears) {
                                setMinYears(newMax);
                              }
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Years Range Display */}
                      <div className="flex justify-center items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{minYears}</span>
                          <span className="text-sm text-gray-500">to</span>
                          <span className="text-sm font-medium">{maxYears}</span>
                          <span className="text-sm text-gray-500">years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Mode</label>
                    <Select
                      value={paymentModeFilter}
                      onValueChange={setPaymentModeFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentModes.map(mode => (
                          <SelectItem key={mode} value={mode}>
                            {mode === 'all' ? 'All Payment Modes' : mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Select
                      value={cityFilter}
                      onValueChange={setCityFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Select
                      value={stateFilter}
                      onValueChange={setStateFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCityFilter('all');
                        setStateFilter('all');
                        setCompanyTypeFilter('all');
                        setMinYears(0);
                        setMaxYears(15);
                        setPaymentModeFilter('all');
                      }}
                    >
                      Clear All Filters
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  {sortOption.includes('asc') ? (
                    <ArrowDownAZ className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowUpAZ className="h-4 w-4 mr-2" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOption('name_asc')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('name_desc')}>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('rating_desc')}>
                  Highest Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('rating_asc')}>
                  Lowest Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('age_desc')}>
                  Most Experienced
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('age_asc')}>
                  Newest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="w-full md:w-auto overflow-x-auto">
            {supplierTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="capitalize whitespace-nowrap">
                {type === 'all' ? 'All Suppliers' : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Active filter indicators */}
        {(cityFilter !== 'all' || stateFilter !== 'all' || companyTypeFilter !== 'all' || minYears > 0 || maxYears < 15 || paymentModeFilter !== 'all') && (
          <div className="flex flex-wrap gap-2">
            {cityFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                City: {cityFilter}
              </Badge>
            )}
            {stateFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                State: {stateFilter}
              </Badge>
            )}
            {companyTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                Type: {companyTypeFilter}
              </Badge>
            )}
            {minYears > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Age: {minYears}-{maxYears} {maxYears === 1 ? 'year' : 'years'}
              </Badge>
            )}
            {paymentModeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Payment: {paymentModeFilter}
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Search className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">No suppliers found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(supplier.org_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{supplier.org_name}</CardTitle>
                      <div className="flex items-center mt-1 gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(supplier.supplier_type)}`}>
                          {supplier.supplier_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Since {supplier.year_started}
                        </span>
                        {getStatusIcon(supplier.status)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {renderRatingStars(supplier.avgRating)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({supplier.reviewCount || 0} {supplier.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                
                <CardDescription className="mt-2">
                  {supplier.pitch}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600 mb-4">
                  {supplier.short_desc}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="font-medium min-w-[100px]">Based in:</span>
                    {renderFieldWithFeedback('hq_city', supplier.hq_city)}
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="font-medium min-w-[100px]">Operates in:</span>
                    {renderFieldWithFeedback('operational_cities', supplier.operational_cities)}
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="font-medium min-w-[100px]">States covered:</span>
                    {renderFieldWithFeedback('states_covered', supplier.states_covered)}
                  </div>
                </div>

                {/* Audience badges */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Target Audience:</p>
                  <div className="flex flex-wrap gap-1">
                    {renderAudienceBadges(supplier)}
                  </div>
                </div>

                <div className="mt-4">
                  <SupplierRating
                    supplierId={supplier.id}
                    initialRating={0}
                    onRatingSubmit={(rating) => handleRatingSubmit(supplier.id, rating)}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4 flex flex-wrap gap-2">
                
                
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedSupplier(supplier)}
                  className="flex-1"
                >
                  View Details
                </Button>
                
                {supplier.website && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => window.open(supplier.website || '#', '_blank')}
                    title="Visit website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon" 
                  className="text-amber-600"
                  onClick={() => navigate(`/legal-complaint/${supplier.id}`)}
                  title="File a complaint"
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced Supplier Details Dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={(open) => !open && setSelectedSupplier(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSupplier && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(selectedSupplier.org_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedSupplier.org_name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${getTypeColor(selectedSupplier.supplier_type)}`}>
                        {selectedSupplier.supplier_type} Provider
                      </span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Est. {selectedSupplier.year_started}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {selectedSupplier.company_type}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      {renderRatingStars(selectedSupplier.avgRating)}
                      <span className="text-sm text-gray-500 ml-2">
                        ({selectedSupplier.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8 mt-6">
                {/* Pitch and Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    About Us
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="font-medium text-blue-900">{selectedSupplier.pitch}</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedSupplier.full_desc}</p>
                </div>

                <Separator />

                {/* Contact and Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact Person</p>
                          {renderFieldWithFeedback('contact_name', selectedSupplier.contact_name)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          {renderFieldWithFeedback('email', selectedSupplier.email)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          {renderFieldWithFeedback('phone', selectedSupplier.phone)}
                        </div>
                      </div>
                      
                      {selectedSupplier.website && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Website</p>
                            {renderFieldWithFeedback('website', selectedSupplier.website)}
                          </div>
                        </div>
                      )}

                      {selectedSupplier.linkedin && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                            {renderFieldWithFeedback('linkedin', selectedSupplier.linkedin)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Coverage
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">Headquarters</p>
                        {renderFieldWithFeedback('hq_city', selectedSupplier.hq_city)}
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">Operational Cities</p>
                        {renderFieldWithFeedback('operational_cities', selectedSupplier.operational_cities)}
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">States Covered</p>
                        {renderFieldWithFeedback('states_covered', selectedSupplier.states_covered)}
                      </div>

                      {selectedSupplier.gst_number && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 mb-1">GST Number</p>
                          {renderFieldWithFeedback('gst_number', selectedSupplier.gst_number)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Services & Offerings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Services & Offerings
                  </h3>
                  {selectedSupplier.service_details ? (
                    renderServiceDetails(selectedSupplier.service_details)
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">No detailed service information available.</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Target Audience and Institutions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Target Audience
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {renderAudienceBadges(selectedSupplier)}
                      {renderAudienceBadges(selectedSupplier).length === 0 && (
                        <p className="text-gray-500 text-sm">No specific audience information</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Institution Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {renderInstitutionBadges(selectedSupplier)}
                      {renderInstitutionBadges(selectedSupplier).length === 0 && (
                        <p className="text-gray-500 text-sm">No specific institution information</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Educational Boards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Educational Boards Supported</h3>
                  <div className="flex flex-wrap gap-2">
                    {renderBoardBadges(selectedSupplier)}
                    {renderBoardBadges(selectedSupplier).length === 0 && (
                      <p className="text-gray-500 text-sm">No specific board information</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment & Policies</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">Payment Modes</p>
                        {renderFieldWithFeedback('payment_modes', selectedSupplier.payment_modes)}
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">Refund Policy</p>
                        {renderFieldWithFeedback('refund_policy', selectedSupplier.refund_policy)}
                      </div>

                      <div className="flex gap-4">
                        {selectedSupplier.discounts && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            Offers Discounts
                          </Badge>
                        )}
                        {selectedSupplier.annual_contracts && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            Annual Contracts Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-3">
                      {selectedSupplier.brochure_url && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200"
                          onClick={() => window.open(selectedSupplier.brochure_url!, '_blank')}
                        >
                          <FileText className="mr-2 h-4 w-4 text-teal" />
                          <span className="font-medium">View Product Brochure</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rating Section */}
                <Separator className="my-6" />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Rate This Supplier
                    </h3>
                    {renderRatingSection(selectedSupplier)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t mt-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSupplier(null)}
                    >
                      Close
                    </Button>
                    {selectedSupplier.website && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedSupplier.website!, '_blank')}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="text-amber-600 border-amber-300 hover:bg-amber-50"
                      onClick={() => {
                        navigate(`/legal-complaint/${selectedSupplier.id}`);
                        setSelectedSupplier(null);
                      }}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Report Issue
                    </Button>
                    
                    <Button
                      onClick={() => {
                        navigate(`/messaging?recipient=${selectedSupplier.id}&recipientName=${encodeURIComponent(selectedSupplier.org_name)}&recipientType=supplier`);
                        setSelectedSupplier(null);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Supplier
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierList;