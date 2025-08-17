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
  login: (email: string) => Promise<void>;
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
      const response = await apiRequest("/api/me");
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      
      setUser(response.user);
      
      // Redirect admin users to admin dashboard
      if (response.user?.isAdmin === true) {
        setTimeout(() => {
          setLocation("/admin");
        }, 100);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/api/logout", { method: "POST" });
      setUser(null);
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
    }}>
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