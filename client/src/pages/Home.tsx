import { TrendingUp, ArrowRight, Star, CheckCircle, Users, DollarSign, Award, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 text-white overflow-hidden">
      {/* Main Poster Content */}
      <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-8">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 text-6xl font-bold transform rotate-12">📈</div>
          <div className="absolute top-40 right-32 text-4xl font-bold transform -rotate-12">💎</div>
          <div className="absolute bottom-32 left-32 text-5xl font-bold transform rotate-45">💰</div>
          <div className="absolute bottom-20 right-20 text-3xl font-bold transform -rotate-45">🚀</div>
        </div>

        {/* Header Badge */}
        <Badge className="mb-8 bg-green-600 text-white px-6 py-2 text-lg font-semibold rounded-full">
          #1 TRADING PLATFORM
        </Badge>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-6xl">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-6">
            <span className="block text-white">TRADING</span>
            <span className="block text-green-400 drop-shadow-2xl">INSIGHTS</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300 mt-4">
              PROFESSIONAL ANALYSIS
            </span>
          </h1>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-8 mb-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/20">
            <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">85%</div>
            <div className="text-sm md:text-base font-semibold">WIN RATE</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/20">
            <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">1.5K+</div>
            <div className="text-sm md:text-base font-semibold">TRADERS</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/20">
            <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">50+</div>
            <div className="text-sm md:text-base font-semibold">INSIGHTS/MONTH</div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="text-center mb-12 max-w-4xl">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-200 leading-relaxed">
            Transform Your Trading Strategy.<br/>
            <span className="text-green-400">Get Expert Market Analysis</span> That Delivers Real Results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <Link href="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white text-xl px-12 py-4 rounded-full font-bold shadow-2xl transform hover:scale-105 transition-all">
              START FREE TRIAL
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          <Link href="/plans">
            <Button size="lg" variant="outline" className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-900 text-xl px-12 py-4 rounded-full font-bold">
              VIEW PRICING
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-6xl">
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="font-bold text-sm">MARKET INSIGHTS</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="font-bold text-sm">EXPERT GUIDANCE</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="font-bold text-sm">STRATEGIC PLANNING</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="font-bold text-sm">PORTFOLIO MANAGEMENT</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-lg font-semibold">4.9/5</span>
          </div>
          <p className="text-gray-300 text-lg">
            "Amazing platform with professional insights. Completely transformed my trading approach!"
            <br />
            <span className="text-green-400 font-semibold">- Sarah J., Investment Manager</span>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            NO SETUP FEES
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            CANCEL ANYTIME
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            24/5 SUPPORT
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            MONEY BACK GUARANTEE
          </div>
        </div>

        {/* Demo Accounts Notice */}
        <div className="mt-8 bg-green-600/20 border border-green-400/30 rounded-xl p-4 max-w-md">
          <p className="text-sm text-center text-green-300">
            <strong>Try Demo Accounts:</strong><br/>
            Admin: admin@forexsignals.com<br/>
            Customer: customer@example.com
          </p>
        </div>

        {/* Urgency Element */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <Badge className="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-full animate-pulse">
            ⚡ LIMITED TIME: 7-DAY FREE TRIAL
          </Badge>
        </div>
      </div>
    </div>
  );
}