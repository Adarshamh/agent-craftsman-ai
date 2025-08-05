// Legacy database interface for backward compatibility
// This will be updated incrementally to match the new schema

import { supabase } from '@/integrations/supabase/client'

// Legacy interfaces for existing components
export interface LegacyTask {
  id: string
  user_id: string
  title: string
  description: string
  model: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  result?: string
  error_message?: string
  created_at: string
  updated_at: string
  execution_time?: number
  code_generated?: number
}

export interface LegacyUserStats {
  id: string
  user_id: string
  tasks_completed: number
  code_generated: number
  knowledge_base_size: number
  success_rate: number
  last_updated: string
}

export interface LegacySystemMetric {
  id: string
  user_id: string
  metric_type: string
  metric_value: number
  metric_unit?: string
  component?: string
  metadata: any
  created_at: string
}

export interface LegacyPerformanceLog {
  id: string
  user_id: string
  operation_type: string
  operation_name: string
  duration_ms: number
  status: 'success' | 'error' | 'timeout'
  error_details?: string
  input_size?: number
  output_size?: number
  metadata: any
  created_at: string
}

export interface LegacyExecutionLog {
  id: string
  user_id: string
  task_id?: string
  log_level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  metadata: any
  component?: string
  execution_context: any
  created_at: string
}

// Legacy functions that map to new schema
export const createTask = async (taskData: Omit<LegacyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Map legacy fields to new schema
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status === 'executing' ? 'running' : taskData.status,
      priority: 'medium', // Default priority
      execution_time_ms: taskData.execution_time,
      error_message: taskData.error_message,
      metadata: { 
        model: taskData.model, 
        result: taskData.result,
        code_generated: taskData.code_generated
      },
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  
  // Map back to legacy format for compatibility
  return {
    ...data,
    model: data.metadata?.model || '',
    result: data.metadata?.result,
    execution_time: data.execution_time_ms,
    code_generated: data.metadata?.code_generated || 0
  }
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
  
  // Map to legacy format
  return (data || []).map(task => ({
    ...task,
    model: task.metadata?.model || '',
    result: task.metadata?.result,
    execution_time: task.execution_time_ms,
    code_generated: task.metadata?.code_generated || 0,
    status: task.status === 'running' ? 'executing' : task.status
  }))
}

export const updateTask = async (id: string, updates: Partial<LegacyTask>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      status: updates.status === 'executing' ? 'running' : updates.status,
      execution_time_ms: updates.execution_time,
      error_message: updates.error_message,
      metadata: {
        model: updates.model,
        result: updates.result,
        code_generated: updates.code_generated
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  return {
    ...data,
    model: data.metadata?.model || '',
    result: data.metadata?.result,
    execution_time: data.execution_time_ms,
    code_generated: data.metadata?.code_generated || 0
  }
}

export const getUserStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  if (!data) return null
  
  // Map to legacy format
  return {
    id: data.id,
    user_id: data.user_id,
    tasks_completed: data.completed_tasks,
    code_generated: 0, // Not tracked in new schema
    knowledge_base_size: 0, // Will get from knowledge patterns
    success_rate: data.total_tasks > 0 ? (data.completed_tasks / data.total_tasks) * 100 : 0,
    last_updated: data.updated_at
  }
}

export const updateUserStats = async (stats: Partial<LegacyUserStats>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: user.id,
      completed_tasks: stats.tasks_completed,
      total_tasks: stats.tasks_completed || 0,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  
  return {
    id: data.id,
    user_id: data.user_id,
    tasks_completed: data.completed_tasks,
    code_generated: 0,
    knowledge_base_size: 0,
    success_rate: data.total_tasks > 0 ? (data.completed_tasks / data.total_tasks) * 100 : 0,
    last_updated: data.updated_at
  }
}

export const getTaskAnalytics = async (days = 7) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('tasks')
    .select('status, created_at, execution_time_ms, metadata')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error
  
  // Map to legacy format
  return (data || []).map(task => ({
    status: task.status === 'running' ? 'executing' : task.status,
    created_at: task.created_at,
    execution_time: task.execution_time_ms,
    code_generated: task.metadata?.code_generated || 0
  }))
}

// Legacy monitoring functions with field mapping
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
  
  // Map to legacy format
  return (data || []).map(metric => ({
    ...metric,
    metric_value: metric.value,
    metric_unit: metric.unit,
    component: metric.metadata?.component
  }))
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
  
  // Map to legacy format - add status field based on data
  return (data || []).map(log => ({
    ...log,
    status: 'success' as const, // Default to success since new schema doesn't have status
    input_size: log.metadata?.input_size,
    output_size: log.metadata?.output_size
  }))
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
  
  // Map to legacy format
  return (data || []).map(log => ({
    ...log,
    task_id: log.metadata?.task_id,
    execution_context: log.metadata
  }))
}

// Re-export other functions that are compatible
export * from './database'