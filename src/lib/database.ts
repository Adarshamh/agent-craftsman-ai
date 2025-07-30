import { supabase } from './supabase'

// Database Types
export interface Task {
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

export interface KnowledgePattern {
  id: string
  user_id: string
  pattern_type: string
  pattern_data: any
  usage_count: number
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  user_id: string
  tasks_completed: number
  code_generated: number
  knowledge_base_size: number
  success_rate: number
  last_updated: string
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
      last_updated: new Date().toISOString()
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