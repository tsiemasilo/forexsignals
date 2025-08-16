import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Clock, Calendar, User, LogOut } from "lucide-react";

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
    return daysLeft;
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Phone Outline */}
        <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden min-h-[600px] max-h-[700px] flex flex-col">
            {/* Status Bar */}
            <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center text-xs">
              <span className="font-medium">9:41</span>
              <div className="flex space-x-1">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
                <div className="w-1 h-2 bg-white rounded-sm"></div>
                <div className="w-6 h-2 bg-white rounded-sm"></div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user?.firstName}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              
              {subscription && (
                <div className="mt-2 text-sm">
                  <span className="opacity-90">{subscription.plan?.name}</span>
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {getDaysRemaining(subscription)} days left
                  </span>
                </div>
              )}
            </div>

            {/* Signals List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Live Signals</h2>
                <Badge variant="secondary" className="text-xs">
                  {signals?.length || 0} Active
                </Badge>
              </div>

              {signalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
                  ))}
                </div>
              ) : signals?.length ? (
                <div className="space-y-3">
                  {signals.map((signal: ForexSignal) => (
                    <Card key={signal.id} className="border-l-4 border-l-blue-500 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                              {signal.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${getTradeColor(signal.tradeAction)} text-xs px-2 py-1`}>
                                {getTradeIcon(signal.tradeAction)}
                                <span className="ml-1">{signal.tradeAction}</span>
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(signal.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {signal.imageUrl && (
                          <img
                            src={signal.imageUrl}
                            alt={signal.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {signal.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No signals available</p>
                  <p className="text-gray-400 text-xs mt-1">Check back later for new trading signals</p>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-gray-50 border-t p-4">
              <div className="flex justify-center space-x-6">
                <button className="flex flex-col items-center space-y-1 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs font-medium">Signals</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">History</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-gray-400">
                  <User className="h-5 w-5" />
                  <span className="text-xs">Profile</span>
                </button>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="flex justify-center py-2">
              <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}