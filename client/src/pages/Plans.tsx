import { CheckCircle, Star, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/AppHeader';
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

      // Fallback to API endpoint for dynamic payment creation
      const response = await fetch('/api/yoco/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue with payment.",
            variant: "destructive",
          });
          window.location.reload();
          return;
        }
        
        throw new Error(errorData.message || 'Failed to initiate Yoco payment');
      }

      const paymentData = await response.json();
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
      const response = await fetch('/api/ozow/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue with payment.",
            variant: "destructive",
          });
          window.location.reload();
          return;
        }
        
        throw new Error(errorData.message || 'Failed to initiate payment');
      }

      const paymentData = await response.json();
      
      // Create and submit Ozow form in new tab
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.action_url;
      form.target = '_blank';
      
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
      document.body.removeChild(form);
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
    return plans.find((plan: any) => plan.name === "Premium Plan");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center pt-20">
          <div className="text-gray-600 text-xl">Loading plans...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center pt-20">
          <div className="text-red-600 text-xl">Error loading plans: {error.message}</div>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center pt-20">
          <div className="text-gray-600 text-xl">No plans available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Hero Section */}
      <div className="pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Get access to premium forex signals and start making profitable trades today
        </p>
      </div>

      {/* Animated Flip Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 justify-items-center">
          {plans.map((plan: any) => {
            const isPopular = plan.id === getPopularPlan()?.id;
            
            return (
              <div key={plan.id} className="flip-card">
                <div className="flip-card-content">
                  {/* Back of card - shows on hover */}
                  <div className="flip-card-back">
                    <div className="rotating-border"></div>
                    <div className="back-content">
                      <div className="plan-icon">
                        <CreditCard className="w-12 h-12 text-white" />
                      </div>
                      <div className="back-text">
                        <h3 className="text-xl font-bold text-white mb-4">Ready to Subscribe?</h3>
                        <Button
                          onClick={() => handleSubscribe(plan)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Choose {plan.name}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Front of card - default view */}
                  <div className="flip-card-front">
                    <div className="floating-circles">
                      <div className="circle circle-1"></div>
                      <div className="circle circle-2"></div>
                      <div className="circle circle-3"></div>
                    </div>
                    
                    <div className="front-content">
                      {isPopular && (
                        <div className="popular-badge">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </div>
                      )}
                      
                      <div className="plan-details">
                        <div className="plan-info">
                          <h3 className="plan-title">{plan.name}</h3>
                          <div className="plan-price">
                            <span className="currency">R</span>
                            <span className="amount">{plan.price}</span>
                            <span className="period">/{plan.duration} days</span>
                          </div>
                        </div>
                        
                        <div className="features">
                          <div className="feature-item">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Premium Signals</span>
                          </div>
                          <div className="feature-item">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Market Analysis</span>
                          </div>
                          <div className="feature-item">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>24/7 Support</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .flip-card {
          width: 280px;
          height: 350px;
          perspective: 1000px;
        }

        .flip-card-content {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 300ms ease-in-out;
          box-shadow: 0px 0px 20px 2px rgba(0,0,0,0.15);
          border-radius: 15px;
        }

        .flip-card:hover .flip-card-content {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 15px;
          overflow: hidden;
        }

        .flip-card-back {
          background: #151515;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotateY(180deg);
          position: relative;
        }

        .rotating-border {
          position: absolute;
          content: '';
          width: 160px;
          height: 160%;
          background: linear-gradient(90deg, transparent, #10b981, #10b981, #10b981, #10b981, transparent);
          animation: rotation 5s infinite linear;
        }

        .back-content {
          position: absolute;
          width: 99%;
          height: 99%;
          background-color: #151515;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
          z-index: 10;
        }

        @keyframes rotation {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }

        .flip-card-front {
          background-color: #151515;
          color: white;
          transform: rotateY(180deg);
          position: relative;
        }

        .floating-circles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(15px);
        }

        .circle-1 {
          width: 90px;
          height: 90px;
          background-color: #10b981;
          top: 20px;
          left: 20px;
          animation: floating 2600ms infinite linear;
        }

        .circle-2 {
          width: 30px;
          height: 30px;
          background-color: #ef4444;
          top: 80px;
          right: 40px;
          animation: floating 2600ms infinite linear;
          animation-delay: -1800ms;
        }

        .circle-3 {
          width: 150px;
          height: 150px;
          background-color: #f97316;
          bottom: 20px;
          left: 50px;
          animation: floating 2600ms infinite linear;
          animation-delay: -800ms;
        }

        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0px); }
        }

        .front-content {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .popular-badge {
          background-color: rgba(0, 0, 0, 0.55);
          color: #10b981;
          padding: 2px 10px;
          border-radius: 10px;
          backdrop-filter: blur(2px);
          width: fit-content;
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
        }

        .plan-details {
          box-shadow: 0px 0px 10px 5px rgba(0,0,0,0.5);
          background-color: rgba(0,0,0,0.6);
          backdrop-filter: blur(5px);
          border-radius: 12px;
          padding: 20px;
        }

        .plan-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 15px;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 20px;
          justify-content: space-between;
          width: 100%;
        }

        .currency {
          font-size: 24px;
          color: #10b981;
          font-weight: 600;
        }

        .amount {
          font-size: 28px;
          font-weight: 800;
          color: white;
        }

        .period {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
        }

        .plan-icon {
          padding: 20px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.2);
          border: 2px solid rgba(16, 185, 129, 0.3);
        }

        .back-text {
          text-align: center;
        }
      `}</style>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select your preferred payment gateway for {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={handleYocoPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay with Yoco
            </Button>
            
            <Button 
              onClick={handleOzowPayment}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Pay with Ozow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}