import { useAuth } from '@/components/auth/AuthContext';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleServiceNavigation = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to browse services.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      navigate('/services');
    }
  };

  const handleSupplierJoin = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to register as a supplier.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      navigate('/supplier/apply');
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-navy to-navy-dark text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-2 drop-shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Trusted School & College Suppliers Network
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              <span className="block">Connect with</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-gold to-gold-dark">Elite Education</span>
              <span className="block">Service Providers</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-lg">
              Join our exclusive network connecting educational institutions with verified, high-quality service providers across all educational needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-teal to-primary hover:from-teal-dark hover:to-primary-dark text-white px-8 py-6 text-lg shadow-lg btn-animated"
                onClick={handleSupplierJoin}
              >
                Join as a Supplier
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg shadow-lg btn-animated"
                onClick={handleServiceNavigation}
              >
                Browse Services
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((index) => (
                  <div 
                    key={index}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-navy font-medium"
                  >
                    {String.fromCharCode(64 + index)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-white">100+ Verified</span> service providers
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in animation-delay-300">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                alt="Education Services" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/90 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gold font-medium">Featured Provider</p>
                    <h3 className="text-white text-xl font-bold">TechLearn Solutions</h3>
                  </div>
                  <div className="bg-teal text-white rounded-full px-3 py-1 text-sm">
                    EdTech
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-1/2 -right-6 transform translate-y-1/2 w-24 h-24 rounded-full bg-gold/20 filter blur-xl"></div>
            <div className="absolute -bottom-10 left-1/3 w-32 h-32 rounded-full bg-teal/20 filter blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full border-4 border-gold/30 z-0"></div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f8fafc" className="w-full">
          <path d="M0,64L60,58.7C120,53,240,43,360,53.3C480,64,600,96,720,96C840,96,960,64,1080,53.3C1200,43,1320,53,1380,58.7L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
