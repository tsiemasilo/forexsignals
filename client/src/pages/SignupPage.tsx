import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    setLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      toast({
        title: "Success",
        description: "Account created successfully! You can now sign in.",
      });

      // Reset form
      setFormData({ name: '', phone: '', email: '' });
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Login Button */}
        <Link href="/">
          <div className="flex items-center space-x-2 mb-8 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </div>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600">Join Watchlist Fx for professional trading signals</p>
        </div>

        {/* 3D Isometric Form */}
        <div className="flex justify-center items-center" style={{ perspective: '1000px' }}>
          <form onSubmit={handleSubmit}>
            <ul className="relative list-none p-0 m-0" style={{ transform: 'skewY(-14deg)' }}>
              <li 
                className="relative list-none w-52 transition-all duration-300 text-white mb-5"
                style={{ 
                  zIndex: 4,
                  '--before-bg': '#d8daf7',
                  '--after-bg': '#d8daf7'
                } as React.CSSProperties}
              >
                <div 
                  className="absolute content-[''] w-10 h-10 top-0 -left-10 transition-all duration-300"
                  style={{ 
                    background: '#d8daf7',
                    transformOrigin: 'right',
                    transform: 'skewY(45deg)'
                  }}
                />
                <div 
                  className="absolute content-[''] w-52 h-10 -top-10 left-0 transition-all duration-300"
                  style={{ 
                    background: '#d8daf7',
                    transformOrigin: 'bottom',
                    transform: 'skewX(45deg)'
                  }}
                />
                <input 
                  className="w-full h-10 relative p-2.5 text-black outline-none border-none text-sm font-medium"
                  style={{ 
                    background: '#d8daf7',
                    border: '0.1px solid #575cb5'
                  }}
                  type="text" 
                  placeholder="Full Name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </li>
              <li 
                className="relative list-none w-52 transition-all duration-300 text-white mb-5 hover:translate-x-[-20px]"
                style={{ 
                  zIndex: 3,
                  '--before-bg': '#c2c5f3',
                  '--after-bg': '#c2c5f3'
                } as React.CSSProperties}
              >
                <div 
                  className="absolute content-[''] w-10 h-10 top-0 -left-10 transition-all duration-300"
                  style={{ 
                    background: '#c2c5f3',
                    transformOrigin: 'right',
                    transform: 'skewY(45deg)'
                  }}
                />
                <div 
                  className="absolute content-[''] w-52 h-10 -top-10 left-0 transition-all duration-300"
                  style={{ 
                    background: '#c2c5f3',
                    transformOrigin: 'bottom',
                    transform: 'skewX(45deg)'
                  }}
                />
                <input 
                  className="w-full h-10 relative p-2.5 text-black outline-none border-none text-sm font-medium"
                  style={{ 
                    background: '#c2c5f3',
                    border: '0.1px solid #575cb5'
                  }}
                  type="tel"
                  placeholder="Phone Number" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                />
              </li>
              <li 
                className="relative list-none w-52 transition-all duration-300 text-white mb-5 hover:translate-x-[-20px]"
                style={{ 
                  zIndex: 2,
                  '--before-bg': '#989deb',
                  '--after-bg': '#989deb'
                } as React.CSSProperties}
              >
                <div 
                  className="absolute content-[''] w-10 h-10 top-0 -left-10 transition-all duration-300"
                  style={{ 
                    background: '#989deb',
                    transformOrigin: 'right',
                    transform: 'skewY(45deg)'
                  }}
                />
                <div 
                  className="absolute content-[''] w-52 h-10 -top-10 left-0 transition-all duration-300"
                  style={{ 
                    background: '#989deb',
                    transformOrigin: 'bottom',
                    transform: 'skewX(45deg)'
                  }}
                />
                <input 
                  className="w-full h-10 relative p-2.5 text-black outline-none border-none text-sm font-medium"
                  style={{ 
                    background: '#989deb',
                    border: '0.1px solid #575cb5'
                  }}
                  type="email" 
                  placeholder="Email Address" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </li>
              <button 
                className="relative list-none w-52 h-10 p-2.5 text-white font-medium cursor-pointer border-none transition-all duration-300 hover:translate-x-[-20px] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ 
                  zIndex: 1,
                  background: '#6d74e3',
                  border: '0.1px solid #575cb5'
                }}
                type="submit"
                disabled={loading || !formData.name || !formData.email || !formData.phone}
              >
                <div 
                  className="absolute content-[''] w-10 h-10 top-0 -left-10 transition-all duration-300"
                  style={{ 
                    background: '#6d74e3',
                    transformOrigin: 'right',
                    transform: 'skewY(45deg)'
                  }}
                />
                <div 
                  className="absolute content-[''] w-52 h-10 -top-10 left-0 transition-all duration-300"
                  style={{ 
                    background: '#6d74e3',
                    transformOrigin: 'bottom',
                    transform: 'skewX(45deg)'
                  }}
                />
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </ul>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-600">
          <p>Already have an account? <Link href="/"><span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">Sign In</span></Link></p>
        </div>
      </div>


    </div>
  );
}