import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

export const PerformanceMetrics = () => {
  const { 
    metrics, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    clearAlerts,
    thresholds 
  } = usePerformanceMonitoring()

  const getStatusColor = (value: number, warning: number, critical: number, inverse = false) => {
    if (inverse) {
      if (value < critical) return 'destructive'
      if (value < warning) return 'secondary'
      return 'default'
    } else {
      if (value > critical) return 'destructive'
      if (value > warning) return 'secondary'
      return 'default'
    }
  }

  const formatBytes = (bytes: number) => {
    return `${bytes} MB`
  }

  const formatMs = (ms: number) => {
    return `${Math.round(ms)} ms`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Monitoring</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAlerts}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Alerts
          </Button>
        </div>
      </div>

      {!isMonitoring && !metrics && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Start monitoring to see performance metrics</p>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Memory Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Memory Usage
                <Badge variant={getStatusColor(
                  metrics.memoryUsage.percentage,
                  thresholds.memory.warning,
                  thresholds.memory.critical
                )}>
                  {metrics.memoryUsage.percentage}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress 
                value={metrics.memoryUsage.percentage} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{formatBytes(metrics.memoryUsage.used)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{formatBytes(metrics.memoryUsage.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frame Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Frame Rate
                <Badge variant={getStatusColor(
                  metrics.frameRate,
                  thresholds.frameRate.warning,
                  thresholds.frameRate.critical,
                  true
                )}>
                  {metrics.frameRate} FPS
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress 
                value={Math.min((metrics.frameRate / 60) * 100, 100)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span>60 FPS</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Latency */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Network Latency
                <Badge variant={getStatusColor(
                  metrics.networkLatency,
                  thresholds.networkLatency.warning,
                  thresholds.networkLatency.critical
                )}>
                  {formatMs(metrics.networkLatency)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress 
                value={Math.min((metrics.networkLatency / 3000) * 100, 100)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Warning:</span>
                  <span>{formatMs(thresholds.networkLatency.warning)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CPU Usage (Long Tasks) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                CPU Load
                <Badge variant={getStatusColor(
                  metrics.cpuUsage.longTasks,
                  thresholds.longTasks.warning,
                  thresholds.longTasks.critical
                )}>
                  {metrics.cpuUsage.longTasks} tasks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress 
                value={Math.min((metrics.cpuUsage.longTasks / 10) * 100, 100)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Long tasks/min:</span>
                  <span>{metrics.cpuUsage.longTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Main thread:</span>
                  <span>{Math.round(metrics.cpuUsage.mainThread)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Load Times */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Page Load
                <Badge variant={getStatusColor(
                  metrics.loadTime,
                  thresholds.loadTime.warning,
                  thresholds.loadTime.critical
                )}>
                  {formatMs(metrics.loadTime)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress 
                value={Math.min((metrics.loadTime / 5000) * 100, 100)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Load time:</span>
                  <span>{formatMs(metrics.loadTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DOM ready:</span>
                  <span>{formatMs(metrics.domContentLoaded)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Status Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Memory</span>
                <Badge 
                  variant={getStatusColor(
                    metrics.memoryUsage.percentage,
                    thresholds.memory.warning,
                    thresholds.memory.critical
                  )}
                  className="text-xs"
                >
                  {metrics.memoryUsage.percentage > thresholds.memory.critical ? 'Critical' :
                   metrics.memoryUsage.percentage > thresholds.memory.warning ? 'Warning' : 'Good'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Performance</span>
                <Badge 
                  variant={getStatusColor(
                    metrics.frameRate,
                    thresholds.frameRate.warning,
                    thresholds.frameRate.critical,
                    true
                  )}
                  className="text-xs"
                >
                  {metrics.frameRate < thresholds.frameRate.critical ? 'Critical' :
                   metrics.frameRate < thresholds.frameRate.warning ? 'Warning' : 'Good'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Network</span>
                <Badge 
                  variant={getStatusColor(
                    metrics.networkLatency,
                    thresholds.networkLatency.warning,
                    thresholds.networkLatency.critical
                  )}
                  className="text-xs"
                >
                  {metrics.networkLatency > thresholds.networkLatency.critical ? 'Critical' :
                   metrics.networkLatency > thresholds.networkLatency.warning ? 'Warning' : 'Good'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}