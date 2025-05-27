
import { useAuth } from "@/components/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building, CreditCard, Globe, Loader2, Mail, MapPin, Phone, Star } from "lucide-react";
import React, { useEffect, useState } from 'react';

interface RatingArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Supplier {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  supplier_type: string;
  short_desc: string;
  full_desc: string;
  pitch: string;
  website?: string;
  linkedin?: string;
  hq_city: string;
  operational_cities: string;
  states_covered: string;
  company_type: string;
  year_started: number;
  gst_number?: string;
  payment_modes: string;
  refund_policy: string;
  brochure_url?: string;
  additional_info?: string;
  audience_schools?: boolean;
  audience_teachers?: boolean;
  audience_students?: boolean;
  audience_parents?: boolean;
  inst_preschool?: boolean;
  inst_k12?: boolean;
  inst_higher_ed?: boolean;
  inst_coaching?: boolean;
  inst_other?: boolean;
  board_cbse?: boolean;
  board_icse?: boolean;
  board_ib?: boolean;
  board_cambridge?: boolean;
  board_state?: boolean;
  board_other?: boolean;
  annual_contracts?: boolean;
  discounts?: boolean;
  service_details?: any;
}

interface SupplierDetailsProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
}

const defaultRatingAreas: RatingArea[] = [
  { id: "organization", name: "Organization Information", description: "Company details, contact information, and basic profile", enabled: true },
  { id: "business", name: "Business Details", description: "Company type, registration, GST, and business credentials", enabled: true },
  { id: "coverage", name: "Service Coverage", description: "Geographic coverage, operational cities, and service areas", enabled: true },
  { id: "education", name: "Educational Profile", description: "Target audience, institution types, and educational boards", enabled: true },
  { id: "services", name: "Service Details", description: "Specific services offered, features, and capabilities", enabled: true },
  { id: "reliability", name: "Reliability", description: "Consistency in service delivery and dependability", enabled: true },
  { id: "responsiveness", name: "Responsiveness", description: "Speed of communication and problem resolution", enabled: true },
  { id: "customerService", name: "Customer Service", description: "Quality of support and customer interaction", enabled: true },
  { id: "qualityOfService", name: "Quality of Service", description: "Overall service quality and satisfaction", enabled: true },
  { id: "valueForMoney", name: "Value for Money", description: "Cost-effectiveness and pricing competitiveness", enabled: false }
];

