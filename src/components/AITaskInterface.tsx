import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAIAgent, ExecutionType } from '@/hooks/useAIAgent'
import { Brain, Sparkles, Wrench, TrendingUp, Clock, Target, Lightbulb } from 'lucide-react'

const executionTypeIcons = {
  analysis: Brain,
  generation: Sparkles,
  problem_solving: Wrench,
  optimization: TrendingUp
}

const executionTypeDescriptions = {
  analysis: 'Deep analysis and insights extraction',
  generation: 'Creative content and idea generation',
  problem_solving: 'Step-by-step problem resolution',
  optimization: 'Performance and efficiency improvements'
}

export const AITaskInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [executionType, setExecutionType] = useState<ExecutionType>('analysis')
  const { 
    executeTask, 
    isProcessing, 
    data, 
    isSuccess,
    reset 
  } = useAIAgent()

  const handleExecute = () => {
    if (!prompt.trim()) return
    
    executeTask({
      prompt: prompt.trim(),
      executionType
    })
  }

  const handleClear = () => {
    setPrompt('')
    reset()
  }

  const Icon = executionTypeIcons[executionType]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Agent Interface
          </CardTitle>
          <CardDescription>
            Intelligent task execution with context-aware processing and learning capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Execution Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Execution Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(executionTypeDescriptions).map(([type, description]) => {
                const TypeIcon = executionTypeIcons[type as ExecutionType]
                const isSelected = executionType === type
                
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => setExecutionType(type as ExecutionType)}
                  >
                    <TypeIcon className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium capitalize">{type.replace('_', ' ')}</div>
                      <div className="text-xs opacity-70">{description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Icon className="h-4 w-4" />
              Task Prompt
            </label>
            <Textarea
              placeholder={`Enter your ${executionType.replace('_', ' ')} request...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={isProcessing}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleExecute}
              disabled={!prompt.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  Execute Task
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={isProcessing}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {isSuccess && data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Execution Results
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={data.confidence > 0.8 ? "default" : "secondary"}>
                {Math.round(data.confidence * 100)}% Confidence
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {data.executionTime}ms
              </Badge>
              {data.knowledgePatternsFound > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  {data.knowledgePatternsFound} Patterns Found
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Result */}
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Response</label>
              <ScrollArea className="h-64 w-full border rounded-md p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {data.result}
                </div>
              </ScrollArea>
            </div>

            {/* Suggestions */}
            {data.suggestions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Suggestions
                </label>
                <div className="space-y-2">
                  {data.suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-muted rounded-md text-sm border-l-4 border-primary"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}