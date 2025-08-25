import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle, RefreshCw, Upload, Image, X } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export default function AdminSignals() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Advanced debugging for live site
  console.log('AdminSignals Debug (Live Site):', { 
    user, 
    userId: user?.id,
    authLoading,
    isAdmin: user?.isAdmin,
    userEmail: user?.email,
    timestamp: new Date().toISOString(),
    location: window.location.href
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<any>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    tradeAction: string;
    imageUrl: string;
    imageUrls: string[];
  }>({
    title: '',
    content: '',
    tradeAction: '',
    imageUrl: '',
    imageUrls: []
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Real-time updates for admin dashboard
  const { isOnline, lastUpdateTime, refreshAll } = useRealtimeUpdates({
    queryKeys: [['/api/admin/signals']],
    interval: 4000, // 4 second refresh for admin
    backgroundRefresh: true
  });

  const { data: signals = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/signals'],
    enabled: !!user,
    refetchInterval: 4000, // Auto-refresh every 4 seconds
    refetchIntervalInBackground: true, // Continue refreshing in background
    staleTime: 0, // Always consider data stale
  });

  const createSignalMutation = useMutation({
    mutationFn: async (signalData: any) => {
      console.log('🚀 CREATING SIGNAL - REQUEST DATA:', {
        signalData,
        url: '/api/admin/signals',
        method: 'POST',
        timestamp: new Date().toISOString(),
        userId: user?.id,
        user: { id: user?.id, email: user?.email, isAdmin: user?.isAdmin }
      });
      
      const result = await apiRequest('POST', '/api/admin/signals', signalData);
      
      console.log('✅ SIGNAL CREATION - RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        result,
        timestamp: new Date().toISOString()
      });
      
      return result;
    },
    onSuccess: (data) => {
      console.log('Signal creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/signals'] });
      toast({
        title: "Signal created",
        description: `New trading signal "${data.title}" has been published.`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('❌ SIGNAL CREATION FAILED:', {
        error: error.message,
        fullError: error,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        user: { id: user?.id, email: user?.email, isAdmin: user?.isAdmin },
        formData
      });
      
      toast({
        title: "Signal Creation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateSignalMutation = useMutation({
    mutationFn: async ({ id, ...signalData }: any) => {
      return await apiRequest('PUT', `/api/admin/signals/${id}`, signalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/signals'] });
      toast({
        title: "Signal updated",
        description: "Trading signal has been updated.",
      });
      setEditingSignal(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update signal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteSignalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/signals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/signals'] });
      toast({
        title: "Signal deleted",
        description: "Trading signal has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete signal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tradeAction: '',
      imageUrl: '',
      imageUrls: []
    });
    setEditingSignal(null);
    
    // Clear uploaded images and their previews
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setUploadedImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('FORM SUBMISSION DEBUG:', {
      formData,
      editingSignal,
      user,
      userId: user?.id,
      isAdmin: user?.isAdmin,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced validation debugging
    const validationResults = {
      title: !!formData.title,
      content: !!formData.content,
      tradeAction: !!formData.tradeAction,
      imageUrlsArray: Array.isArray(formData.imageUrls),
      formDataComplete: formData
    };
    
    console.log('🔍 FORM VALIDATION CHECK:', validationResults);
    
    if (!formData.title || !formData.content || !formData.tradeAction) {
      console.error('❌ Form validation failed:', validationResults);
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, content, and trade action).",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ FORM VALIDATION PASSED - Proceeding with submission');
    
    if (editingSignal) {
      console.log('Updating existing signal:', editingSignal.id);
      updateSignalMutation.mutate({ id: editingSignal.id, ...formData });
    } else {
      console.log('Creating new signal with data:', formData);
      // Map imageUrls to uploadedImages for backend compatibility
      const signalData = {
        ...formData,
        uploadedImages: formData.imageUrls
      };
      createSignalMutation.mutate(signalData);
    }
  };

  const handleEdit = (signal: any) => {
    setEditingSignal(signal);
    setFormData({
      title: signal.title,
      content: signal.content,
      tradeAction: signal.tradeAction,
      imageUrl: signal.imageUrl || '',
      imageUrls: signal.imageUrls || []
    });
  };

  const addImageUrl = () => {
    if (formData.imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, prev.imageUrl.trim()],
        imageUrl: ''
      }));
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  // Compress image to reduce payload size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // File upload handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files (PNG, JPG, GIF, etc.)",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Please upload images smaller than 5MB",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      // Create preview URLs for the uploaded files
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      
      setUploadedImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Compress and convert files to base64 data URLs
      const filePromises = validFiles.map(file => compressImage(file));

      Promise.all(filePromises).then(compressedDataUrls => {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...compressedDataUrls]
        }));
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this signal?')) {
      deleteSignalMutation.mutate(id);
    }
  };

  const getTradeActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'hold':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'wait':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTradeActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-red-100 text-red-800';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'wait':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Show admin access check first
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Admin access validation with detailed debugging
  if (!user?.isAdmin) {
    console.error('ADMIN ACCESS DENIED:', { 
      user, 
      isAdmin: user?.isAdmin, 
      email: user?.email,
      message: 'Current user does not have admin privileges' 
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">
            You are logged in as: <strong>{user?.email}</strong><br/>
            Admin status: <strong>{user?.isAdmin ? 'Yes' : 'No'}</strong><br/>
            This page requires admin privileges to publish signals.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={async () => {
                try {
                  // Quick admin login
                  const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'admin@forexsignals.com' }),
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    window.location.reload();
                  } else {
                    console.error('Admin login failed:', await response.text());
                    window.location.href = '/api/logout';
                  }
                } catch (error) {
                  console.error('Login error:', error);
                  window.location.href = '/api/logout';
                }
              }} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Quick Admin Login
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                Back to Admin Dashboard
              </Button>
            </Link>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                <strong>Admin Login:</strong> admin@forexsignals.com<br/>
                <strong>Debug Info:</strong> User logged in
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Admin Dashboard Header with Real-time Status */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Signal Dashboard</h1>
              <p className="text-gray-600 mt-2">Create and manage live trading signals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {isOnline ? 'Live Updates: 4s' : 'Offline Mode'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Last sync: {lastUpdateTime.toLocaleTimeString()}
              </div>
              <Button 
                onClick={refreshAll} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh All</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Signal Management</h2>
            <p className="text-gray-600">
              Create, edit, and manage trading signals for your subscribers.
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Signal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Create New Signal</DialogTitle>
                <DialogDescription>
                  Publish a new trading signal for your subscribers.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto px-1">
                <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                <div>
                  <Label htmlFor="title">Signal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., EUR/USD Long Position"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tradeAction">Trade Action</Label>
                  <Select value={formData.tradeAction} onValueChange={(value) => setFormData({ ...formData, tradeAction: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trade action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Sell">Sell</SelectItem>
                      <SelectItem value="Hold">Hold</SelectItem>
                      <SelectItem value="Wait">Wait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="content">Analysis & Details</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Detailed market analysis, entry points, stop loss, take profit levels..."
                    rows={6}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="images">Chart Images (Optional)</Label>
                  <div className="space-y-4">
                    {/* Drag & Drop Upload Area */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-12 h-12 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Drop your chart images here, or <span className="text-blue-600">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports PNG, JPG, GIF up to 5MB each
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* URL Input as Alternative */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Or add image URL:</p>
                      <div className="flex space-x-2">
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/chart.png"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                        />
                        <Button
                          type="button"
                          onClick={addImageUrl}
                          disabled={!formData.imageUrl.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Image Previews */}
                    {(imagePreviews.length > 0 || formData.imageUrls.length > 0) && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Uploaded Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Show uploaded file previews */}
                          {imagePreviews.map((preview, index) => (
                            <div key={`preview-${index}`} className="relative group">
                              <img
                                src={preview}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removeUploadedImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                {uploadedImages[index]?.name.split('.').pop()?.toUpperCase()}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show URL-based images that aren't from uploads */}
                          {formData.imageUrls.filter((_, i) => i >= imagePreviews.length).map((url, index) => (
                            <div key={`url-${index}`} className="relative group">
                              <img
                                src={url}
                                alt={`URL ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removeImageUrl(imagePreviews.length + index)}
                                className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                URL
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={createSignalMutation.isPending}
                    >
                      {createSignalMutation.isPending ? 'Publishing...' : 'Publish Signal'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Signals List */}
        {signals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">No signals published</h2>
              <p className="text-gray-600 mb-4">
                Create your first trading signal to share with subscribers.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Signal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {signals
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((signal: any) => (
              <Card key={signal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getTradeActionIcon(signal.tradeAction)}
                      <div>
                        <CardTitle className="text-xl">{signal.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Published: {new Date(signal.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTradeActionColor(signal.tradeAction)}>
                        {signal.tradeAction.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(signal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(signal.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{signal.content}</p>
                  {(signal.imageUrls?.length > 0 || signal.imageUrl) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Chart Images:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {signal.imageUrls?.map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Chart analysis ${index + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                        )) || (signal.imageUrl && (
                          <img
                            src={signal.imageUrl}
                            alt="Chart analysis"
                            className="w-full h-32 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingSignal} onOpenChange={(open) => !open && setEditingSignal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Signal</DialogTitle>
              <DialogDescription>
                Update the trading signal details.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Signal Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-tradeAction">Trade Action</Label>
                <Select value={formData.tradeAction} onValueChange={(value) => setFormData({ ...formData, tradeAction: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="Wait">Wait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-content">Analysis & Details</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-imageUrl">Chart Images (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      id="edit-imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/chart.png"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                    />
                    <Button
                      type="button"
                      onClick={addImageUrl}
                      disabled={!formData.imageUrl.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </div>
                  {formData.imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Added Images:</p>
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm flex-1 truncate">{url}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeImageUrl(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setEditingSignal(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateSignalMutation.isPending}
                >
                  {updateSignalMutation.isPending ? 'Updating...' : 'Update Signal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}