import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { Toaster } from "@/components/ui/toaster";

import { PhoneSignalsPage } from "@/pages/PhoneSignalsPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Plans } from "@/pages/Plans";
import { PaymentSuccess } from "@/pages/PaymentSuccess";
import { PaymentCancel } from "@/pages/PaymentCancel";
import { PaymentError } from "@/pages/PaymentError";
import TradeStats from "@/pages/TradeStats";


function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => {
        if (!user) return <PhoneSignalsPage />;
        return user.isAdmin ? <AdminDashboard /> : <PhoneSignalsPage />;
      }} />

      <Route path="/phone-signals" component={PhoneSignalsPage} />
      <Route path="/signals" component={PhoneSignalsPage} />
      <Route path="/trade-stats" component={TradeStats} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={LoginPage} />
      <Route path="/plans" component={Plans} />

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