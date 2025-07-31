import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getExecutionLogs, 
  getSystemMetrics, 
  getPerformanceLogs, 
  getErrorLogs, 
  getSessionLogs,
  logExecution,
  recordSystemMetric,
  logPerformance,
  logError,
  logSession,
  resolveError,
  type ExecutionLog,
  type SystemMetric,
  type PerformanceLog,
  type ErrorLog,
  type SessionLog
} from '@/lib/database'

// Execution Logs Hooks
export const useExecutionLogs = (limit = 50, component?: string, logLevel?: string) => {
  return useQuery({
    queryKey: ['execution-logs', limit, component, logLevel],
    queryFn: () => getExecutionLogs(limit, component, logLevel),
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time monitoring
  })
}

export const useLogExecution = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (logData: Omit<ExecutionLog, 'id' | 'user_id' | 'created_at'>) => 
      logExecution(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-logs'] })
    },
  })
}

// System Metrics Hooks
export const useSystemMetrics = (metricType?: string, hours = 24) => {
  return useQuery({
    queryKey: ['system-metrics', metricType, hours],
    queryFn: () => getSystemMetrics(metricType, hours),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  })
}

export const useRecordSystemMetric = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (metricData: Omit<SystemMetric, 'id' | 'user_id' | 'created_at'>) => 
      recordSystemMetric(metricData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-metrics'] })
    },
  })
}

// Performance Logs Hooks
export const usePerformanceLogs = (operationType?: string, limit = 100) => {
  return useQuery({
    queryKey: ['performance-logs', operationType, limit],
    queryFn: () => getPerformanceLogs(operationType, limit),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  })
}

export const useLogPerformance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (performanceData: Omit<PerformanceLog, 'id' | 'user_id' | 'created_at'>) => 
      logPerformance(performanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-logs'] })
    },
  })
}

// Error Logs Hooks
export const useErrorLogs = (severity?: string, resolved?: boolean, limit = 50) => {
  return useQuery({
    queryKey: ['error-logs', severity, resolved, limit],
    queryFn: () => getErrorLogs(severity, resolved, limit),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  })
}

export const useLogError = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (errorData: Omit<ErrorLog, 'id' | 'user_id' | 'created_at'>) => 
      logError(errorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] })
    },
  })
}

export const useResolveError = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, resolutionNotes }: { id: string; resolutionNotes?: string }) => 
      resolveError(id, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] })
    },
  })
}

// Session Logs Hooks
export const useSessionLogs = (sessionId?: string, limit = 100) => {
  return useQuery({
    queryKey: ['session-logs', sessionId, limit],
    queryFn: () => getSessionLogs(sessionId, limit),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  })
}

export const useLogSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (sessionData: Omit<SessionLog, 'id' | 'user_id' | 'created_at'>) => 
      logSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-logs'] })
    },
  })
}

// Combined monitoring stats hook
export const useMonitoringStats = () => {
  const executionLogs = useExecutionLogs(1000) // Get more logs for stats
  const errorLogs = useErrorLogs(undefined, undefined, 1000)
  const performanceLogs = usePerformanceLogs(undefined, 1000)
  
  return useQuery({
    queryKey: ['monitoring-stats'],
    queryFn: async () => {
      const logs = executionLogs.data || []
      const errors = errorLogs.data || []
      const performance = performanceLogs.data || []
      
      // Calculate stats from the data
      const logLevelCounts = logs.reduce((acc, log) => {
        acc[log.log_level] = (acc[log.log_level] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const errorSeverityCounts = errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const avgResponseTime = performance.length > 0 
        ? performance.reduce((sum, p) => sum + p.duration_ms, 0) / performance.length 
        : 0
      
      const successRate = performance.length > 0
        ? (performance.filter(p => p.status === 'success').length / performance.length) * 100
        : 0
      
      return {
        totalLogs: logs.length,
        errorCount: logLevelCounts.error || 0,
        warningCount: logLevelCounts.warn || 0,
        infoCount: logLevelCounts.info || 0,
        successCount: logLevelCounts.debug || 0,
        criticalErrors: errorSeverityCounts.critical || 0,
        unresolvedErrors: errors.filter(e => !e.resolved).length,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate),
        totalOperations: performance.length
      }
    },
    enabled: !!(executionLogs.data && errorLogs.data && performanceLogs.data),
    refetchInterval: 5000,
  })
}