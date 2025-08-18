import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
// Debugging imports temporarily commented out for deployment
// import { AdminDebugPanel } from '@/components/AdminDebugPanel';
// import { SubscriptionTester } from '@/utils/subscriptionTestSuite';
// import { useAdvancedDebug } from '@/hooks/useAdvancedDebug';
// import { LiveDebugDisplay } from '@/components/LiveDebugDisplay';

export default function AdminUsers() {
  // Ultra-aggressive cache invalidation system - Build ID: 20250818-v2.3
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user?.isAdmin,
    refetchInterval: 2000, // Fast refresh - every 2 seconds  
    staleTime: 0, // Always consider data stale to force fresh fetches
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on component mount
    refetchIntervalInBackground: true // Keep refreshing even when tab not focused
  });

  // Debug logging for users data
  console.log('🔍 ADMIN USERS DEBUG:', { 
    users, 
    userCount: Array.isArray(users) ? users.length : 0, 
    isLoading, 
    error,
    isAdminUser: user?.isAdmin,
    userId: user?.id
  });

  // Enhanced debugging query
  const { data: debugInfo } = useQuery<any>({
    queryKey: ['/api/admin/debug'],
    enabled: !!user?.isAdmin,
    refetchInterval: 10000, // Every 10 seconds
    staleTime: 0
  });

  console.log('🔍 ENHANCED DEBUG INFO:', debugInfo);

  const { data: plans = [] } = useQuery<any[]>({
    queryKey: ['/api/plans'],
    enabled: !!user?.isAdmin
  });

  // Advanced debugging hook temporarily disabled
  // const { debugState, resetDebugState } = useAdvancedDebug(users, plans);

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, status, planId }: { userId: number; status: string; planId?: number }) => {
      console.log('🔧 MUTATION CALLED:', { userId, status, planId });
      const response = await apiRequest(`/api/admin/users/${userId}/subscription`, { 
        method: 'PUT',
        body: JSON.stringify({ status, planId })
      });
      console.log('🔧 MUTATION RESPONSE:', response);
      return response;
    },
    onMutate: async ({ userId, status, planId }) => {
      console.log('🔧 MUTATION STARTING:', { userId, status, planId });
      
      // Show loading state 
      toast({
        title: "Processing...",
        description: `Updating subscription for user ${userId}...`,
      });
      
      return { userId, status, planId };
    },
    onSuccess: async (data, { userId, planId }) => {
      console.log('🔧 MUTATION SUCCESS - FORCING COMPLETE REFRESH:', data);
      
      // AGGRESSIVE CACHE INVALIDATION WITH FORCED REFRESH
      console.log('🔧 SUBSCRIPTION UPDATED - REFRESHING UI');
      
      // Clear all caches immediately
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.removeQueries({ queryKey: ['/api/admin/users'] });
      
      // Force immediate refetch
      setTimeout(async () => {
        await refetch();
      }, 200);
      
      // Force page reload to ensure UI updates
      setTimeout(() => {
        console.log('🔄 RELOADING PAGE TO SHOW UPDATED SUBSCRIPTION');
        window.location.reload();
      }, 1500);
      
      toast({
        title: "Success", 
        description: `Subscription updated to Plan ${planId}! Page will refresh to show changes.`,
      });
      
      // Display immediate feedback to user
      console.log(`✅ SUBSCRIPTION UPDATED: User ${userId} → Plan ${planId}`);
      console.log('🔄 AGGRESSIVE CACHE INVALIDATION ACTIVE - UI WILL UPDATE SHORTLY');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription status",
        variant: "destructive",
      });
    },
  });

  // Dedicated mutation for creating fresh trials
  const updateTrialMutation = useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      return await apiRequest(`/api/admin/users/${userId}/create-trial`, { 
        method: 'POST'
      });
    },
    onSuccess: () => {
      // Force immediate cache invalidation and refetch
      queryClient.removeQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription-status'] });
      toast({
        title: "Success",
        description: "7-day trial created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create trial",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionStatus = (user: any) => {
    if (!user.subscription) {
      return { 
        status: 'No Subscription', 
        color: 'bg-gray-100 text-gray-800', 
        plan: 'None',
        daysLeft: 0,
        rawStatus: 'none'
      };
    }

    // Advanced debugging with multiple calculation methods
    const startDate = new Date(user.subscription.startDate);
    const endDate = new Date(user.subscription.endDate);
    const currentDate = new Date();
    
    // Method 1: Use backend endDate (most accurate)
    const daysLeftMethod1 = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Method 2: Calculate from duration
    const backendDuration = user.subscription.duration || 14;
    const calculatedEndDate = new Date(startDate.getTime() + backendDuration * 24 * 60 * 60 * 1000);
    const daysLeftMethod2 = Math.max(0, Math.ceil((calculatedEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Method 3: Use plan lookup
    const plan = plans.find(p => p.id === user.subscription.planId);
    const planDuration = plan?.duration || 14;
    const planCalculatedEndDate = new Date(startDate.getTime() + planDuration * 24 * 60 * 60 * 1000);
    const daysLeftMethod3 = Math.max(0, Math.ceil((planCalculatedEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));

    console.log('🔧 ADVANCED DAYS CALCULATION DEBUG:', {
      userId: user.id,
      email: user.email,
      subscription: user.subscription,
      planName: user.subscription.planName,
      backendDuration: user.subscription.duration,
      foundPlan: plan,
      planDuration: plan?.duration,
      status: user.subscription.status,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentDate: currentDate.toISOString(),
      methods: {
        method1_backendEndDate: daysLeftMethod1,
        method2_backendDuration: daysLeftMethod2,
        method3_planLookup: daysLeftMethod3
      },
      timeDifferences: {
        startToNow: Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        startToBackendEnd: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        nowToBackendEnd: Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    });

    // Use the most accurate method (backend endDate)
    const daysLeft = daysLeftMethod1;
    
    let statusDisplay = '';
    let colorClass = '';
    let displayDaysLeft = daysLeft;
    
    switch (user.subscription.status) {
      case 'trial':
        statusDisplay = 'Free Trial';
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'active':
        statusDisplay = 'Active';
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'inactive':
        statusDisplay = 'Inactive';
        colorClass = 'bg-yellow-100 text-yellow-800';
        displayDaysLeft = 0; // Inactive subscriptions show 0 days
        break;
      case 'expired':
        statusDisplay = 'Expired';
        colorClass = 'bg-red-100 text-red-800';
        displayDaysLeft = 0; // Expired subscriptions show 0 days
        break;
      default:
        statusDisplay = 'Unknown';
        colorClass = 'bg-gray-100 text-gray-800';
        displayDaysLeft = 0;
    }

    // If the subscription is naturally expired based on date, override status
    const isExpired = currentDate > endDate;
    if (isExpired && user.subscription.status === 'active') {
      statusDisplay = 'Expired';
      colorClass = 'bg-red-100 text-red-800';
      displayDaysLeft = 0;
    }

    console.log('🔧 FINAL DAYS RESULT:', {
      userId: user.id,
      email: user.email,
      statusDisplay,
      planName: user.subscription.planName,
      displayDaysLeft,
      isExpired,
      endDate: endDate.toISOString(),
      currentDate: currentDate.toISOString()
    });

    return {
      status: statusDisplay,
      color: colorClass,
      plan: user.subscription.planName || 'Unknown',
      daysLeft: displayDaysLeft,
      rawStatus: user.subscription.status
    };
  };

  const handleStatusChange = (userId: number, newStatus: string, planId?: number) => {
    console.log('🔧 ADMIN FRONTEND: About to change subscription:', { userId, newStatus, planId });
    console.log('🔧 FRONTEND DEBUG: Available plans:', plans);
    console.log('🔧 FRONTEND DEBUG: Mutation pending:', updateSubscriptionMutation.isPending);
    
    // Run comprehensive test before mutation
    if (planId && Array.isArray(users)) {
      const targetUser = users.find((u: any) => u.id === userId);
      if (targetUser) {
        console.log('🧪 PRE-MUTATION: Target user found:', targetUser);
      }
    }
    
    updateSubscriptionMutation.mutate({ userId, status: newStatus, planId });
  };

  // New dedicated trial creation function
  const handleCreateTrial = (userId: number) => {
    console.log('🎯 ADMIN: Creating fresh 7-day trial for user:', userId);
    updateTrialMutation.mutate({ userId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeSubscriptions = Array.isArray(users) ? users.filter((user: any) => {
    const subscription = getSubscriptionStatus(user);
    return subscription.status === 'Active';
  }).length : 0;
  const totalRevenue = Array.isArray(users) ? users
    .filter((user: any) => user.subscription && user.subscription.plan)
    .reduce((sum: number, user: any) => sum + parseFloat(user.subscription.plan.price || '0'), 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-gray-600">
                View and manage all registered users and their subscription status.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline"
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Badge variant="outline" className="px-2 py-1">
                Live Updates: {new Date().toLocaleTimeString()}
              </Badge>
              <Badge variant="secondary" className="px-2 py-1">
                Auto-refresh: 1s
              </Badge>
            </div>
          </div>
        </div>

        {/* Cache Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Real-time Updates Active</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Users Loading:</span>
                <Badge variant={isLoading ? "default" : "outline"}>{isLoading ? "Yes" : "No"}</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Auto-refresh:</span>
                <Badge variant="secondary">Every 1s</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cache Clearing:</span>
                <Badge variant="destructive">Ultra-Aggressive</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {totalUsers > 0 ? `${Math.round((activeSubscriptions / totalUsers) * 100)}%` : '0%'} conversion rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From active subscriptions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Complete list of registered users and their subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!Array.isArray(users) || users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Manage Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(users) && users.map((user: any) => {
                      const subscriptionInfo = getSubscriptionStatus(user);
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">ID: {user.id}</p>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={subscriptionInfo.color}>
                              {subscriptionInfo.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{subscriptionInfo.plan}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              subscriptionInfo.status === 'Inactive' ? 'text-yellow-600' :
                              subscriptionInfo.status === 'Expired' ? 'text-red-600' :
                              subscriptionInfo.daysLeft <= 3 && subscriptionInfo.daysLeft > 0 ? 'text-red-600' : 
                              subscriptionInfo.daysLeft <= 7 && subscriptionInfo.daysLeft > 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {subscriptionInfo.status === 'No Subscription' ? '-' :
                               subscriptionInfo.status === 'Inactive' ? 'Inactive' :
                               subscriptionInfo.status === 'Expired' ? 'Expired' :
                               subscriptionInfo.daysLeft > 0 ? `${subscriptionInfo.daysLeft} days` : 'Expired'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.subscription ? formatDate(user.subscription.endDate) : '-'}
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <div className="space-y-2">
                                {/* Simple buttons instead of dropdown */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCreateTrial(user.id)}
                                    disabled={updateSubscriptionMutation.isPending}
                                    className="w-[130px] text-xs"
                                  >
                                    Create 7-Day Trial
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange(user.id, "inactive")}
                                    disabled={updateSubscriptionMutation.isPending}
                                    className="w-[130px] text-xs"
                                  >
                                    Set Inactive
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange(user.id, "expired")}
                                    disabled={updateSubscriptionMutation.isPending}
                                    className="w-[130px] text-xs"
                                  >
                                    Set Expired
                                  </Button>
                                </div>
                                
                                {/* Active Plan Selection */}
                                <Select 
                                  onValueChange={(planId) => {
                                    console.log('🔧 DROPDOWN SELECTED:', { planId, userId: user.id, planIdParsed: parseInt(planId) });
                                    handleStatusChange(user.id, "active", parseInt(planId));
                                  }}
                                  disabled={updateSubscriptionMutation.isPending}
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Set Active Plan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {plans.map((plan: any) => (
                                      <SelectItem key={plan.id} value={plan.id.toString()}>
                                        Active - {plan.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No subscription</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              🚀 Ultra-aggressive cache invalidation system active. Page will auto-refresh after subscription changes. Build: v2.3-20250818
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}