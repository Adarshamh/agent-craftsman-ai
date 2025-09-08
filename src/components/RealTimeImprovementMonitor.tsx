import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSelfImprovement } from '@/hooks/useSelfImprovement'
import { supabase } from '@/integrations/supabase/client'
import { 
  Activity, 
  TrendingUp, 
  Brain, 
  Clock, 
  Target
} from 'lucide-react'

interface LiveMetrics {
  activeImprovement: boolean
  recentConfidenceScore: number
  improvementRate: number
  learningVelocity: string
}

export const RealTimeImprovementMonitor: React.FC = () => {
  const { metrics } = useSelfImprovement()
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeImprovement: false,
    recentConfidenceScore: 0,
    improvementRate: 0,
    learningVelocity: 'idle'
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Set up real-time subscriptions for improvement monitoring
    const channel = supabase
      .channel('improvement-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_feedback'
        },
        (payload) => {
          console.log('New task feedback:', payload)
          setLiveMetrics(prev => ({
            ...prev,
            activeImprovement: true,
            recentConfidenceScore: payload.new.confidence_score || 0,
            learningVelocity: 'learning'
          }))

          // Reset active improvement after 5 seconds
          setTimeout(() => {
            setLiveMetrics(prev => ({
              ...prev,
              activeImprovement: false,
              learningVelocity: 'idle'
            }))
          }, 5000)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'knowledge_patterns'
        },
        (payload) => {
          console.log('Pattern optimized:', payload)
          if (payload.new.effectiveness_score > (payload.old?.effectiveness_score || 0)) {
            setLiveMetrics(prev => ({
              ...prev,
              improvementRate: prev.improvementRate + 1,
              learningVelocity: 'optimizing'
            }))
          }
        }
      )
      .subscribe((status) => {
        console.log('Improvement monitor status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getStatusColor = (velocity: string) => {
    switch (velocity) {
      case 'learning': return 'bg-blue-500'
      case 'optimizing': return 'bg-green-500'
      case 'idle': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (velocity: string) => {
    switch (velocity) {
      case 'learning': return 'Learning from new task'
      case 'optimizing': return 'Optimizing patterns'
      case 'idle': return 'Monitoring...'
      default: return 'Unknown status'
    }
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className={`h-4 w-4 ${liveMetrics.activeImprovement ? 'animate-pulse text-green-500' : 'text-muted-foreground'}`} />
          Real-Time Improvement Monitor
          {isConnected && (
            <Badge variant="outline" className="text-xs">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(liveMetrics.learningVelocity)} mr-1 animate-pulse`}></div>
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={liveMetrics.learningVelocity === 'idle' ? 'outline' : 'default'}>
            {getStatusText(liveMetrics.learningVelocity)}
          </Badge>
        </div>

        {/* Recent Confidence */}
        {liveMetrics.recentConfidenceScore > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Latest Confidence
              </span>
              <span className="text-sm font-medium">
                {(liveMetrics.recentConfidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={liveMetrics.recentConfidenceScore * 100} className="h-2" />
          </div>
        )}

        {/* Improvement Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Improvements Today
            </span>
            <span className="text-sm font-medium">
              {liveMetrics.improvementRate}
            </span>
          </div>
        </div>

        {/* Overall Trend */}
        {metrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Overall Trend
              </span>
              <Badge variant={
                metrics.improvementTrend === 'improving' ? 'default' : 
                metrics.improvementTrend === 'declining' ? 'destructive' : 'outline'
              }>
                {metrics.improvementTrend}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Response
              </span>
              <span className="text-sm font-medium">
                {metrics.avgExecutionTime > 1000 
                  ? `${(metrics.avgExecutionTime / 1000).toFixed(1)}s`
                  : `${metrics.avgExecutionTime.toFixed(0)}ms`
                }
              </span>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Connection</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}