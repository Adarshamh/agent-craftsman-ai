import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AITaskInterface } from '@/components/AITaskInterface'
import { SmartTaskCreator } from '@/components/SmartTaskCreator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useKnowledgePatterns, useUserStats, useTaskAnalytics } from '@/hooks/useDatabase'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, TrendingUp, Database, Clock, Target, Lightbulb } from 'lucide-react'

export const AIAgent: React.FC = () => {
  const { data: knowledgePatterns } = useKnowledgePatterns()
  const { data: userStats } = useUserStats()
  const { data: analytics } = useTaskAnalytics(30)

  const completionRate = userStats?.total_tasks 
    ? (userStats.completed_tasks / userStats.total_tasks) * 100 
    : 0

  const avgResponseTime = userStats?.average_response_time_ms || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            AI Agent System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Intelligent task processing with self-improving capabilities and contextual learning
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {userStats?.completed_tasks || 0} of {userStats?.total_tasks || 0} tasks
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgResponseTime > 1000 
                  ? `${(avgResponseTime / 1000).toFixed(1)}s`
                  : `${avgResponseTime.toFixed(0)}ms`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Processing efficiency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Knowledge Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{knowledgePatterns?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Learned patterns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats?.error_rate ? `${(userStats.error_rate * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                System reliability
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="interface" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Interface
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Smart Creator
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interface" className="space-y-6">
            <AITaskInterface />
          </TabsContent>

          <TabsContent value="creator" className="space-y-6">
            <SmartTaskCreator />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Knowledge Patterns
                </CardTitle>
                <CardDescription>
                  AI-learned patterns and successful approaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgePatterns && knowledgePatterns.length > 0 ? (
                  <div className="space-y-4">
                    {knowledgePatterns.map((pattern) => (
                      <div key={pattern.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{pattern.pattern_name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{pattern.pattern_type}</Badge>
                            {pattern.effectiveness_score && (
                              <Badge variant="secondary">
                                {Math.round(pattern.effectiveness_score * 100)}% effective
                              </Badge>
                            )}
                          </div>
                        </div>
                        {pattern.description && (
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Used {pattern.usage_count} times • Created {new Date(pattern.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No knowledge patterns learned yet.</p>
                    <p className="text-sm">Execute AI tasks to start building your knowledge base.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}