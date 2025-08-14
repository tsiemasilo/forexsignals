import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  status: string;
  statusDisplay: string;
  daysLeft: number;
  endDate?: string;
  plan?: {
    name: string;
    price: string;
  } | null;
  color: string;
}

export function useSubscriptionStatus() {
  const { sessionId, user } = useAuth();

  return useQuery<SubscriptionStatus>({
    queryKey: ['/api/user/subscription-status'],
    enabled: !!sessionId && !!user && !user.isAdmin,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
  });
}