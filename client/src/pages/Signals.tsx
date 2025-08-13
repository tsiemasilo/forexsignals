import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Signals() {
  const { sessionId } = useAuth();

  const { data: signals = [], isLoading, error } = useQuery({
    queryKey: ['/api/signals'],
    enabled: !!sessionId,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.message || 'Unknown error';
    
    if (errorMessage.includes('subscription')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardHeader>
              <CardTitle>Subscription Required</CardTitle>
              <CardDescription>
                You need an active subscription to view trading signals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plans">
                <Button className="bg-green-600 hover:bg-green-700">
                  View Plans
                </Button>
              </Link>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trading Signals</h1>
          <p className="text-gray-600">
            Professional forex signals from expert traders. Follow the analysis and manage your risk.
          </p>
        </div>

        {signals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">No signals available</h2>
              <p className="text-gray-600">
                New trading signals will appear here when our experts identify opportunities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {signals.map((signal: any) => (
              <Card key={signal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getTradeActionIcon(signal.tradeAction)}
                      <div>
                        <CardTitle className="text-xl">{signal.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {formatDate(signal.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getTradeActionColor(signal.tradeAction)}>
                      {signal.tradeAction.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold mb-2">Analysis</h4>
                      <p className="text-gray-700 leading-relaxed">{signal.content}</p>
                    </div>
                    
                    {signal.imageUrl && (
                      <div className="lg:col-span-1">
                        <h4 className="font-semibold mb-2">Chart Analysis</h4>
                        <img
                          src={signal.imageUrl}
                          alt="Chart analysis"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Risk Disclaimer:</strong> Trading forex involves substantial risk and may not be suitable for all investors. 
                      Past performance is not indicative of future results. Please trade responsibly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}