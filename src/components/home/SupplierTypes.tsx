import { useAuth } from '@/components/auth/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SupplierCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const supplierCategories: SupplierCategory[] = [
  {
    id: 'edtech',
    title: 'EdTech Solutions',
    description: 'Digital learning platforms, LMS, virtual labs and adaptive learning tools.',
    icon: '💻',
    color: 'from-blue-500 to-blue-700'
  },
  {
    id: 'curriculum',
    title: 'Curriculum & Content',
    description: 'Teaching resources, assessment tools and academic content providers.',
    icon: '📚',
    color: 'from-green-500 to-green-700'
  },
  {
    id: 'furniture',
    title: 'Furniture & Infrastructure',
    description: 'Classroom furniture, laboratory equipment and smart classroom solutions.',
    icon: '🪑',
    color: 'from-yellow-500 to-yellow-700'
  },
  {
    id: 'transport',
    title: 'Transport & Logistics',
    description: 'School buses, fleet management and student transport solutions.',
    icon: '🚌',
    color: 'from-red-500 to-red-700'
  },
  {
    id: 'training',
    title: 'Training & Consulting',
    description: 'Teacher training, professional development and educational consulting.',
    icon: '👨‍🏫',
    color: 'from-purple-500 to-purple-700'
  },
  {
    id: 'books',
    title: 'Books & Publications',
    description: 'Textbooks, digital publications and reference materials.',
    icon: '📕',
    color: 'from-orange-500 to-orange-700'
  },
  {
    id: 'uniforms',
    title: 'Uniforms & Supplies',
    description: 'School uniforms, stationery and other educational supplies.',
    icon: '👕',
    color: 'from-pink-500 to-pink-700'
  },
  {
    id: 'erp',
    title: 'School ERP & Admin',
    description: 'School management software, admin systems and digital record keeping.',
    icon: '⚙️',
    color: 'from-teal-500 to-teal-700'
  },
];

const SupplierTypes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSupplierNavigation = (path: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to view suppliers.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-teal/5 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Discover Our <span className="text-teal bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">Supplier Categories</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Explore our diverse range of education service providers, each vetted to ensure the highest quality solutions for schools and institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplierCategories.map((category, index) => (
            <Card 
              key={category.id} 
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 animate-fade-in bg-white/80 backdrop-blur-sm hover:bg-white" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 bg-gradient-to-r ${category.color} transition-all duration-300 group-hover:h-3`}></div>
              <CardContent className="p-6 relative overflow-hidden">
                {/* Hover Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {category.icon}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-teal group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:rotate-90">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2 group-hover:text-teal transition-colors duration-300 relative z-10">{category.title}</h3>
                <p className="text-gray-600 mb-4 relative z-10 group-hover:text-gray-700 transition-colors duration-300">{category.description}</p>
                <Button 
                  variant="outline" 
                  className="text-teal border-teal hover:bg-teal hover:text-white hover:border-teal transition-all duration-300 w-full font-semibold transform hover:scale-105 hover:shadow-lg relative z-10"
                  onClick={() => handleSupplierNavigation(`/suppliers/${category.id}`)}
                >
                  Browse Suppliers
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-navy to-navy-dark text-white hover:from-navy-dark hover:to-navy px-8 btn-animated"
            onClick={() => handleSupplierNavigation('/suppliers')}
          >
            View All Suppliers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SupplierTypes;
