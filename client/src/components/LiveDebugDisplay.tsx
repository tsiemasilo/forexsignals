import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Bug,
  Zap,
  Timer,
  Database,
  Server
} from 'lucide-react';

interface DebugLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  category: string;
}

interface SystemStatus {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'critical';
  database: {
    status: string;
    response_time: number;
  };
  api_endpoints: Array<{
    url: string;
    status: string;
    response_time: number;
  }>;
  errors: string[];
}

const LiveDebugDisplay: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoFixing, setAutoFixing] = useState(false);

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/debug/system-status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  // Fetch debug logs
  const fetchDebugLogs = async () => {
    try {
      const response = await fetch('/api/debug/logs');
      if (response.ok) {
        const logs = await response.json();
        setDebugLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch debug logs:', error);
    }
  };

  // Auto-fix system issues
  const runAutoFix = async () => {
    setAutoFixing(true);
    try {
      const response = await fetch('/api/debug/auto-fix', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        console.log('Auto-fix completed:', result);
        
        // Add fix results to logs
        const fixLog: DebugLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Auto-fix applied: ${result.fixes_applied.join(', ')}`,
          category: 'system'
        };
        setDebugLogs(prev => [fixLog, ...prev].slice(0, 50));
        
        // Refresh system status
        await fetchSystemStatus();
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
    } finally {
      setAutoFixing(false);
    }
  };

  // Monitor system periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchDebugLogs();
    }, 10000); // Check every 10 seconds

    // Initial fetch
    fetchSystemStatus();
    fetchDebugLogs();

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Live System Monitoring
              </CardTitle>
              <CardDescription>
                Real-time system health and debugging information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={runAutoFix}
                disabled={autoFixing}
              >
                {autoFixing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Auto Fix
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {systemStatus && (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(systemStatus.overall_status)}
                  <div>
                    <h3 className="font-semibold">System Status</h3>
                    <p className={`text-sm ${getStatusColor(systemStatus.overall_status)}`}>
                      {systemStatus.overall_status.charAt(0).toUpperCase() + systemStatus.overall_status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="text-xs text-gray-500">
                    {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Critical Alerts */}
              {systemStatus.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertTitle className="text-red-700 dark:text-red-300">System Errors Detected</AlertTitle>
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {systemStatus.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Component Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database Status */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge 
                        variant={systemStatus.database.status === 'healthy' ? 'secondary' : 'destructive'}
                      >
                        {systemStatus.database.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="w-3 h-3" />
                      <span>{systemStatus.database.response_time}ms</span>
                    </div>
                  </CardContent>
                </Card>

                {/* API Health */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span className="font-medium">API Endpoints</span>
                      </div>
                      <Badge variant="secondary">
                        {systemStatus.api_endpoints.filter(ep => ep.status === 'healthy').length}/{systemStatus.api_endpoints.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {systemStatus.api_endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{endpoint.url}</span>
                          <div className="flex items-center gap-1">
                            <span className={getStatusColor(endpoint.status)}>
                              {endpoint.status}
                            </span>
                            <span className="text-gray-500">({endpoint.response_time}ms)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!systemStatus && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading system status...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Debug Logs
          </CardTitle>
          <CardDescription>
            Real-time debugging information and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            {debugLogs.length > 0 ? (
              <div className="space-y-2">
                {debugLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <div className="flex-shrink-0 mt-1">
                      {log.level === 'error' ? (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      ) : log.level === 'warn' ? (
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No debug logs available
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveDebugDisplay;