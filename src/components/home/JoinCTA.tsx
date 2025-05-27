import { Button } from "@/components/ui/button";
import { Briefcase, Globe, GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JoinCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-navy via-primary to-navy-dark text-white relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gold/10 rounded-full blur-2xl animate-bounce-subtle"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-teal/10 rounded-full blur-2xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-xl animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/20 rounded-full mb-6 animate-bounce-subtle">
            <Globe className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-scale-in">
            Join <span className="text-gold bg-gradient-to-r from-gold to-gold/80 bg-clip-text text-transparent">TSCSN</span> Today
          </h2>
          <p className="text-xl text-white/95 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Become part of India's most trusted network connecting educational institutions 
            with verified, excellence-driven suppliers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Institutions */}
          <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-teal/20 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <GraduationCap className="w-10 h-10 text-teal" />
            </div>
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-gold animate-pulse" />
              For Institutions
            </h3>
            <p className="text-lg mb-6 text-white/95">
              Stop wasting time on unreliable vendors. Join TSCSN and simplify your procurement process.
            </p>
            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-start group/item">
                <span className="text-gold mr-3 text-xl group-hover/item:scale-125 transition-transform duration-200">•</span>
                <span className="group-hover/item:text-gold transition-colors duration-200">One-click access to trusted vendors across 50+ categories</span>
              </li>
              <li className="flex items-start group/item">
                <span className="text-gold mr-3 text-xl group-hover/item:scale-125 transition-transform duration-200">•</span>
                <span className="group-hover/item:text-gold transition-colors duration-200">Verified reviews by fellow principals & educators</span>
              </li>
              <li className="flex items-start group/item">
                <span className="text-gold mr-3 text-xl group-hover/item:scale-125 transition-transform duration-200">•</span>
                <span className="group-hover/item:text-gold transition-colors duration-200">Transparent pricing, documentation, and contact information</span>
              </li>
            </ul>
            <Button 
              size="lg" 
              className="bg-teal hover:bg-teal/90 text-white w-full py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:rotate-1"
              onClick={() => navigate('/register')}
            >
              <span className="relative z-10">Register Your Institution</span>
            </Button>
          </div>
          
          {/* For Suppliers */}
          <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/20 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Briefcase className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-teal animate-pulse" />
              For Suppliers
            </h3>
            <p className="text-lg mb-6 text-white/95">
              Stand out as a verified, trusted partner. Build your brand across India's top schools and colleges.
            </p>
            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-start group/item">
                <span className="text-teal mr-3 text-xl group-hover/item:scale-125 transition-transform duration-200">•</span>
                <span className="group-hover/item:text-teal transition-colors duration-200">Join an elite network recommended by education leaders</span>
              </li>
              <li className="flex items-start group/item">
                <span className="text-teal mr-3 text-xl group-hover/item:scale-125 transition-transform duration-200">•</span>
                <span className="group-hover/item:text-teal transition-colors duration-200">Get direct B2B leads from verified institutions</span>
              </li>
              <li className="flex items-start group/item">
                <span className="text-teal mr-3 text-xl group-hover/item:scale-125 transition-transform duration-200">•</span>
                <span className="group-hover/item:text-teal transition-colors duration-200">Participate in exclusive review podcasts & showcase credibility</span>
              </li>
            </ul>
            <Button 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-navy w-full font-bold py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:rotate-1"
              onClick={() => navigate('/join')}
            >
              <span className="relative z-10">Join Elite Network</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCTA;
