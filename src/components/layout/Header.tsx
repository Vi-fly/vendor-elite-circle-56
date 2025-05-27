import { useAuth } from '@/components/auth/AuthContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Briefcase,
  DollarSign,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span className="font-bold text-xl text-navy">TSCSN</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink to="/" className={({ isActive }) => 
                isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
              }>
                Home
              </NavLink>
              <NavLink to="/services" className={({ isActive }) => 
                isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
              }>
                Services
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => 
                isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
              }>
                About Us
              </NavLink>
              
              {/* Dashboard links based on user role */}
              {user && user.role === 'school' && (
                <NavLink to="/school-dashboard" className={({ isActive }) => 
                  isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
                }>
                  School Dashboard
                </NavLink>
              )}
              
              {user && user.role === 'supplier' && (
                <>
                  <NavLink to="/supplier-dashboard" className={({ isActive }) => 
                    isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
                  }>
                    Supplier Dashboard
                  </NavLink>
                  <NavLink to="/pricing-management" className={({ isActive }) => 
                    isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
                  }>
                    Pricing
                  </NavLink>
                </>
              )}
              
              {user && user.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => 
                  isActive ? "text-teal font-medium" : "text-gray-600 hover:text-teal"
                }>
                  Admin
                </NavLink>
              )}
            </nav>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  className="hidden md:inline-flex"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-teal to-primary text-white"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {user.role === 'school' && (
                    <DropdownMenuItem onClick={() => navigate('/school-dashboard')}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>School Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === 'supplier' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/supplier-dashboard')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Supplier Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/pricing-management')}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Manage Pricing</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isMenuOpen && (
          <div className="pt-2 pb-4 border-t md:hidden">
            <nav className="flex flex-col space-y-3">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/services" 
                className={({ isActive }) => 
                  isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </NavLink>
              
              {user && user.role === 'school' && (
                <NavLink 
                  to="/school-dashboard" 
                  className={({ isActive }) => 
                    isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  School Dashboard
                </NavLink>
              )}
              
              {user && user.role === 'supplier' && (
                <>
                  <NavLink 
                    to="/supplier-dashboard" 
                    className={({ isActive }) => 
                      isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Supplier Dashboard
                  </NavLink>
                  <NavLink 
                    to="/pricing-management" 
                    className={({ isActive }) => 
                      isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </NavLink>
                </>
              )}
              
              {user && user.role === 'admin' && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </NavLink>
              )}
              
              {!user && (
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => 
                    isActive ? "text-teal font-medium p-2" : "text-gray-600 p-2"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
