import { Calendar as CalendarIcon, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Calendar() {
  // Sample economic calendar events
  const economicEvents = [
    {
      id: 1,
      time: '09:30',
      currency: 'USD',
      event: 'Non-Farm Payrolls',
      impact: 'high',
      forecast: '200K',
      previous: '180K',
      date: 'Today'
    },
    {
      id: 2,
      time: '14:00',
      currency: 'EUR',
      event: 'ECB Interest Rate Decision',
      impact: 'high',
      forecast: '4.50%',
      previous: '4.50%',
      date: 'Today'
    },
    {
      id: 3,
      time: '08:30',
      currency: 'GBP',
      event: 'GDP Growth Rate',
      impact: 'medium',
      forecast: '1.2%',
      previous: '1.0%',
      date: 'Tomorrow'
    },
    {
      id: 4,
      time: '12:00',
      currency: 'USD',
      event: 'Consumer Price Index',
      impact: 'high',
      forecast: '3.2%',
      previous: '3.4%',
      date: 'Tomorrow'
    },
    {
      id: 5,
      time: '10:00',
      currency: 'JPY',
      event: 'Bank of Japan Meeting',
      impact: 'medium',
      forecast: '-0.10%',
      previous: '-0.10%',
      date: 'Friday'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrencyFlag = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '🇺🇸';
      case 'EUR':
        return '🇪🇺';
      case 'GBP':
        return '🇬🇧';
      case 'JPY':
        return '🇯🇵';
      default:
        return '🌍';
    }
  };

  const groupedEvents = economicEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, typeof economicEvents>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CalendarIcon className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Economic Calendar</h1>
          <p className="text-gray-600 mt-1">Stay updated with key market events and economic indicators</p>
        </div>
      </div>

      {/* Calendar Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>Impact Levels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800">High Impact</Badge>
              <span className="text-sm text-gray-600">Major market movers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
              <span className="text-sm text-gray-600">Moderate market influence</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">Low Impact</Badge>
              <span className="text-sm text-gray-600">Minimal market impact</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Events */}
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([date, events]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock size={20} className="text-blue-600" />
                <span>{date}</span>
              </CardTitle>
              <CardDescription>
                {events.length} economic event{events.length > 1 ? 's' : ''} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-mono text-gray-600 min-w-[60px]">
                        {event.time}
                      </div>
                      <div className="text-2xl">
                        {getCurrencyFlag(event.currency)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{event.event}</h3>
                        <p className="text-sm text-gray-600">{event.currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Forecast: <span className="font-medium">{event.forecast}</span></div>
                        <div className="text-gray-500">Previous: {event.previous}</div>
                      </div>
                      <Badge className={getImpactColor(event.impact)}>
                        {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Hours Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-green-600" />
            <span>Market Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">London</div>
              <div className="text-sm text-gray-600">08:00 - 17:00 GMT</div>
              <Badge className="mt-2 bg-green-100 text-green-800">Open</Badge>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">New York</div>
              <div className="text-sm text-gray-600">13:00 - 22:00 GMT</div>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800">Opening Soon</Badge>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">Tokyo</div>
              <div className="text-sm text-gray-600">00:00 - 09:00 GMT</div>
              <Badge className="mt-2 bg-gray-100 text-gray-800">Closed</Badge>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">Sydney</div>
              <div className="text-sm text-gray-600">22:00 - 07:00 GMT</div>
              <Badge className="mt-2 bg-gray-100 text-gray-800">Closed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}