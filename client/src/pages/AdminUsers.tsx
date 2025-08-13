import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminUsers() {
  const { sessionId } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!sessionId,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
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
      return { status: 'None', color: 'bg-gray-100 text-gray-800', plan: 'Free' };
    }

    const isExpired = new Date() > new Date(user.subscription.endDate);
    
    if (isExpired) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', plan: user.subscription.plan?.name || 'Unknown' };
    }

    return {
      status: user.subscription.status === 'active' ? 'Active' : 'Inactive',
      color: user.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
      plan: user.subscription.plan?.name || 'Unknown'
    };
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
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
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
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Revenue</TableHead>
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
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <span className="font-medium">{subscriptionInfo.plan}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={subscriptionInfo.color}>
                              {subscriptionInfo.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.subscription ? formatDate(user.subscription.endDate) : '-'}
                          </TableCell>
                          <TableCell>
                            {user.subscription && user.subscription.plan ? 
                              `$${user.subscription.plan.price}` : '$0.00'
                            }
                          </TableCell>
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