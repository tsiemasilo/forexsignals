import { CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Plans() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();

  const { data: plans = [] } = useQuery({
    queryKey: ['/api/plans'],
  });

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/ozow/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const paymentData = await response.json();
      
      // Create and submit Ozow form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.action_url;
      
      // Add all Ozow fields
      Object.entries(paymentData).forEach(([key, value]) => {
        if (key !== 'action_url') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }
      });
      
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPopularPlan = () => {
    return plans.length > 0 ? plans[Math.floor(plans.length / 2)] : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-green-600">Trading Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your trading needs. All plans include professional signals, 
            market analysis, and expert support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan: any) => {
            const isPopular = plan.id === getPopularPlan()?.id;
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'ring-2 ring-green-500 shadow-xl' : 'shadow-lg'} hover:shadow-xl transition-shadow`}>
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="text-center">
                    <span className="text-4xl font-bold">R{plan.price}</span>
                    <span className="text-gray-500 ml-1">/{plan.duration} days</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Professional forex signals</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Real-time notifications</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Risk management included</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Expert market analysis</span>
                    </div>
                  </div>
                  
                  {user ? (
                    <Button 
                      className={`w-full ${isPopular ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      Subscribe Now
                    </Button>
                  ) : (
                    <Link href="/register" className="block">
                      <Button className={`w-full ${isPopular ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                        Get Started
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose ForexSignals Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%+</div>
              <p className="text-gray-600">Signal Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/5</div>
              <p className="text-gray-600">Market Coverage</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">1500+</div>
              <p className="text-gray-600">Happy Traders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}