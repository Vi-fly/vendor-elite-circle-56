
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Zhang',
    role: 'CEO & Founder',
    bio: 'Former education procurement specialist with 15+ years of experience transforming how educational institutions connect with service providers.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    socialLinks: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'CTO',
    bio: 'Tech leader with expertise in building scalable marketplaces and platforms. Previously led engineering teams at major EdTech companies.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    socialLinks: {
      linkedin: '#',
      github: '#'
    }
  },
  {
    id: 3,
    name: 'Priya Patel',
    role: 'Head of Supplier Relations',
    bio: 'Former school administrator who understands the challenges of finding quality suppliers. Dedicated to ensuring supplier excellence.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    socialLinks: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    id: 4,
    name: 'James Wilson',
    role: 'Head of School Partnerships',
    bio: 'Former principal with deep connections in education. Passionate about helping schools find resources to improve educational outcomes.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    socialLinks: {
      linkedin: '#'
    }
  },
  {
    id: 5,
    name: 'Olivia Mitchell',
    role: 'Product Manager',
    bio: 'Specializes in creating intuitive digital experiences. Focused on making our platform accessible and valuable for all users.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    socialLinks: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    id: 6,
    name: 'David Kim',
    role: 'Marketing Director',
    bio: 'Digital marketing strategist specialized in education sector. Brings innovative approaches to connect schools with quality suppliers.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
    socialLinks: {
      linkedin: '#',
      twitter: '#'
    }
  },
];

const TeamSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h6 className="text-teal uppercase tracking-wider font-medium mb-3">Our Team</h6>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Meet the <span className="text-gold">OLL Team</span> Behind EduVendorsElite
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our diverse team of education experts, technology innovators, and customer success specialists 
            work together to create the best platform for educational procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="border-0 hover:shadow-lg transition-all duration-300 h-full animate-hover">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold">OLL</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-navy mb-1">{member.name}</h3>
                  <p className="text-teal font-medium mb-3">{member.role}</p>
                  
                  <p className="text-gray-600 text-center mb-4">{member.bio}</p>
                  
                  <div className="flex space-x-3 mt-auto">
                    {member.socialLinks.linkedin && (
                      <a href={member.socialLinks.linkedin} className="text-gray-400 hover:text-teal" aria-label="LinkedIn">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a href={member.socialLinks.twitter} className="text-gray-400 hover:text-teal" aria-label="Twitter">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a href={member.socialLinks.github} className="text-gray-400 hover:text-teal" aria-label="GitHub">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
