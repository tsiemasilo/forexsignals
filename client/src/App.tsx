import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Signals from "@/pages/Signals";
import Plans from "@/pages/Plans";
import Calendar from "@/pages/Calendar";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSignals from "@/pages/AdminSignals";
import AdminUsers from "@/pages/AdminUsers";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Auth} />
            <Route path="/register" component={Auth} />
            <Route path="/auth" component={Auth} />
            <Route path="/plans" component={Plans} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      ) : (
        <DashboardLayout>
          <Switch>
            {user.isAdmin ? (
              <>
                <Route path="/" component={AdminDashboard} />
                <Route path="/admin/signals" component={AdminSignals} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/plans" component={Plans} />
              </>
            ) : (
              <>
                <Route path="/" component={Signals} />
                <Route path="/signals" component={Signals} />
                <Route path="/plans" component={Plans} />
                <Route path="/calendar" component={Calendar} />
              </>
            )}
            <Route component={NotFound} />
          </Switch>
        </DashboardLayout>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;