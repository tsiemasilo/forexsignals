import { CheckCircle, Star, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { useState } from 'react';

export default function Plans() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { data: plans = [] } = useQuery<any[]>({
    queryKey: ['/api/plans'],
  });

  const handleSubscribe = (plan: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPlan(plan);
    setIsPaymentDialogOpen(true);
  };



  const handleYocoPayment = async () => {
    try {
      // Redirect to specific Yoco checkout URLs based on plan
      if (selectedPlan.name === "Basic Plan") {
        window.location.href = "https://c.yoco.com/checkout/ch_PLmQ2BJ7wp8h3Qu4Z9F1l6Lm";
        setIsPaymentDialogOpen(false);
        return;
      } else if (selectedPlan.name === "Premium Plan") {
        window.location.href = "https://c.yoco.com/checkout/ch_QLOBkND8RDvfb3Vh207tyk0x";
        setIsPaymentDialogOpen(false);
        return;
      } else if (selectedPlan.name === "VIP Plan") {
        window.location.href = "https://pay.yoco.com/r/mEQXAD";
        setIsPaymentDialogOpen(false);
        return;
      }

      if (!sessionId) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue with payment.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/yoco/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        // If unauthorized, the session has expired
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue with payment.",
            variant: "destructive",
          });
          // Clear invalid session data
          localStorage.removeItem("sessionId");
          localStorage.removeItem("user");
          // Refresh the page to show login
          window.location.reload();
          return;
        }
        
        throw new Error(errorData.message || 'Failed to initiate Yoco payment');
      }

      const paymentData = await response.json();
      
      // Redirect to Yoco payment page
      window.location.href = paymentData.redirectUrl;
      setIsPaymentDialogOpen(false);
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Unable to process Yoco payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOzowPayment = async () => {
    try {
      if (!sessionId) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue with payment.",
          variant: "destructive",
        });
        return;
      }

      console.log('Making Ozow payment request with sessionId:', sessionId);
      console.log('Selected plan:', selectedPlan);

      const response = await fetch('/api/ozow/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        // If unauthorized, the session has expired
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue with payment.",
            variant: "destructive",
          });
          // Clear invalid session data
          localStorage.removeItem("sessionId");
          localStorage.removeItem("user");
          // Refresh the page to show login
          window.location.reload();
          return;
        }
        
        throw new Error(errorData.message || 'Failed to initiate payment');
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
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error('Ozow payment error:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Unable to process payment. Please try again.",
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
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe Now
                    </Button>
                  ) : (
                    <Link href="/auth" className="block">
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

        {/* Payment Method Selection Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="text-center space-y-3">
              <DialogTitle className="text-2xl font-bold">Complete Your Subscription</DialogTitle>
              <DialogDescription className="text-base">
                Choose your preferred payment method to get instant access
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-8">
              {/* Plan Summary Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPlan?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedPlan?.duration} days of premium access</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">R{selectedPlan?.price}</p>
                    <p className="text-xs text-gray-500">One-time payment</p>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Payment Method</h4>
                
                <Button 
                  onClick={handleYocoPayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="bg-white p-3 rounded-lg mr-4 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://cdn.brandfetch.io/idGqhiL13o/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1667785033148" 
                          alt="Yoco" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lg">Yoco Payments</div>
                        <div className="text-sm opacity-90">Credit card, debit card & mobile money</div>
                      </div>
                    </div>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={handleOzowPayment}
                  variant="outline"
                  className="w-full p-6 h-auto border-2 border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-3 rounded-lg mr-4 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://cdn.brandfetch.io/idy9gzLXq0/w/358/h/100/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1672151446656" 
                          alt="Ozow" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lg text-gray-900">Ozow</div>
                        <div className="text-sm text-gray-600">Instant bank-to-bank transfer</div>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Security Note */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Your payment information is secured with bank-level encryption. Subscription activates immediately upon successful payment.
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}