import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSignals } from '@/hooks/useRealtimeSignals';
import { TrendingUp, TrendingDown, Minus, Clock, Bell, Signal, Home, CreditCard, Settings, Users, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { SubscriptionStatusBadge } from '@/components/SubscriptionStatusBadge';

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
      {/* App Header/Navbar */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Signal className="h-8 w-8 text-green-600"/>
                  <span className="text-xl font-bold text-gray-900">Watchlist Fx</span>
                </div>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link href="/">
                  <span className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </span>
                </Link>
                
                <Link href="/signals">
                  <span className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
                    <Signal className="h-4 w-4" />
                    <span>Signals</span>
                  </span>
                </Link>
                
                {!user?.isAdmin && (
                  <Link href="/plans">
                    <span className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      <span>Plans</span>
                    </span>
                  </Link>
                )}
                
                {user?.isAdmin && (
                  <>
                    <Link href="/admin">
                      <span className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Admin</span>
                      </span>
                    </Link>
                    <Link href="/admin/users">
                      <span className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
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
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
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