import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminUsers() {
  const { sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!sessionId,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
  });

  const { data: plans = [] } = useQuery<any[]>({
    queryKey: ['/api/plans'],
    enabled: !!sessionId
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, status, planId }: { userId: number; status: string; planId?: number }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}/subscription`, { status, planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription-status'] });
      toast({
        title: "Success",
        description: "User subscription status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription status",
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

    const endDate = new Date(user.subscription.endDate);
    const currentDate = new Date();
    const isExpired = currentDate > endDate;
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
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
    if (isExpired && user.subscription.status === 'active') {
      statusDisplay = 'Expired';
      colorClass = 'bg-red-100 text-red-800';
      displayDaysLeft = 0;
    }

    return {
      status: statusDisplay,
      color: colorClass,
      plan: user.subscription.plan?.name || 'Unknown',
      daysLeft: displayDaysLeft,
      rawStatus: user.subscription.status
    };
  };

  const handleStatusChange = (userId: number, newStatus: string, planId?: number) => {
    updateSubscriptionMutation.mutate({ userId, status: newStatus, planId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalUsers = users.length;
  const activeSubscriptions = users.filter((user: any) => {
    const subscription = getSubscriptionStatus(user);
    return subscription.status === 'Active';
  }).length;
  const totalRevenue = users
    .filter((user: any) => user.subscription && user.subscription.plan)
    .reduce((sum: number, user: any) => sum + parseFloat(user.subscription.plan.price || '0'), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">
            View and manage all registered users and their subscription status.
          </p>
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
            {users.length === 0 ? (
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
                    {users.map((user: any) => {
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
                                <Select 
                                  value={subscriptionInfo.rawStatus} 
                                  onValueChange={(value) => {
                                    if (value !== "active") {
                                      handleStatusChange(user.id, value);
                                    }
                                  }}
                                  disabled={updateSubscriptionMutation.isPending}
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="trial">Free Trial</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {/* Active Plan Selection */}
                                <Select 
                                  onValueChange={(planId) => {
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
      </div>
    </div>
  );
}