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
            <div key={plan.id} className="plan">
              <div className="inner">
                <span className="pricing">
                  <span>
                    R{plan.price} <small>/ {plan.duration}d</small>
                  </span>
                </span>
                <p className="title">{plan.name}</p>
                <p className="info">{plan.description}</p>
                <ul className="features">
                  <li>
                    <span className="icon">
                      <Check size={14} />
                    </span>
                    <span>Daily <strong>premium signals</strong></span>
                  </li>
                  <li>
                    <span className="icon">
                      <Check size={14} />
                    </span>
                    <span>Expert <strong>market analysis</strong></span>
                  </li>
                  <li>
                    <span className="icon">
                      <Check size={14} />
                    </span>
                    <span>Real-time notifications</span>
                  </li>
                  <li>
                    <span className="icon">
                      <Check size={14} />
                    </span>
                    <span><strong>24/7</strong> support access</span>
                  </li>
                  {plan.name === "VIP Plan" && (
                    <>
                      <li>
                        <span className="icon">
                          <Star size={14} />
                        </span>
                        <span>Priority <strong>signal delivery</strong></span>
                      </li>
                      <li>
                        <span className="icon">
                          <Star size={14} />
                        </span>
                        <span>Exclusive <strong>VIP signals</strong></span>
                      </li>
                    </>
                  )}
                </ul>
                <div className="action">
                  <button 
                    className="button" 
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

      {/* Custom Styles */}
      <style jsx>{`
        .plan {
          border-radius: 16px;
          box-shadow: 0 30px 30px -25px rgba(0, 38, 255, 0.205);
          padding: 10px;
          background-color: #fff;
          color: #697e91;
          max-width: 300px;
          margin: 0 auto;
        }

        .plan strong {
          font-weight: 600;
          color: #425275;
        }

        .plan .inner {
          align-items: center;
          padding: 20px;
          padding-top: 40px;
          background-color: #ecf0ff;
          border-radius: 12px;
          position: relative;
        }

        .plan .pricing {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #bed6fb;
          border-radius: 99em 0 0 99em;
          display: flex;
          align-items: center;
          padding: 0.625em 0.75em;
          font-size: 1.25rem;
          font-weight: 600;
          color: #425475;
        }

        .plan .pricing small {
          color: #707a91;
          font-size: 0.75em;
          margin-left: 0.25em;
        }

        .plan .title {
          font-weight: 600;
          font-size: 1.25rem;
          color: #425675;
          margin-bottom: 0.75rem;
        }

        .plan .info {
          margin-bottom: 1rem;
        }

        .plan .features {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.25rem;
        }

        .plan .features li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .plan .features .icon {
          background-color: #1FCAC5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .plan .features .icon svg {
          width: 14px;
          height: 14px;
        }

        .plan .action {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: end;
        }

        .plan .button {
          background-color: #6558d3;
          border-radius: 6px;
          color: #fff;
          font-weight: 500;
          font-size: 1.125rem;
          text-align: center;
          border: 0;
          outline: 0;
          width: 100%;
          padding: 0.625em 0.75em;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .plan .button:hover, .plan .button:focus {
          background-color: #4133B7;
        }
      `}</style>
    </div>
  );
}

export default Plans;