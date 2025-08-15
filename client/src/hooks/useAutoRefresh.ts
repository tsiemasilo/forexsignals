import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  queryKey: string | string[];
  interval?: number; // milliseconds, default 5000 (5 seconds)
  enabled?: boolean;
}

export function useAutoRefresh({ 
  queryKey, 
  interval = 5000, 
  enabled = true 
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Set up auto refresh
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey]
      });
    }, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient, queryKey, interval, enabled]);

  // Manual refresh function
  const refresh = () => {
    queryClient.invalidateQueries({ 
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey]
    });
  };

  return { refresh };
}