
import React from 'react';
import Layout from '@/components/layout/Layout';
import TeamSection from '@/components/about/TeamSection';
import AboutHero from '@/components/about/AboutHero';
import Mission from '@/components/about/Mission';
import Timeline from '@/components/about/Timeline';

const About = () => {
  return (
    <Layout>
      <AboutHero />
      <Mission />
      <TeamSection />
      <Timeline />
    </Layout>
  );
};

export default About;
