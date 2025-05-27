import SupplierRatingsManager from '@/components/admin/SupplierRatingsManager';
import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/layout/Layout';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SupplierRatings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Supplier Ratings Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate supplier ratings from schools
          </p>
        </div>
        <SupplierRatingsManager />
      </div>
    </Layout>
  );
};

export default SupplierRatings; 