import { TrendingUp, Shield, Users, Clock, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: "Professional Signals",
      description: "Get accurate forex signals from expert traders with proven track records."
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Receive instant notifications when new trading opportunities arise."
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Every signal includes stop loss and take profit levels for proper risk control."
    },
    {
      icon: Users,
      title: "Expert Analysis",
      description: "Detailed market analysis and reasoning behind each trading signal."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Trader",
      content: "ForexSignals Pro has transformed my trading. The accuracy rate is impressive!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Forex Enthusiast",
      content: "Great signals with detailed analysis. Helped me become a more confident trader.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Investment Manager",
      content: "The best forex signal service I've used. Professional and reliable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional <span className="text-green-400">Forex Signals</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300">
            Get accurate trading signals from expert traders. 
            Boost your forex trading performance with our professional analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-900">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ForexSignals Pro?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide professional forex trading signals with comprehensive analysis to help you make informed trading decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">85%</h3>
              <p className="text-xl text-gray-600">Signal Accuracy Rate</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">1,500+</h3>
              <p className="text-xl text-gray-600">Active Subscribers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">50+</h3>
              <p className="text-xl text-gray-600">Signals Per Month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Traders Say</h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful traders who trust ForexSignals Pro
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Trading Like a Pro?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join our community of successful traders and start receiving professional forex signals today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                Get Started Now
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-900">
                View All Plans
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center mt-8 space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              No Setup Fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Cancel Anytime
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              24/5 Support
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}