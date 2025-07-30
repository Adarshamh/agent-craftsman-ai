import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Task,
  KnowledgePattern,
  UserStats,
  createTask,
  getTasks,
  updateTask,
  addKnowledgePattern,
  getKnowledgePatterns,
  getUserStats,
  updateUserStats,
  getTaskAnalytics
} from '@/lib/database'
import { toast } from '@/hooks/use-toast'

// Tasks Hook
export const useTasks = (limit = 10) => {
  return useQuery({
    queryKey: ['tasks', limit],
    queryFn: () => getTasks(limit),
    refetchOnWindowFocus: false
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      })
      console.error('Create task error:', error)
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => 
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      })
      console.error('Update task error:', error)
    }
  })
}

// Knowledge Patterns Hook
export const useKnowledgePatterns = () => {
  return useQuery({
    queryKey: ['knowledgePatterns'],
    queryFn: getKnowledgePatterns,
    refetchOnWindowFocus: false
  })
}

export const useAddKnowledgePattern = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: addKnowledgePattern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgePatterns'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add knowledge pattern',
        variant: 'destructive'
      })
      console.error('Add knowledge pattern error:', error)
    }
  })
}

// User Stats Hook
export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    refetchOnWindowFocus: false
  })
}

export const useUpdateUserStats = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUserStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update stats',
        variant: 'destructive'
      })
      console.error('Update stats error:', error)
    }
  })
}

// Analytics Hook
export const useTaskAnalytics = (days = 7) => {
  return useQuery({
    queryKey: ['taskAnalytics', days],
    queryFn: () => getTaskAnalytics(days),
    refetchOnWindowFocus: false
  })
}

// Realtime Stats Hook
export const useRealtimeStats = () => {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    codeGenerated: 0,
    knowledgeBase: 0,
    successRate: 0
  })

  const { data: userStats } = useUserStats()
  const { data: tasks } = useTasks(50)
  const { data: patterns } = useKnowledgePatterns()

  useEffect(() => {
    if (userStats || tasks || patterns) {
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
      const totalCodeGenerated = tasks?.reduce((sum, task) => sum + (task.code_generated || 0), 0) || 0
      const successfulTasks = tasks?.filter(t => t.status === 'completed').length || 0
      const totalTasks = tasks?.length || 0
      const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0

      setStats({
        tasksCompleted: userStats?.tasks_completed || completedTasks,
        codeGenerated: userStats?.code_generated || totalCodeGenerated,
        knowledgeBase: userStats?.knowledge_base_size || patterns?.length || 0,
        successRate: userStats?.success_rate || successRate
      })
    }
  }, [userStats, tasks, patterns])

  return stats
}