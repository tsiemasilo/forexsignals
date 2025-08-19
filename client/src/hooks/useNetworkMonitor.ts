import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface APIEndpoint {
  url: string;
  method: string;
  status: 'healthy' | 'slow' | 'error' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
}

export const useNetworkMonitor = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine
  });
  
  const [apiHealth, setApiHealth] = useState<APIEndpoint[]>([
    { url: '/api/signals', method: 'GET', status: 'unknown', lastCheck: new Date(), responseTime: 0, errorCount: 0 },
    { url: '/api/plans', method: 'GET', status: 'unknown', lastCheck: new Date(), responseTime: 0, errorCount: 0 },
    { url: '/api/user/subscription-status', method: 'GET', status: 'unknown', lastCheck: new Date(), responseTime: 0, errorCount: 0 },
    { url: '/api/admin/users', method: 'GET', status: 'unknown', lastCheck: new Date(), responseTime: 0, errorCount: 0 }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    setNetworkStatus({
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData
    });
  }, []);

  // Check API endpoint health
  const checkEndpointHealth = useCallback(async (endpoint: APIEndpoint): Promise<APIEndpoint> => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      let status: APIEndpoint['status'] = 'healthy';
      if (responseTime > 3000) status = 'slow';
      if (!response.ok) status = 'error';
      
      return {
        ...endpoint,
        status,
        lastCheck: new Date(),
        responseTime,
        errorCount: response.ok ? 0 : endpoint.errorCount + 1
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        ...endpoint,
        status: 'error',
        lastCheck: new Date(),
        responseTime,
        errorCount: endpoint.errorCount + 1
      };
    }
  }, []);

  // Monitor all API endpoints
  const monitorAPIs = useCallback(async () => {
    if (!isMonitoring || !networkStatus.isOnline) return;
    
    const updatedEndpoints = await Promise.all(
      apiHealth.map(endpoint => checkEndpointHealth(endpoint))
    );
    
    setApiHealth(updatedEndpoints);
  }, [apiHealth, checkEndpointHealth, isMonitoring, networkStatus.isOnline]);

  // Get overall system health
  const getSystemHealth = useCallback(() => {
    if (!networkStatus.isOnline) return 'offline';
    
    const errorEndpoints = apiHealth.filter(ep => ep.status === 'error').length;
    const slowEndpoints = apiHealth.filter(ep => ep.status === 'slow').length;
    
    if (errorEndpoints > 0) return 'critical';
    if (slowEndpoints > 1) return 'degraded';
    if (slowEndpoints === 1) return 'slow';
    
    return 'healthy';
  }, [networkStatus.isOnline, apiHealth]);

  // Auto-fix network issues
  const autoFixNetworkIssues = useCallback(async () => {
    const systemHealth = getSystemHealth();
    
    if (systemHealth === 'offline') {
      console.log('Network offline - waiting for connection...');
      return false;
    }
    
    if (systemHealth === 'critical') {
      // Try to reload failed endpoints
      const failedEndpoints = apiHealth.filter(ep => ep.status === 'error');
      
      for (const endpoint of failedEndpoints) {
        try {
          console.log(`Attempting to fix endpoint: ${endpoint.url}`);
          await checkEndpointHealth(endpoint);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between retries
        } catch (error) {
          console.error(`Failed to fix endpoint ${endpoint.url}:`, error);
        }
      }
      
      return true;
    }
    
    return false;
  }, [getSystemHealth, apiHealth, checkEndpointHealth]);

  // Generate health report
  const generateHealthReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      network: networkStatus,
      systemHealth: getSystemHealth(),
      apiEndpoints: apiHealth.map(ep => ({
        url: ep.url,
        status: ep.status,
        responseTime: ep.responseTime,
        errorCount: ep.errorCount,
        lastCheck: ep.lastCheck.toISOString()
      })),
      summary: {
        totalEndpoints: apiHealth.length,
        healthyEndpoints: apiHealth.filter(ep => ep.status === 'healthy').length,
        slowEndpoints: apiHealth.filter(ep => ep.status === 'slow').length,
        errorEndpoints: apiHealth.filter(ep => ep.status === 'error').length,
        averageResponseTime: apiHealth.reduce((sum, ep) => sum + ep.responseTime, 0) / apiHealth.length
      }
    };
    
    return report;
  }, [networkStatus, getSystemHealth, apiHealth]);

  // Setup event listeners
  useEffect(() => {
    const handleOnline = () => {
      updateNetworkStatus();
      console.log('Network connection restored');
    };
    
    const handleOffline = () => {
      updateNetworkStatus();
      console.log('Network connection lost');
    };
    
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }
    
    // Initial status update
    updateNetworkStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus]);

  // Monitor APIs periodically
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(monitorAPIs, 30000); // Check every 30 seconds
    
    // Initial check
    monitorAPIs();
    
    return () => clearInterval(interval);
  }, [monitorAPIs, isMonitoring]);

  return {
    networkStatus,
    apiHealth,
    systemHealth: getSystemHealth(),
    isMonitoring,
    setIsMonitoring,
    checkEndpointHealth,
    autoFixNetworkIssues,
    generateHealthReport,
    monitorAPIs
  };
};