import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, User } from "lucide-react";
import { useEffect, useState } from 'react';

interface RatingArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
}

interface Supplier {
  id: string;
  org_name: string;
  supplier_type: string;
}

interface RatingConfig {
  [key: string]: {
    enabled: boolean;
    weight: number;
  };
}

interface SupplierRatingConfigProps {
  supplierId: string;
  onClose: () => void;
}

const defaultRatingAreas: RatingArea[] = [
  {
    id: "organization_info",
    name: "Organization Information",
    description: "Company details, contact information, and basic profile",
    enabled: true,
    weight: 0.1
  },
  {
    id: "business_details",
    name: "Business Details", 
    description: "Company type, registration, GST, and business credentials",
    enabled: true,
    weight: 0.1
  },
  {
    id: "service_coverage",
    name: "Service Coverage",
    description: "Geographic coverage, operational cities, and service areas",
    enabled: true,
    weight: 0.15
  },
  {
    id: "educational_profile",
    name: "Educational Profile",
    description: "Target audience, institution types, and educational boards",
    enabled: true,
    weight: 0.1
  },
  {
    id: "service_details",
    name: "Service Details",
    description: "Specific services offered, features, and capabilities",
    enabled: true,
    weight: 0.15
  },
  {
    id: "reliability",
    name: "Reliability",
    description: "Consistency in service delivery and dependability",
    enabled: true,
    weight: 0.1
  },
  {
    id: "responsiveness",
    name: "Responsiveness",
    description: "Speed of communication and problem resolution",
    enabled: true,
    weight: 0.1
  },
  {
    id: "customer_service",
    name: "Customer Service",
    description: "Quality of support and customer interaction",
    enabled: true,
    weight: 0.1
  },
  {
    id: "quality_of_service",
    name: "Quality of Service",
    description: "Overall service quality and satisfaction",
    enabled: true,
    weight: 0.05
  },
  {
    id: "value_for_money",
    name: "Value for Money",
    description: "Cost-effectiveness and pricing competitiveness",
    enabled: true,
    weight: 0.05
  }
];

const SupplierRatingConfiguration: React.FC<SupplierRatingConfigProps> = ({ supplierId, onClose }) => {
  const { toast } = useToast();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [currentRatingAreas, setCurrentRatingAreas] = useState<RatingArea[]>(defaultRatingAreas);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load supplier and configuration
  useEffect(() => {
    fetchSupplier();
    fetchConfiguration();
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_applications')
        .select('id, org_name, supplier_type')
        .eq('id', supplierId)
        .single();

      if (error) {
        console.error('Error fetching supplier:', error);
        return;
      }

      setSupplier(data);
    } catch (error) {
      console.error('Error in fetchSupplier:', error);
    }
  };

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rating_configurations')
        .select('config')
        .eq('supplier_id', supplierId)
        .single();

      if (error) {
        console.error('Error fetching configuration:', error);
        return;
      }

      if (data) {
        const config = data.config as RatingConfig;
        // Update the rating areas with the configuration from the database
        const updatedAreas = defaultRatingAreas.map(area => ({
          ...area,
          enabled: config[area.id]?.enabled ?? area.enabled,
          weight: config[area.id]?.weight ?? area.weight
        }));
        setCurrentRatingAreas(updatedAreas);
      }
    } catch (error) {
      console.error('Error in fetchConfiguration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      // Convert rating areas to the expected config format
      const config: RatingConfig = {};
      currentRatingAreas.forEach(area => {
        config[area.id] = {
          enabled: area.enabled,
          weight: area.weight
        };
      });

      const { error } = await supabase
        .from('rating_configurations')
        .upsert(
          {
            supplier_id: supplierId,
            config: config,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'supplier_id',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;

      setHasChanges(false);
      toast({
        title: "Configuration Saved",
        description: "Rating configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save rating configuration.",
        variant: "destructive",
      });
    }
  };

  const handleToggleArea = (areaId: string, enabled: boolean) => {
    const updatedAreas = currentRatingAreas.map(area => 
      area.id === areaId ? { ...area, enabled } : area
    );
    setCurrentRatingAreas(updatedAreas);
    setHasChanges(true);
  };

  const resetToDefault = () => {
    setCurrentRatingAreas([...defaultRatingAreas]);
    setHasChanges(true);
    
    toast({
      title: "Reset to Default",
      description: "Configuration reset to default settings",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading configuration...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-red-500">Supplier not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-navy" />
          <div>
            <h2 className="text-xl font-semibold">{supplier.org_name}</h2>
            <p className="text-sm text-gray-600">
              Configure rating areas for this supplier
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
          >
            Reset to Default
          </Button>
          <Button
            onClick={saveConfiguration}
            disabled={!hasChanges}
            className="bg-navy text-white hover:bg-navy/90"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-blue-600">ℹ️</div>
        <div className="text-sm text-blue-800">
          <p className="font-medium">How it works:</p>
          <p>Configure which rating areas are available for this supplier. Schools will only see enabled areas when rating this supplier.</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Rating Area</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Weight</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRatingAreas.map((area) => (
            <TableRow key={area.id}>
              <TableCell>
                <p className="font-medium">{area.name}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-gray-600">{area.description}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {(area.weight * 100).toFixed(0)}%
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={area.enabled ? "default" : "secondary"}>
                  {area.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch
                  checked={area.enabled}
                  onCheckedChange={(checked) => handleToggleArea(area.id, checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasChanges && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            <div>⚠️</div>
            <p className="text-sm font-medium">You have unsaved changes</p>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            Don't forget to save your configuration changes to apply them to the rating system.
          </p>
        </div>
      )}
    </div>
  );
};

export default SupplierRatingConfiguration;
