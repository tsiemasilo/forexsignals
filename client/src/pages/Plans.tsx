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
                <span className="text-gray-700 hover:text-green-600 transition-colors cursor-pointer">Home</span>
              </Link>
              <Link href="/signals">
                <span className="text-gray-700 hover:text-green-600 transition-colors cursor-pointer">Signals</span>
              </Link>
              <span className="text-green-600 font-semibold">Plans</span>
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
              className="rounded-2xl p-2.5 bg-white text-gray-600 max-w-sm mx-auto h-full"
              style={{ boxShadow: '0 30px 30px -25px rgba(0, 38, 255, 0.205)' }}
            >
              <div className="relative bg-blue-50 rounded-xl p-5 pt-10 h-full flex flex-col">
                <div 
                  className="absolute top-0 right-0 flex items-center px-3 py-2 text-xl font-semibold text-blue-800"
                  style={{ 
                    backgroundColor: '#bed6fb',
                    borderRadius: '99em 0 0 99em'
                  }}
                >
                  <span>
                    R{plan.price} <span className="text-sm ml-1 opacity-75">/ {plan.duration} {plan.duration === 1 ? 'day' : 'days'}</span>
                  </span>
                </div>
                
                <div className="flex-grow">
                  <p className="text-xl font-semibold text-blue-900 mb-3">{plan.name}</p>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 min-h-[24px]">
                      <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                      <span>Daily <span className="font-semibold text-blue-800">premium signals</span></span>
                    </li>
                    <li className="flex items-center gap-2 min-h-[24px]">
                      <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                      <span>Expert <span className="font-semibold text-blue-800">market analysis</span></span>
                    </li>
                    <li className="flex items-center gap-2 min-h-[24px]">
                      <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                      <span>Real-time notifications</span>
                    </li>
                    <li className="flex items-center gap-2 min-h-[24px]">
                      <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                      <span><span className="font-semibold text-blue-800">24/7</span> support access</span>
                    </li>
                    {plan.name === "VIP Plan" ? (
                      <>
                        <li className="flex items-center gap-2 min-h-[24px]">
                          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <Star size={14} className="text-white" />
                          </div>
                          <span>Priority <span className="font-semibold text-blue-800">signal delivery</span></span>
                        </li>
                        <li className="flex items-center gap-2 min-h-[24px]">
                          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <Star size={14} className="text-white" />
                          </div>
                          <span>Exclusive <span className="font-semibold text-blue-800">VIP signals</span></span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2 min-h-[24px] opacity-0">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-5 h-5"></div>
                          </div>
                          <span>Placeholder</span>
                        </li>
                        <li className="flex items-center gap-2 min-h-[24px] opacity-0">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-5 h-5"></div>
                          </div>
                          <span>Placeholder</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="mt-auto">
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Choose Payment Method</DialogTitle>
            <DialogDescription className="text-center">
              Select your preferred payment method for {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center py-4">
            {/* Yoco Payment Card */}
            <div 
              className="payment-card relative w-60 h-80 bg-transparent rounded-2xl overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-105"
              style={{ boxShadow: '0px 8px 28px -9px rgba(0,0,0,0.45)' }}
              onClick={handleYocoPayment}
            >
              {/* Animated Wave Background */}
              <div 
                className="wave absolute w-[540px] h-[700px] opacity-60 left-0 top-0 -ml-[50%] -mt-[70%] rounded-[40%] animate-spin"
                style={{ 
                  background: 'linear-gradient(744deg, #2563eb, #1d4ed8 60%, #1e40af)',
                  animationDuration: '55s'
                }}
              />
              <div 
                className="wave absolute w-[540px] h-[700px] opacity-60 left-0 top-52 -ml-[50%] rounded-[40%] animate-spin"
                style={{ 
                  background: 'linear-gradient(744deg, #2563eb, #1d4ed8 60%, #1e40af)',
                  animationDuration: '50s'
                }}
              />
              <div 
                className="wave absolute w-[540px] h-[700px] opacity-60 left-0 top-52 -ml-[50%] rounded-[40%] animate-spin"
                style={{ 
                  background: 'linear-gradient(744deg, #2563eb, #1d4ed8 60%, #1e40af)',
                  animationDuration: '45s'
                }}
              />
              
              {/* Card Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                <div className="w-16 h-12 mb-4 flex items-center justify-center">
                  <svg viewBox="0 0 100 40" className="w-full h-full fill-white">
                    <text x="50" y="25" textAnchor="middle" className="font-bold text-lg" style={{ fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>
                      YOCO
                    </text>
                  </svg>
                </div>
                <div className="text-xl font-semibold mb-2">Yoco Payment</div>
                <div className="text-sm opacity-90">Credit & Debit Cards</div>
                <div className="text-xs opacity-75 mt-2">Secure card processing</div>
              </div>
            </div>

            {/* Ozow Payment Card */}
            <div 
              className="payment-card relative w-60 h-80 bg-transparent rounded-2xl overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-105"
              style={{ boxShadow: '0px 8px 28px -9px rgba(0,0,0,0.45)' }}
              onClick={handleOzowPayment}
            >
              {/* Animated Wave Background */}
              <div 
                className="wave absolute w-[540px] h-[700px] opacity-60 left-0 top-0 -ml-[50%] -mt-[70%] rounded-[40%] animate-spin"
                style={{ 
                  background: 'linear-gradient(744deg, #059669, #047857 60%, #065f46)',
                  animationDuration: '55s'
                }}
              />
              <div 
                className="wave absolute w-[540px] h-[700px] opacity-60 left-0 top-52 -ml-[50%] rounded-[40%] animate-spin"
                style={{ 
                  background: 'linear-gradient(744deg, #059669, #047857 60%, #065f46)',
                  animationDuration: '50s'
                }}
              />
              <div 
                className="wave absolute w-[540px] h-[700px] opacity-60 left-0 top-52 -ml-[50%] rounded-[40%] animate-spin"
                style={{ 
                  background: 'linear-gradient(744deg, #059669, #047857 60%, #065f46)',
                  animationDuration: '45s'
                }}
              />
              
              {/* Card Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                <div className="w-12 h-12 mb-4 text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <div className="text-xl font-semibold mb-2">Ozow Payment</div>
                <div className="text-sm opacity-90">Instant EFT</div>
                <div className="text-xs opacity-75 mt-2">Bank to bank transfer</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
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