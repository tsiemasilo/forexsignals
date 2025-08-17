import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSignals } from '@/hooks/useRealtimeSignals';
import { TrendingUp, TrendingDown, Minus, Clock, Bell, Signal, Home, CreditCard, Settings, Users, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { SubscriptionStatusBadge } from '@/components/SubscriptionStatusBadge';
import { useToast } from '@/hooks/use-toast';

// Phone Login Component
function PhoneLoginForm({ onSignupClick }: { onSignupClick: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await login(email);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Signal className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">Watchlist Fx</h1>
        </div>
        <p className="text-gray-600 text-xs">Professional Trading Signals</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg space-y-4">
        <div className="space-y-2">
          <label className="text-gray-900 font-semibold text-sm">Email</label>
          <div className="border border-gray-300 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="0 0 32 32" height={16} className="text-gray-400">
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor"/>
              </g>
            </svg>
            <input 
              placeholder="Enter your Email" 
              className="ml-3 border-none outline-none w-full h-full text-sm"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-900 font-semibold text-sm">Password</label>
          <div className="border border-gray-300 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="-64 0 512 512" height={16} className="text-gray-400">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor"/>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor"/>
            </svg>
            <input 
              placeholder="Enter your Password" 
              className="ml-3 border-none outline-none w-full h-full text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="remember" className="text-sm text-black">Remember me</label>
          </div>
          <span className="text-sm text-blue-500 cursor-pointer font-medium">Forgot password?</span>
        </div>

        <button 
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
          type="submit"
          disabled={loading || !email}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-black">
          Don't have an account? 
          <span onClick={onSignupClick} className="text-blue-500 font-medium cursor-pointer ml-1">Sign Up</span>
        </p>

        <p className="text-center text-sm text-black border-t pt-4">Or With</p>

        <button 
          type="button"
          className="w-full h-12 rounded-lg flex justify-center items-center font-medium gap-3 border border-gray-300 bg-white hover:border-blue-500 transition-colors"
        >
          <svg xmlSpace="preserve" style={{enableBackground: 'new 0 0 512 512'}} viewBox="0 0 512 512" y="0px" x="0px" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Layer_1" width={20} version="1.1">
            <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
            c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
            C103.821,274.792,107.225,292.797,113.47,309.408z" style={{fill: '#FBBB00'}} />
            <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
            c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
            c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" style={{fill: '#518EF8'}} />
            <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
            c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
            c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" style={{fill: '#28B446'}} />
            <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
            c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
            C318.115,0,375.068,22.126,419.404,58.936z" style={{fill: '#F14336'}} />
          </svg>
          Google 
        </button>
      </form>
    </div>
  );
}

// Phone Signup Component
function PhoneSignupForm({ onSigninClick }: { onSigninClick: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: '123-456-7890' // Default phone for now
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      toast({
        title: "Success",
        description: "Account created successfully! You can now sign in.",
      });

      // Switch to login form
      onSigninClick();
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Signal className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">Watchlist Fx</h1>
        </div>
        <p className="text-gray-600 text-xs">Create Your Account</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg space-y-4">
        <div className="space-y-2">
          <label className="text-gray-900 font-semibold text-sm">Full Name</label>
          <div className="border border-gray-300 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              placeholder="Enter your full name" 
              className="ml-3 border-none outline-none w-full h-full text-sm"
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-900 font-semibold text-sm">Email</label>
          <div className="border border-gray-300 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="0 0 32 32" height={16} className="text-gray-400">
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor"/>
              </g>
            </svg>
            <input 
              placeholder="Enter your Email" 
              className="ml-3 border-none outline-none w-full h-full text-sm"
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-900 font-semibold text-sm">Password</label>
          <div className="border border-gray-300 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="-64 0 512 512" height={16} className="text-gray-400">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor"/>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor"/>
            </svg>
            <input 
              placeholder="Create a password" 
              className="ml-3 border-none outline-none w-full h-full text-sm"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-900 font-semibold text-sm">Confirm Password</label>
          <div className="border border-gray-300 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="-64 0 512 512" height={16} className="text-gray-400">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor"/>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor"/>
            </svg>
            <input 
              placeholder="Confirm your password" 
              className="ml-3 border-none outline-none w-full h-full text-sm"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <button 
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 mt-6"
          type="submit"
          disabled={loading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-black">
          Already have an account? 
          <span onClick={onSigninClick} className="text-blue-500 font-medium cursor-pointer ml-1">Sign In</span>
        </p>

        <p className="text-center text-sm text-black border-t pt-4">Or With</p>

        <button 
          type="button"
          className="w-full h-12 rounded-lg flex justify-center items-center font-medium gap-3 border border-gray-300 bg-white hover:border-blue-500 transition-colors"
        >
          <svg xmlSpace="preserve" style={{enableBackground: 'new 0 0 512 512'}} viewBox="0 0 512 512" y="0px" x="0px" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Layer_1" width={20} version="1.1">
            <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
            c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
            C103.821,274.792,107.225,292.797,113.47,309.408z" style={{fill: '#FBBB00'}} />
            <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
            c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
            c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" style={{fill: '#518EF8'}} />
            <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
            c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
            c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" style={{fill: '#28B446'}} />
            <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
            c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
            C318.115,0,375.068,22.126,419.404,58.936z" style={{fill: '#F14336'}} />
          </svg>
          Google 
        </button>
      </form>
    </div>
  );
}

export function PhoneSignalsPage() {
  const { user, logout } = useAuth();
  // Only fetch signals if user is authenticated
  const { signals = [], isLoading, error } = useRealtimeSignals();
  const [showSignup, setShowSignup] = useState(false);

  const handleLogout = () => {
    logout();
  };



  const getTradeActionIcon = (action: string) => {
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

  const getTradeActionColor = (action: string) => {
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
      {/* App Header/Navbar - Only show when user is logged in */}
      {user && (
        <header className="bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Signal className="h-8 w-8 text-green-600"/>
                  <span className="text-xl font-bold text-white">Watchlist Fx</span>
                </div>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link href="/">
                  <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </span>
                </Link>
                
                <Link href="/signals">
                  <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                    <Signal className="h-4 w-4" />
                    <span>Signals</span>
                  </span>
                </Link>
                
                {!user?.isAdmin && (
                  <Link href="/plans">
                    <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      <span>Plans</span>
                    </span>
                  </Link>
                )}
                
                {user?.isAdmin && (
                  <>
                    <Link href="/admin">
                      <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Admin</span>
                      </span>
                    </Link>
                    <Link href="/admin/users">
                      <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                        <Users className="h-4 w-4" />
                        <span>Manage Users</span>
                      </span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* User Info and Status */}
            <div className="flex items-center space-x-4">
              {/* Subscription Status Badge */}
              <SubscriptionStatusBadge />
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-300">{user?.email}</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Phone Interface Container */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center">
          {/* Phone Mockup */}
          <div className="relative scale-85 md:scale-100">
            {/* Phone Frame */}
            <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
              {/* Phone Screen */}
              <div className="w-full h-full bg-white rounded-[2.5rem] relative overflow-hidden flex flex-col">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10"></div>
                
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 pt-8 pb-2 bg-slate-50 flex-shrink-0">
                  <span className="text-sm font-medium text-slate-900">9:41</span>
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
                  /* Authenticated User - Show Signals */
                  <>
                    {/* Notifications Header */}
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                          <Bell className="w-5 h-5 mr-2 text-blue-600" />
                          Trading Signals
                        </h2>
                        {user && <SubscriptionStatusBadge />}
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
                                    <Badge className={`text-xs ${getTradeActionColor(signal.tradeAction)}`}>
                                      {signal.tradeAction.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                    {signal.content}
                                  </p>
                                  
                                  {/* Quick Action Icons */}
                                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                                    <Link href={`/signal/${signal.id}`}>
                                      <div className="flex items-center space-x-4 cursor-pointer hover:text-blue-600 transition-colors">
                                        {getTradeActionIcon(signal.tradeAction)}
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
                ) : (
                  /* Unauthenticated User - Show Login/Signup Form */
                  <div className="flex-1 bg-gradient-to-br from-blue-50 to-slate-100">
                    {showSignup ? 
                      <PhoneSignupForm onSigninClick={() => setShowSignup(false)} /> : 
                      <PhoneLoginForm onSignupClick={() => setShowSignup(true)} />
                    }
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