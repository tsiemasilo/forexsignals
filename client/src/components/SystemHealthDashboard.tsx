import React, { useState } from 'react';
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor';
import { useConsoleDebugger } from '@/hooks/useConsoleDebugger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Wifi, 
  WifiOff,
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Download,
  RefreshCw,
  Shield
} from 'lucide-react';
import ConsoleDebugPanel from './ConsoleDebugPanel';
import DebugTestPanel from './DebugTestPanel';

const SystemHealthDashboard: React.FC = () => {
  const {
    networkStatus,
    apiHealth,
    systemHealth,
    isMonitoring,
    setIsMonitoring,
    autoFixNetworkIssues,
    generateHealthReport,
    monitorAPIs
  } = useNetworkMonitor();

  const { stats: debugStats } = useConsoleDebugger();
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);

  // Get health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'slow': return 'text-yellow-500';
      case 'degraded': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  // Get health icon
  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'slow': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'offline': return <WifiOff className="w-5 h-5 text-gray-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  // Export health report
  const exportReport = () => {
    const report = generateHealthReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-health-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-fix system issues
  const runAutoFix = async () => {
    setAutoFixEnabled(true);
    try {
      await autoFixNetworkIssues();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await monitorAPIs();
    } catch (error) {
      console.error('Auto-fix failed:', error);
    } finally {
      setAutoFixEnabled(false);
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
                <Shield className="w-5 h-5" />
                System Health Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of application health and performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={runAutoFix}
                disabled={autoFixEnabled}
              >
                {autoFixEnabled ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Auto Fix
              </Button>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Overall Health Status */}
          <div className="flex items-center justify-between mb-6 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getHealthIcon(systemHealth)}
              <div>
                <h3 className="font-semibold">System Status</h3>
                <p className={`text-sm ${getHealthColor(systemHealth)}`}>
                  {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Monitoring:</span>
              <Switch checked={isMonitoring} onCheckedChange={setIsMonitoring} />
            </div>
          </div>

          {/* Network Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {networkStatus.isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">Network</span>
                </div>
                <p className="text-sm text-gray-600">
                  {networkStatus.isOnline ? 'Online' : 'Offline'}
                </p>
                {networkStatus.effectiveType && (
                  <p className="text-xs text-gray-500">
                    {networkStatus.effectiveType.toUpperCase()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">API Health</span>
                </div>
                <p className="text-sm text-gray-600">
                  {apiHealth.filter(ep => ep.status === 'healthy').length}/{apiHealth.length} Healthy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Errors</span>
                </div>
                <p className="text-sm text-gray-600">
                  {debugStats.total_errors} Total
                </p>
                <p className="text-xs text-gray-500">
                  {debugStats.critical_errors} Critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Response Time</span>
                </div>
                <p className="text-sm text-gray-600">
                  {Math.round(apiHealth.reduce((sum, ep) => sum + ep.responseTime, 0) / apiHealth.length)}ms
                </p>
                <p className="text-xs text-gray-500">Average</p>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {systemHealth === 'critical' && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-700 dark:text-red-300">System Issues Detected</AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-400">
                Critical issues found. Some features may not work properly. Consider running auto-fix.
              </AlertDescription>
            </Alert>
          )}

          {!networkStatus.isOnline && (
            <Alert className="mb-4 border-gray-200 bg-gray-50 dark:bg-gray-950">
              <WifiOff className="h-4 w-4 text-gray-500" />
              <AlertTitle className="text-gray-700 dark:text-gray-300">Network Offline</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-400">
                No internet connection detected. Some features may be limited.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="console">Console Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="testing">Error Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Health</CardTitle>
              <CardDescription>
                Status and performance of critical API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiHealth.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{endpoint.url}</p>
                        <p className="text-sm text-gray-600">{endpoint.method}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm">{endpoint.responseTime}ms</p>
                        <p className="text-xs text-gray-500">
                          {endpoint.lastCheck.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <Badge 
                        variant={endpoint.status === 'healthy' ? 'secondary' : 'destructive'}
                        className="capitalize"
                      >
                        {endpoint.status}
                      </Badge>
                      
                      {endpoint.errorCount > 0 && (
                        <Badge variant="outline" className="text-red-500">
                          {endpoint.errorCount} errors
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="console">
          <ConsoleDebugPanel />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                System performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Response Time</span>
                    <span>{Math.round(apiHealth.reduce((sum, ep) => sum + ep.responseTime, 0) / apiHealth.length)}ms</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (apiHealth.reduce((sum, ep) => sum + ep.responseTime, 0) / apiHealth.length) / 50)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Error Rate</span>
                    <span>{Math.round((debugStats.total_errors / (debugStats.total_errors + 50)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (debugStats.total_errors / (debugStats.total_errors + 50)) * 100)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>System Health</span>
                    <span>
                      {systemHealth === 'healthy' ? '100%' : 
                       systemHealth === 'slow' ? '75%' :
                       systemHealth === 'degraded' ? '50%' : 
                       systemHealth === 'critical' ? '25%' : '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      systemHealth === 'healthy' ? 100 : 
                      systemHealth === 'slow' ? 75 :
                      systemHealth === 'degraded' ? 50 : 
                      systemHealth === 'critical' ? 25 : 0
                    }
                    className="h-2"
                  />
                </div>

                {networkStatus.downlink && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Network Speed</span>
                      <span>{networkStatus.downlink} Mbps</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (networkStatus.downlink / 10) * 100)}
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <DebugTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;