import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/auth/AuthContext';
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Services from '@/pages/Services';
import JoinSupplier from '@/pages/JoinSupplier';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import SubmissionSuccess from '@/pages/SubmissionSuccess';
import SchoolDashboard from '@/pages/SchoolDashboard';
import SupplierDashboard from '@/pages/SupplierDashboard';
import Admin from '@/pages/Admin';
import SupplierRatings from '@/pages/SupplierRatings';
import Profile from '@/pages/Profile';
import PricingManagement from '@/pages/PricingManagement';
import ApplicationReviewPage from '@/pages/ApplicationReview';
import LegalComplaint from '@/pages/LegalComplaint';
import MessagingPage from '@/pages/Messaging';
import NotFound from '@/pages/NotFound';
import PaymentSuccess from '@/pages/PaymentSuccess';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/join" element={<JoinSupplier />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/submission-success" element={<SubmissionSuccess />} />
            <Route path="/school-dashboard" element={<SchoolDashboard />} />
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/supplier-ratings" element={<SupplierRatings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing-management" element={<PricingManagement />} />
            <Route path="/application-review" element={<ApplicationReviewPage />} />
            <Route path="/legal-complaint" element={<LegalComplaint />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
