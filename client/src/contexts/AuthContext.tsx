import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, firstName?: string, lastName?: string) => Promise<void>;
  register: (email: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('=== CHECKING AUTH ===');
      console.log('Current cookies:', document.cookie);
      const response = await apiRequest("/api/me");
      console.log('CheckAuth response user:', response.user);
      setUser(response.user);
    } catch (error) {
      console.log('CheckAuth error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, firstName?: string, lastName?: string) => {
    try {
      console.log("=== FRONTEND LOGIN/REGISTER ATTEMPT ===");
      console.log("Email:", email, "First:", firstName, "Last:", lastName);
      
      const requestBody = firstName && lastName 
        ? { email, firstName, lastName }  // Registration data
        : { email }; // Login only
      
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
      console.log('=== LOGIN RESPONSE RECEIVED ===');
      console.log('Full response:', response);
      console.log('Response user:', response.user);
      console.log('User isAdmin:', response.user?.isAdmin);
      console.log('User email:', response.user?.email);
      
      // Set user first
      setUser(response.user);
      
      // Check admin status and redirect - but only redirect to admin from root or login pages
      console.log('=== CHECKING ADMIN STATUS ===');
      if (response.user?.isAdmin === true) {
        console.log('🔥 ADMIN USER DETECTED 🔥');
        const currentPath = window.location.pathname;
        console.log('Current path:', currentPath);
        
        // Only auto-redirect from specific pages, not from plans or other pages where they might want to stay
        if (currentPath === '/' || currentPath === '/login' || currentPath === '/quick-admin-login') {
          console.log('Auto-redirecting admin to admin dashboard from path:', currentPath);
          setTimeout(() => {
            console.log('🚀 EXECUTING ADMIN REDIRECT NOW 🚀');
            window.location.href = "/admin";
          }, 200);
        } else {
          console.log('Admin user on path:', currentPath, '- not auto-redirecting');
        }
      } else {
        console.log('❌ Not admin user - isAdmin:', response.user?.isAdmin);
      }
    } catch (error: any) {
      console.log("Frontend login error:", error);
      // Re-throw the error with all its properties preserved
      throw error;
    }
  };

  const register = async (email: string, firstName: string, lastName: string) => {
    // Registration now goes through login endpoint
    return login(email, firstName, lastName);
  };

  const logout = async () => {
    console.log("=== LOGOUT FUNCTION CALLED ===");
    // Set user to null immediately for faster UI response
    setUser(null);
    
    // Use router navigation instead of window.location for smoother transition
    setLocation("/");
    
    // Make logout API call in background (don't wait)
    apiRequest("/api/logout", { method: "POST" }).catch(error => {
      console.error("Logout error:", error);
    });
    
    console.log("🚀 Navigated to home page after logout");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}