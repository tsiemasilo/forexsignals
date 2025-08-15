import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAutoRefresh } from './useAutoRefresh';

export function useRealtimeSignals() {
  const queryClient = useQueryClient();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Fetch signals with auto-refresh
  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 3000, // React Query auto-refresh every 3 seconds
    refetchIntervalInBackground: true, // Continue refreshing when tab is not active
    staleTime: 0, // Always consider data stale to force refresh
  });

  // Additional custom auto-refresh hook for manual control
  const { refresh } = useAutoRefresh({
    queryKey: ['/api/signals'],
    interval: 5000, // Manual refresh every 5 seconds as backup
    enabled: true
  });

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