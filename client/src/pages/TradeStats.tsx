import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";

interface TradeStatsData {
  totalTrades: number;
  wins: number;
  losses: number;
  pending: number;
  winRate: number;
  accuracy: number;
}

export default function TradeStats() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<TradeStatsData>({
    queryKey: ['/api/trade-stats'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading trade statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No trade data available</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-gray-400 font-medium">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Trade Performance</h1>
          <p className="text-gray-400">Your trading statistics and accuracy metrics</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
          <BarChart3 className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-gray-300">Live Stats</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          title="Total Trades"
          value={stats.totalTrades}
          subtitle="All time signals"
          color="bg-blue-600"
        />
        
        <StatCard
          icon={TrendingUp}
          title="Winning Trades"
          value={stats.wins}
          subtitle={`${stats.wins} successful trades`}
          color="bg-green-600"
        />
        
        <StatCard
          icon={TrendingDown}
          title="Losing Trades"
          value={stats.losses}
          subtitle={`${stats.losses} unsuccessful trades`}
          color="bg-red-600"
        />
        
        <StatCard
          icon={BarChart3}
          title="Pending Trades"
          value={stats.pending}
          subtitle="Awaiting outcome"
          color="bg-orange-600"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Win Rate */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Win Rate</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</span>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {stats.wins} wins out of {stats.wins + stats.losses} completed trades
            </p>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Overall Accuracy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-400">{stats.accuracy.toFixed(1)}%</span>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              Based on all {stats.totalTrades} trading signals
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.wins}</div>
            <div className="text-sm text-gray-400">Successful Trades</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.losses}</div>
            <div className="text-sm text-gray-400">Failed Trades</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-orange-400 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending Results</div>
          </div>
        </div>
      </div>
    </div>
  );
}