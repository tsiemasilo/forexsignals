import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

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
  register: (email: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
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

  const login = async (email: string) => {
    try {
      console.log("=== FRONTEND LOGIN ATTEMPT ===");
      console.log("Email:", email);
      
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      
      console.log('Login response:', response);
      console.log('Login response user:', response.user);
      setUser(response.user);
    } catch (error: any) {
      console.log("Frontend login error:", error);
      // Re-throw the error with all its properties preserved
      throw error;
    }
  };

  const register = async (email: string, firstName: string, lastName: string) => {
    const response = await apiRequest("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, firstName, lastName }),
    });
    setUser(response.user);
  };

  const logout = async () => {
    await apiRequest("/api/logout", { method: "POST" });
    setUser(null);
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