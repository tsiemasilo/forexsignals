import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Signal, CreditCard, Settings, Users } from 'lucide-react';

export function AppHeader() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Signal className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-white">Watchlist Fx</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </span>
              </Link>
              
              <Link href="/signals">
                <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                  <Signal className="h-4 w-4" />
                  <span>Signals</span>
                </span>
              </Link>
              
              {!user.isAdmin && (
                <Link href="/plans">
                  <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    <span>Plans</span>
                  </span>
                </Link>
              )}
              
              {user.isAdmin && (
                <>
                  <Link href="/admin">
                    <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </span>
                  </Link>
                  <Link href="/admin/users">
                    <span className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors cursor-pointer">
                      <Users className="h-4 w-4" />
                      <span>Manage Users</span>
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Info and Status */}
          <div className="flex items-center space-x-4">
            {/* Subscription Status Badge */}
            <SubscriptionStatusBadge />
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-300">{user.email}</p>
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
      </div>
    </header>
  );
}