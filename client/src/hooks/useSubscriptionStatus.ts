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
    queryKey: ['/api/user/subscription-status', Date.now()], // Add timestamp to force fresh data
    enabled: !!sessionId && !!user && !user.isAdmin,
    refetchInterval: 5000, // More frequent refetch - every 5 seconds
    staleTime: 0, // Always consider data stale to force refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: () => 
      fetch(`/api/user/subscription-status?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${sessionId || 'guest_session'}`
        }
      }).then(res => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
  });
}