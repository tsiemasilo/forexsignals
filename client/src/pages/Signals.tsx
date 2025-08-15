import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Clock, Bell, Smartphone, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useRealtimeSignals } from '@/hooks/useRealtimeSignals';
import { useQuery } from '@tanstack/react-query';

export default function Signals() {
  const { sessionId, user } = useAuth();
  
  // Debug logging for user dashboard
  console.log('🏠 USER DASHBOARD DEBUG:', {
    sessionId,
    user,
    isAdmin: user?.isAdmin,
    timestamp: new Date().toISOString()
  });

  // Use real-time signals hook for auto-refresh
  const { signals = [], isLoading, error, lastUpdateTime, refresh } = useRealtimeSignals();

  // Debug logging after query with real-time info
  console.log('🎯 USER DASHBOARD QUERY RESULT (REAL-TIME):', {
    signalsCount: (signals as any)?.length || 0,
    signals: signals,
    isLoading,
    error: error?.message,
    errorType: error?.constructor?.name,
    errorStatus: (error as any)?.status,
    lastUpdateTime: lastUpdateTime.toISOString(),
    sessionId,
    user,
    timestamp: new Date().toISOString()
  });
  
  // Additional subscription access debug
  if (error) {
    console.log('🚨 SUBSCRIPTION ACCESS DEBUG:', {
      errorMessage: error.message,
      errorContainsSubscription: error.message.includes('subscription'),
      errorContains403: error.message.includes('403'),
      errorContainsActive: error.message.includes('Active subscription required'),
      shouldShowUpgrade: error.message.includes('subscription') || error.message.includes('Active subscription required') || error.message.includes('403')
    });
  }

  const getTradeActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'hold':
        return <Minus className="w-5 h-5 text-yellow-600" />;
      case 'wait':
        return <Clock className="w-5 h-5 text-gray-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check subscription status to determine if user should see upgrade prompt (must be at top level)
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/user/subscription-status'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.message || 'Unknown error';
    console.error('❌ USER DASHBOARD SIGNALS LOADING ERROR:', {
      errorMessage,
      error,
      sessionId,
      user,
      timestamp: new Date().toISOString()
    });
    
    // Only show upgrade prompt if subscription access is blocked AND user has no days left
    // If user is on trial with days remaining, they should see signals, not upgrade prompt
    const shouldShowUpgrade = (errorMessage.includes('subscription') || errorMessage.includes('Active subscription required') || errorMessage.includes('403')) && 
                             (!subscriptionStatus || subscriptionStatus.daysLeft === 0 || subscriptionStatus.status === 'inactive' || subscriptionStatus.status === 'expired');
    
    console.log('🔍 TRIAL ACCESS DEBUG:', {
      errorMessage,
      subscriptionStatus,
      shouldShowUpgrade,
      daysLeft: subscriptionStatus?.daysLeft,
      status: subscriptionStatus?.status
    });
    
    if (shouldShowUpgrade) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
          <Card className="max-w-lg text-center shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Upgrade Your Plan</CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Your subscription has expired. Upgrade now to continue receiving premium NAS100 trading signals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">What you're missing:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time NAS100 trading signals</li>
                  <li>• Entry, stop loss, and take profit levels</li>
                  <li>• Mobile push notifications</li>
                  <li>• Professional market analysis</li>
                </ul>
              </div>
              <Link href="/plans">
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200">
                  Choose Your Plan
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Plans start from R49.99/month
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Error Loading Signals</CardTitle>
            <CardDescription>
              Unable to load trading signals. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Auto-refresh indicator */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Trading Signals</h1>
            <p className="text-gray-600">Real-time NAS100 professional insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Auto-updating every 3s</span>
            </div>
            <div className="text-xs text-gray-500">
              Last update: {lastUpdateTime.toLocaleTimeString()}
            </div>
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2 hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Now</span>
            </Button>
          </div>
        </div>


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
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                    Live nas100 Trading Signals
                  </h2>
                </div>

                {/* Signals Notifications */}
                <div className="flex-1 overflow-y-auto max-h-[480px]">
                  {(signals as any)?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center px-6">
                      <Bell className="w-16 h-16 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No New Signals</h3>
                      <p className="text-sm text-slate-500">
                        New trading signals will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(signals as any)
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
                  
                  {/* Debug info - will be visible in console */}
                  {(signals as any)?.length > 0 && console.log('📱 SIGNALS DISPLAYED ON DASHBOARD:', (signals as any)?.length)}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full"></div>
              </div>
            </div>
            
            {/* Phone Side Buttons */}
            <div className="absolute right-0 top-20 w-1 h-12 bg-slate-700 rounded-l-lg"></div>
            <div className="absolute right-0 top-36 w-1 h-8 bg-slate-700 rounded-l-lg"></div>
            <div className="absolute right-0 top-48 w-1 h-8 bg-slate-700 rounded-l-lg"></div>
          </div>
        </div>


      </div>
    </div>
  );
}