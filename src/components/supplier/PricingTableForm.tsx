
import React from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Clock, CalendarDays } from "lucide-react";

const featureSchema = z.object({
  name: z.string().min(1, "Feature name is required"),
  included: z.boolean().default(true),
});

const formSchema = z.object({
  supplier_id: z.string().min(1, "Supplier ID is required"),
  service_name: z.string().min(3, "Service name must be at least 3 characters"),
  price_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid positive number",
  }),
  price_unit: z.string().min(2, "Unit must be at least 2 characters"),
  duration: z.string().optional(),
  includes: z.string().optional(),
  features: z.array(featureSchema).min(1, "Add at least one feature"),
});

type FormValues = z.infer<typeof formSchema>;

interface FeatureItem {
  name: string;
  included: boolean;
}

interface PricingTableFormProps {
  supplierId: string;
  onSuccess?: () => void;
  existingPricingTable?: {
    id: string;
    service_name: string;
    price_amount: number;
    price_unit: string;
    features: FeatureItem[];
    duration?: string;
    includes?: string;
  };
}

const PricingTableForm = ({ supplierId, onSuccess, existingPricingTable }: PricingTableFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_id: supplierId,
      service_name: existingPricingTable?.service_name || "",
      price_amount: existingPricingTable?.price_amount.toString() || "",
      price_unit: existingPricingTable?.price_unit || "",
      duration: existingPricingTable?.duration || "",
      includes: existingPricingTable?.includes || "",
      features: existingPricingTable?.features || [{ name: "", included: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to manage pricing tables",
        variant: "destructive",
      });
      return;
    }

    try {
      // For demo purposes, we'll just show a success message
      // In a real app, this would be a Supabase call to insert/update data
      console.log("Submitting data:", data);

      toast({
        title: "Success",
        description: "Pricing table has been saved successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error in submission:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border shadow-sm mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {existingPricingTable ? "Edit Pricing Table" : "Add New Pricing Table"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Package, Premium Service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., per student, per month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                        Duration
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 8 weeks, Half-day (5 days)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="includes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Includes (summary)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., All core curriculum, Themed activities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Features Included</h3>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 mb-2">
                  <FormField
                    control={form.control}
                    name={`features.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Feature description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ name: "", included: true })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Feature
              </Button>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                className="bg-primary text-white"
                disabled={form.formState.isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {form.formState.isSubmitting ? "Saving..." : "Save Pricing Table"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PricingTableForm;
