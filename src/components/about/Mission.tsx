
import React from 'react';

const Mission = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h6 className="text-teal uppercase tracking-wider font-medium mb-3">Our Vision & Mission</h6>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              Creating a Better Educational <span className="text-gold">Ecosystem</span>
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              At EduVendorsElite, we believe that every educational institution deserves access to the highest quality service providers. Our platform bridges the gap between schools and suppliers, ensuring transparency, quality, and efficiency in the procurement process.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-navy text-lg">Rigorous Verification</h4>
                  <p className="text-gray-600">All suppliers undergo thorough verification to ensure quality and reliability.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-navy text-lg">Streamlined Discovery</h4>
                  <p className="text-gray-600">Schools can easily find and compare services based on their specific needs.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-navy text-lg">Quality Partnerships</h4>
                  <p className="text-gray-600">We facilitate meaningful connections that lead to long-term collaborative partnerships.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04" 
                alt="Our mission" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold/20 rounded-full blur-2xl z-0"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-teal/20 rounded-full blur-2xl z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
