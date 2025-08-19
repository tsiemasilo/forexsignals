import React, { useState } from 'react';
import { useConsoleDebugger } from '@/hooks/useConsoleDebugger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Bug, 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  Zap,
  Activity,
  Wifi,
  User,
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const ConsoleDebugPanel: React.FC = () => {
  const {
    logs,
    stats,
    isActive,
    autoFix,
    setIsActive,
    setAutoFix,
    clearLogs,
    exportLogs,
    autoFixIssue
  } = useConsoleDebugger();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Filter logs based on selected criteria
  const filteredLogs = logs.filter(log => {
    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;
    return true;
  });

  // Get icon for log level
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api': return <Activity className="w-4 h-4" />;
      case 'auth': return <User className="w-4 h-4" />;
      case 'network': return <Wifi className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'ui': return <Settings className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Console Debugger
            </CardTitle>
            <CardDescription>
              Real-time console monitoring and automatic problem detection
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.total_errors}</div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.api_errors}</div>
            <div className="text-sm text-gray-600">API Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.auth_errors}</div>
            <div className="text-sm text-gray-600">Auth Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical_errors}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
        </div>

        {/* Auto-fix toggle */}
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Auto-fix common issues</span>
          </div>
          <Switch checked={autoFix} onCheckedChange={setAutoFix} />
        </div>

        {/* Critical alerts */}
        {stats.critical_errors > 0 && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-700 dark:text-red-300">Critical Issues Detected</AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-400">
              {stats.critical_errors} critical error(s) found. Review and fix immediately.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Console Logs</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="fixes">Auto Fixes</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Categories</option>
                <option value="api">API</option>
                <option value="auth">Authentication</option>
                <option value="subscription">Subscription</option>
                <option value="payment">Payment</option>
                <option value="network">Network</option>
                <option value="ui">UI</option>
                <option value="general">General</option>
              </select>

              <select 
                value={selectedSeverity} 
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Logs list */}
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {isActive ? 'No logs to display' : 'Console monitoring is paused'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          {getLogIcon(log.level)}
                          {getCategoryIcon(log.category)}
                          <Badge variant="outline" className="text-xs">
                            {log.category}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(log.severity)}`} />
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          {log.auto_fixable && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        {log.auto_fixable && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => autoFixIssue(log)}
                            className="text-xs"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Fix
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                        {log.message}
                      </div>
                      
                      {log.suggested_fix && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                          <strong>Suggested Fix:</strong> {log.suggested_fix}
                        </div>
                      )}
                      
                      {log.stack && (
                        <details className="text-xs text-gray-500 mt-2">
                          <summary className="cursor-pointer">Stack trace</summary>
                          <pre className="mt-1 whitespace-pre-wrap">{log.stack}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Error Pattern Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.common_issues.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Most Common Issues:</h4>
                      {stats.common_issues.map((issue, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          {issue}...
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recurring issues detected</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <Badge variant={stats.total_errors > 10 ? "destructive" : "secondary"}>
                        {stats.total_errors > 10 ? "High" : "Normal"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>API Health:</span>
                      <Badge variant={stats.api_errors > 5 ? "destructive" : "secondary"}>
                        {stats.api_errors > 5 ? "Issues Detected" : "Healthy"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Auth Status:</span>
                      <Badge variant={stats.auth_errors > 2 ? "destructive" : "secondary"}>
                        {stats.auth_errors > 2 ? "Auth Problems" : "Stable"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fixes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Auto-fixes</CardTitle>
                <CardDescription>
                  Issues that can be automatically resolved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Authentication Issues</h4>
                      <p className="text-sm text-gray-600">Clear session and redirect to login</p>
                    </div>
                    <Badge variant="secondary">Auto-fixable</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">API Server Errors</h4>
                      <p className="text-sm text-gray-600">Retry with exponential backoff</p>
                    </div>
                    <Badge variant="secondary">Auto-fixable</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Network Connectivity</h4>
                      <p className="text-sm text-gray-600">Implement retry mechanism</p>
                    </div>
                    <Badge variant="secondary">Auto-fixable</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Subscription Status</h4>
                      <p className="text-sm text-gray-600">Refresh from server</p>
                    </div>
                    <Badge variant="secondary">Auto-fixable</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConsoleDebugPanel;