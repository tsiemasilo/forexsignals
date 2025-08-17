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
  const { user } = useAuth();

  return useQuery<SubscriptionStatus>({
    queryKey: ['/api/user/subscription-status'],
    enabled: !!user, // Only enabled when user is authenticated
    refetchInterval: user ? 5000 : false, // Only refetch when user is authenticated
    staleTime: 0, // Always consider data stale to force refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: () => 
      fetch(`/api/user/subscription-status?t=${Date.now()}`, {
        credentials: 'include'
      }).then(res => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
  });
}