import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminSignals() {
  const { sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tradeAction: '',
    imageUrl: ''
  });

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['/api/signals'],
    enabled: !!sessionId,
    meta: {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    }
  });

  const createSignalMutation = useMutation({
    mutationFn: async (signalData: any) => {
      const response = await apiRequest('POST', '/api/signals', signalData, {
        headers: {
          Authorization: `Bearer ${sessionId}`
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/signals'] });
      toast({
        title: "Signal created",
        description: "New trading signal has been published.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create signal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateSignalMutation = useMutation({
    mutationFn: async ({ id, ...signalData }: any) => {
      const response = await apiRequest('PUT', `/api/signals/${id}`, signalData, {
        headers: {
          Authorization: `Bearer ${sessionId}`
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/signals'] });
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
      const response = await apiRequest('DELETE', `/api/signals/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${sessionId}`
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/signals'] });
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
      imageUrl: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSignal) {
      updateSignalMutation.mutate({ id: editingSignal.id, ...formData });
    } else {
      createSignalMutation.mutate(formData);
    }
  };

  const handleEdit = (signal: any) => {
    setEditingSignal(signal);
    setFormData({
      title: signal.title,
      content: signal.content,
      tradeAction: signal.tradeAction,
      imageUrl: signal.imageUrl || ''
    });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Signals</h1>
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Signal</DialogTitle>
                <DialogDescription>
                  Publish a new trading signal for your subscribers.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="imageUrl">Chart Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/chart.png"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
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
            {signals.map((signal: any) => (
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
                  {signal.imageUrl && (
                    <img
                      src={signal.imageUrl}
                      alt="Chart analysis"
                      className="w-full max-w-md h-48 object-cover rounded border"
                    />
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
                <Label htmlFor="edit-imageUrl">Chart Image URL (Optional)</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
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