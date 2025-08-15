import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealtimeUpdatesOptions {
  queryKeys: string[][];
  interval?: number;
  backgroundRefresh?: boolean;
}

export function useRealtimeUpdates({ 
  queryKeys, 
  interval = 4000, 
  backgroundRefresh = true 
}: UseRealtimeUpdatesOptions) {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh multiple query keys
  useEffect(() => {
    if (!isOnline) return;

    const intervalId = setInterval(() => {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      setLastUpdateTime(new Date());
    }, interval);

    return () => clearInterval(intervalId);
  }, [queryClient, queryKeys, interval, isOnline]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (isOnline) {
        queryKeys.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
        setLastUpdateTime(new Date());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient, queryKeys, isOnline]);

  // Manual refresh function
  const refreshAll = () => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
    setLastUpdateTime(new Date());
  };

  return {
    isOnline,
    lastUpdateTime,
    refreshAll
  };
}