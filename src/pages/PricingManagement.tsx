
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PricingTableList from '@/components/supplier/PricingTableList';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const PricingManagement = () => {
  const { user } = useAuth();
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch supplier ID for the current user
  useEffect(() => {
    const fetchSupplierInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // For demo purposes, generate a mock supplier ID
        // In a real app, this would be fetched from the database
        const demoSupplierId = '4ce04cf5-322a-41c0-bc52-8a5db3373b3f'; // Fixed supplier ID for demo
        setSupplierId(demoSupplierId);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchSupplierInfo();
  }, [user]);

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-navy mb-2">
              Manage Your <span className="text-teal">Service Pricing</span>
            </h1>
            <p className="text-gray-600 mb-8">
              Create and manage pricing tables for the services you offer to schools
            </p>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <p>Loading your supplier information...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
                <p className="text-red-600">{error}</p>
                <p className="mt-4 text-gray-600">Please make sure you have submitted a supplier application first.</p>
              </div>
            ) : !supplierId ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-amber-700 mb-2">No Supplier Profile Found</h2>
                <p className="text-amber-600">
                  You need to create a supplier profile before managing pricing tables.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <PricingTableList supplierId={supplierId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingManagement;
