
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import SupplierTypes from '@/components/home/SupplierTypes';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import JoinCTA from '@/components/home/JoinCTA';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <SupplierTypes />
      <Features />
      <Testimonials />
      <JoinCTA />
    </Layout>
  );
};

export default Index;
