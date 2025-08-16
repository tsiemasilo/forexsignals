import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, User } from "lucide-react";

interface ForexSignal {
  id: number;
  title: string;
  content: string;
  tradeAction: "Buy" | "Sell" | "Hold";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStatus {
  status: string;
  statusDisplay: string;
  daysLeft: number;
  plan?: {
    name: string;
    price: string;
  };
  color: string;
}

export function DashboardPage() {
  const { user, logout } = useAuth();

  const { data: signals, isLoading: signalsLoading, error: signalsError } = useQuery({
    queryKey: ["/api/signals"],
    queryFn: () => apiRequest("/api/signals"),
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/user/subscription-status"],
    queryFn: () => apiRequest("/api/user/subscription-status"),
  });

  const getTradeIcon = (action: string) => {
    switch (action) {
      case "Buy":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "Sell":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "Hold":
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTradeColor = (action: string) => {
    switch (action) {
      case "Buy":
        return "bg-green-100 text-green-800 border-green-200";
      case "Sell":
        return "bg-red-100 text-red-800 border-red-200";
      case "Hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (signalsError && signalsError.message.includes("403")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">ForexSignals Pro</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.firstName} {user?.lastName}</span>
                </div>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <div className="max-w-md mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Subscription Required</CardTitle>
                    <CardDescription>
                      You need an active subscription to access forex signals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptionStatus && (
                      <div className="mb-4 flex items-center justify-center space-x-2">
                        <Badge className={subscriptionStatus.color}>
                          {subscriptionStatus.statusDisplay}
                        </Badge>
                        {subscriptionStatus.daysLeft > 0 && (
                          <span className="text-sm text-gray-600">
                            {subscriptionStatus.daysLeft} days left
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-4">
                      Get access to professional forex trading signals with real-time market analysis.
                    </p>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">Premium Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Real-time trading signals</li>
                        <li>• Expert market analysis</li>
                        <li>• Entry and exit points</li>
                        <li>• Risk management guidance</li>
                      </ul>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm text-gray-500">
                        Contact support to activate your subscription
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">ForexSignals Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              {subscriptionStatus && (
                <div className="flex items-center space-x-2">
                  <Badge className={subscriptionStatus.color}>
                    {subscriptionStatus.statusDisplay}
                  </Badge>
                  {subscriptionStatus.daysLeft > 0 && (
                    <span className="text-sm text-gray-600">
                      {subscriptionStatus.daysLeft} days left
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.firstName} {user?.lastName}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trading Signals</h2>
            <p className="text-gray-600">Latest forex market analysis and trading recommendations</p>
          </div>

          {signalsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : signals && signals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {signals.map((signal: ForexSignal) => (
                <Card key={signal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{signal.title}</CardTitle>
                      <Badge className={getTradeColor(signal.tradeAction)}>
                        <div className="flex items-center space-x-1">
                          {getTradeIcon(signal.tradeAction)}
                          <span>{signal.tradeAction}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(signal.createdAt)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {signal.imageUrl && (
                      <img
                        src={signal.imageUrl}
                        alt={signal.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
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
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No signals available</h3>
              <p className="text-gray-600">Check back later for new trading signals</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}