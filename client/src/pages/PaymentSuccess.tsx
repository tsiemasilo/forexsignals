import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setIsLoading(false);
          // Redirect to login page after countdown
          setTimeout(() => {
            navigate("/");
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [navigate]);

  if (isLoading && countdown > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-pulse mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Your subscription has been activated successfully.
          </p>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
            <span className="text-lg text-gray-700">Processing your account...</span>
          </div>
          
          <div className="bg-green-50 rounded-full p-4 mb-4 border-4 border-green-200">
            <div className="text-3xl font-bold text-green-600">{countdown}</div>
            <div className="text-sm text-green-700">seconds remaining</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium">
              Redirecting to login page where you can access your premium forex signals!
            </p>
          </div>

          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Go to Login Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600 mb-6">
          Taking you to the login page now.
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto" />
      </div>
    </div>
  );
}