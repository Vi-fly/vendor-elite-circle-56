import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Calendar, Users, Phone, Mail, Globe, MessageSquare } from 'lucide-react';
import SupplierDetails from './SupplierDetails';
import SupplierRating from './SupplierRating';

interface RatingArea {
  name: string;
  weight: number;
  enabled: boolean;
}

interface RatingAverages {
  [key: string]: {
    average: number;
    weight: number;
  };
}

interface Supplier {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website?: string;
  supplier_type: string;
  hq_city: string;
  operational_cities: string;
  short_desc: string;
  full_desc: string;
  year_started: number;
  status: 'pending' | 'approved' | 'rejected' | 'waiting';
  avgRating: number;
  reviewCount: number;
  ratingConfig: RatingArea[];
  ratingAverages: RatingAverages;
}

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      
      // Fetch supplier applications
      const { data: supplierData, error: supplierError } = await supabase
        .from('supplier_applications')
        .select('*')
        .eq('status', 'approved');

      if (supplierError) throw supplierError;

      // Fetch rating configurations
      const { data: ratingConfigs, error: configError } = await supabase
        .from('rating_configurations')
        .select('*');

      if (configError) throw configError;

      // Fetch rating averages
      const { data: ratingAverages, error: avgError } = await supabase
        .from('supplier_rating_averages')
        .select('*');

      if (avgError) throw avgError;

      // Process and combine data
      const processedSuppliers = (supplierData || []).map(supplier => {
        const config = ratingConfigs?.find(c => c.supplier_id === supplier.id);
        const averages = ratingAverages?.find(a => a.supplier_id === supplier.id);
        
        const ratingConfig: RatingArea[] = config?.config ? 
          Object.entries(config.config).map(([key, value]: [string, any]) => ({
            name: key,
            weight: value.weight || 0,
            enabled: value.enabled || false
          })) : [];

        const ratingAvgs: RatingAverages = averages?.ratings || {};
        
        // Calculate overall rating
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        Object.entries(ratingAvgs).forEach(([key, rating]: [string, any]) => {
          if (rating?.average && rating?.weight) {
            totalWeightedScore += rating.average * rating.weight;
            totalWeight += rating.weight;
          }
        });

        const avgRating = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        const reviewCount = Object.values(ratingAvgs).reduce((sum, rating: any) => 
          sum + (rating?.count || 0), 0);

        return {
          ...supplier,
          status: supplier.status as 'pending' | 'approved' | 'rejected' | 'waiting',
          avgRating,
          reviewCount,
          ratingConfig,
          ratingAverages: ratingAvgs
        };
      });

      setSuppliers(processedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch suppliers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.org_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.short_desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || supplier.supplier_type === selectedType;
    const matchesCity = !selectedCity || supplier.hq_city === selectedCity ||
                       supplier.operational_cities.toLowerCase().includes(selectedCity.toLowerCase());
    
    return matchesSearch && matchesType && matchesCity;
  });

  const uniqueTypes = Array.from(new Set(suppliers.map(s => s.supplier_type)));
  const uniqueCities = Array.from(new Set(suppliers.map(s => s.hq_city)));

  const handleContactSupplier = async (supplier: Supplier) => {
    try {
      // Fetch current user's role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', supabase.auth.currentUser?.id)
        .single();
        
      if (profileError) throw profileError;
      
      const userRole = profileData?.role;
      
      if (!userRole) {
        toast({
          title: 'Error',
          description: 'Could not determine your role.',
          variant: 'destructive',
        });
        return;
      }
      
      // Create or get conversation
      const { data: conversation, error: conversationError } = await supabase.rpc(
        'get_or_create_conversation',
        {
          school_id: userRole === 'school' ? supabase.auth.currentUser?.id : supplier.id,
          supplier_id: userRole === 'supplier' ? supabase.auth.currentUser?.id : supplier.id,
        }
      );
      
      if (conversationError) throw conversationError;
      
      // Redirect to messaging page with the conversation ID
      window.location.href = `/messaging?conversationId=${conversation.id}`;
    } catch (error: any) {
      console.error('Error contacting supplier:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate contact. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cities</SelectItem>
            {uniqueCities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{supplier.org_name}</CardTitle>
                  <CardDescription>{supplier.supplier_type}</CardDescription>
                </div>
                <Badge variant="secondary">{supplier.status}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{supplier.avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({supplier.reviewCount} reviews)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{supplier.short_desc}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{supplier.hq_city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Since {supplier.year_started}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{supplier.contact_name}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setShowRatingDialog(true);
                  }}
                >
                  Rate Supplier
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleContactSupplier(supplier)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No suppliers found matching your criteria.</p>
        </div>
      )}

      {/* Supplier Details Dialog */}
      {selectedSupplier && !showRatingDialog && (
        <SupplierDetails
          supplier={selectedSupplier}
          isOpen={true}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {/* Rating Dialog */}
      {selectedSupplier && showRatingDialog && (
        <SupplierRating
          supplier={selectedSupplier}
          isOpen={showRatingDialog}
          onClose={() => {
            setShowRatingDialog(false);
            setSelectedSupplier(null);
          }}
          onRatingSubmitted={fetchSuppliers}
        />
      )}
    </div>
  );
};

export default SupplierList;
