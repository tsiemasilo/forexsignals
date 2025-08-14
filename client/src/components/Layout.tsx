import { Link, useLocation } from 'wouter';
import { TrendingUp, User, LogOut, Settings, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
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
    { href: '/calendar', label: 'Calendar' },
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - only show for authenticated users */}
      {user && (
        <div className="w-64 bg-gray-800 text-white fixed left-0 top-0 h-screen z-40 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <TrendingUp className="text-[#00FF9C]" size={28} />
              <div>
                <h1 className="text-lg font-bold text-white">ForexSignals Pro</h1>
                <p className="text-xs text-gray-400">Professional Trading</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {getNavigationItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  location === item.href || (item.href !== '/' && location.startsWith(item.href))
                    ? 'bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">
                  {item.label === 'Signals' || item.label === 'Manage Signals' || item.label === 'Dashboard' ? '📊' :
                   item.label === 'Pricing' ? '💰' :
                   item.label === 'Calendar' ? '📅' :
                   item.label === 'Manage Users' ? '👥' : '📄'}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              © 2025 ForexSignals Pro
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className={user ? "ml-64 flex-1" : "flex-1"}>
        {/* Top Navigation Header - only show when no sidebar */}
        {!user && (
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

                {/* Auth Links */}
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="hover:text-green-400 transition-colors">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Top header for authenticated users */}
        {user && (
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {user.isAdmin ? 'Admin Dashboard' : 'Trading Dashboard'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {user.isAdmin 
                    ? 'Manage your forex signals platform' 
                    : 'Access professional trading signals and insights'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {!user.isAdmin && <SubscriptionStatusBadge />}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                      <User size={20} className="text-gray-600" />
                      <div className="text-left hidden sm:block">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.isAdmin ? 'Administrator' : 'Trader'}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="mr-2" size={16} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={user ? "p-6" : "container mx-auto px-4 py-8"}>
          {children}
        </main>
      </div>
    </div>
  );
}