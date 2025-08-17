import { Link } from 'wouter';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            You can try again anytime or contact support if you need assistance.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/plans">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
          
          <Link href="/signals">
            <Button variant="outline" className="w-full">
              Continue with Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}