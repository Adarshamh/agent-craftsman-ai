import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Gauge
} from 'lucide-react'

export const LivePerformanceMetrics: React.FC = () => {
  const { liveMetrics, isConnected, isLoading } = useRealTimeMonitoring()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (value: number, type: 'success' | 'response' | 'error' | 'load') => {
    switch (type) {
      case 'success':
        return value >= 90 ? 'text-green-500' : value >= 70 ? 'text-yellow-500' : 'text-red-500'
      case 'response':
        return value <= 500 ? 'text-green-500' : value <= 1000 ? 'text-yellow-500' : 'text-red-500'
      case 'error':
        return value <= 5 ? 'text-green-500' : value <= 15 ? 'text-yellow-500' : 'text-red-500'
      case 'load':
        return value <= 60 ? 'text-green-500' : value <= 80 ? 'text-yellow-500' : 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Throughput',
      value: `${liveMetrics.currentThroughput}/hr`,
      progress: Math.min((liveMetrics.currentThroughput / 100) * 100, 100),
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      label: 'Avg Response Time',
      value: `${liveMetrics.avgResponseTime.toFixed(0)}ms`,
      progress: Math.max(0, 100 - (liveMetrics.avgResponseTime / 10)),
      color: getStatusColor(liveMetrics.avgResponseTime, 'response')
    },
    {
      icon: Zap,
      label: 'Success Rate',
      value: `${(liveMetrics.successRate * 100).toFixed(1)}%`,
      progress: liveMetrics.successRate * 100,
      color: getStatusColor(liveMetrics.successRate * 100, 'success')
    },
    {
      icon: Activity,
      label: 'Active Operations',
      value: liveMetrics.activeOperations.toString(),
      progress: Math.min((liveMetrics.activeOperations / 10) * 100, 100),
      color: 'text-purple-500'
    },
    {
      icon: AlertTriangle,
      label: 'Error Rate',
      value: `${(liveMetrics.errorRate * 100).toFixed(1)}%`,
      progress: liveMetrics.errorRate * 100,
      color: getStatusColor(liveMetrics.errorRate * 100, 'error')
    },
    {
      icon: Gauge,
      label: 'System Load',
      value: `${liveMetrics.systemLoad.toFixed(1)}%`,
      progress: liveMetrics.systemLoad,
      color: getStatusColor(liveMetrics.systemLoad, 'load')
    }
  ]

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className={`h-5 w-5 ${isConnected ? 'animate-pulse text-green-500' : 'text-muted-foreground'}`} />
          Live Performance Metrics
          {isConnected && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map(({ icon: Icon, label, value, progress, color }, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
                <span className={`text-sm font-medium ${color}`}>
                  {value}
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* System Status Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">System Status</span>
            <Badge 
              variant={
                liveMetrics.successRate >= 0.9 && liveMetrics.systemLoad <= 80 
                  ? 'default' 
                  : liveMetrics.successRate >= 0.7 
                  ? 'secondary' 
                  : 'destructive'
              }
            >
              {liveMetrics.successRate >= 0.9 && liveMetrics.systemLoad <= 80 
                ? 'Optimal' 
                : liveMetrics.successRate >= 0.7 
                ? 'Good' 
                : 'Degraded'}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {liveMetrics.successRate >= 0.9 && liveMetrics.systemLoad <= 80 
              ? 'All systems operating normally'
              : liveMetrics.successRate >= 0.7
              ? 'Performance within acceptable ranges'
              : 'System performance may need attention'}
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Real-time Connection</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}