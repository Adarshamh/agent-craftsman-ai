import { useState } from 'react'
import { X, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { usePerformanceMonitoring, type PerformanceAlert } from '@/hooks/usePerformanceMonitoring'

const getSeverityColor = (severity: PerformanceAlert['severity']) => {
  switch (severity) {
    case 'critical': return 'destructive'
    case 'high': return 'destructive'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'outline'
  }
}

const getSeverityIcon = (severity: PerformanceAlert['severity']) => {
  switch (severity) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />
    case 'high': return <AlertCircle className="h-4 w-4 text-destructive" />
    case 'medium': return <Info className="h-4 w-4 text-muted-foreground" />
    case 'low': return <Zap className="h-4 w-4 text-muted-foreground" />
    default: return <Info className="h-4 w-4" />
  }
}

const getTypeIcon = (type: PerformanceAlert['type']) => {
  switch (type) {
    case 'memory': return '🧠'
    case 'cpu': return '⚡'
    case 'network': return '🌐'
    case 'performance': return '📊'
    default: return '⚠️'
  }
}

export const AlertSystem = () => {
  const { alerts, dismissAlert, clearAlerts } = usePerformanceMonitoring()
  const [isMinimized, setIsMinimized] = useState(false)

  if (alerts.length === 0) return null

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length
  const highAlerts = alerts.filter(alert => alert.severity === 'high').length

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="bg-background/95 backdrop-blur border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold">Performance Alerts</span>
              <Badge variant="outline" className="text-xs">
                {alerts.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? '▲' : '▼'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAlerts}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {(criticalAlerts > 0 || highAlerts > 0) && (
                <div className="flex gap-2 mb-3">
                  {criticalAlerts > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {criticalAlerts} Critical
                    </Badge>
                  )}
                  {highAlerts > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {highAlerts} High
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-2 rounded-md bg-muted/50 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base">{getTypeIcon(alert.type)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityIcon(alert.severity)}
                          <Badge 
                            variant={getSeverityColor(alert.severity)} 
                            className="text-xs"
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground break-words">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-6 w-6 p-0 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {alerts.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center p-2">
                    +{alerts.length - 5} more alerts
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}