import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RealtimeStatusProps {
  isOnline: boolean;
  lastUpdateTime: Date;
  onRefresh: () => void;
  interval?: string;
  className?: string;
}

export function RealtimeStatus({ 
  isOnline, 
  lastUpdateTime, 
  onRefresh, 
  interval = "3s",
  className = ""
}: RealtimeStatusProps) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="font-medium">
          {isOnline ? `Auto-refresh: ${interval}` : 'Offline'}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        Last update: {lastUpdateTime.toLocaleTimeString()}
      </div>
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        size="sm"
        className="flex items-center space-x-2 hover:bg-blue-50"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </Button>
    </div>
  );
}