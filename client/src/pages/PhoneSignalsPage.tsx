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
function PhoneLoginForm() {
  const [email, setEmail] = useState("");
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
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col gap-4 bg-white p-8 w-full rounded-3xl font-system shadow-xl"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}
        >
          <div className="flex flex-col">
            <label className="text-gray-900 font-semibold mb-1" style={{ color: '#151717', fontWeight: 600 }}>
              Email
            </label>
          </div>
          
          <div 
            className="border-2 rounded-xl h-14 flex items-center px-3 transition-all duration-200 ease-in-out focus-within:border-blue-500"
            style={{ 
              border: '1.5px solid #ecedec', 
              borderRadius: '10px',
              height: '50px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 0 32 32" height={20} className="text-gray-500">
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor"/>
              </g>
            </svg>
            <input
              placeholder="Enter your Email"
              className="ml-3 border-none w-full h-full bg-transparent focus:outline-none"
              style={{ 
                marginLeft: '10px',
                borderRadius: '10px',
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
            className="border-none text-white font-medium cursor-pointer transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              margin: '20px 0 10px 0',
              backgroundColor: '#151717',
              fontSize: '15px',
              fontWeight: 500,
              borderRadius: '10px',
              height: '50px',
              cursor: loading || !email ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          
          <p 
            className="text-center text-black my-1"
            style={{ 
              textAlign: 'center',
              color: 'black',
              fontSize: '14px',
              margin: '5px 0'
            }}
          >
            Don't have an account?{' '}
            <span 
              className="cursor-pointer"
              style={{ 
                color: '#2d79f3',
                fontWeight: 500,
                marginLeft: '5px',
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

export function PhoneSignalsPage() {
  const { user, logout } = useAuth();
  const { signals = [], isLoading, error } = useRealtimeSignals();

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
              <div className="w-full h-full bg-white rounded-[2.5rem] relative overflow-hidden">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10"></div>
                
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 pt-8 pb-2 bg-slate-50">
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