import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export type ExecutionType = 'analysis' | 'generation' | 'problem_solving' | 'optimization'

interface AITaskRequest {
  taskId?: string
  prompt: string
  executionType: ExecutionType
  context?: {
    knowledgePatterns?: any[]
    userStats?: any
    previousTasks?: any[]
  }
}

interface AITaskResponse {
  success: boolean
  result: string
  executionTime: number
  knowledgePatternsFound: number
  confidence: number
  suggestions: string[]
}

export const useAIAgent = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  const executeTask = useMutation({
    mutationFn: async (request: AITaskRequest): Promise<AITaskResponse> => {
      setIsProcessing(true)
      
      try {
        console.log('Executing AI task:', request.executionType)
        
        const { data, error } = await supabase.functions.invoke('ai-agent', {
          body: request
        })

        if (error) {
          console.error('AI Agent error:', error)
          throw new Error(error.message || 'AI task execution failed')
        }

        if (!data.success) {
          throw new Error(data.error || 'AI task failed')
        }

        return data
      } finally {
        setIsProcessing(false)
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgePatterns'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      
      toast({
        title: 'AI Task Completed',
        description: `Task executed in ${data.executionTime}ms with ${data.confidence}% confidence`,
      })
    },
    onError: (error) => {
      console.error('AI task error:', error)
      toast({
        title: 'AI Task Failed',
        description: error.message || 'Failed to execute AI task',
        variant: 'destructive',
      })
    }
  })

  // Quick analysis function
  const analyzeText = async (text: string, context?: any) => {
    return executeTask.mutateAsync({
      prompt: `Analyze the following text and provide insights: ${text}`,
      executionType: 'analysis',
      context
    })
  }

  // Content generation function
  const generateContent = async (prompt: string, context?: any) => {
    return executeTask.mutateAsync({
      prompt: `Generate content based on: ${prompt}`,
      executionType: 'generation',
      context
    })
  }

  // Problem solving function
  const solveProblem = async (problem: string, context?: any) => {
    return executeTask.mutateAsync({
      prompt: `Solve this problem step by step: ${problem}`,
      executionType: 'problem_solving',
      context
    })
  }

  // Optimization function
  const optimizeProcess = async (process: string, context?: any) => {
    return executeTask.mutateAsync({
      prompt: `Optimize the following process: ${process}`,
      executionType: 'optimization',
      context
    })
  }

  return {
    executeTask: executeTask.mutate,
    executeTaskAsync: executeTask.mutateAsync,
    analyzeText,
    generateContent,
    solveProblem,
    optimizeProcess,
    isProcessing: isProcessing || executeTask.isPending,
    isSuccess: executeTask.isSuccess,
    isError: executeTask.isError,
    error: executeTask.error,
    data: executeTask.data,
    reset: executeTask.reset
  }
}