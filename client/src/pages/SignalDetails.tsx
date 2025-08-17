import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Clock, ArrowLeft, Calendar, User } from 'lucide-react';
import { Link, useParams } from 'wouter';

interface Signal {
  id: number;
  title: string;
  content: string;
  tradeAction: string;
  imageUrl?: string;
  imageUrls?: string[];
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SignalDetails() {
  const params = useParams();
  const signalId = params.id;
  const { sessionId } = useAuth();

  const { data: signal, isLoading, error } = useQuery<Signal>({
    queryKey: [`/api/signals/${signalId}`],
    enabled: !!sessionId && !!signalId,
  });

  const getTradeActionIcon = (action: string | undefined) => {
    if (!action) return <TrendingUp className="w-6 h-6 text-blue-600" />;
    
    switch (action.toLowerCase()) {
      case 'buy':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'sell':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      case 'hold':
        return <Minus className="w-6 h-6 text-yellow-600" />;
      case 'wait':
        return <Clock className="w-6 h-6 text-gray-600" />;
      default:
        return <TrendingUp className="w-6 h-6 text-blue-600" />;
    }
  };

  const getTradeActionColor = (action: string | undefined) => {
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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !signal) {
    const errorMessage = (error as any)?.message || 'Signal not found';
    
    if (errorMessage.includes('subscription')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardHeader>
              <CardTitle>Subscription Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You need an active subscription to view signal details.
              </p>
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
            <CardTitle>Signal Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The requested signal could not be found or has been removed.
            </p>
            <Link href="/">
              <Button variant="outline">
                Back to Signals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }



  const images = signal?.imageUrls?.filter((url: string) => url && url.trim()) || (signal?.imageUrl ? [signal.imageUrl] : []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Signals</span>
            </Button>
          </Link>
        </div>

        {/* Signal Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {getTradeActionIcon(signal?.tradeAction)}
                <div>
                  <CardTitle className="text-2xl mb-2">{signal?.title || 'Signal Title Not Available'}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(signal?.createdAt || signal?.updatedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Expert Trader</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge className={`text-sm ${getTradeActionColor(signal?.tradeAction)}`}>
                {(signal?.tradeAction?.toUpperCase()) || 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Signal Content */}
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Trading Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Signal Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Signal Posted</p>
                  <p className="text-lg font-semibold">
                    {formatDate(signal?.createdAt || signal?.updatedAt) !== 'Date not available' 
                      ? formatDate(signal?.createdAt || signal?.updatedAt) 
                      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    }
                  </p>
                </div>

                {/* Signal Description */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {signal?.content || 'No signal analysis content available'}
                  </p>
                </div>

                {/* Chart Images */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Chart Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {images.map((imageUrl: string, index: number) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Chart analysis ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1} of {images.length}
                          </div>
                        </div>
                      ))}
                    </div>
                    {images.length > 1 && (
                      <p className="text-xs text-gray-500 text-center">
                        Click images to view full size
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}