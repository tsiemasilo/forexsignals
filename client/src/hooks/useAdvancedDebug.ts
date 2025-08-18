import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface DebugState {
  cacheUpdateCount: number;
  lastCacheUpdate: string;
  queryInvalidationCount: number;
  subscriptionChanges: Array<{
    userId: number;
    timestamp: string;
    oldData: any;
    newData: any;
    planChange: boolean;
  }>;
  daysCalculationHistory: Array<{
    userId: number;
    timestamp: string;
    calculatedDays: number;
    backendDays: number;
    planId: number;
    planName: string;
    method: string;
  }>;
}

export function useAdvancedDebug(users: any[], plans: any[]) {
  const queryClient = useQueryClient();
  const [debugState, setDebugState] = useState<DebugState>({
    cacheUpdateCount: 0,
    lastCacheUpdate: '',
    queryInvalidationCount: 0,
    subscriptionChanges: [],
    daysCalculationHistory: []
  });
  
  const previousUsersRef = useRef<any[]>([]);
  const debugInterval = useRef<NodeJS.Timeout>();

  // Track cache updates and user changes
  useEffect(() => {
    const currentUsers = Array.isArray(users) ? users : [];
    const previousUsers = previousUsersRef.current;

    if (currentUsers.length > 0 && previousUsers.length > 0) {
      // Detect subscription changes
      const changes = currentUsers.map(currentUser => {
        const previousUser = previousUsers.find(p => p.id === currentUser.id);
        if (previousUser && previousUser.subscription && currentUser.subscription) {
          const planChanged = previousUser.subscription.planId !== currentUser.subscription.planId;
          const statusChanged = previousUser.subscription.status !== currentUser.subscription.status;
          
          if (planChanged || statusChanged) {
            return {
              userId: currentUser.id,
              timestamp: new Date().toISOString(),
              oldData: previousUser.subscription,
              newData: currentUser.subscription,
              planChange: planChanged
            };
          }
        }
        return null;
      }).filter(Boolean);

      if (changes.length > 0) {
        const validChanges = changes.filter((change): change is NonNullable<typeof change> => change !== null);
        setDebugState(prev => ({
          ...prev,
          subscriptionChanges: [...prev.subscriptionChanges.slice(-10), ...validChanges],
          cacheUpdateCount: prev.cacheUpdateCount + 1,
          lastCacheUpdate: new Date().toISOString()
        }));

        console.group('🔍 SUBSCRIPTION CHANGES DETECTED');
        changes.forEach(change => {
          console.log('User ID:', change?.userId);
          console.log('Old Plan:', change?.oldData.planName, 'Duration:', change?.oldData.duration);
          console.log('New Plan:', change?.newData.planName, 'Duration:', change?.newData.duration);
          console.log('Plan Changed:', change?.planChange);
        });
        console.groupEnd();
      }
    }

    // Track days calculations for all users
    const daysCalculations = currentUsers.map(user => {
      if (user.subscription) {
        const endDate = new Date(user.subscription.endDate);
        const currentDate = new Date();
        const calculatedDays = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        return {
          userId: user.id,
          timestamp: new Date().toISOString(),
          calculatedDays,
          backendDays: user.subscription.duration,
          planId: user.subscription.planId,
          planName: user.subscription.planName,
          method: 'endDate_calculation'
        };
      }
      return null;
    }).filter(Boolean);

    if (daysCalculations.length > 0) {
      const validCalculations = daysCalculations.filter((calc): calc is NonNullable<typeof calc> => calc !== null);
      setDebugState(prev => ({
        ...prev,
        daysCalculationHistory: [...prev.daysCalculationHistory.slice(-50), ...validCalculations]
      }));
    }

    previousUsersRef.current = currentUsers;
  }, [users]);

  // Real-time debugging interval
  useEffect(() => {
    debugInterval.current = setInterval(() => {
      if (Array.isArray(users) && users.length > 0) {
        console.group('🔬 REAL-TIME DEBUG SNAPSHOT');
        console.log('Cache State:', {
          totalUsers: users.length,
          updateCount: debugState.cacheUpdateCount,
          lastUpdate: debugState.lastCacheUpdate
        });
        
        // Check for calculation discrepancies
        users.forEach(user => {
          if (user.subscription) {
            const endDate = new Date(user.subscription.endDate);
            const currentDate = new Date();
            const realTimeDays = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
            const backendDuration = user.subscription.duration;
            
            if (Math.abs(realTimeDays - backendDuration) > 1) {
              console.warn('DISCREPANCY DETECTED:', {
                userId: user.id,
                email: user.email,
                realTimeDays,
                backendDuration,
                difference: realTimeDays - backendDuration,
                endDate: user.subscription.endDate,
                planName: user.subscription.planName
              });
            }
          }
        });
        console.groupEnd();
      }
    }, 5000); // Every 5 seconds

    return () => {
      if (debugInterval.current) {
        clearInterval(debugInterval.current);
      }
    };
  }, [users, debugState]);

  // Monitor query client cache
  useEffect(() => {
    const handleCacheChange = () => {
      setDebugState(prev => ({
        ...prev,
        queryInvalidationCount: prev.queryInvalidationCount + 1
      }));
    };

    // Listen for cache updates through the query client's mount/unmount
    const unsubscribe = queryClient.getQueryCache().subscribe(handleCacheChange);

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return {
    debugState,
    resetDebugState: () => setDebugState({
      cacheUpdateCount: 0,
      lastCacheUpdate: '',
      queryInvalidationCount: 0,
      subscriptionChanges: [],
      daysCalculationHistory: []
    })
  };
}