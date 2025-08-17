import { CheckCircle, Star, CreditCard, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { useState } from 'react';

export function Plans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { data: plans = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  });

  console.log('Plans page - data:', plans);
  console.log('Plans page - isLoading:', isLoading);
  console.log('Plans page - error:', error);

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
      // Direct Yoco checkout URLs for each plan
      if (selectedPlan.name === "Basic Plan") {
        window.open("https://c.yoco.com/checkout/ch_PLmQ2BJ7wp8h3Qu4Z9F1l6Lm", "_blank");
        setIsPaymentDialogOpen(false);
        return;
      } else if (selectedPlan.name === "Premium Plan") {
        window.open("https://c.yoco.com/checkout/ch_QLOBkND8RDvfb3Vh207tyk0x", "_blank");
        setIsPaymentDialogOpen(false);
        return;
      } else if (selectedPlan.name === "VIP Plan") {
        window.open("https://pay.yoco.com/r/mEQXAD", "_blank");
        setIsPaymentDialogOpen(false);
        return;
      }

      toast({
        title: "Error",
        description: "Invalid plan selected.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process Yoco payment.",
        variant: "destructive",
      });
    }
  };

  const handleOzowPayment = async () => {
    try {
      const response = await fetch('/api/ozow/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (!response.ok) {
        throw new Error('Failed to create Ozow payment');
      }

      const paymentData = await response.json();
      
      // Create and submit Ozow form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.action_url;
      form.target = '_blank';

      // Add all payment parameters as hidden inputs
      Object.entries(paymentData).forEach(([key, value]) => {
        if (key !== 'action_url') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      setIsPaymentDialogOpen(false);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process Ozow payment.",
        variant: "destructive",
      });
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "Basic Plan":
        return "from-blue-500 to-blue-600";
      case "Premium Plan":
        return "from-green-500 to-green-600";
      case "VIP Plan":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Basic Plan":
        return <CreditCard className="h-6 w-6" />;
      case "Premium Plan":
        return <Star className="h-6 w-6" />;
      case "VIP Plan":
        return <Smartphone className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPopularPlan = () => {
    return plans.find((plan: any) => plan.name === "Premium Plan");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading plans: {error.message}</div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No plans available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Smartphone className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">Watchlist Fx</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <a className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              </Link>
              <Link href="/signals">
                <a className="text-gray-700 hover:text-green-600 transition-colors">Signals</a>
              </Link>
              <a href="#" className="text-green-600 font-semibold">Plans</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <span className="text-gray-700">Hi, {user.firstName}</span>
              ) : (
                <Link href="/login">
                  <a className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Sign In
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Trading Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get premium forex trading signals delivered directly to your phone. 
            Professional analysis, real-time alerts, and expert insights to maximize your trading potential.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan: any) => (
            <div 
              key={plan.id} 
              className="rounded-2xl p-2.5 bg-white text-gray-600 max-w-sm mx-auto"
              style={{ boxShadow: '0 30px 30px -25px rgba(0, 38, 255, 0.205)' }}
            >
              <div className="relative bg-blue-50 rounded-xl p-5 pt-10">
                <div 
                  className="absolute top-0 right-0 flex items-center px-3 py-2 text-xl font-semibold text-blue-800"
                  style={{ 
                    backgroundColor: '#bed6fb',
                    borderRadius: '99em 0 0 99em'
                  }}
                >
                  <span>
                    R{plan.price} <span className="text-sm ml-1 opacity-75">/ {plan.duration}d</span>
                  </span>
                </div>
                
                <p className="text-xl font-semibold text-blue-900 mb-3">{plan.name}</p>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <ul className="space-y-3 mb-5">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <span>Daily <span className="font-semibold text-blue-800">premium signals</span></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <span>Expert <span className="font-semibold text-blue-800">market analysis</span></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <span>Real-time notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <span><span className="font-semibold text-blue-800">24/7</span> support access</span>
                  </li>
                  {plan.name === "VIP Plan" && (
                    <>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star size={14} className="text-white" />
                        </div>
                        <span>Priority <span className="font-semibold text-blue-800">signal delivery</span></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star size={14} className="text-white" />
                        </div>
                        <span>Exclusive <span className="font-semibold text-blue-800">VIP signals</span></span>
                      </li>
                    </>
                  )}
                </ul>
                
                <div className="flex justify-end">
                  <button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg rounded-md px-4 py-2.5 transition-colors duration-200"
                    onClick={() => handleSubscribe(plan)}
                  >
                    Choose Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-8">Trusted by thousands of traders across South Africa</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-500">1000+</div>
            <div className="text-gray-500">Active Traders</div>
            <div className="text-2xl font-bold text-gray-500">95%</div>
            <div className="text-gray-500">Success Rate</div>
            <div className="text-2xl font-bold text-gray-500">24/7</div>
            <div className="text-gray-500">Support</div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select your preferred payment method for {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={handleYocoPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Pay with Yoco (Card)
            </Button>
            
            <Button 
              onClick={handleOzowPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Pay with Ozow (EFT)
            </Button>
            
            <Button 
              onClick={() => setIsPaymentDialogOpen(false)}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default Plans;