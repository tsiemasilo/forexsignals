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
import { Users, Plus, TrendingUp, Settings, User, Calendar, Signal, Upload, X, Image } from "lucide-react";

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
  imageUrls?: string; // JSON string of base64 images - use existing field
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
  });
  const [signalImages, setSignalImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

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
    mutationFn: (signalData: typeof newSignal & { imageUrls?: string[] }) => 
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
      });
      setSignalImages([]);
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

  const handleCreateTrial = (userId: number) => {
    createTrialMutation.mutate(userId);
  };

  const handleUpdateSubscription = (userId: number, status: string, planName?: string) => {
    updateSubscriptionMutation.mutate({ userId, status, planName });
  };

  // New unlimited image upload system - no compression, no size limits
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    console.log('📸 Processing', files.length, 'image(s) with unlimited size support');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      
      console.log('✅ Processing image:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setSignalImages(prev => [...prev, base64]);
          console.log('✅ Image added - Base64 length:', base64.length);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('❌ Image processing failed:', error);
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (index: number) => {
    setSignalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSignal.title || !newSignal.content || !newSignal.tradeAction) {
      alert('Please fill in all required fields (title, content, trade action)');
      return;
    }
    
    const signalData = {
      title: newSignal.title,
      content: newSignal.content,
      tradeAction: newSignal.tradeAction,
      imageUrls: signalImages.length > 0 ? signalImages : [] // Send array directly
    };
    
    console.log('🚀 Creating signal with data:', { 
      title: signalData.title, 
      content: signalData.content,
      tradeAction: signalData.tradeAction,
      hasImages: !!signalData.imageUrls?.length,
      imageCount: signalImages.length,
      totalImageSize: signalImages.reduce((total, img) => total + img.length, 0)
    });
    
    createSignalMutation.mutate(signalData);
  };

  const getStatusColor = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return "bg-gray-100 text-gray-800";
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const isActive = endDate > now;
    
    if (subscription.status === 'trial' && isActive) {
      return "bg-blue-100 text-blue-800";
    } else if (subscription.status === 'active' && isActive) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getStatusDisplay = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return "No Subscription";
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (subscription.status === 'trial') {
      return daysLeft > 0 ? `Trial (${daysLeft} days left)` : "Trial Expired";
    } else if (subscription.status === 'active') {
      const planName = subscription.plan?.name || 'Active';
      return daysLeft > 0 ? `${planName} (${daysLeft} days left)` : "Expired";
    } else if (subscription.status === 'expired') {
      return "Expired";
    } else {
      return subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
    }
  };

  const getDaysRemaining = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage users and forex signals</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signals" className="flex items-center space-x-2">
              <Signal className="h-4 w-4" />
              <span>Signals</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-6">
            {/* Create Signal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Signal</span>
                </CardTitle>
                <CardDescription>
                  Add forex signals for subscribers with unlimited image uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSignal} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="Signal title"
                        value={newSignal.title}
                        onChange={(e) => setNewSignal(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trade Action</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={newSignal.tradeAction}
                        onChange={(e) => setNewSignal(prev => ({ ...prev, tradeAction: e.target.value as "Buy" | "Sell" | "Hold" }))}
                        required
                      >
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                        <option value="Hold">Hold</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="Signal details and analysis"
                      value={newSignal.content}
                      onChange={(e) => setNewSignal(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>

                  {/* New Unlimited Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Images (Unlimited Size & Quantity)</label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <p className="text-lg font-medium text-gray-900">Drop images here or click to browse</p>
                        <p className="text-sm text-gray-500 mt-1">Upload any size images - no compression, no limits!</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                    </div>
                    
                    {/* Image Previews */}
                    {signalImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {signalImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Signal image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {(image.length / 1024).toFixed(0)}KB
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createSignalMutation.isPending}
                  >
                    {createSignalMutation.isPending ? "Creating..." : "Create Signal"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Signals List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Signal className="h-5 w-5" />
                  <span>Recent Signals</span>
                </CardTitle>
                <CardDescription>
                  Manage existing forex signals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signals?.map((signal: ForexSignal) => (
                    <div key={signal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{signal.title}</h3>
                            <Badge variant={signal.tradeAction === "Buy" ? "default" : signal.tradeAction === "Sell" ? "destructive" : "secondary"}>
                              {signal.tradeAction}
                            </Badge>
                          </div>
                          
                          {/* Display images if available */}
                          {(signal.imageUrl || signal.imageUrls) && (
                            <div className="mb-2">
                              {signal.imageUrl && (
                                <img
                                  src={signal.imageUrl}
                                  alt={signal.title}
                                  className="w-full h-20 object-cover rounded-md"
                                />
                              )}
                              {signal.imageUrls && (() => {
                                try {
                                  const imageArray = typeof signal.imageUrls === 'string' 
                                    ? JSON.parse(signal.imageUrls) 
                                    : signal.imageUrls;
                                  return Array.isArray(imageArray) && imageArray.length > 0 ? (
                                    <>
                                      <div className={imageArray.length === 1 ? "" : "grid grid-cols-2 gap-1"}>
                                        {imageArray.slice(0, 4).map((imageUrl: string, index: number) => (
                                          <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`${signal.title} ${index + 1}`}
                                            className="w-full h-16 object-cover rounded-md"
                                          />
                                        ))}
                                      </div>
                                      {imageArray.length > 4 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          +{imageArray.length - 4} more images
                                        </p>
                                      )}
                                    </>
                                  ) : null;
                                } catch (e) {
                                  return null;
                                }
                              })()}
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 line-clamp-2">{signal.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(signal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage user subscriptions and trials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user: AdminUser) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(user.subscription)}>
                              {user.subscription ? (
                                user.subscription.status === 'active' ? 
                                  `Active - ${user.subscription.plan?.name || 'Plan'}` :
                                  user.subscription.status === 'trial' ? 'Trial' :
                                  'Expired'
                              ) : 'No Subscription'}
                            </Badge>
                            {user.subscription && (
                              <Badge variant="outline" className="text-xs">
                                {getDaysRemaining(user.subscription)} days left
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateTrial(user.id)}
                          disabled={createTrialMutation.isPending || updateSubscriptionMutation.isPending}
                        >
                          7-Day Trial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateSubscription(user.id, "active", "Premium")}
                          disabled={updateSubscriptionMutation.isPending || createTrialMutation.isPending}
                        >
                          Activate Premium
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateSubscription(user.id, "expired")}
                          disabled={updateSubscriptionMutation.isPending || createTrialMutation.isPending}
                        >
                          Expire
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}