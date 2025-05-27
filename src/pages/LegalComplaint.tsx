
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LegalComplaintForm from '@/components/supplier/LegalComplaintForm';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LegalComplaint = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplierId) {
      setLoading(true);
      supabase
        .from('supplier_applications')
        .select('org_name')
        .eq('id', supplierId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching supplier:', error);
            setError('Could not find the specified supplier');
          } else if (data) {
            setSupplierName(data.org_name);
          }
          setLoading(false);
        });
    }
  }, [supplierId]);

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-navy mb-6">
              Legal <span className="text-teal">Complaint Form</span>
            </h1>
            
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <p>Loading supplier information...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-red-500">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <LegalComplaintForm 
                supplierId={supplierId} 
                supplierName={supplierName || undefined} 
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalComplaint;
