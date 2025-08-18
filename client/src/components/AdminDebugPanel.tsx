import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionTester, adminTestUtils } from '@/utils/subscriptionTestSuite';

interface DebugPanelProps {
  users: any[];
  plans: any[];
}

export function AdminDebugPanel({ users, plans }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Real-time data fetching
  const { data: liveUserData } = useQuery({
    queryKey: ['/api/admin/users'],
    refetchInterval: 2000,
    enabled: isVisible
  });

  const { data: debugApiData } = useQuery({
    queryKey: ['/api/admin/debug'],
    refetchInterval: 5000,
    enabled: isVisible
  });

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Auto-generate test results when users change
  useEffect(() => {
    if (users.length > 0 && plans.length > 0) {
      const report = SubscriptionTester.generateTestReport(users, plans);
      setTestResults(report);
      
      // Log comprehensive debugging to console
      console.group('🔧 SUBSCRIPTION DEBUG SUITE');
      console.log('Test Report:', report);
      adminTestUtils.logAllUsers(users);
      users.forEach(user => adminTestUtils.testDaysCalculation(user, plans));
      console.groupEnd();
    }
  }, [users, plans]);

  const runLiveTest = async () => {
    if (!selectedUserId) return;
    
    setIsRunningTest(true);
    try {
      // Test changing to different plans
      const basicTest = await SubscriptionTester.testSubscriptionChange(selectedUserId, 1);
      const premiumTest = await SubscriptionTester.testSubscriptionChange(selectedUserId, 2);
      const vipTest = await SubscriptionTester.testSubscriptionChange(selectedUserId, 3);
      
      console.group('🧪 LIVE SUBSCRIPTION TESTS');
      console.log('Basic Plan Test:', basicTest);
      console.log('Premium Plan Test:', premiumTest);
      console.log('VIP Plan Test:', vipTest);
      console.groupEnd();
      
      setTestResults({
        ...testResults,
        liveTests: { basicTest, premiumTest, vipTest }
      });
    } catch (error) {
      console.error('Live test failed:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const calculateDaysDebug = (user: any) => {
    if (!user?.subscription) return null;

    const now = new Date();
    const startDate = new Date(user.subscription.startDate);
    const endDate = new Date(user.subscription.endDate);
    
    const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentDate: now.toISOString(),
      totalDuration,
      daysElapsed,
      daysRemaining,
      isExpired: now > endDate,
      planName: user.subscription.planName,
      status: user.subscription.status,
      backendDuration: user.subscription.duration
    };
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          🔧 Debug Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-blue-700">Advanced Debug Panel</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* User Selection */}
          <div>
            <label className="font-medium">Test User:</label>
            <select 
              value={selectedUserId || ''} 
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="w-full mt-1 p-1 border rounded text-xs"
            >
              <option value="">Select user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email} (ID: {user.id})
                </option>
              ))}
            </select>
          </div>

          {/* Selected User Debug */}
          {selectedUser && (
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-blue-700 mb-1">
                User {selectedUser.id}: {selectedUser.email}
              </div>
              
              {selectedUser.subscription ? (
                <div className="space-y-1">
                  <div>Plan: <Badge variant="outline">{selectedUser.subscription.planName}</Badge></div>
                  <div>Status: <Badge variant="outline">{selectedUser.subscription.status}</Badge></div>
                  
                  {(() => {
                    const debug = calculateDaysDebug(selectedUser);
                    return debug ? (
                      <div className="bg-white p-2 rounded border text-xs">
                        <div className="grid grid-cols-2 gap-1">
                          <div>Backend Duration: {debug.backendDuration}d</div>
                          <div>Calculated Total: {debug.totalDuration}d</div>
                          <div>Days Elapsed: {debug.daysElapsed}</div>
                          <div className="font-bold text-green-600">Days Remaining: {debug.daysRemaining}</div>
                          <div>Is Expired: {debug.isExpired ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="mt-2 text-xs">
                          <div>Start: {new Date(debug.startDate).toLocaleDateString()}</div>
                          <div>End: {new Date(debug.endDate).toLocaleDateString()}</div>
                          <div>Now: {new Date(debug.currentDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="text-gray-500">No subscription</div>
              )}
            </div>
          )}

          {/* Plans Data */}
          <div>
            <div className="font-medium text-blue-700">Available Plans:</div>
            <div className="space-y-1">
              {plans.map(plan => (
                <div key={plan.id} className="flex justify-between">
                  <span>{plan.name}</span>
                  <Badge variant="outline">{plan.duration}d</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Live Data Comparison */}
          {liveUserData && Array.isArray(liveUserData) && (
            <div>
              <div className="font-medium text-blue-700">Live Data Status:</div>
              <div className="text-xs">
                Users: {liveUserData.length} | 
                Last Update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults && (
            <div>
              <div className="font-medium text-blue-700">Test Results:</div>
              <div className="text-xs bg-white p-2 rounded border">
                <div className="text-green-600">Passed: {testResults.passedTests}</div>
                <div className="text-red-600">Failed: {testResults.failedTests?.length || 0}</div>
                <div>{testResults.summary}</div>
              </div>
            </div>
          )}

          {/* Live Testing */}
          <div>
            <Button 
              onClick={runLiveTest}
              disabled={!selectedUserId || isRunningTest}
              size="sm"
              className="w-full text-xs"
            >
              {isRunningTest ? '🧪 Testing...' : '🧪 Run Live Tests'}
            </Button>
          </div>

          {/* API Debug Info */}
          {debugApiData && typeof debugApiData === 'object' && 'totalUsers' in debugApiData && (
            <div>
              <div className="font-medium text-blue-700">Backend Debug:</div>
              <div className="text-xs">
                Total Users: {(debugApiData as any).totalUsers} |
                Active: {(debugApiData as any).totalSubscriptions}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}