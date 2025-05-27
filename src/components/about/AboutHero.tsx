
import React from 'react';

const AboutHero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/80 z-0"></div>
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" 
          alt="Education background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h6 className="text-teal mb-3 font-medium uppercase tracking-wider">About Us</h6>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Transforming Education <span className="text-gold">Procurement</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8">
            Founded in 2025, our mission is to revolutionize how educational institutions find and partner with quality service providers.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center w-32">
              <div className="text-3xl font-bold text-gold">250+</div>
              <div className="text-white text-sm">Schools</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center w-32">
              <div className="text-3xl font-bold text-gold">180+</div>
              <div className="text-white text-sm">Suppliers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center w-32">
              <div className="text-3xl font-bold text-gold">15+</div>
              <div className="text-white text-sm">Countries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center w-32">
              <div className="text-3xl font-bold text-gold">98%</div>
              <div className="text-white text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
