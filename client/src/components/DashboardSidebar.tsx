import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function DashboardSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const customerMenuItems = [
    {
      href: '/',
      label: 'Signals',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      ),
      description: 'Trading Signals'
    },
    {
      href: '/plans',
      label: 'Pricing',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 15h7c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h7c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h7c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm-4 6h2v2H3zm0-4h2v2H3zm0-4h2v2H3zm15.5 8.5L21 15l-2.5-2.5L17 15l2.5 2.5z"/>
        </svg>
      ),
      description: 'Subscription Plans'
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      ),
      description: 'Market Calendar'
    }
  ];

  const adminMenuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      description: 'Analytics Overview'
    },
    {
      href: '/admin/signals',
      label: 'Signals',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      ),
      description: 'Manage Trading Signals'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.999 2.999 0 0 0 17.13 7h-1.26c-.8 0-1.54.37-2.01 1l-.91 1.11c-.31.38-.09.89.4.89H15v8H9V8h1.65c.49 0 .71-.51.4-.89L10.14 6c-.47-.63-1.21-1-2.01-1H6.87c-1.31 0-2.41.83-2.83 2.06L1.5 14H4v6h16z"/>
        </svg>
      ),
      description: 'User Management'
    },
    {
      href: '/plans',
      label: 'Pricing',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 15h7c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h7c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h7c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm-4 6h2v2H3zm0-4h2v2H3zm0-4h2v2H3zm15.5 8.5L21 15l-2.5-2.5L17 15l2.5 2.5z"/>
        </svg>
      ),
      description: 'Subscription Plans'
    }
  ];

  const menuItems = user?.isAdmin ? adminMenuItems : customerMenuItems;

  return (
    <div className="h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-800 w-64 fixed left-0 top-0 z-40 flex flex-col shadow-2xl">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ForexSignals Pro</h1>
            <p className="text-xs text-blue-200">Professional Trading</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== '/' && location.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl" />
              )}
              <div className={cn(
                'relative z-10 flex-shrink-0',
                isActive ? 'text-blue-300' : 'text-blue-200/60 group-hover:text-blue-200'
              )}>
                {item.icon}
              </div>
              <div className="flex-1 relative z-10">
                <div className={cn(
                  'font-medium text-sm',
                  isActive ? 'text-white' : 'text-blue-100/80 group-hover:text-white'
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-blue-200/60 group-hover:text-blue-200/80">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-blue-200/60 text-center">
          © 2025 ForexSignals Pro
        </div>
      </div>
    </div>
  );
}