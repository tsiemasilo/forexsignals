import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SystemHealthDashboard from "@/components/SystemHealthDashboard";
import { Users, Plus, TrendingUp, Settings, User, Calendar, Signal, Trash2, UserCheck, Shield } from "lucide-react";

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subscription?: {
    id: number;
    status: string;
    startDate: string;
    endDate: string;
    plan: {
      name: string;
      price: string;
    };
  };
}

interface ForexSignal {
  id: number;
  title: string;
  content: string;
  tradeAction: "Buy" | "Sell" | "Hold";
  imageUrl?: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("signals");
  const [newSignal, setNewSignal] = useState({
    title: "",
    content: "",
    tradeAction: "Buy" as "Buy" | "Sell" | "Hold",
    imageUrl: "",
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users"),
  });

  const { data: signals } = useQuery({
    queryKey: ["/api/admin/signals"],
    queryFn: () => apiRequest("/api/admin/signals"),
  });

  const createTrialMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/admin/users/${userId}/create-trial`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Trial created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trial",
        variant: "destructive",
      });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ userId, status, planName }: { userId: number; status: string; planName?: string }) => 
      apiRequest(`/api/admin/users/${userId}/subscription`, { 
        method: "PUT",
        body: JSON.stringify({ status, planName })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Subscription updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const createSignalMutation = useMutation({
    mutationFn: (signalData: typeof newSignal) => 
      apiRequest("/api/admin/signals", {
        method: "POST",
        body: JSON.stringify(signalData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/signals"] });
      setNewSignal({
        title: "",
        content: "",
        tradeAction: "Buy",
        imageUrl: "",
      });
      toast({
        title: "Success",
        description: "Signal created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create signal",
        variant: "destructive",
      });
    },
  });

  const deleteSignalMutation = useMutation({
    mutationFn: (signalId: number) => 
      apiRequest(`/api/admin/signals/${signalId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/signals"] });
      toast({
        title: "Success",
        description: "Signal deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete signal",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User account deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user account",
        variant: "destructive",
      });
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/admin/users/${userId}/promote`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User promoted to admin successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to promote user to admin",
        variant: "destructive",
      });
    },
  });

  const handleCreateTrial = (userId: number) => {
    createTrialMutation.mutate(userId);
  };

  const handleUpdateSubscription = (userId: number, status: string, planName?: string) => {
    updateSubscriptionMutation.mutate({ userId, status, planName });
  };

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignal.title || !newSignal.content) return;
    createSignalMutation.mutate(newSignal);
  };

  const handleDeleteSignal = (signalId: number) => {
    if (confirm("Are you sure you want to delete this signal? This action cannot be undone.")) {
      deleteSignalMutation.mutate(signalId);
    }
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}'s account? This will permanently delete their account and all associated data. This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handlePromoteUser = (userId: number, userName: string) => {
    if (confirm(`Are you sure you want to promote ${userName} to admin? They will have full administrative access to the system.`)) {
      promoteUserMutation.mutate(userId);
    }
  };

  const getStatusColor = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return "bg-gray-100 text-gray-800";
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const isExpired = endDate <= now;
    
    if (isExpired || subscription.status === 'expired') {
      return "bg-red-100 text-red-800";
    } else if (subscription.status === 'free trial') {
      return "bg-blue-100 text-blue-800";
    } else if (subscription.status === 'basic plan') {
      return "bg-green-100 text-green-800";
    } else if (subscription.status === 'premium plan') {
      return "bg-purple-100 text-purple-800";
    } else if (subscription.status === 'vip plan') {
      return "bg-amber-100 text-amber-800";
    } else if (subscription.status === 'trial' || subscription.status === 'active') {
      // Legacy status support
      return subscription.status === 'trial' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getStatusDisplay = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return "No Subscription";
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = endDate <= now;
    
    if (subscription.status === 'expired' || isExpired) {
      return "Expired";
    } else if (subscription.status === 'free trial') {
      return daysLeft > 0 ? `Trial (${daysLeft} days left)` : "Trial Expired";
    } else if (subscription.status === 'basic plan') {
      return daysLeft > 0 ? `Basic Plan (${daysLeft} days left)` : "Expired";
    } else if (subscription.status === 'premium plan') {
      return daysLeft > 0 ? `Premium Plan (${daysLeft} days left)` : "Expired";
    } else if (subscription.status === 'vip plan') {
      return daysLeft > 0 ? `VIP Plan (${daysLeft} days left)` : "Expired";
    } else if (subscription.status === 'trial') {
      // Legacy support
      return daysLeft > 0 ? `Trial (${daysLeft} days left)` : "Trial Expired";
    } else if (subscription.status === 'active') {
      // Legacy support
      const planName = subscription.plan?.name || 'Active';
      return daysLeft > 0 ? `${planName} (${daysLeft} days left)` : "Expired";
    } else {
      // Capitalize first letter of any other status
      const displayStatus = subscription.status.replace(/\b\w/g, l => l.toUpperCase());
      return daysLeft > 0 ? `${displayStatus} (${daysLeft} days left)` : "Expired";
    }
  };

  const getDaysRemaining = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return daysLeft;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <Badge className="bg-purple-100 text-purple-800 hidden sm:inline-flex">
                <Settings className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.firstName} {user?.lastName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="text-xs sm:text-sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-2 sm:py-6 px-2 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-8">
          {/* Stats Overview */}
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered customers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{signals?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Published signals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users?.filter((u: AdminUser) => {
                    if (!u.subscription) return false;
                    const now = new Date();
                    const endDate = new Date(u.subscription.endDate);
                    return endDate > now;
                  }).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Signals and User Management */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signals" className="flex items-center text-xs sm:text-sm">
                <Signal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Signals Management</span>
                <span className="sm:hidden">Signals</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="debugging" className="flex items-center text-xs sm:text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">System Health</span>
                <span className="sm:hidden">Health</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signals" className="space-y-6">
              {/* Create New Signal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Create New Signal</span>
                  </CardTitle>
                  <CardDescription>
                    Add a new forex trading signal for subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSignal} className="space-y-3 sm:space-y-4">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Signal Title</label>
                        <Input
                          placeholder="EUR/USD Buy Signal"
                          value={newSignal.title}
                          onChange={(e) => setNewSignal({ ...newSignal, title: e.target.value })}
                          required
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Trade Action</label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                          value={newSignal.tradeAction}
                          onChange={(e) => setNewSignal({ ...newSignal, tradeAction: e.target.value as "Buy" | "Sell" | "Hold" })}
                        >
                          <option value="Buy">Buy</option>
                          <option value="Sell">Sell</option>
                          <option value="Hold">Hold</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Signal Content</label>
                      <textarea
                        className="flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        placeholder="Strong bullish momentum on EUR/USD. Entry at 1.0850, Stop Loss at 1.0820, Take Profit at 1.0920..."
                        value={newSignal.content}
                        onChange={(e) => setNewSignal({ ...newSignal, content: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Image URL (Optional)</label>
                      <Input
                        placeholder="https://example.com/chart-image.png"
                        value={newSignal.imageUrl}
                        onChange={(e) => setNewSignal({ ...newSignal, imageUrl: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto" 
                      disabled={createSignalMutation.isPending}
                      size="sm"
                    >
                      {createSignalMutation.isPending ? "Creating..." : "Create Signal"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Signals */}
              <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {signals?.map((signal: ForexSignal) => (
                  <Card key={signal.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">{signal.title}</CardTitle>
                      <div className="flex items-center justify-between space-x-2">
                        <Badge className={`text-xs ${
                          signal.tradeAction === "Buy" ? "bg-green-100 text-green-800" :
                          signal.tradeAction === "Sell" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {signal.tradeAction}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(signal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {signal.imageUrl && (
                        <img
                          src={signal.imageUrl}
                          alt={signal.title}
                          className="w-full h-24 sm:h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-3">{signal.content}</p>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSignal(signal.id)}
                          disabled={deleteSignalMutation.isPending}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">{deleteSignalMutation.isPending ? "Deleting..." : "Delete"}</span>
                          <span className="sm:hidden">{deleteSignalMutation.isPending ? "..." : "Del"}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* User Management */}
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user subscriptions and create trials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {users?.map((user: AdminUser) => (
                      <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">{user.firstName} {user.lastName}</p>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <Badge className={`${getStatusColor(user.subscription)} text-xs`}>
                                {getStatusDisplay(user.subscription)}
                              </Badge>
                              {user.subscription && (
                                <Badge variant="outline" className="text-xs">
                                  {getDaysRemaining(user.subscription)} days left
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            onClick={() => handleCreateTrial(user.id)}
                            disabled={createTrialMutation.isPending}
                            className="w-full sm:w-auto text-xs"
                          >
                            Create Trial
                          </Button>
                          <select
                            className="h-8 rounded border border-input px-2 text-xs w-full sm:w-auto"
                            onChange={(e) => {
                              if (e.target.value) {
                                const [status, planName] = e.target.value.split('|');
                                handleUpdateSubscription(user.id, status, planName);
                                e.target.value = '';
                              }
                            }}
                            value=""
                          >
                            <option value="">Change Status</option>
                            <option value="active|Basic Plan">Basic Plan</option>
                            <option value="active|Premium Plan">Premium Plan</option>
                            <option value="active|VIP Plan">VIP Plan</option>
                            <option value="expired">Mark as Expired</option>
                          </select>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteUser(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={promoteUserMutation.isPending}
                              className="flex items-center space-x-1 flex-1 sm:flex-none text-xs"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span className="hidden sm:inline">Admin</span>
                              <span className="sm:hidden">Admin</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={deleteUserMutation.isPending}
                              className="flex items-center space-x-1 flex-1 sm:flex-none text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="hidden sm:inline">Delete</span>
                              <span className="sm:hidden">Del</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debugging" className="space-y-6">
              <SystemHealthDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}