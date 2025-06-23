import { Truck, Award, Wrench, Users, Target, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  const stats = [
    { icon: Award, value: '50,000+', label: 'Products Available' },
    { icon: Users, value: '25,000+', label: 'Happy Customers' },
    { icon: Truck, value: '500+', label: 'Car Brands Supported' },
    { icon: Target, value: '99%', label: 'Customer Satisfaction' },
  ];

  const values = [
    {
      icon: Award,
      title: 'Quality First',
      description: 'We only source genuine parts from trusted manufacturers and suppliers worldwide.',
    },
    {
      icon: Heart,
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We provide exceptional service and support.',
    },
    {
      icon: Wrench,
      title: 'Expert Knowledge',
      description: 'Our team of automotive experts is here to help you find the right parts.',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to get your vehicle back on the road fast.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-auto-gray text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About AutoParts Pro</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your trusted partner in automotive excellence for over 15 years. We're passionate about 
            keeping your vehicle running at its best with genuine, high-quality parts.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-auto-gray mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2009, AutoParts Pro began as a small family business with a simple mission: 
                  to provide car owners with genuine, high-quality parts at fair prices. What started in 
                  a modest garage has grown into one of the most trusted names in automotive parts.
                </p>
                <p>
                  Over the years, we've built strong relationships with manufacturers, suppliers, and 
                  customers alike. Our commitment to quality and service has never wavered, and we 
                  continue to expand our inventory to serve the growing needs of car enthusiasts and 
                  everyday drivers.
                </p>
                <p>
                  Today, we're proud to serve customers across the country with an extensive catalog 
                  of parts for hundreds of vehicle makes and models, backed by our expert team and 
                  industry-leading customer service.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Professional automotive workshop"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-auto-light">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-gray mb-4">By the Numbers</h2>
            <p className="text-lg text-gray-600">Our commitment to excellence speaks for itself</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="mx-auto mb-4 text-auto-blue" size={48} />
                <div className="text-4xl font-bold text-auto-red mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-gray mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <value.icon className="mx-auto mb-4 text-auto-blue" size={48} />
                  <h3 className="text-xl font-semibold mb-3 text-auto-gray">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-auto-gray text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-300">Automotive experts dedicated to your success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">Mike Johnson</h3>
              <p className="text-gray-300 mb-2">Founder & CEO</p>
              <p className="text-sm text-gray-400">
                25 years of automotive industry experience
              </p>
            </div>
            
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b6de2d99?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">Sarah Davis</h3>
              <p className="text-gray-300 mb-2">Head of Customer Service</p>
              <p className="text-sm text-gray-400">
                Ensuring every customer gets the best experience
              </p>
            </div>
            
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">David Rodriguez</h3>
              <p className="text-gray-300 mb-2">Technical Specialist</p>
              <p className="text-sm text-gray-400">
                Expert in parts compatibility and installation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-auto-gray mb-8">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            To be the most trusted source for automotive parts and accessories, providing our customers 
            with genuine products, expert advice, and exceptional service that keeps their vehicles 
            running safely and efficiently for years to come.
          </p>
        </div>
      </section>
    </div>
  );
}
