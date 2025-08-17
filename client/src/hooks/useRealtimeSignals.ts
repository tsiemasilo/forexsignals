import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAutoRefresh } from './useAutoRefresh';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeSignals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Fetch signals with optimized refresh strategy - only when user is authenticated
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
    enabled: !!user, // Only run query when user is authenticated
    refetchInterval: user ? 5000 : false, // Only refresh when user is authenticated
    refetchIntervalInBackground: false, // Disable background refresh to reduce conflicts
    staleTime: 2000, // Allow data to be fresh for 2 seconds before forcing refresh
    retry: false, // Don't retry failed requests automatically
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