import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  execution_time_ms: number | null
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export const RealTimeTaskMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { startOperation, endOperation } = useRealTimeMonitoring()

  useEffect(() => {
    // Initial fetch of tasks
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching tasks:', error)
        return
      }

      setTasks(data || [])
    }

    fetchTasks()

    // Set up real-time subscription
    const channel = supabase
      .channel('task-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task change:', payload)
          
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev.slice(0, 19)])
            startOperation('task_created')
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => 
              prev.map(task => 
                task.id === payload.new.id ? payload.new as Task : task
              )
            )
            
            // Track operation completion
            if (payload.new.status === 'completed' && payload.old?.status !== 'completed') {
              endOperation(
                'task_execution',
                payload.new.execution_time_ms || 0,
                true
              )
            } else if (payload.new.status === 'failed' && payload.old?.status !== 'failed') {
              endOperation(
                'task_execution',
                payload.new.execution_time_ms || 0,
                false
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('Task monitor status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [startOperation, endOperation])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatExecutionTime = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const runningTasks = tasks.filter(t => t.status === 'running').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const failedTasks = tasks.filter(t => t.status === 'failed').length

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Play className={`h-5 w-5 ${isConnected ? 'animate-pulse text-green-500' : 'text-muted-foreground'}`} />
          Real-Time Task Monitor
          {isConnected && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-blue-500">{runningTasks}</div>
            <div className="text-xs text-muted-foreground">Running</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-green-500">{completedTasks}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-red-500">{failedTasks}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold">{tasks.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Task List */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No tasks found
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)} bg-card hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(task.status)}
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(task.created_at)}
                          </span>
                          {task.execution_time_ms && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {formatExecutionTime(task.execution_time_ms)}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>

                      {task.error_message && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                          {task.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Connection Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Real-time Updates</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}