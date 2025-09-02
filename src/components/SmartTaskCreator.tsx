import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useCreateTask } from '@/hooks/useDatabase'
import { useAIAgent, ExecutionType } from '@/hooks/useAIAgent'
import { Plus, Brain, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
]

export const SmartTaskCreator: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [executionType, setExecutionType] = useState<ExecutionType>('analysis')
  const [useAI, setUseAI] = useState(false)
  
  const createTask = useCreateTask()
  const { executeTaskAsync, isProcessing } = useAIAgent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required',
        variant: 'destructive'
      })
      return
    }

    try {
      // Create the task first
      const newTask = await new Promise<any>((resolve, reject) => {
        createTask.mutate({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status: useAI ? 'running' : 'pending',
          metadata: {
            ai_enabled: useAI,
            execution_type: useAI ? executionType : undefined,
            created_via: 'smart_creator'
          }
        }, {
          onSuccess: resolve,
          onError: reject
        })
      })

      // If AI processing is enabled, execute the task immediately
      if (useAI && newTask?.id) {
        try {
          const aiResult = await executeTaskAsync({
            taskId: newTask.id,
            prompt: `Task: ${title}\nDescription: ${description}\nPriority: ${priority}\n\nPlease process this task according to the specified execution type.`,
            executionType
          })

          toast({
            title: 'Smart Task Created & Processed',
            description: `Task created and processed by AI in ${aiResult.executionTime}ms`,
          })
        } catch (aiError) {
          console.error('AI processing failed:', aiError)
          toast({
            title: 'Task Created (AI Processing Failed)',
            description: 'Task was created but AI processing encountered an error',
            variant: 'destructive'
          })
        }
      } else {
        toast({
          title: 'Task Created',
          description: 'Task has been created successfully',
        })
      }

      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setExecutionType('analysis')
      setUseAI(false)

    } catch (error) {
      console.error('Task creation error:', error)
      toast({
        title: 'Creation Failed',
        description: 'Failed to create task',
        variant: 'destructive'
      })
    }
  }

  const isLoading = createTask.isPending || isProcessing

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Smart Task Creator
        </CardTitle>
        <CardDescription>
          Create tasks with optional AI processing and intelligent execution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Title *</label>
            <Input
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the task in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={priority === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority(option.value as any)}
                  disabled={isLoading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* AI Processing Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={isLoading}
                className="rounded"
              />
              <label htmlFor="useAI" className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Enable AI Processing
              </label>
            </div>

            {useAI && (
              <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                <label className="text-sm font-medium">AI Execution Type</label>
                <Select 
                  value={executionType} 
                  onValueChange={(value: ExecutionType) => setExecutionType(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analysis">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Analysis - Deep insights and examination
                      </div>
                    </SelectItem>
                    <SelectItem value="generation">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generation - Creative content creation
                      </div>
                    </SelectItem>
                    <SelectItem value="problem_solving">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Problem Solving - Step-by-step solutions
                      </div>
                    </SelectItem>
                    <SelectItem value="optimization">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Optimization - Performance improvements
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    AI will process this task immediately after creation using the selected execution type.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isProcessing ? 'Processing with AI...' : 'Creating Task...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {useAI ? 'Create & Process with AI' : 'Create Task'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}