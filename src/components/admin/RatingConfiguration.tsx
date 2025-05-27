
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
import { useToast } from "@/components/ui/use-toast";
import { RotateCcw, Save, Settings } from "lucide-react";
import { useEffect, useState } from 'react';

interface RatingArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const RatingConfiguration = () => {
  const { toast } = useToast();
  const [ratingAreas, setRatingAreas] = useState<RatingArea[]>([
    {
      id: "organization",
      name: "Organization Information",
      description: "Company details, contact information, and basic profile",
      enabled: true
    },
    {
      id: "business",
      name: "Business Details",
      description: "Company type, registration, GST, and business credentials",
      enabled: true
    },
    {
      id: "coverage",
      name: "Service Coverage",
      description: "Geographic coverage, operational cities, and service areas",
      enabled: true
    },
    {
      id: "education",
      name: "Educational Profile",
      description: "Target audience, institution types, and educational boards",
      enabled: true
    },
    {
      id: "services",
      name: "Service Details",
      description: "Specific services offered, features, and capabilities",
      enabled: true
    },
    {
      id: "reliability",
      name: "Reliability",
      description: "Consistency in service delivery and dependability",
      enabled: true
    },
    {
      id: "responsiveness",
      name: "Responsiveness",
      description: "Speed of communication and problem resolution",
      enabled: true
    },
    {
      id: "customerService",
      name: "Customer Service",
      description: "Quality of support and customer interaction",
      enabled: true
    },
    {
      id: "qualityOfService",
      name: "Quality of Service",
      description: "Overall service quality and satisfaction",
      enabled: true
    },
    {
      id: "valueForMoney",
      name: "Value for Money",
      description: "Cost-effectiveness and pricing competitiveness",
      enabled: false
    }
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('adminRatingConfiguration');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setRatingAreas(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading rating configuration:', error);
    }
  }, []);

  const handleToggleArea = (areaId: string, enabled: boolean) => {
    setRatingAreas(prev => 
      prev.map(area => 
        area.id === areaId ? { ...area, enabled } : area
      )
    );
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('adminRatingConfiguration', JSON.stringify(ratingAreas));
      setHasChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "Rating configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving rating configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save rating configuration.",
        variant: "destructive",
      });
    }
  };

  const handleResetToDefaults = () => {
    const defaultSettings = ratingAreas.map(area => ({
      ...area,
      enabled: area.id !== 'valueForMoney' // All enabled except valueForMoney
    }));
    
    setRatingAreas(defaultSettings);
    setHasChanges(true);
    
    toast({
      title: "Reset to Defaults",
      description: "Rating configuration has been reset to default settings.",
    });
  };

  const enabledCount = ratingAreas.filter(area => area.enabled).length;
  const totalCount = ratingAreas.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-navy" />
              <div>
                <CardTitle className="text-xl">Rating Configuration</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configure which areas schools can rate when reviewing suppliers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {enabledCount}/{totalCount} Areas Enabled
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-600">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">How it works:</p>
              <p>Schools will only see rating options for the areas you enable below. Disabled areas won't appear in the supplier rating interface.</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Rating Areas</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefaults}
                className="text-gray-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={!hasChanges}
                className="bg-navy text-white hover:bg-navy/90"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Rating Area</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratingAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{area.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">{area.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={area.enabled ? "default" : "secondary"}>
                      {area.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`rating-switch-${area.id}`}
                        checked={area.enabled}
                        onCheckedChange={(checked) => handleToggleArea(area.id, checked)}
                      />
                      <Label htmlFor={`rating-switch-${area.id}`} className="text-sm">
                        {area.enabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingConfiguration;
