import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminLoginTest() {
  const [email, setEmail] = useState("admin@forexsignals.com");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const { login, user } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setStatus("Starting login...");
    
    try {
      console.log("=== ADMIN TEST LOGIN START ===");
      console.log("Email:", email);
      
      setStatus("Calling login function...");
      await login(email);
      
      console.log("=== ADMIN TEST LOGIN SUCCESS ===");
      setStatus("Login completed successfully!");
      
    } catch (error: any) {
      console.error("=== ADMIN TEST LOGIN ERROR ===", error);
      setStatus(`Login failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login Test</h1>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Logging in..." : "Test Login"}
          </Button>
          
          {status && (
            <div className="p-3 bg-gray-100 rounded text-sm">
              Status: {status}
            </div>
          )}
          
          {user && (
            <div className="p-3 bg-green-100 rounded text-sm">
              <div><strong>Logged in as:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
              <div><strong>Admin:</strong> {user.isAdmin ? "YES" : "NO"}</div>
              <div><strong>ID:</strong> {user.id}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}