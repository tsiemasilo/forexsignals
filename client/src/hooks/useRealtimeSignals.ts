import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export function useRealtimeSignals() {
  const { user } = useAuth();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const queryClient = useQueryClient();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Fetch signals with optimized refresh strategy - only when authenticated
  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['/api/signals'],
    queryFn: async () => {
      const response = await fetch('/api/signals', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    refetchInterval: (user && subscriptionStatus?.status !== 'expired' && subscriptionStatus?.status !== 'inactive') ? 5000 : false, // Auto-refresh for active users
    refetchIntervalInBackground: false,
    staleTime: 2000,
    retry: false,
    enabled: !!(user && subscriptionStatus?.status !== 'expired' && subscriptionStatus?.status !== 'inactive'), // Only enable for active users
  });

  // Simplified manual refresh without conflicting intervals
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/signals'] });
  };

  // Update timestamp when signals change
  useEffect(() => {
    if (signals) {
      setLastUpdateTime(new Date());
    }
  }, [signals]);

  // Listen for window focus to refresh immediately
  useEffect(() => {
    const handleFocus = () => {
      refresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refresh]);

  return {
    signals,
    isLoading,
    error,
    lastUpdateTime,
    refresh
  };
}