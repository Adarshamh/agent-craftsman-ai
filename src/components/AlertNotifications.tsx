import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react'
import { Alert } from '@/hooks/useAlertMonitoring'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface AlertNotificationsProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
  onResolve: (alertId: string) => void
  onClearAll: () => void
  className?: string
  maxVisible?: number
  showSoundToggle?: boolean
  autoHideAfterMs?: number
}

export const AlertNotifications = ({
  alerts,
  onAcknowledge,
  onResolve,
  onClearAll,
  className,
  maxVisible = 5,
  showSoundToggle = true,
  autoHideAfterMs = 0 // 0 means don't auto-hide
}: AlertNotificationsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hiddenAlerts, setHiddenAlerts] = useState<Set<string>>(new Set())

  // Sound notification for new alerts
  useEffect(() => {
    if (!soundEnabled || alerts.length === 0) return

    // Play sound for critical and high severity alerts
    const newCriticalAlerts = alerts.filter(alert => 
      alert.severity === 'critical' && 
      !alert.acknowledged &&
      !hiddenAlerts.has(alert.id)
    )

    if (newCriticalAlerts.length > 0) {
      // Create audio context and play alert sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (error) {
        console.warn('Could not play alert sound:', error)
      }
    }
  }, [alerts, soundEnabled, hiddenAlerts])

  // Auto-hide alerts after specified time
  useEffect(() => {
    if (autoHideAfterMs <= 0) return

    const timer = setTimeout(() => {
      const newHiddenAlerts = new Set(hiddenAlerts)
      alerts.forEach(alert => {
        const alertAge = Date.now() - new Date(alert.timestamp).getTime()
        if (alertAge > autoHideAfterMs) {
          newHiddenAlerts.add(alert.id)
        }
      })
      setHiddenAlerts(newHiddenAlerts)
    }, 1000)

    return () => clearTimeout(timer)
  }, [alerts, autoHideAfterMs, hiddenAlerts])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-950'
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const visibleAlerts = alerts
    .filter(alert => !hiddenAlerts.has(alert.id))
    .slice(0, maxVisible)
    .sort((a, b) => {
      // Sort by severity (critical first), then by timestamp (newest first)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const severityDiff = severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  const handleHideAlert = (alertId: string) => {
    setHiddenAlerts(prev => new Set([...prev, alertId]))
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    onAcknowledge(alertId)
    handleHideAlert(alertId)
  }

  const handleResolveAlert = (alertId: string) => {
    onResolve(alertId)
    handleHideAlert(alertId)
  }

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 w-96 space-y-2", className)}>
      {/* Header with controls */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle className="text-lg">
                Active Alerts ({visibleAlerts.length})
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {showSoundToggle && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Show alerts' : 'Hide alerts'}
              >
                {isCollapsed ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              {alerts.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearAll}
                  title="Clear all alerts"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="pt-0">
            <ScrollArea className="max-h-96">
              <div className="space-y-3">
                {visibleAlerts.map((alert) => (
                  <Card 
                    key={alert.id} 
                    className={cn(
                      "border-l-4 transition-all duration-200 hover:shadow-md",
                      getSeverityColor(alert.severity),
                      alert.acknowledged && "opacity-75"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge 
                                variant={getSeverityBadgeVariant(alert.severity)}
                                className="text-xs"
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs">
                                  ACKNOWLEDGED
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="font-medium text-sm mb-1 truncate">
                              {alert.ruleName}
                            </h4>
                            
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {alert.message}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(alert.timestamp), 'HH:mm:ss')}</span>
                              </div>
                              <div>
                                Current: <span className="font-medium">{alert.currentValue.toFixed(2)}</span>
                              </div>
                              <div>
                                Threshold: <span className="font-medium">{alert.threshold}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="h-7 px-2 text-xs"
                              title="Acknowledge alert"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                            className="h-7 px-2 text-xs"
                            title="Resolve alert"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleHideAlert(alert.id)}
                            className="h-7 px-2 text-xs"
                            title="Hide alert"
                          >
                            <EyeOff className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            
            {alerts.length > maxVisible && (
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  +{alerts.length - maxVisible} more alerts hidden
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}