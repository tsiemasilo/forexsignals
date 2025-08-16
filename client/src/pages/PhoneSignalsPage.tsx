import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Clock, Calendar, User, LogOut, Signal, BarChart3, Settings, Bell } from "lucide-react";

interface ForexSignal {
  id: number;
  title: string;
  content: string;
  tradeAction: "Buy" | "Sell" | "Hold";
  imageUrl?: string;
  createdAt: string;
}

interface UserSubscription {
  id: number;
  status: string;
  endDate: string;
  plan: {
    name: string;
  };
}

export function PhoneSignalsPage() {
  const { user, logout } = useAuth();

  const { data: signals, isLoading: signalsLoading } = useQuery({
    queryKey: ["/api/signals"],
    queryFn: () => apiRequest("/api/signals"),
  });

  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
    queryFn: () => apiRequest("/api/user/subscription"),
  });

  const getDaysRemaining = (subscription?: UserSubscription) => {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return isNaN(daysLeft) ? 0 : daysLeft;
  };

  const getTradeIcon = (action: string) => {
    switch (action) {
      case "Buy":
        return <TrendingUp className="h-4 w-4" />;
      case "Sell":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTradeColor = (action: string) => {
    switch (action) {
      case "Buy":
        return "bg-green-500 text-white";
      case "Sell":
        return "bg-red-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      {/* iPhone Frame */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* iPhone Frame with styled-components inspired design */}
        <div className="relative bg-black rounded-[35px] border-2 border-gray-600 p-[7px] shadow-2xl">
          {/* Side Buttons */}
          <div className="absolute w-0.5 h-11 top-[30%] -right-1 bg-gradient-to-r from-gray-800 to-gray-600 rounded"></div>
          <div className="absolute w-0.5 h-8 top-[26%] -left-1 bg-gradient-to-r from-gray-800 to-gray-600 rounded"></div>
          <div className="absolute w-0.5 h-8 top-[36%] -left-1 bg-gradient-to-r from-gray-800 to-gray-600 rounded"></div>
          
          {/* Top Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[35%] h-[18px] bg-black rounded-b-[10px] z-20">
            {/* Speaker */}
            <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-[40%] h-0.5 bg-gray-800 rounded"></div>
            {/* Camera */}
            <div className="absolute top-1.5 left-[16%] w-1.5 h-1.5 bg-gray-700 bg-opacity-20 rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-blue-900 bg-opacity-20 rounded-full"></div>
            </div>
          </div>
          
          {/* Screen */}
          <div className="bg-black rounded-[25px] overflow-hidden min-h-[640px] max-h-[750px] flex flex-col relative">
            {/* iOS Style Status Bar */}
            <div className="bg-black text-white px-8 pt-12 pb-2 flex justify-between items-center text-sm font-medium">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-white rounded-full"></div>
                  <div className="w-1 h-3 bg-white rounded-full"></div>
                  <div className="w-1 h-3 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-3 bg-white/30 rounded-full"></div>
                </div>
                <div className="w-6 h-3 bg-white rounded-sm relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-black rounded-full"></div>
                </div>
              </div>
            </div>

            {/* iOS Style Header */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Signal className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Signals</h1>
                    <p className="text-xs text-gray-500">Live Trading Updates</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
                  >
                    <Bell className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout}
                    className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
              
              {subscription && (
                <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{subscription.plan?.name}</span>
                      <p className="text-xs text-gray-600 mt-1">Hello, {user?.firstName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{getDaysRemaining(subscription)}</div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* iOS Style Signals List */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {signalsLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="h-20 bg-gray-200 rounded-xl mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : signals?.length ? (
                <div className="p-4 space-y-4">
                  {signals.map((signal: ForexSignal, index: number) => (
                    <div key={signal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Signal Header */}
                      <div className="p-4 pb-3">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight">
                              {signal.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium ${getTradeColor(signal.tradeAction)}`}>
                                {getTradeIcon(signal.tradeAction)}
                                <span>{signal.tradeAction.toUpperCase()}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(signal.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {signal.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={signal.imageUrl}
                              alt={signal.title}
                              className="w-full h-40 object-cover rounded-xl border border-gray-200"
                            />
                          </div>
                        )}
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {signal.content}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Bar */}
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4">
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                              <BarChart3 className="h-4 w-4" />
                              <span className="text-sm">Analyze</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
                              <Signal className="h-4 w-4" />
                              <span className="text-sm">Follow</span>
                            </button>
                          </div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Signal className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No signals yet</h3>
                    <p className="text-gray-500 text-sm">New trading signals will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* iOS Style Tab Bar */}
            <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200">
              <div className="flex justify-around py-2">
                <button className="flex flex-col items-center py-2 px-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mb-1">
                    <Signal className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-600">Signals</span>
                </button>
                <button className="flex flex-col items-center py-2 px-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mb-1">
                    <BarChart3 className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500">Charts</span>
                </button>
                <button className="flex flex-col items-center py-2 px-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mb-1">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500">History</span>
                </button>
                <button className="flex flex-col items-center py-2 px-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mb-1">
                    <Settings className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500">Settings</span>
                </button>
              </div>
              
              {/* iOS Home Indicator */}
              <div className="flex justify-center py-2">
                <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}