import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Signal {
  id: number;
  title: string;
  content: string;
  tradeAction: string;
  imageUrl?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Trade action utilities
const getTradeActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'buy':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'sell':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    case 'hold':
      return <Minus className="w-4 h-4 text-yellow-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getTradeActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'buy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'sell':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'hold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function SignalDetail() {
  const params = useParams();
  const signalId = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignal = async () => {
      if (!signalId) {
        setError('Signal ID not provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/signals/${signalId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required');
            toast({
              title: "Authentication Required",
              description: "Please log in to view signal details.",
              variant: "destructive"
            });
            setLocation('/');
            return;
          }
          throw new Error(`Failed to fetch signal: ${response.status}`);
        }

        const data = await response.json();
        setSignal(data);
      } catch (err) {
        console.error('Error fetching signal:', err);
        setError(err instanceof Error ? err.message : 'Failed to load signal');
        toast({
          title: "Error Loading Signal",
          description: "Unable to load signal details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [signalId, setLocation, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-2">Signal Not Found</h2>
          <p className="text-slate-300 mb-4">{error || 'The requested signal could not be found.'}</p>
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Signals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* iPhone-style container */}
      <div className="max-w-sm mx-auto bg-slate-900 min-h-screen relative">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700 px-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="text-white text-sm font-medium">Signal Details</div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Signal Content */}
        <div className="px-4 pb-8">
          {/* Signal Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTradeActionIcon(signal.tradeAction)}
                  <div>
                    <h1 className="text-white font-semibold text-lg">{signal.title}</h1>
                    <p className="text-blue-100 text-sm">Professional Signal</p>
                  </div>
                </div>
                <Badge className={`${getTradeActionColor(signal.tradeAction)} font-semibold`}>
                  {signal.tradeAction.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Signal Content */}
              <div className="mb-6">
                <h3 className="text-slate-900 font-medium mb-3">Signal Analysis</h3>
                <div className="prose prose-sm text-slate-700">
                  {signal.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Image if available */}
              {signal.imageUrl && (
                <div className="mb-6">
                  <h3 className="text-slate-900 font-medium mb-3">Chart Analysis</h3>
                  <div className="rounded-lg overflow-hidden border border-slate-200">
                    <img 
                      src={signal.imageUrl} 
                      alt="Signal Chart"
                      className="w-full h-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Signal #{signal.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(signal.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View More Signals
                </Button>
                <Button 
                  onClick={() => setLocation('/plans')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
      </div>
    </div>
  );
}