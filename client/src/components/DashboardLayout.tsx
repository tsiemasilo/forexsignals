import { User, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import DashboardSidebar from './DashboardSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center">
            {/* Page Title Area - can be customized per page */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user?.isAdmin ? 'Admin Dashboard' : 'Trading Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {user?.isAdmin 
                  ? 'Manage your forex signals platform' 
                  : 'Access professional trading signals and insights'
                }
              </p>
            </div>

            {/* Right side - User info and controls */}
            <div className="flex items-center space-x-4">
              {/* Subscription Status Badge for non-admin users */}
              {!user?.isAdmin && <SubscriptionStatusBadge />}
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="p-2">
                <Bell size={18} className="text-gray-600" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                    <User size={20} className="text-gray-600" />
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.isAdmin ? 'Administrator' : 'Trader'}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
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

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}