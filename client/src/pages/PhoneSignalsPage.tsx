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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Phone Outline */}
        <div className="relative w-[210px] h-[400px] bg-black rounded-[35px] border-2 border-gray-600 p-[7px] shadow-[2px_5px_15px_rgba(0,0,0,0.486)] mx-auto">
          
          {/* Side Buttons */}
          <div className="absolute w-[2px] h-[45px] top-[30%] right-[-4px] bg-gradient-to-r from-gray-800 via-gray-600 to-gray-500"></div>
          <div className="absolute w-[2px] h-[30px] top-[26%] left-[-4px] bg-gradient-to-r from-gray-800 via-gray-600 to-gray-500"></div>
          <div className="absolute w-[2px] h-[30px] top-[36%] left-[-4px] bg-gradient-to-r from-gray-800 via-gray-600 to-gray-500"></div>
          
          {/* Top Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[35%] h-[18px] bg-black rounded-b-[10px]">
            <div className="absolute top-[2px] left-1/2 transform -translate-x-1/2 w-[40%] h-[2px] rounded-[2px] bg-gray-800"></div>
            <div className="absolute top-[6px] left-[16%] w-[6px] h-[6px] rounded-full bg-white/10">
              <div className="absolute w-[3px] h-[3px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-400/20"></div>
            </div>
          </div>
          
          {/* Screen with gradient */}
          <div 
            className="h-full rounded-[25px] overflow-hidden relative"
            style={{
              background: 'linear-gradient(to right bottom, #ff0000, #ff0045, #ff0078, #ea00aa, #b81cd7, #8a3ad6, #5746cf, #004ac2, #003d94, #002e66, #001d3a, #020812)',
              backgroundSize: '200% 200%',
              backgroundPosition: '0% 0%',
              transition: 'all 0.6s ease-out'
            }}
          >
            {/* Status Bar */}
            <div className="text-white px-4 pt-6 pb-2 flex justify-between items-center text-xs font-medium relative z-10">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-2 bg-white rounded-full"></div>
                  <div className="w-1 h-2 bg-white rounded-full"></div>
                  <div className="w-1 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-2 bg-white/30 rounded-full"></div>
                </div>
                <div className="w-5 h-2 bg-white rounded-sm relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-black rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-white px-4 py-3 relative z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Signal className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold">Forex Signals</h1>
                    <p className="text-xs opacity-80">Live Updates</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-6 h-6 p-0 rounded-full hover:bg-white/10 text-white"
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout}
                    className="w-6 h-6 p-0 rounded-full hover:bg-white/10 text-white"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {subscription && (
                <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-medium">{subscription.plan?.name}</span>
                      <p className="text-xs opacity-70">Hello, {user?.firstName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{getDaysRemaining(subscription)}</div>
                      <div className="text-xs opacity-70">days left</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Signals List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 relative z-10">
              {signalsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="animate-pulse">
                        <div className="h-3 bg-white/20 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-white/20 rounded w-1/2 mb-2"></div>
                        <div className="h-16 bg-white/20 rounded mb-2"></div>
                        <div className="h-2 bg-white/20 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : signals?.length ? (
                <div className="space-y-2">
                  {signals.map((signal: ForexSignal) => (
                    <div key={signal.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-xs leading-tight mb-1">
                            {signal.title}
                          </h3>
                          <div className="flex items-center space-x-1 mb-2">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTradeColor(signal.tradeAction)}`}>
                              {getTradeIcon(signal.tradeAction)}
                              <span>{signal.tradeAction}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                              <Clock className="h-2 w-2" />
                              <span>{formatDate(signal.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {signal.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={signal.imageUrl}
                            alt={signal.title}
                            className="w-full h-20 object-cover rounded border border-white/20"
                          />
                        </div>
                      )}
                      
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-white/90 leading-relaxed">
                          {signal.content}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                        <div className="flex space-x-3">
                          <button className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors">
                            <BarChart3 className="h-2 w-2" />
                            <span className="text-xs">Chart</span>
                          </button>
                          <button className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors">
                            <Signal className="h-2 w-2" />
                            <span className="text-xs">Follow</span>
                          </button>
                        </div>
                        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Signal className="h-6 w-6 text-white/50" />
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1">No signals yet</h3>
                    <p className="text-white/70 text-xs">New signals will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 relative z-10">
              <div className="flex justify-around py-2">
                <button className="flex flex-col items-center py-1">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center mb-1">
                    <Signal className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white">Signals</span>
                </button>
                <button className="flex flex-col items-center py-1">
                  <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center mb-1">
                    <BarChart3 className="h-3 w-3 text-white/60" />
                  </div>
                  <span className="text-xs text-white/60">Charts</span>
                </button>
                <button className="flex flex-col items-center py-1">
                  <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center mb-1">
                    <Calendar className="h-3 w-3 text-white/60" />
                  </div>
                  <span className="text-xs text-white/60">History</span>
                </button>
                <button className="flex flex-col items-center py-1">
                  <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center mb-1">
                    <Settings className="h-3 w-3 text-white/60" />
                  </div>
                  <span className="text-xs text-white/60">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}