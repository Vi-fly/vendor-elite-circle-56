
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  supplier_id: z.string().uuid().nonempty("Please select a supplier"),
  complaint_title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  complaint_details: z.string().min(20, "Please provide more details about your complaint").max(2000, "Details cannot exceed 2000 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface LegalComplaintFormProps {
  supplierId?: string;
  supplierName?: string;
}

const LegalComplaintForm = ({ supplierId, supplierName }: LegalComplaintFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_id: supplierId || "",
      complaint_title: "",
      complaint_details: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a complaint",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('legal_complaints')
        .insert({
          supplier_id: data.supplier_id,
          complaint_title: data.complaint_title,
          complaint_details: data.complaint_details,
          submitted_by: user.id,
        });

      if (error) {
        console.error("Error submitting complaint:", error);
        toast({
          title: "Error",
          description: "Failed to submit complaint: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your legal complaint has been submitted successfully",
      });
      
      // Reset form
      form.reset();
      
      // Redirect to a success page or supplier list
      navigate("/school-dashboard");
    } catch (error) {
      console.error("Error in submission:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">Please log in to submit a legal complaint.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-navy">Submit a Legal Complaint</CardTitle>
        <CardDescription>
          {supplierName 
            ? `Filing a complaint against ${supplierName}`
            : "Please provide details about your legal concern with this supplier"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!supplierId && (
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier ID" {...field} />
                    </FormControl>
                    <FormDescription>Enter the ID of the supplier you're filing against</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="complaint_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your complaint" {...field} />
                  </FormControl>
                  <FormDescription>Summarize your complaint in a few words</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="complaint_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide detailed information about your complaint" 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include relevant dates, communications, and specific details about the issue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-teal to-primary text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LegalComplaintForm;
