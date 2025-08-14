import { Link, useLocation } from 'wouter';
import { TrendingUp, DollarSign, Calendar, BarChart3, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function DashboardSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const customerMenuItems = [
    {
      href: '/',
      label: 'Signals',
      icon: TrendingUp,
      description: 'Trading Signals'
    },
    {
      href: '/plans',
      label: 'Pricing',
      icon: DollarSign,
      description: 'Subscription Plans'
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'Market Calendar'
    }
  ];

  const adminMenuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Analytics Overview'
    },
    {
      href: '/admin/signals',
      label: 'Signals',
      icon: TrendingUp,
      description: 'Manage Trading Signals'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
      description: 'User Management'
    },
    {
      href: '/plans',
      label: 'Pricing',
      icon: DollarSign,
      description: 'Subscription Plans'
    }
  ];

  const menuItems = user?.isAdmin ? adminMenuItems : customerMenuItems;

  return (
    <div className="h-screen bg-gray-800 w-64 fixed left-0 top-0 z-40 flex flex-col border-r-2 border-red-500">
      {/* Logo/Brand */}
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== '/' && location.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Icon size={20} className={cn(
                'transition-colors',
                isActive ? 'text-[#00FF9C]' : 'text-gray-400 group-hover:text-white'
              )} />
              <div className="flex-1">
                <div className={cn(
                  'font-medium text-sm',
                  isActive ? 'text-[#00FF9C]' : 'text-gray-300 group-hover:text-white'
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          © 2025 ForexSignals Pro
        </div>
      </div>
    </div>
  );
}