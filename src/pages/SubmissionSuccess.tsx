
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SubmissionSuccess = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full shadow-xl border-0 animate-scale-in">
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Submission Successful!
            </h2>
            
            <p className="mt-2 text-center text-gray-600">
              Thank you for applying to join our network of education service providers.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-blue-800 font-medium text-center">What happens next?</h3>
                <ol className="mt-2 text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">1.</span>
                    <span>Our admin team will review your application</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">2.</span>
                    <span>You may be contacted for additional information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">3.</span>
                    <span>Once approved, your profile will be visible to schools</span>
                  </li>
                </ol>
              </div>
              
              <p className="text-center text-sm text-gray-500">
                Review typically takes 2-3 business days. You will receive an email notification once your application has been processed.
              </p>
              
              <div className="pt-4 flex flex-col space-y-2">
                <Button asChild className="bg-gradient-to-r from-teal to-primary hover:from-teal-dark hover:to-primary-dark text-white w-full">
                  <Link to="/">
                    Return to Home
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    Sign in to your account
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SubmissionSuccess;