const SupplierDetails: React.FC<SupplierDetailsProps> = ({ supplier, isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enabledRatingAreas, setEnabledRatingAreas] = useState<RatingArea[]>(defaultRatingAreas);

  useEffect(() => {
    // Load supplier-specific rating configuration
    const loadSupplierRatingConfig = () => {
      try {
        const savedConfigs = localStorage.getItem('supplierRatingConfigurations');
        if (savedConfigs) {
          const parsed = JSON.parse(savedConfigs);
          const supplierConfig = parsed[supplier.id] || defaultRatingAreas;
          setEnabledRatingAreas(supplierConfig);
        } else {
          setEnabledRatingAreas(defaultRatingAreas);
        }
      } catch (error) {
        console.error('Error loading rating configuration:', error);
        setEnabledRatingAreas(defaultRatingAreas);
      }
    };

    if (isOpen && supplier) {
      loadSupplierRatingConfig();
    }
  }, [supplier, isOpen]);

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

  const submitRating = async () => {
    if (!user || Object.keys(ratings).length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit individual ratings for each area
      for (const [areaId, rating] of Object.entries(ratings)) {
        if (rating > 0) {
          const { error } = await supabase
            .from('supplier_reviews')
            .insert({
              supplier_id: supplier.id,
              reviewer_id: user.id,
              reviewer_role: user.role || 'school',
              rating: rating,
              comment: `${areaId}: ${feedback}`,
              rating_area: areaId,
              is_issue: false
            });

          if (error) {
            console.error('Error submitting rating for area:', areaId, error);
          }
        }
      }

      toast({
        title: "Ratings Submitted",
        description: "Thank you for your feedback!",
      });

      onClose();
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
      setIsSubmitting(false);
    }
  };

  const getAudienceList = () => {
    const audiences = [];
    if (supplier.audience_schools) audiences.push("Schools");
    if (supplier.audience_teachers) audiences.push("Teachers");
    if (supplier.audience_students) audiences.push("Students");
    if (supplier.audience_parents) audiences.push("Parents");
    return audiences;
  };

  const getInstitutionList = () => {
    const institutions = [];
    if (supplier.inst_preschool) institutions.push("Preschool");
    if (supplier.inst_k12) institutions.push("K-12");
    if (supplier.inst_higher_ed) institutions.push("Higher Education");
    if (supplier.inst_coaching) institutions.push("Coaching");
    if (supplier.inst_other) institutions.push("Other");
    return institutions;
  };

  const getBoardsList = () => {
    const boards = [];
    if (supplier.board_cbse) boards.push("CBSE");
    if (supplier.board_icse) boards.push("ICSE");
    if (supplier.board_ib) boards.push("IB");
    if (supplier.board_cambridge) boards.push("Cambridge");
    if (supplier.board_state) boards.push("State Boards");
    if (supplier.board_other) boards.push("Other");
    return boards;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{supplier.org_name}</DialogTitle>
          <DialogDescription>
            Detailed information and rating for this supplier
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Person</p>
                  <p>{supplier.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Supplier Type</p>
                  <Badge variant="secondary">{supplier.supplier_type}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Company Type</p>
                  <p>{supplier.company_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Year Started</p>
                  <p>{supplier.year_started}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm">{supplier.full_desc}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Pitch</p>
                <p className="text-sm">{supplier.pitch}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact & Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{supplier.email}</span>
                </div>
                {supplier.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Headquarters</p>
                <p>{supplier.hq_city}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Operational Cities</p>
                <p>{supplier.operational_cities}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">States Covered</p>
                <p>{supplier.states_covered}</p>
              </div>
            </CardContent>
          </Card>

          {/* Educational Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Educational Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Target Audience</p>
                <div className="flex flex-wrap gap-2">
                  {getAudienceList().map(audience => (
                    <Badge key={audience} variant="outline">{audience}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Institution Types</p>
                <div className="flex flex-wrap gap-2">
                  {getInstitutionList().map(institution => (
                    <Badge key={institution} variant="outline">{institution}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Educational Boards</p>
                <div className="flex flex-wrap gap-2">
                  {getBoardsList().map(board => (
                    <Badge key={board} variant="outline">{board}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.gst_number && (
                <div>
                  <p className="text-sm font-medium text-gray-600">GST Number</p>
                  <p>{supplier.gst_number}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Modes</p>
                <p>{supplier.payment_modes}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Policy</p>
                <p>{supplier.refund_policy}</p>
              </div>
              
              <div className="flex items-center gap-4">
                {supplier.annual_contracts && (
                  <Badge variant="default">Offers Annual Contracts</Badge>
                )}
                {supplier.discounts && (
                  <Badge variant="default">Offers Discounts</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rating Section */}
          <Card>
            <CardHeader>
              <CardTitle>Rate This Supplier</CardTitle>
              <p className="text-sm text-gray-600">Rate different aspects of this supplier's services</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {enabledRatingAreas.filter(area => area.enabled).map((area) => (
                <div key={area.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{area.name}</h4>
                      <p className="text-sm text-gray-600">{area.description}</p>
                    </div>
                    {renderStars(area.id, true)}
                  </div>
                </div>
              ))}
              
              <div>
                <label className="text-sm font-medium">Additional Feedback (Optional)</label>
                <Textarea
                  placeholder="Share your overall experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={submitRating}
                  disabled={Object.keys(ratings).length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Star className="h-4 w-4 mr-2" />
                  )}
                  Submit Ratings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierDetails;
