import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { sessionId } = useAuth();

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!sessionId,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['/api/signals'],
    enabled: !!sessionId,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
  });

  const totalUsers = users.length;
  const activeSubscriptions = users.filter((user: any) => 
    user.subscription && user.subscription.status === 'active'
  ).length;
  const totalSignals = signals.length;
  const recentSignals = signals.slice(0, 3);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered customers",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions,
      description: "Current subscribers",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Signals",
      value: totalSignals,
      description: "Published signals",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Conversion Rate",
      value: totalUsers > 0 ? `${Math.round((activeSubscriptions / totalUsers) * 100)}%` : "0%",
      description: "Users to subscribers",
      icon: Activity,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor your forex signals platform performance and manage users.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Signals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signals</CardTitle>
              <CardDescription>
                Latest trading signals published
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSignals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No signals published yet</p>
              ) : (
                <div className="space-y-4">
                  {recentSignals.map((signal: any) => (
                    <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{signal.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(signal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        signal.tradeAction === 'Buy' ? 'bg-green-100 text-green-800' :
                        signal.tradeAction === 'Sell' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {signal.tradeAction}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Newly registered customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users registered yet</p>
              ) : (
                <div className="space-y-4">
                  {users.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscription && user.subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription && user.subscription.status === 'active' ? 'Active' : 'Free'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}