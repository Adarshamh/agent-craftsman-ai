import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface RealTimeMetric {
  id: string
  user_id: string
  metric_type: string
  metric_value: number
  timestamp: string
  metadata: any
}

interface PerformanceMonitoring {
  id: string
  user_id: string
  operation_type: string
  execution_time_ms: number
  success_rate: number
  throughput_per_hour: number
  created_at: string
  updated_at: string
}

interface LiveMetrics {
  currentThroughput: number
  avgResponseTime: number
  successRate: number
  activeOperations: number
  errorRate: number
  systemLoad: number
}

export const useRealTimeMonitoring = () => {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    currentThroughput: 0,
    avgResponseTime: 0,
    successRate: 0,
    activeOperations: 0,
    errorRate: 0,
    systemLoad: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()

  // Fetch real-time metrics
  const { data: realtimeMetrics, isLoading } = useQuery({
    queryKey: ['realtimeMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('real_time_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as RealTimeMetric[]
    },
    refetchInterval: 1000 // Refresh every second
  })

  // Fetch performance monitoring data
  const { data: performanceData } = useQuery({
    queryKey: ['performanceMonitoring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_monitoring')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as PerformanceMonitoring[]
    },
    refetchInterval: 2000 // Refresh every 2 seconds
  })

  // Record metric mutation
  const recordMetric = useMutation({
    mutationFn: async ({ type, value, metadata = {} }: { 
      type: string; 
      value: number; 
      metadata?: any 
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('real_time_metrics')
        .insert({
          user_id: user.id,
          metric_type: type,
          metric_value: value,
          metadata
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtimeMetrics'] })
    },
    onError: (error) => {
      console.error('Failed to record metric:', error)
    }
  })

  // Record performance data mutation
  const recordPerformance = useMutation({
    mutationFn: async ({ 
      operationType, 
      executionTime, 
      successRate, 
      throughput 
    }: {
      operationType: string
      executionTime: number
      successRate: number
      throughput: number
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('performance_monitoring')
        .insert({
          user_id: user.id,
          operation_type: operationType,
          execution_time_ms: executionTime,
          success_rate: successRate,
          throughput_per_hour: throughput
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceMonitoring'] })
    }
  })

  // Calculate live metrics from data
  const calculateLiveMetrics = useCallback(() => {
    if (!realtimeMetrics || !performanceData) return

    const recentMetrics = realtimeMetrics.slice(0, 10)
    const recentPerformance = performanceData.slice(0, 5)

    // Calculate throughput (operations per hour)
    const throughputMetrics = recentMetrics.filter(m => m.metric_type === 'throughput')
    const currentThroughput = throughputMetrics.length > 0 
      ? throughputMetrics[0].metric_value 
      : 0

    // Calculate average response time
    const avgResponseTime = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.execution_time_ms, 0) / recentPerformance.length
      : 0

    // Calculate success rate
    const successRate = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.success_rate, 0) / recentPerformance.length
      : 0

    // Calculate active operations
    const activeOperations = recentMetrics.filter(m => 
      m.metric_type === 'active_operations'
    ).length

    // Calculate error rate
    const errorMetrics = recentMetrics.filter(m => m.metric_type === 'error_rate')
    const errorRate = errorMetrics.length > 0 
      ? errorMetrics[0].metric_value 
      : 0

    // Calculate system load
    const loadMetrics = recentMetrics.filter(m => m.metric_type === 'system_load')
    const systemLoad = loadMetrics.length > 0 
      ? loadMetrics[0].metric_value 
      : 0

    setLiveMetrics({
      currentThroughput,
      avgResponseTime,
      successRate,
      activeOperations,
      errorRate,
      systemLoad
    })
  }, [realtimeMetrics, performanceData])

  // Set up real-time subscriptions
  useEffect(() => {
    const metricsChannel = supabase
      .channel('realtime-metrics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_metrics'
        },
        (payload) => {
          console.log('New metric:', payload)
          queryClient.invalidateQueries({ queryKey: ['realtimeMetrics'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'performance_monitoring'
        },
        (payload) => {
          console.log('New performance data:', payload)
          queryClient.invalidateQueries({ queryKey: ['performanceMonitoring'] })
        }
      )
      .subscribe((status) => {
        console.log('Real-time monitoring status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Task monitoring subscription
    const taskChannel = supabase
      .channel('task-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task update:', payload)
          
          // Record performance metrics for task operations
          if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
            const executionTime = payload.new.execution_time_ms || 0
            recordPerformance.mutate({
              operationType: 'task_completion',
              executionTime,
              successRate: 1.0,
              throughput: 1
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(metricsChannel)
      supabase.removeChannel(taskChannel)
    }
  }, [recordPerformance, queryClient])

  // Update live metrics when data changes
  useEffect(() => {
    calculateLiveMetrics()
  }, [calculateLiveMetrics])

  // Auto-record system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate system metrics (in real app, get from actual system)
      const systemLoad = Math.random() * 100
      const throughput = Math.floor(Math.random() * 50) + 10
      
      recordMetric.mutate({ type: 'system_load', value: systemLoad })
      recordMetric.mutate({ type: 'throughput', value: throughput })
    }, 5000) // Every 5 seconds

    return () => clearInterval(interval)
  }, [recordMetric])

  const startOperation = useCallback((operationType: string) => {
    recordMetric.mutate({ 
      type: 'active_operations', 
      value: 1, 
      metadata: { operation: operationType, status: 'started' }
    })
  }, [recordMetric])

  const endOperation = useCallback((operationType: string, executionTime: number, success: boolean) => {
    recordMetric.mutate({ 
      type: 'active_operations', 
      value: -1, 
      metadata: { operation: operationType, status: 'completed' }
    })

    recordPerformance.mutate({
      operationType,
      executionTime,
      successRate: success ? 1.0 : 0.0,
      throughput: 1
    })
  }, [recordMetric, recordPerformance])

  return {
    liveMetrics,
    realtimeMetrics,
    performanceData,
    isLoading,
    isConnected,
    recordMetric: recordMetric.mutate,
    recordPerformance: recordPerformance.mutate,
    startOperation,
    endOperation,
    isRecording: recordMetric.isPending || recordPerformance.isPending
  }
}