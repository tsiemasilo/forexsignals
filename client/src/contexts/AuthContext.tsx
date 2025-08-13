import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (userData: { email: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const storedSessionId = localStorage.getItem("sessionId");
    const storedUser = localStorage.getItem("user");
    
    if (storedSessionId && storedUser) {
      try {
        setSessionId(storedSessionId);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem("sessionId");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    try {
      const response = await apiRequest("POST", "/api/login", { email });
      const data = await response.json();
      
      setUser(data.user);
      setSessionId(data.sessionId);
      
      // Store in localStorage for persistence
      localStorage.setItem("sessionId", data.sessionId);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (userData: { email: string; firstName?: string; lastName?: string }) => {
    try {
      await apiRequest("POST", "/api/register", userData);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    // Call logout endpoint (no authorization header needed with session cookies)
    apiRequest("POST", "/api/logout", {}).catch(() => {
      // Ignore errors for logout
    });
    
    setUser(null);
    setSessionId(null);
    localStorage.removeItem("sessionId");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, isLoading, login, register, logout }}>
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