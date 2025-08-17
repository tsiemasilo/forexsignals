import { useEffect } from 'react';
import { Link } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentSuccess() {
  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/signals';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your payment. Your subscription has been activated.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            You now have full access to all forex signals. Start trading with confidence!
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/signals">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              View Signals Dashboard
            </Button>
          </Link>
          
          <p className="text-xs text-gray-500">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}