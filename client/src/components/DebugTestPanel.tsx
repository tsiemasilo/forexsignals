import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bug, 
  TestTube,
  AlertTriangle,
  Network,
  Server,
  Database
} from 'lucide-react';

const DebugTestPanel: React.FC = () => {
  // Test functions to trigger different types of errors
  const triggerMalformedUrlError = () => {
    console.log('🧪 Testing malformed URL error...');
    // Simulate the exact error pattern from your logs
    fetch('/api/admin/users/29/subscription:1')
      .catch(error => console.error('Malformed URL test error:', error));
  };

  const triggerNetworkError = () => {
    console.log('🧪 Testing network error...');
    fetch('https://nonexistent-domain-12345.com/api/test')
      .catch(error => console.error('Network test error:', error));
  };

  const triggerAuthError = () => {
    console.log('🧪 Testing authentication error...');
    console.error('Authentication required');
  };

  const trigger404Error = () => {
    console.log('🧪 Testing 404 error...');
    fetch('/api/nonexistent-endpoint')
      .catch(error => console.error('404 test error:', error));
  };

  const triggerConsoleError = () => {
    console.log('🧪 Testing console error...');
    console.error('Test console error message');
  };

  const triggerUnhandledError = () => {
    console.log('🧪 Testing unhandled error...');
    setTimeout(() => {
      throw new Error('Test unhandled error');
    }, 100);
  };

  const triggerPromiseRejection = () => {
    console.log('🧪 Testing promise rejection...');
    Promise.reject(new Error('Test promise rejection'));
  };

  const triggerApiError = () => {
    console.log('🧪 Testing API error...');
    fetch('/api/admin/users/999999')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
      })
      .catch(error => console.error('API test error:', error));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Debug System Test Panel
        </CardTitle>
        <CardDescription>
          Test the console debugging system by triggering different error types
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-300">Testing Environment</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            These buttons will intentionally trigger errors to test the debugging system.
            Check the System Health tab to see how errors are detected and categorized.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Malformed URL Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerMalformedUrlError}
              variant="destructive"
              className="w-full"
            >
              <Bug className="w-4 h-4 mr-2" />
              Malformed URL
            </Button>
            <p className="text-xs text-gray-600">
              Tests detection of URLs with colon patterns
            </p>
          </div>

          {/* Network Error Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerNetworkError}
              variant="destructive"
              className="w-full"
            >
              <Network className="w-4 h-4 mr-2" />
              Network Error
            </Button>
            <p className="text-xs text-gray-600">
              Tests network connectivity issues
            </p>
          </div>

          {/* Auth Error Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerAuthError}
              variant="destructive"
              className="w-full"
            >
              <Server className="w-4 h-4 mr-2" />
              Auth Error
            </Button>
            <p className="text-xs text-gray-600">
              Tests authentication error detection
            </p>
          </div>

          {/* 404 Error Test */}
          <div className="space-y-2">
            <Button 
              onClick={trigger404Error}
              variant="destructive"
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              404 Error
            </Button>
            <p className="text-xs text-gray-600">
              Tests API endpoint not found errors
            </p>
          </div>

          {/* Console Error Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerConsoleError}
              variant="destructive"
              className="w-full"
            >
              <Bug className="w-4 h-4 mr-2" />
              Console Error
            </Button>
            <p className="text-xs text-gray-600">
              Tests console.error() detection
            </p>
          </div>

          {/* Unhandled Error Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerUnhandledError}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Unhandled Error
            </Button>
            <p className="text-xs text-gray-600">
              Tests unhandled JavaScript errors
            </p>
          </div>

          {/* Promise Rejection Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerPromiseRejection}
              variant="destructive"
              className="w-full"
            >
              <Network className="w-4 h-4 mr-2" />
              Promise Rejection
            </Button>
            <p className="text-xs text-gray-600">
              Tests unhandled promise rejections
            </p>
          </div>

          {/* API Error Test */}
          <div className="space-y-2">
            <Button 
              onClick={triggerApiError}
              variant="destructive"
              className="w-full"
            >
              <Server className="w-4 h-4 mr-2" />
              API Error
            </Button>
            <p className="text-xs text-gray-600">
              Tests general API error handling
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to Test:</h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Click any error test button above</li>
            <li>2. Switch to the "Console Logs" tab</li>
            <li>3. Check if the error appears in the logs</li>
            <li>4. Look for auto-fix suggestions and severity levels</li>
            <li>5. Test the auto-fix functionality if available</li>
          </ol>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge variant="secondary">Status Categories</Badge>
          <Badge variant="outline" className="text-green-600">API</Badge>
          <Badge variant="outline" className="text-blue-600">Auth</Badge>
          <Badge variant="outline" className="text-orange-600">Network</Badge>
          <Badge variant="outline" className="text-purple-600">General</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugTestPanel;