import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'school' | 'supplier' | null;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setLoading(true);
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            const profile = await fetchUserProfile(currentSession.user.id);
            
            if (profile) {
              setUser({
                id: currentSession.user.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole
              });
              
              // Navigate based on role
              if (profile.role === 'admin') {
                navigate('/admin');
              } else if (profile.role === 'school') {
                navigate('/school-dashboard');
              } else if (profile.role === 'supplier') {
                navigate('/supplier-dashboard');
              }
            } else {
              // Handle case where we have auth but no profile
              setUser({
                id: currentSession.user.id,
                name: currentSession.user.email?.split('@')[0] || 'User',
                email: currentSession.user.email || '',
                role: 'school' // Default role
              });
            }
            setLoading(false);
          }, 0);
        } else if (event === 'SIGNED_OUT' || !currentSession) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          
          const profile = await fetchUserProfile(initialSession.user.id);
          
          if (profile) {
            setUser({
              id: initialSession.user.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole
            });
          } else {
            // Use basic info from session if profile not found
            setUser({
              id: initialSession.user.id,
              name: initialSession.user.email?.split('@')[0] || 'User',
              email: initialSession.user.email || '',
              role: 'school' // Default role
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing state to prevent issues
      cleanupAuthState();
      
      // Try a global sign out first to prevent potential auth state issues
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Continue even if this fails
        console.log('Pre-signout failed, continuing with login');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        throw new Error('Login failed: No user data returned');
      }
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back!`,
      });
      
    } catch (error: any) {
      console.error('Login failed:', error.message || error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      
      // Clean up auth state
      cleanupAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Reset user state
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // Clean up existing state to prevent issues
      cleanupAuthState();
      
      // Try a global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Continue even if this fails
        console.log('Pre-signout failed, continuing with registration');
      }
      
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        throw new Error('Registration failed: No user data returned');
      }
      
      console.log('Registration successful:', data);
      
      // Don't login automatically - require email verification
      // We're not returning the data, just fulfilling the Promise<void> contract
    } catch (error: any) {
      console.error('Registration failed:', error.message || error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create the context value object
  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    logout,
    register
  };

  // Provider component
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
