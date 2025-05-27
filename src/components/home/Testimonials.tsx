
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'Principal',
    company: 'Heritage International School',
    quote: 'EduVendorsElite has transformed how we source educational services. The quality of providers we\'ve connected with has significantly improved our academic offerings.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'CEO',
    company: 'TechLearn Solutions',
    quote: 'As an EdTech provider, joining this platform has connected us with schools that truly value innovation. Our client base has grown by 40% since joining.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Procurement Manager',
    company: 'Delhi Public School Group',
    quote: 'The supplier verification process gives us confidence that we\'re partnering with reliable providers. It\'s saved us countless hours in vendor research and validation.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: 4,
    name: 'James Wilson',
    role: 'Director',
    company: 'EduFurniture Inc.',
    quote: 'Since joining as a verified supplier, we\'ve established partnerships with 15 new school districts. The platform\'s focus on quality has helped us stand out in the market.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  },
];

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h6 className="text-teal font-medium mb-2 uppercase tracking-wider">Testimonials</h6>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Hear From Our <span className="text-gold">Community</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Discover what schools and service providers are saying about their experience with EduVendorsElite.
          </p>
        </div>

        <div className="relative">
          <div className="max-w-4xl mx-auto">
            {/* Current testimonial */}
            <div className="relative">
              <Card className="border-0 shadow-xl bg-white relative z-10 animate-scale-in">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="relative">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                        <img 
                          src={testimonials[activeIndex].image} 
                          alt={testimonials[activeIndex].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 11.5L13.6 4.1C13.2 3.7 12.6 3.7 12.2 4.1L10.8 5.5C10.4 5.9 10.4 6.5 10.8 6.9L16.4 12.5L10.8 18.1C10.4 18.5 10.4 19.1 10.8 19.5L12.2 20.9C12.6 21.3 13.2 21.3 13.6 20.9L21 13.5C21.4 13.1 21.4 12.5 21 11.5Z" fill="currentColor"/>
                          <path d="M10 11.5L2.6 4.1C2.2 3.7 1.6 3.7 1.2 4.1L-0.2 5.5C-0.6 5.9 -0.6 6.5 -0.2 6.9L5.4 12.5L-0.2 18.1C-0.6 18.5 -0.6 19.1 -0.2 19.5L1.2 20.9C1.6 21.3 2.2 21.3 2.6 20.9L10 13.5C10.4 13.1 10.4 12.5 10 11.5Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <svg className="w-10 h-10 text-teal/20 mb-4 mx-auto md:mx-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"></path>
                      </svg>
                      <p className="text-gray-700 text-lg md:text-xl italic mb-6">
                        "{testimonials[activeIndex].quote}"
                      </p>
                      <div>
                        <h4 className="text-navy font-bold text-lg">
                          {testimonials[activeIndex].name}
                        </h4>
                        <p className="text-gray-500">
                          {testimonials[activeIndex].role}, {testimonials[activeIndex].company}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial navigation */}
            <div className="flex justify-between items-center mt-8">
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeIndex === index ? 'bg-teal w-8' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-teal/10 filter blur-lg"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-gold/10 filter blur-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
