import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { SimpleLoginPage } from "@/pages/SimpleLoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PhoneSignalsPage } from "@/pages/PhoneSignalsPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Plans } from "@/pages/Plans";
import { PaymentSuccess } from "@/pages/PaymentSuccess";
import { PaymentCancel } from "@/pages/PaymentCancel";
import { PaymentError } from "@/pages/PaymentError";
import { AdminLoginTest } from "@/pages/AdminLoginTest";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Enhanced debug logging
  console.log('=== APP ROUTES RENDER ===');
  console.log('User object:', user);
  console.log('User isAdmin:', user?.isAdmin);
  console.log('User email:', user?.email);
  console.log('Loading state:', loading);

  return (
    <Switch>
      <Route path="/" component={() => {
        // Always show PhoneSignalsPage for both logged-in and logged-out users
        if (!user) return <PhoneSignalsPage />;
        console.log('Root route - User:', user, 'IsAdmin:', user.isAdmin);
        
        // Force admin users to admin dashboard
        if (user.isAdmin === true) {
          console.log('Redirecting admin user to admin dashboard');
          return <Redirect to="/admin" />;
        }
        
        return <PhoneSignalsPage />;
      }} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/phone-signals" component={PhoneSignalsPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={() => {
        // If user is already logged in as admin, redirect to admin dashboard
        if (user && user.isAdmin === true) {
          console.log('Admin user accessing login page - redirecting to admin dashboard');
          return <Redirect to="/admin" />;
        }
        return <SimpleLoginPage />;
      }} />
      <Route path="/quick-admin-login" component={() => {
        const { login } = useAuth();
        const [loading, setLoading] = useState(false);
        const [message, setMessage] = useState("");
        
        const handleAdminLogin = async () => {
          console.log("=== QUICK ADMIN LOGIN CLICKED ===");
          setLoading(true);
          setMessage("");
          try {
            console.log("Calling login with admin@forexsignals.com");
            await login("admin@forexsignals.com");
            console.log("Login successful, redirecting...");
            setMessage("Login successful! Redirecting...");
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          } catch (error) {
            console.error("Admin login failed:", error);
            setMessage("Login failed: " + (error instanceof Error ? error.message : "Unknown error"));
          } finally {
            setLoading(false);
          }
        };
        
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Quick Admin Login</h2>
              <button 
                onClick={handleAdminLogin}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 w-full mb-4"
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
              {message && (
                <div className={`p-3 rounded text-sm ${message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        );
      }} />

      <Route path="/admin-test" component={AdminLoginTest} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-cancel" component={PaymentCancel} />
      <Route path="/payment-error" component={PaymentError} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;