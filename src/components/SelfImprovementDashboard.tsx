import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useSelfImprovement } from '@/hooks/useSelfImprovement'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  Zap, 
  Target, 
  Clock,
  Lightbulb,
  RefreshCw
} from 'lucide-react'

export const SelfImprovementDashboard: React.FC = () => {
  const { 
    metrics, 
    knowledgePatterns, 
    taskFeedback, 
    isLoading, 
    optimizePatterns, 
    isOptimizing 
  } = useSelfImprovement()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Self-Improvement Analytics
          </h2>
          <p className="text-muted-foreground">
            AI system learning and optimization metrics
          </p>
        </div>
        <Button 
          onClick={() => optimizePatterns()} 
          disabled={isOptimizing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
          Optimize Patterns
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Confidence Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Avg Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {(metrics.avgConfidence * 100).toFixed(1)}%
                </div>
                <Progress value={metrics.avgConfidence * 100} className="h-2" />
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(metrics.improvementTrend)}
                  <span className={getTrendColor(metrics.improvementTrend)}>
                    {metrics.improvementTrend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {(metrics.successRate * 100).toFixed(1)}%
                </div>
                <Progress value={metrics.successRate * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Tasks with &gt;70% confidence
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Avg Execution Time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Execution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avgExecutionTime > 1000 
                  ? `${(metrics.avgExecutionTime / 1000).toFixed(1)}s`
                  : `${metrics.avgExecutionTime.toFixed(0)}ms`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Processing efficiency
              </p>
            </CardContent>
          </Card>

          {/* Pattern Count */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Learned Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {knowledgePatterns?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Optimizable patterns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Improvement Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Top Improvement Suggestions
            </CardTitle>
            <CardDescription>
              AI-generated recommendations for better performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.topSuggestions && metrics.topSuggestions.length > 0 ? (
              <div className="space-y-3">
                {metrics.topSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-sm flex-1">{suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No suggestions available yet.</p>
                <p className="text-sm">Complete more tasks to get personalized recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Learning Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recent Learning Patterns
            </CardTitle>
            <CardDescription>
              Latest AI knowledge patterns discovered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {knowledgePatterns && knowledgePatterns.length > 0 ? (
              <div className="space-y-3">
                {knowledgePatterns.slice(0, 5).map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{pattern.pattern_name}</h3>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {pattern.pattern_type}
                        </Badge>
                        {pattern.optimization_score && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(pattern.optimization_score * 100)}% opt
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Used {pattern.usage_count} times • 
                      {pattern.effectiveness_score && 
                        ` ${Math.round(pattern.effectiveness_score * 100)}% effective`
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patterns learned yet.</p>
                <p className="text-sm">Execute AI tasks to start building knowledge patterns.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Task Feedback */}
      {taskFeedback && taskFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Task Feedback</CardTitle>
            <CardDescription>
              Latest performance feedback and learning insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taskFeedback.slice(0, 3).map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={feedback.confidence_score > 0.8 ? 'default' : 'outline'}>
                      {(feedback.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {feedback.feedback_data?.quality_indicators && (
                    <div className="text-sm space-y-1">
                      <div className="flex gap-4">
                        <span>Quality: <Badge variant="outline" className="text-xs">
                          {feedback.feedback_data.quality_indicators.coherence}
                        </Badge></span>
                        <span>Efficiency: <Badge variant="outline" className="text-xs">
                          {feedback.feedback_data.efficiency_rating}
                        </Badge></span>
                      </div>
                    </div>
                  )}
                  
                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Suggestions:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {feedback.suggestions.slice(0, 2).map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}