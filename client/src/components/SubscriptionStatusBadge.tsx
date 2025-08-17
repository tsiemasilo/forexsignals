import { Badge } from '@/components/ui/badge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Crown, AlertTriangle } from 'lucide-react';

export function SubscriptionStatusBadge() {
  const { user } = useAuth();
  const { data: subscriptionStatus, isLoading, error } = useSubscriptionStatus();

  // Debug logging
  console.log('Badge Debug:', { user, subscriptionStatus, isLoading, error });

  // Don't show badge for admin users, but show for regular users even if user data is incomplete
  if (isLoading) {
    return null;
  }

  // Show badge if we have subscription data, regardless of user state
  if (!subscriptionStatus) {
    return null;
  }

  // Hide only for admin users
  if (user?.isAdmin) {
    return null;
  }

  const getIcon = () => {
    switch (subscriptionStatus.status) {
      case 'trial':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'active':
        return <Crown className="w-3 h-3 mr-1" />;
      case 'expired':
      case 'inactive':
        return <AlertTriangle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getDaysLeftColor = () => {
    if (subscriptionStatus.daysLeft <= 3) return 'text-red-600';
    if (subscriptionStatus.daysLeft <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Force explicit color classes for better CSS compilation
  const getBadgeColorClass = () => {
    switch (subscriptionStatus.status) {
      case 'trial':
        return 'bg-yellow-500 text-white';
      case 'active':
        return 'bg-green-500 text-white';
      case 'expired':
        return 'bg-red-500 text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Badge className={`${getBadgeColorClass()} flex items-center text-xs font-medium`}>
      {getIcon()}
      {subscriptionStatus.statusDisplay}
    </Badge>
  );
}