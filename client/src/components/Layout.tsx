import { Link, useLocation } from 'wouter';
import { TrendingUp, User, LogOut, Settings, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const publicNavigationItems = [
    { href: '/', label: 'Home' },
    { href: '/plans', label: 'Pricing' },
  ];

  const customerNavigationItems = [
    { href: '/', label: 'Signals' },
    { href: '/plans', label: 'Pricing' },
  ];

  const adminNavigationItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/admin/signals', label: 'Manage Signals' },
    { href: '/admin/users', label: 'Manage Users' },
  ];

  const getNavigationItems = () => {
    if (!user) return publicNavigationItems;
    if (user.isAdmin) return adminNavigationItems;
    return customerNavigationItems;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <TrendingUp className="text-green-400" size={32} />
              <div>
                <h1 className="text-xl font-bold">ForexSignals Pro</h1>
                <p className="text-xs text-gray-400">Professional Trading Signals</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-green-400 transition-colors ${
                    location === item.href ? 'text-green-400' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:text-green-400">
                      <User size={20} className="mr-2" />
                      {user.firstName || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.isAdmin && (
                        <p className="text-xs text-green-600 font-medium">Administrator</p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {user.isAdmin ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/" className="flex items-center">
                            <BarChart3 size={16} className="mr-2" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/signals" className="flex items-center">
                            <Settings size={16} className="mr-2" />
                            Manage Signals
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users" className="flex items-center">
                            <Users size={16} className="mr-2" />
                            Manage Users
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/" className="flex items-center">
                            <TrendingUp size={16} className="mr-2" />
                            Signals
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/plans" className="flex items-center">
                            <BarChart3 size={16} className="mr-2" />
                            Pricing
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button size="sm" variant="ghost" className="text-white hover:text-green-400">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="text-green-400" size={28} />
                <div>
                  <h3 className="text-xl font-bold">ForexSignals Pro</h3>
                  <p className="text-xs text-gray-400">Professional Trading Signals</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Get professional forex trading signals from expert traders. 
                Boost your trading performance with our accurate market analysis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/plans" className="hover:text-white">Trading Plans</Link></li>
                <li><Link href="/" className="hover:text-white">Live Signals</Link></li>
                <li><a href="#" className="hover:text-white">Market Analysis</a></li>
                <li><a href="#" className="hover:text-white">Expert Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Trading Guide</a></li>
                <li><a href="#" className="hover:text-white">Risk Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="text-gray-400 space-y-2">
                <p>+1 (555) 987-6543</p>
                <p>support@forexsignalspro.com</p>
                <p>Trading signals available 24/5</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ForexSignals Pro. All rights reserved. Trading involves risk.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}