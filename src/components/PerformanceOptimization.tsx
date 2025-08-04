import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Cpu,
  HardDrive,
  Database,
  Network,
  Zap,
  Target
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

// Mock performance data
const performanceMetrics = [
  { time: '00:00', cpu: 45, memory: 62, network: 78, database: 34 },
  { time: '04:00', cpu: 52, memory: 68, network: 82, database: 41 },
  { time: '08:00', cpu: 78, memory: 84, network: 95, database: 67 },
  { time: '12:00', cpu: 85, memory: 91, network: 88, database: 73 },
  { time: '16:00', cpu: 73, memory: 79, network: 85, database: 58 },
  { time: '20:00', cpu: 58, memory: 71, network: 79, database: 45 },
]

const bottlenecks = [
  {
    id: 1,
    component: 'Database Query Executor',
    severity: 'high',
    impact: 'Response time increased by 45%',
    suggestion: 'Add index on frequently queried columns',
    savings: '2.3s avg response time',
  },
  {
    id: 2,
    component: 'Memory Cache',
    severity: 'medium',
    impact: 'Cache hit ratio below 80%',
    suggestion: 'Increase cache size or optimize cache keys',
    savings: '15% performance boost',
  },
  {
    id: 3,
    component: 'API Rate Limiter',
    severity: 'low',
    impact: 'Blocking 2% of requests',
    suggestion: 'Review rate limiting policies',
    savings: '2% throughput increase',
  },
]

const recommendations = [
  {
    id: 1,
    title: 'Optimize Database Queries',
    priority: 'high',
    effort: 'medium',
    impact: 'high',
    description: 'Add composite indexes to reduce query execution time',
    estimatedSavings: '40% query performance improvement',
  },
  {
    id: 2,
    title: 'Implement Connection Pooling',
    priority: 'medium',
    effort: 'low',
    impact: 'medium',
    description: 'Reduce database connection overhead',
    estimatedSavings: '25% reduction in connection latency',
  },
  {
    id: 3,
    title: 'Enable Response Compression',
    priority: 'medium',
    effort: 'low',
    impact: 'medium',
    description: 'Compress API responses to reduce bandwidth',
    estimatedSavings: '30% bandwidth reduction',
  },
]

const resourceTrends = [
  { date: '2024-01-01', cpuAvg: 45, memoryAvg: 62, networkAvg: 78 },
  { date: '2024-01-02', cpuAvg: 48, memoryAvg: 65, networkAvg: 82 },
  { date: '2024-01-03', cpuAvg: 52, memoryAvg: 68, networkAvg: 85 },
  { date: '2024-01-04', cpuAvg: 55, memoryAvg: 71, networkAvg: 88 },
  { date: '2024-01-05', cpuAvg: 58, memoryAvg: 74, networkAvg: 91 },
  { date: '2024-01-06', cpuAvg: 62, memoryAvg: 77, networkAvg: 94 },
  { date: '2024-01-07', cpuAvg: 59, memoryAvg: 75, networkAvg: 89 },
]

export function PerformanceOptimization() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Optimization</h2>
          <p className="text-muted-foreground">
            Identify bottlenecks and optimize system performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Run Optimization
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottleneck Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Resource Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span>+5% from yesterday</span>
                </div>
                <Progress value={73} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span>-2% from yesterday</span>
                </div>
                <Progress value={68} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span>+8% from yesterday</span>
                </div>
                <Progress value={82} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Load</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span>-3% from yesterday</span>
                </div>
                <Progress value={45} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Metrics</CardTitle>
              <CardDescription>
                System resource utilization over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network %" />
                  <Line type="monotone" dataKey="database" stroke="#ff7300" name="Database %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Identified Bottlenecks
              </CardTitle>
              <CardDescription>
                Performance issues that are impacting system efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bottlenecks.map((bottleneck) => (
                  <Card key={bottleneck.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{bottleneck.component}</h3>
                            <Badge variant={getSeverityColor(bottleneck.severity)}>
                              {bottleneck.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{bottleneck.impact}</p>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium">Suggested Fix:</p>
                            <p className="text-sm">{bottleneck.suggestion}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <Zap className="h-4 w-4" />
                            <span>Potential savings: {bottleneck.savings}</span>
                          </div>
                        </div>
                        <Button size="sm">Apply Fix</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Performance Recommendations
              </CardTitle>
              <CardDescription>
                Actionable improvements to boost system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <Card key={recommendation.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{recommendation.title}</h3>
                            <Badge variant={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.description}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Effort:</span> {recommendation.effort}
                            </div>
                            <div>
                              <span className="font-medium">Impact:</span> {recommendation.impact}
                            </div>
                            <div>
                              <span className="font-medium">Savings:</span> {recommendation.estimatedSavings}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm">Learn More</Button>
                          <Button size="sm">Implement</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Trends</CardTitle>
              <CardDescription>
                Historical resource utilization patterns over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={resourceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpuAvg" stackId="1" stroke="#8884d8" fill="#8884d8" name="CPU Average" />
                  <Area type="monotone" dataKey="memoryAvg" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Memory Average" />
                  <Area type="monotone" dataKey="networkAvg" stackId="1" stroke="#ffc658" fill="#ffc658" name="Network Average" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-green-600">87</div>
                  <div className="text-sm text-muted-foreground">Overall Performance Score</div>
                  <Progress value={87} className="mt-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optimization Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Database Optimization</span>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Configuration</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Network Compression</span>
                    <Badge variant="default">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}