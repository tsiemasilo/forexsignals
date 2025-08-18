import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DebugState } from '@/hooks/useAdvancedDebug';

interface LiveDebugDisplayProps {
  debugState: DebugState;
  onReset: () => void;
  users: any[];
}

export function LiveDebugDisplay({ debugState, onReset, users }: LiveDebugDisplayProps) {
  const recentChanges = debugState.subscriptionChanges.slice(-3);
  const recentCalculations = debugState.daysCalculationHistory.slice(-5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Real-time Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Real-time Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Active Users:</span>
            <Badge variant="outline">{Array.isArray(users) ? users.length : 0}</Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Cache Updates:</span>
            <Badge variant="secondary">{debugState.cacheUpdateCount}</Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Query Invalidations:</span>
            <Badge variant="outline">{debugState.queryInvalidationCount}</Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Last Update:</span>
            <span className="text-xs text-gray-500">
              {debugState.lastCacheUpdate ? new Date(debugState.lastCacheUpdate).toLocaleTimeString() : 'None'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Subscription Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentChanges.length === 0 ? (
            <p className="text-xs text-gray-500">No recent changes</p>
          ) : (
            <div className="space-y-2">
              {recentChanges.map((change, index) => (
                <div key={index} className="text-xs border-l-2 border-blue-200 pl-2">
                  <div className="font-medium">User {change.userId}</div>
                  <div className="text-gray-600">
                    {change.oldData?.planName} → {change.newData?.planName}
                  </div>
                  <div className="text-gray-500">
                    {new Date(change.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Days Calculation Monitor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Days Calculation Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCalculations.length === 0 ? (
            <p className="text-xs text-gray-500">No calculations yet</p>
          ) : (
            <div className="space-y-2">
              {recentCalculations.map((calc, index) => (
                <div key={index} className="text-xs">
                  <div className="flex justify-between">
                    <span>User {calc.userId}</span>
                    <Badge 
                      variant={calc.calculatedDays === calc.backendDays ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {calc.calculatedDays}d
                    </Badge>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {calc.planName} ({calc.backendDays}d expected)
                  </div>
                  {calc.calculatedDays !== calc.backendDays && (
                    <div className="text-red-600 text-xs">
                      Discrepancy: {calc.calculatedDays - calc.backendDays}d
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Actions */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Debug Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onReset}>
              Reset Debug State
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.group('🔍 CURRENT DEBUG STATE');
                console.log('Full Debug State:', debugState);
                console.log('Active Users:', users);
                console.groupEnd();
              }}
            >
              Log Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}