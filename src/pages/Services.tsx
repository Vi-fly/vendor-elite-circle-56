
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const services = [
    {
      id: 'edtech',
      title: 'EdTech Solutions',
      description: 'Digital learning platforms, interactive content, and educational software for modern classrooms.',
      features: [
        'Learning Management Systems (LMS)',
        'Interactive digital content',
        'Student progress tracking',
        'Virtual classroom tools',
        'Educational apps and software'
      ],
      icon: '💻'
    },
    {
      id: 'furniture',
      title: 'School Furniture',
      description: 'Ergonomic and durable furniture designed specifically for educational environments.',
      features: [
        'Classroom desks and chairs',
        'Laboratory furniture',
        'Library shelving and seating',
        'Administrative office furniture',
        'Outdoor educational spaces'
      ],
      icon: '🪑'
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      description: 'Comprehensive teaching materials and content aligned with various educational boards.',
      features: [
        'Board-aligned textbooks',
        'Teacher guides and resources',
        'Assessment materials',
        'Subject-specific workbooks',
        'Supplementary learning materials'
      ],
      icon: '📚'
    },
    {
      id: 'books',
      title: 'Books & Publications',
      description: 'Textbooks, reference materials, and educational publications for all age groups.',
      features: [
        'Subject textbooks for all grades',
        'Reference books and encyclopedias',
        "Children's literature",
        'Educational magazines',
        'Digital publications'
      ],
      icon: '📖'
    },
    {
      id: 'training',
      title: 'Teacher Training',
      description: 'Professional development programs and workshops for educators to enhance teaching skills.',
      features: [
        'Pedagogical training',
        'Technology integration workshops',
        'Subject-specific methodology',
        'Assessment techniques',
        'Classroom management strategies'
      ],
      icon: '👩‍🏫'
    },
    {
      id: 'erp',
      title: 'School ERP Solutions',
      description: 'Comprehensive management systems for streamlining school administrative operations.',
      features: [
        'Student information management',
        'Attendance tracking',
        'Fee management',
        'Examination and grading systems',
        'Communication portals'
      ],
      icon: '🖥️'
    }
  ];

  // Function to determine which dashboard to navigate to
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch(user.role) {
      case 'admin':
        return '/admin';
      case 'school':
        return '/school-dashboard';
      case 'supplier':
        return '/supplier-dashboard';
      default:
        return '/';
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-navy mb-4">Our Educational Services</h1>
            <p className="text-lg text-gray-600">
              Connecting schools with quality education service providers across India. 
              Browse our comprehensive range of services designed to enhance the learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="border-0 shadow-md transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="text-3xl mb-3">{service.icon}</div>
                  <CardTitle className="text-xl font-semibold text-navy">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate(getDashboardLink())} 
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    {user ? "Explore Providers" : "Login to Explore"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="bg-navy/5 rounded-lg p-6 md:p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-navy mb-4">Are You an Education Service Provider?</h2>
              <p className="mb-6 text-gray-700">
                Join our platform to connect with schools across India and grow your business.
                Our platform offers visibility to thousands of educational institutions looking for quality services.
              </p>
              {!user ? (
                <Button onClick={() => navigate('/join')} size="lg" className="bg-gradient-to-r from-teal to-primary text-white">
                  Join as a Supplier
                </Button>
              ) : user.role !== 'supplier' ? (
                <Button onClick={() => navigate('/join')} size="lg" className="bg-gradient-to-r from-teal to-primary text-white">
                  Join as a Supplier
                </Button>
              ) : (
                <Button onClick={() => navigate('/supplier-dashboard')} size="lg" className="bg-gradient-to-r from-teal to-primary text-white">
                  Go to Supplier Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
