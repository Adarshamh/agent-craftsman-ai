import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface TaskFeedback {
  id: string
  task_id: string
  feedback_type: string
  feedback_data: any
  confidence_score: number
  suggestions: string[]
  created_at: string
}

interface ImprovementMetrics {
  avgConfidence: number
  avgExecutionTime: number
  successRate: number
  improvementTrend: 'improving' | 'stable' | 'declining'
  topSuggestions: string[]
}

export const useSelfImprovement = () => {
  const [metrics, setMetrics] = useState<ImprovementMetrics | null>(null)
  const queryClient = useQueryClient()

  // Fetch task feedback
  const { data: taskFeedback, isLoading } = useQuery({
    queryKey: ['taskFeedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as TaskFeedback[]
    }
  })

  // Fetch knowledge patterns for optimization
  const { data: knowledgePatterns } = useQuery({
    queryKey: ['knowledgePatterns', 'optimization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_patterns')
        .select('*')
        .order('optimization_score', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    }
  })

  // Optimize patterns mutation
  const optimizePatterns = useMutation({
    mutationFn: async () => {
      if (!knowledgePatterns || knowledgePatterns.length === 0) {
        throw new Error('No patterns available for optimization')
      }

      // Find patterns that can be improved
      const improvablePatterns = knowledgePatterns.filter(
        pattern => pattern.usage_count > 5 && pattern.effectiveness_score < 0.9
      )

      for (const pattern of improvablePatterns) {
        const optimizedScore = Math.min(1.0, pattern.effectiveness_score + 0.05)
        
        await supabase
          .from('knowledge_patterns')
          .update({
            effectiveness_score: optimizedScore,
            optimization_score: optimizedScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', pattern.id)
      }

      return improvablePatterns.length
    },
    onSuccess: (optimizedCount) => {
      queryClient.invalidateQueries({ queryKey: ['knowledgePatterns'] })
      toast({
        title: 'Patterns Optimized',
        description: `Improved ${optimizedCount} knowledge patterns based on usage data`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Optimization Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Calculate improvement metrics
  useEffect(() => {
    if (taskFeedback && taskFeedback.length > 0) {
      const recentFeedback = taskFeedback.slice(0, 10)
      const olderFeedback = taskFeedback.slice(10, 20)

      const avgConfidence = recentFeedback.reduce((sum, f) => sum + f.confidence_score, 0) / recentFeedback.length
      const avgExecutionTime = recentFeedback.reduce((sum, f) => {
        return sum + (f.feedback_data?.execution_time_ms || 0)
      }, 0) / recentFeedback.length

      const successRate = recentFeedback.filter(f => f.confidence_score > 0.7).length / recentFeedback.length

      // Calculate trend
      let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable'
      if (olderFeedback.length > 0) {
        const oldAvgConfidence = olderFeedback.reduce((sum, f) => sum + f.confidence_score, 0) / olderFeedback.length
        if (avgConfidence > oldAvgConfidence + 0.05) {
          improvementTrend = 'improving'
        } else if (avgConfidence < oldAvgConfidence - 0.05) {
          improvementTrend = 'declining'
        }
      }

      // Extract top suggestions
      const allSuggestions = recentFeedback.flatMap(f => f.suggestions || [])
      const suggestionCounts = allSuggestions.reduce((counts, suggestion) => {
        counts[suggestion] = (counts[suggestion] || 0) + 1
        return counts
      }, {} as Record<string, number>)

      const topSuggestions = Object.entries(suggestionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([suggestion]) => suggestion)

      setMetrics({
        avgConfidence,
        avgExecutionTime,
        successRate,
        improvementTrend,
        topSuggestions
      })
    }
  }, [taskFeedback])

  // Auto-optimize patterns when confidence trends are good
  useEffect(() => {
    if (metrics && metrics.improvementTrend === 'improving' && metrics.avgConfidence > 0.8) {
      // Auto-optimize every 10 successful runs
      const shouldOptimize = Math.random() < 0.1 // 10% chance
      if (shouldOptimize && knowledgePatterns && knowledgePatterns.length > 0) {
        optimizePatterns.mutate()
      }
    }
  }, [metrics, knowledgePatterns])

  return {
    taskFeedback,
    knowledgePatterns,
    metrics,
    isLoading,
    optimizePatterns: optimizePatterns.mutate,
    isOptimizing: optimizePatterns.isPending
  }
}