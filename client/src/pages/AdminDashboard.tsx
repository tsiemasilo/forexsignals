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
  imageUrls?: string[];
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
        imageUrl: "",
      });
      setUploadedImages([]);
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

  // Advanced image compression that works with large files
  const compressImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        try {
          let { width, height } = img;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            // Use white background for better compression
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedData = canvas.toDataURL('image/jpeg', quality);
            console.log('Original size:', file.size, 'bytes');
            console.log('Compressed size:', compressedData.length, 'characters');
            resolve(compressedData);
          } else {
            reject(new Error('Canvas context not available'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Create object URL to load the image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (files: FileList) => {
    console.log('Processing', files.length, 'files');
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        console.log('Processing image:', file.name, 'Original size:', file.size, 'bytes');
        
        try {
          const compressedImage = await compressImage(file);
          setUploadedImages(prev => [...prev, compressedImage]);
          console.log('Image compressed and added to preview');
        } catch (error) {
          console.error('Image compression failed:', error);
          alert('Failed to process image. Please try a different image.');
        }
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
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignal.title || !newSignal.content) return;
    
    const signalData = {
      ...newSignal,
      imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined
    };
    
    console.log('🚀 Creating signal with data:', { 
      title: signalData.title, 
      hasImages: !!signalData.imageUrls,
      imageCount: signalData.imageUrls?.length || 0 
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
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return daysLeft;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-800">
                <Settings className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.firstName} {user?.lastName}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-3">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signals" className="flex items-center">
                <Signal className="h-4 w-4 mr-2" />
                Signals Management
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                User Management
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
                  <form onSubmit={handleCreateSignal} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Signal Title</label>
                        <Input
                          placeholder="EUR/USD Buy Signal"
                          value={newSignal.title}
                          onChange={(e) => setNewSignal({ ...newSignal, title: e.target.value })}
                          required
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
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Upload Images (Optional)</label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          isDragOver 
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop images here, or{' '}
                          <label htmlFor="image-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            browse files
                          </label>
                        </p>
                        <p className="text-xs text-gray-500">Support JPG, PNG, GIF - any size (auto-compressed)</p>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        />
                      </div>

                      {/* Image Preview */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto" 
                      disabled={createSignalMutation.isPending}
                    >
                      {createSignalMutation.isPending ? "Creating..." : "Create Signal"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Signals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recent Signals</span>
                  </CardTitle>
                  <CardDescription>
                    Latest trading signals published
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {signals?.slice(0, 6).map((signal: ForexSignal) => (
                      <div key={signal.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium truncate">{signal.title}</h3>
                          <Badge className={
                            signal.tradeAction === "Buy" ? "bg-green-100 text-green-800" :
                            signal.tradeAction === "Sell" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
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
                                      {imageArray.slice(0, 4).map((imageUrl, index) => (
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
                            onClick={() => handleUpdateSubscription(user.id, "active", "Basic Plan")}
                            disabled={createTrialMutation.isPending || updateSubscriptionMutation.isPending}
                            className="bg-green-50 hover:bg-green-100"
                          >
                            Basic Plan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateSubscription(user.id, "active", "Pro Plan")}
                            disabled={createTrialMutation.isPending || updateSubscriptionMutation.isPending}
                            className="bg-blue-50 hover:bg-blue-100"
                          >
                            Premium Plan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateSubscription(user.id, "active", "VIP Plan")}
                            disabled={createTrialMutation.isPending || updateSubscriptionMutation.isPending}
                            className="bg-purple-50 hover:bg-purple-100"
                          >
                            VIP Plan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateSubscription(user.id, "expired")}
                            disabled={createTrialMutation.isPending || updateSubscriptionMutation.isPending}
                            className="bg-red-50 hover:bg-red-100"
                          >
                            Set Expired
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
      </main>
    </div>
  );
}