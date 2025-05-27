
import React from 'react';

const timelineItems = [
  {
    year: 2019,
    title: 'Our Beginning',
    description: 'EduConnect was founded with a vision to revolutionize how schools find educational service providers.'
  },
  {
    year: 2020,
    title: 'Overcoming Challenges',
    description: 'Adapted quickly during the pandemic to help schools find digital learning solutions and remote education resources.'
  },
  {
    year: 2021,
    title: 'Building Partnerships',
    description: 'Established formal partnerships with educational boards and expanded our supplier network to over 200 verified providers.'
  },
  {
    year: 2022,
    title: 'Technology Upgrade',
    description: 'Launched our intelligent matching algorithm to help schools find the perfect providers based on their specific needs.'
  },
  {
    year: 2023,
    title: 'Community Growth',
    description: 'Reached the milestone of connecting 1,000+ schools with ideal service providers across the country.'
  },
  {
    year: 2024,
    title: 'Global Expansion',
    description: 'Began expanding our platform to serve international schools and educational institutions worldwide.'
  },
  {
    year: 2025,
    title: 'Future Vision',
    description: 'Working towards becoming the comprehensive one-stop solution for all educational institution procurement needs.'
  }
];

const Timeline: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Our Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From our founding until today, we've been on a mission to transform how educational institutions connect with service providers.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-teal-200 z-0"></div>
          
          {/* Timeline items */}
          {timelineItems.map((item, index) => (
            <div key={index} className={`relative z-10 mb-12 flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-teal">
                  <span className="text-teal font-bold text-xl">{item.year}</span>
                  <h3 className="text-navy font-bold text-lg mt-1">{item.title}</h3>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                </div>
              </div>
              
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-teal border-4 border-white shadow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
