import { Badge } from '@/components/ui/badge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Crown, AlertTriangle } from 'lucide-react';

export function SubscriptionStatusBadge() {
  const { user } = useAuth();
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();

  // Don't show badge for admin users
  if (!user || user.isAdmin || isLoading || !subscriptionStatus) {
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

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${subscriptionStatus.color} flex items-center text-xs`}>
        {getIcon()}
        {subscriptionStatus.statusDisplay}
      </Badge>
      {subscriptionStatus.status === 'expired' ? (
        <span className="text-xs font-medium text-red-600">
          Expired
        </span>
      ) : subscriptionStatus.status === 'inactive' ? (
        <span className="text-xs font-medium text-yellow-600">
          Inactive
        </span>
      ) : subscriptionStatus.daysLeft > 0 ? (
        <span className={`text-xs font-medium text-white ${getDaysLeftColor()}`}>
          {subscriptionStatus.daysLeft} days left
        </span>
      ) : null}
    </div>
  );
}