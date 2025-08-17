import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSignals } from '@/hooks/useRealtimeSignals';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { TrendingUp, TrendingDown, Minus, Clock, Bell, Signal, Home, CreditCard, Settings, Users, LogOut, AlertTriangle, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { SubscriptionStatusBadge } from '@/components/SubscriptionStatusBadge';
import { useToast } from '@/hooks/use-toast';

// Pricing Card Component
function PricingCard() {
  const [, setLocation] = useLocation();

  const handlePlanSelect = (plan: string) => {
    console.log('Selected plan:', plan);
    // Fast navigation using React Router
    setLocation('/plans');
  };

  return (
    <div className="pricing-cards flex flex-col gap-3 items-center">
      <div 
        className="pricing-card flex items-center justify-center flex-col text-center h-16 w-48 rounded-lg text-white cursor-pointer transition-all duration-400 bg-rose-500 hover:scale-110"
        onClick={() => handlePlanSelect('basic')}
      >
        <p className="text-sm font-bold">BASIC PLAN</p>
        <p className="text-xs">R49.99 / 5 days</p>
      </div>
      <div 
        className="pricing-card flex items-center justify-center flex-col text-center h-16 w-48 rounded-lg text-white cursor-pointer transition-all duration-400 bg-blue-500 hover:scale-110"
        onClick={() => handlePlanSelect('premium')}
      >
        <p className="text-sm font-bold">PREMIUM</p>
        <p className="text-xs">R99.99 / 14 days</p>
      </div>
      <div 
        className="pricing-card flex items-center justify-center flex-col text-center h-16 w-48 rounded-lg text-white cursor-pointer transition-all duration-400 bg-green-500 hover:scale-110"
        onClick={() => handlePlanSelect('vip')}
      >
        <p className="text-sm font-bold">VIP PLAN</p>
        <p className="text-xs">R179.99 / 30 days</p>
      </div>
    </div>
  );
}

// Phone Login Component
function PhoneLoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== PHONE LOGIN FORM SUBMIT ===");
    console.log("Email:", email);
    
    if (!email) return;

    setLoading(true);
    try {
      await login(email);
      
      // Check if admin login - redirect to admin dashboard immediately
      if (email === "admin@forexsignals.com") {
        console.log("Admin login detected - redirecting to admin dashboard");
        toast({
          title: "Admin Login Successful",
          description: "Redirecting to admin dashboard...",
        });
        // Force a page reload to ensure proper routing
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
        return;
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    } catch (error: any) {
      console.log("Phone login error caught:", error);
      console.log("Error needsRegistration:", error?.needsRegistration);
      console.log("Error userExists:", error?.userExists);
      
      // Handle specific error cases
      if (error?.needsRegistration === true) {
        console.log("Setting showSignUp to true");
        setShowSignUp(true);
        toast({
          title: "Registration Required",
          description: "Please complete your registration to create an account.",
        });
      } else if (error?.userExists === true) {
        setShowSignUp(false);
        toast({
          title: "Account Exists",
          description: "This account already exists. Please sign in instead.",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSignUp) {
    return <PhoneSignUpForm onBackToLogin={() => setShowSignUp(false)} />;
  }

  return (
    <div className="flex-1 flex justify-center px-4" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="w-full flex justify-center">
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col bg-white rounded-2xl shadow-lg"
          style={{ 
            gap: '10px',
            padding: '30px',
            width: '280px',
            borderRadius: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6" style={{ marginTop: '-10px' }}>
            <div className="flex items-center gap-2">
              <Signal className="h-8 w-8 text-green-600" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#151717', lineHeight: '1.2' }}>
                  Watchlist Fx
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.2' }}>
                  Professional Trading Signals
                </div>
              </div>
            </div>
          </div>

          {/* Free Trial Ribbon */}
          <div style={{ 
            position: 'relative',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: '8px 25px',
              borderRadius: '20px 20px 20px 20px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span style={{ position: 'relative', zIndex: 2 }}>
                ⚡ 7 Days FREE • Start Now ⚡
              </span>
              {/* Animated shimmer effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s infinite',
                zIndex: 1
              }}></div>
            </div>
          </div>

          {/* See Plans Button */}
          <div style={{ 
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <Link href="/plans">
              <button
                style={{
                  background: 'transparent',
                  color: '#2563eb',
                  border: '1.5px solid #2563eb',
                  padding: '6px 20px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#2563eb';
                }}
              >
                See Plans & Pricing
              </button>
            </Link>
          </div>

          <div className="flex flex-col">
            <label style={{ color: '#151717', fontWeight: 600 }}>Email</label>
          </div>
          
          <div 
            className="flex items-center transition-all duration-200"
            style={{ 
              border: '1.5px solid #ecedec',
              borderRadius: '10px',
              height: '50px',
              paddingLeft: '10px'
            }}
            onFocus={(e) => e.currentTarget.style.border = '1.5px solid #2d79f3'}
            onBlur={(e) => e.currentTarget.style.border = '1.5px solid #ecedec'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 0 32 32" height={20}>
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"/>
              </g>
            </svg>
            <input
              placeholder="Enter your Email"
              className="input"
              style={{ 
                marginLeft: '10px',
                borderRadius: '10px',
                border: 'none',
                width: '100%',
                height: '100%',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !email}
            className="button-submit"
            style={{ 
              margin: '20px 0 10px 0',
              backgroundColor: '#151717',
              border: 'none',
              color: 'white',
              fontSize: '15px',
              fontWeight: 500,
              borderRadius: '10px',
              height: '50px',
              width: '100%',
              cursor: 'pointer',
              opacity: loading || !email ? 0.5 : 1
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          
          <p 
            className="p"
            style={{ 
              textAlign: 'center',
              color: 'black',
              fontSize: '14px',
              margin: '5px 0'
            }}
          >
            Don't have an account?{' '}
            <span 
              className="span"
              onClick={() => setShowSignUp(true)}
              style={{ 
                fontSize: '14px',
                marginLeft: '5px',
                color: '#2d79f3',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

// Phone Sign Up Component
function PhoneSignUpForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    setLoading(true);
    try {
      // Create account with 7-day free trial
      await register(email, firstName, lastName);
      toast({
        title: "Welcome! 🎉",
        description: "Account created with 7-day FREE trial activated!",
      });
    } catch (error: any) {
      if (error?.userExists === true) {
        onBackToLogin();
        toast({
          title: "Account Exists",
          description: "This account already exists. Please sign in instead.",
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center px-4" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="w-full flex justify-center">
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col bg-white rounded-2xl shadow-lg"
          style={{ 
            gap: '10px',
            padding: '30px',
            width: '280px',
            borderRadius: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Signal className="h-8 w-8 text-green-600" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#151717', lineHeight: '1.2' }}>
                  Watchlist Fx
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.2' }}>
                  Professional Trading Signals
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label style={{ color: '#151717', fontWeight: 600 }}>First Name</label>
          </div>
          
          <div 
            className="inputForm"
            style={{ 
              border: '1.5px solid #ecedec',
              borderRadius: '10px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
              transition: '0.2s ease-in-out'
            }}
          >
            <input
              placeholder="Enter your First Name"
              className="input"
              style={{ 
                marginLeft: '10px',
                borderRadius: '10px',
                border: 'none',
                width: '100%',
                height: '100%',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label style={{ color: '#151717', fontWeight: 600 }}>Last Name</label>
          </div>
          
          <div 
            className="inputForm"
            style={{ 
              border: '1.5px solid #ecedec',
              borderRadius: '10px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
              transition: '0.2s ease-in-out'
            }}
          >
            <input
              placeholder="Enter your Last Name"
              className="input"
              style={{ 
                marginLeft: '10px',
                borderRadius: '10px',
                border: 'none',
                width: '100%',
                height: '100%',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label style={{ color: '#151717', fontWeight: 600 }}>Email</label>
          </div>
          
          <div 
            className="inputForm"
            style={{ 
              border: '1.5px solid #ecedec',
              borderRadius: '10px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
              transition: '0.2s ease-in-out'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 0 32 32" height={20}>
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"/>
              </g>
            </svg>
            <input
              placeholder="Enter your Email"
              className="input"
              style={{ 
                marginLeft: '10px',
                borderRadius: '10px',
                border: 'none',
                width: '100%',
                height: '100%',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !firstName || !lastName || !email}
            className="button-submit"
            style={{ 
              margin: '20px 0 10px 0',
              backgroundColor: '#151717',
              border: 'none',
              color: 'white',
              fontSize: '15px',
              fontWeight: 500,
              borderRadius: '10px',
              height: '50px',
              width: '100%',
              cursor: 'pointer',
              opacity: loading || !firstName || !lastName || !email ? 0.5 : 1
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
          <p 
            className="p"
            style={{ 
              textAlign: 'center',
              color: 'black',
              fontSize: '14px',
              margin: '5px 0'
            }}
          >
            Already have an account?{' '}
            <span 
              className="span"
              onClick={onBackToLogin}
              style={{ 
                fontSize: '14px',
                marginLeft: '5px',
                color: '#2d79f3',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export function PhoneSignalsPage() {
  const { user, logout } = useAuth();
  const { signals = [], isLoading, error } = useRealtimeSignals();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };



  const getTradeActionIcon = (action: string | null | undefined) => {
    if (!action) return <TrendingUp className="w-4 h-4 text-white" />;
    switch (action.toLowerCase()) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-white" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-white" />;
      case 'hold':
        return <Minus className="w-4 h-4 text-white" />;
      case 'wait':
        return <Clock className="w-4 h-4 text-white" />;
      default:
        return <TrendingUp className="w-4 h-4 text-white" />;
    }
  };

  const getTradeActionColor = (action: string | null | undefined) => {
    if (!action) return 'bg-blue-100 text-blue-800';
    switch (action.toLowerCase()) {
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-red-100 text-red-800';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'wait':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* App Header/Navbar - Always show */}
      <nav className="bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Signal className="h-8 w-8 text-green-600"/>
                  <span className="text-xl font-bold text-white">Watchlist Fx</span>
                </div>
              </Link>
            </div>
            
            {/* Navigation Links - Show based on auth state */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex space-x-6">
                    {!user?.isAdmin && (
                      <Link href="/plans">
                        <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <span>Plans</span>
                        </span>
                      </Link>
                    )}
                  </nav>
                  
                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="text-gray-300 hover:text-white transition-colors p-2"
                    >
                      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </div>
                  
                  {/* User Actions */}
                  <div className="hidden md:flex items-center space-x-4">
                    <span className="text-gray-300 text-sm">
                      Hi, {user.firstName}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">Welcome to Watchlist Fx</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && user && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!user?.isAdmin && (
                <Link href="/plans" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative flex items-center space-x-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-4 py-3 rounded-lg font-bold text-base cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-green-400">
                    <CreditCard className="h-6 w-6 text-yellow-300" />
                    <span className="text-lg">💳 UPGRADE PLANS</span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  </div>
                </Link>
              )}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <span className="text-gray-300 text-sm">
                    Hi, {user.firstName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      
      {/* Phone Container */}

      {/* Phone Interface Container */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center">
          {/* Phone Mockup */}
          <div className="relative scale-85 md:scale-100">
            {/* Phone Frame */}
            <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
              {/* Phone Screen */}
              <div className="w-full h-full bg-white rounded-[2.5rem] relative overflow-hidden">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10"></div>
                
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 pt-8 pb-2 bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">
                    {currentTime.toLocaleTimeString('en-US', { 
                      timeZone: 'Africa/Johannesburg',
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-2 bg-slate-900 rounded-sm"></div>
                    <div className="w-1 h-2 bg-slate-900 rounded-sm"></div>
                    <div className="w-6 h-3 border border-slate-900 rounded-sm">
                      <div className="w-4 h-1.5 bg-green-500 rounded-sm m-0.5"></div>
                    </div>
                  </div>
                </div>
                
                {/* Phone Content - Conditional Display */}
                {user ? (
                  /* Authenticated User - Check Subscription Status */
                  subscriptionStatus?.status === 'expired' || subscriptionStatus?.status === 'inactive' ? (
                    /* Expired/Inactive Subscription - Show Upgrade Message */
                    <div className="flex-1 flex flex-col items-center text-center px-4 py-4">
                      <div className="mt-8">
                        <AlertTriangle className="w-12 h-12 text-red-500 mb-3 mx-auto" />
                        <h3 className="text-base font-semibold text-slate-900 mb-2">Subscription Expired</h3>
                        <p className="text-xs text-slate-600 mb-6 leading-relaxed max-w-64">
                          Your subscription has expired. Please upgrade your plan to continue receiving premium trading signals.
                        </p>
                      </div>
                      <div className="flex justify-center w-full mt-4">
                        <PricingCard />
                      </div>
                      <p className="text-xs text-slate-500 mt-4">
                        Contact support if you have any questions
                      </p>
                    </div>
                  ) : (
                    /* Active Subscription - Show Signals */
                    <>
                      {/* Notifications Header */}
                      <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-blue-600" />
                            Trading Signals
                          </h2>
                          <SubscriptionStatusBadge />
                        </div>
                      </div>

                      {/* Signals Notifications */}
                      <div className="flex-1 overflow-y-auto max-h-[480px]">
                        {signals?.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-96 text-center px-6">
                            <Bell className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 mb-2">No New Signals</h3>
                            <p className="text-sm text-slate-500">
                              New trading signals will appear here
                            </p>
                          </div>
                        ) : (
                        <div className="space-y-1">
                          {signals
                            ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            ?.map((signal: any) => (
                              <div key={signal.id} className="mx-4 my-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                {/* Notification Header */}
                                <div className="flex items-center px-4 py-3 border-b border-slate-100">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-slate-900">NAS100 Pro Signals</span>
                                      <span className="text-xs text-slate-500">
                                        {new Date(signal.createdAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-500">now</span>
                                  </div>
                                </div>

                                {/* Notification Content */}
                                <div className="px-4 py-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-slate-900 text-sm">{signal.title}</h3>
                                    <Badge className={`text-xs ${getTradeActionColor(signal.trade_action)}`}>
                                      {(signal.trade_action || 'UNKNOWN').toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                    {signal.content}
                                  </p>
                                  
                                  {/* Quick Action Icons */}
                                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                                    <Link href={`/signal/${signal.id}`}>
                                      <div className="flex items-center space-x-4 cursor-pointer hover:text-blue-600 transition-colors">
                                        {getTradeActionIcon(signal.trade_action)}
                                        <span className="text-xs text-slate-500">Tap to view details</span>
                                      </div>
                                    </Link>
                                    <div className="flex space-x-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                        <span className="text-xs">💰</span>
                                      </div>
                                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                        <span className="text-xs">📊</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) || []}
                        </div>
                        )}
                      </div>
                    </>
                  )
                ) : (
                  /* Unauthenticated User - Show Login Form */
                  <div className="flex-1 flex flex-col">
                    <PhoneLoginForm />
                  </div>
                )}

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full"></div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}