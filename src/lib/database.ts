import { supabase } from '@/integrations/supabase/client'

// Database Types
export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  execution_time_ms?: number
  error_message?: string
  metadata: any
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface KnowledgePattern {
  id: string
  user_id: string
  pattern_type: string
  pattern_name: string
  pattern_data: any
  description?: string
  usage_count: number
  effectiveness_score?: number
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  total_execution_time_ms: number
  average_response_time_ms?: number
  error_rate: number
  uptime_percentage: number
  last_activity_at?: string
  created_at: string
  updated_at: string
}

// Monitoring Types
export interface ExecutionLog {
  id: string
  user_id: string
  component: string
  operation: string
  log_level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  metadata: any
  execution_time_ms?: number
  created_at: string
}

export interface SystemMetric {
  id: string
  user_id: string
  metric_type: string
  metric_name: string
  value: number
  unit?: string
  metadata: any
  created_at: string
}

export interface PerformanceLog {
  id: string
  user_id: string
  operation_type: string
  operation_name: string
  duration_ms: number
  memory_usage_mb?: number
  cpu_usage_percent?: number
  metadata: any
  created_at: string
}

export interface ErrorLog {
  id: string
  user_id: string
  error_type: string
  error_message: string
  stack_trace?: string
  component?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolution_notes?: string
  metadata: any
  created_at: string
  resolved_at?: string
}

export interface SessionLog {
  id: string
  user_id: string
  session_id: string
  event_type: string
  event_data: any
  created_at: string
}

// Task Operations
export const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...taskData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTasks = async (limit = 10) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Knowledge Pattern Operations
export const addKnowledgePattern = async (pattern: Omit<KnowledgePattern, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('knowledge_patterns')
    .insert({
      ...pattern,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getKnowledgePatterns = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('knowledge_patterns')
    .select('*')
    .eq('user_id', user.id)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data || []
}

// User Stats Operations
export const getUserStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const updateUserStats = async (stats: Partial<UserStats>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: user.id,
      ...stats,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Analytics Operations
export const getTaskAnalytics = async (days = 7) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('tasks')
    .select('status, created_at, execution_time, code_generated')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ============= MONITORING OPERATIONS =============

// Execution Logging
export const logExecution = async (logData: Omit<ExecutionLog, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('execution_logs')
    .insert({
      ...logData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getExecutionLogs = async (limit = 50, component?: string, logLevel?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('execution_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (component) query = query.eq('component', component)
  if (logLevel) query = query.eq('log_level', logLevel)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// System Metrics
export const recordSystemMetric = async (metricData: Omit<SystemMetric, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('system_metrics')
    .insert({
      ...metricData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSystemMetrics = async (metricType?: string, hours = 24) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const startTime = new Date()
  startTime.setHours(startTime.getHours() - hours)

  let query = supabase
    .from('system_metrics')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startTime.toISOString())
    .order('created_at', { ascending: true })

  if (metricType) query = query.eq('metric_type', metricType)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Performance Logging
export const logPerformance = async (performanceData: Omit<PerformanceLog, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('performance_logs')
    .insert({
      ...performanceData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPerformanceLogs = async (operationType?: string, limit = 100) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('performance_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (operationType) query = query.eq('operation_type', operationType)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Error Logging
export const logError = async (errorData: Omit<ErrorLog, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('error_logs')
    .insert({
      ...errorData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getErrorLogs = async (severity?: string, resolved?: boolean, limit = 50) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('error_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (severity) query = query.eq('severity', severity)
  if (resolved !== undefined) query = query.eq('resolved', resolved)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const resolveError = async (id: string, resolutionNotes?: string) => {
  const { data, error } = await supabase
    .from('error_logs')
    .update({
      resolved: true,
      resolution_notes: resolutionNotes,
      resolved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Session Logging
export const logSession = async (sessionData: Omit<SessionLog, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('session_logs')
    .insert({
      ...sessionData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSessionLogs = async (sessionId?: string, limit = 100) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('session_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (sessionId) query = query.eq('session_id', sessionId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Utility Functions for Monitoring
export const createPerformanceWrapper = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationType: string,
  operationName: string
): T => {
  return ((...args: Parameters<T>) => {
    const startTime = Date.now()
    
    return fn(...args).then(
      (result) => {
        const duration = Date.now() - startTime
        logPerformance({
          operation_type: operationType,
          operation_name: operationName,
          duration_ms: duration,
          metadata: { 
            status: 'success',
            input_size: JSON.stringify(args).length,
            output_size: JSON.stringify(result).length,
            args_count: args.length 
          }
        }).catch(console.error)
        return result
      },
      (error) => {
        const duration = Date.now() - startTime
        logPerformance({
          operation_type: operationType,
          operation_name: operationName,
          duration_ms: duration,
          metadata: { 
            status: 'error',
            error_details: error.message,
            input_size: JSON.stringify(args).length,
            args_count: args.length 
          }
        }).catch(console.error)
        throw error
      }
    )
  }) as T
}

export const logger = {
  debug: (message: string, component?: string, metadata?: any, taskId?: string) =>
    logExecution({ 
      log_level: 'debug', 
      message, 
      component: component || 'unknown', 
      operation: 'debug_log',
      metadata: { ...metadata, task_id: taskId } 
    }),
  
  info: (message: string, component?: string, metadata?: any, taskId?: string) =>
    logExecution({ 
      log_level: 'info', 
      message, 
      component: component || 'unknown', 
      operation: 'info_log',
      metadata: { ...metadata, task_id: taskId } 
    }),
  
  warn: (message: string, component?: string, metadata?: any, taskId?: string) =>
    logExecution({ 
      log_level: 'warn', 
      message, 
      component: component || 'unknown', 
      operation: 'warn_log',
      metadata: { ...metadata, task_id: taskId } 
    }),
  
  error: (message: string, component?: string, metadata?: any, taskId?: string, errorDetails?: any) => {
    // Log to execution logs
    logExecution({ 
      log_level: 'error', 
      message, 
      component: component || 'unknown', 
      operation: 'error_log',
      metadata: { ...metadata, task_id: taskId, error_details: errorDetails } 
    })
    
    // Also log to error logs for centralized error tracking
    logError({
      error_type: 'application_error',
      error_message: message,
      component: component || 'unknown',
      severity: 'medium',
      resolved: false,
      stack_trace: errorDetails?.stack,
      metadata: metadata || {}
    })
  },
  
  fatal: (message: string, component?: string, metadata?: any, taskId?: string, errorDetails?: any) => {
    // Log to execution logs
    logExecution({ 
      log_level: 'fatal', 
      message, 
      component: component || 'unknown', 
      operation: 'fatal_log',
      metadata: { ...metadata, task_id: taskId, error_details: errorDetails } 
    })
    
    // Also log to error logs for centralized error tracking
    logError({
      error_type: 'fatal_error',
      error_message: message,
      component: component || 'unknown',
      severity: 'critical',
      resolved: false,
      stack_trace: errorDetails?.stack,
      metadata: metadata || {}
    })
  }
}