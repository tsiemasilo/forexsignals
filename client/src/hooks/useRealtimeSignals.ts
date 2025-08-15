import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAutoRefresh } from './useAutoRefresh';

export function useRealtimeSignals() {
  const queryClient = useQueryClient();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Fetch signals with optimized refresh strategy
  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 5000, // Reduced to 5 seconds to prevent too frequent updates
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