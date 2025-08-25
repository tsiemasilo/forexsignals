import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Signal, CreditCard, Settings, Users, BarChart3, Menu, X } from 'lucide-react';

export function AppHeader() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Signal className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">Watchlist Fx</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <a className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
              </Link>
              
              <Link href="/signals">
                <a className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                  <Signal className="h-4 w-4" />
                  <span>Signals</span>
                </a>
              </Link>
              
              <Link href="/trade-stats">
                <a className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Stats</span>
                </a>
              </Link>
              
              {!user.isAdmin && (
                <Link href="/plans">
                  <a className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                    <CreditCard className="h-4 w-4" />
                    <span>Plans</span>
                  </a>
                </Link>
              )}
              
              {user.isAdmin && (
                <>
                  <Link href="/admin">
                    <a className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </a>
                  </Link>
                  <Link href="/admin/users">
                    <a className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                      <Users className="h-4 w-4" />
                      <span>Manage Users</span>
                    </a>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Info and Status */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Desktop: Subscription Status Badge */}
            <div className="hidden md:flex">
              <SubscriptionStatusBadge />
            </div>
            
            {/* Desktop: User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <a className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors py-2">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
              </Link>
              
              <Link href="/signals" onClick={() => setIsMobileMenuOpen(false)}>
                <a className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors py-2">
                  <Signal className="h-4 w-4" />
                  <span>Signals</span>
                </a>
              </Link>
              
              <Link href="/trade-stats" onClick={() => setIsMobileMenuOpen(false)}>
                <a className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors py-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Stats</span>
                </a>
              </Link>
              
              {!user.isAdmin && (
                <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors py-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Plans</span>
                  </a>
                </Link>
              )}
              
              {user.isAdmin && (
                <>
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <a className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors py-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </a>
                  </Link>
                  <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)}>
                    <a className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors py-2">
                      <Users className="h-4 w-4" />
                      <span>Manage Users</span>
                    </a>
                  </Link>
                </>
              )}
              
              {/* Mobile: User Info Section */}
              <div className="border-t pt-4 space-y-3">
                <SubscriptionStatusBadge />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}