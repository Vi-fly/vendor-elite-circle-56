
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 max-w-md mx-auto">
          <h1 className="text-6xl md:text-9xl font-bold text-navy opacity-20">404</h1>
          <div className="mt-6">
            <h2 className="text-3xl font-bold text-navy">Page Not Found</h2>
            <p className="text-gray-600 mt-3 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Button asChild className="bg-gradient-to-r from-teal to-primary hover:from-teal-dark hover:to-primary text-white">
              <Link to="/">
                Return to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
