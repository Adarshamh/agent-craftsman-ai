import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar, TrendingUp, TrendingDown, Activity, AlertTriangle, BarChart3, Download } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  useSystemMetrics, 
  usePerformanceLogs, 
  useErrorLogs, 
  useExecutionLogs 
} from '@/hooks/useMonitoring'
import { format, subDays, subHours } from 'date-fns'

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'

const TIME_RANGES = {
  '1h': { label: '1 Hour', hours: 1 },
  '6h': { label: '6 Hours', hours: 6 },
  '24h': { label: '24 Hours', hours: 24 },
  '7d': { label: '7 Days', hours: 168 },
  '30d': { label: '30 Days', hours: 720 }
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  
  const { data: systemMetrics = [] } = useSystemMetrics(undefined, TIME_RANGES[timeRange].hours)
  const { data: performanceLogs = [] } = usePerformanceLogs(undefined, 1000)
  const { data: errorLogs = [] } = useErrorLogs(undefined, undefined, 500)
  const { data: executionLogs = [] } = useExecutionLogs(1000)

  // Process data for charts
  const performanceData = useMemo(() => {
    const timeSlots = []
    const hoursToShow = TIME_RANGES[timeRange].hours
    const slotSize = hoursToShow <= 6 ? 15 : hoursToShow <= 24 ? 60 : hoursToShow <= 168 ? 360 : 1440 // minutes
    
    for (let i = hoursToShow * 60; i >= 0; i -= slotSize) {
      const time = subDays(new Date(), i / (24 * 60))
      timeSlots.push({
        time: format(time, hoursToShow <= 24 ? 'HH:mm' : 'MMM dd'),
        timestamp: time.getTime(),
        responseTime: 0,
        errorCount: 0,
        memoryUsage: 0,
        successRate: 100
      })
    }

    // Aggregate performance logs into time slots
    performanceLogs.forEach(log => {
      const logTime = new Date(log.created_at).getTime()
      const slot = timeSlots.find(s => 
        logTime >= s.timestamp && logTime < s.timestamp + (slotSize * 60 * 1000)
      )
        if (slot) {
          slot.responseTime = Math.max(slot.responseTime, log.duration_ms || 0)
          if (log.status !== 'success') slot.errorCount++
      }
    })

    // Add memory metrics
    systemMetrics.forEach(metric => {
      if (metric.metric_type === 'memory_usage') {
        const metricTime = new Date(metric.created_at).getTime()
        const slot = timeSlots.find(s => 
          metricTime >= s.timestamp && metricTime < s.timestamp + (slotSize * 60 * 1000)
        )
        if (slot) {
          slot.memoryUsage = Math.max(slot.memoryUsage, metric.metric_value)
        }
      }
    })

    return timeSlots
  }, [systemMetrics, performanceLogs, timeRange])

  const errorDistribution = useMemo(() => {
    const distribution = errorLogs.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([severity, count]) => ({
      name: severity,
      value: count,
      percentage: errorLogs.length > 0 ? Math.round((Number(count) / errorLogs.length) * 100) : 0
    }))
  }, [errorLogs])

  const logLevelDistribution = useMemo(() => {
    const distribution = executionLogs.reduce((acc, log) => {
      acc[log.log_level] = (acc[log.log_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([level, count]) => ({
      name: level,
      value: count,
      percentage: executionLogs.length > 0 ? Math.round((Number(count) / executionLogs.length) * 100) : 0
    }))
  }, [executionLogs])

  const getMetricTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0
    const recent = data.slice(-5).reduce((sum, item) => sum + item[key], 0) / 5
    const previous = data.slice(-10, -5).reduce((sum, item) => sum + item[key], 0) / 5
    return previous === 0 ? 0 : ((recent - previous) / previous) * 100
  }

  const avgResponseTime = performanceData.reduce((sum, item) => sum + item.responseTime, 0) / performanceData.length
  const responseTrend = getMetricTrend(performanceData, 'responseTime')
  
  const avgMemoryUsage = performanceData.reduce((sum, item) => sum + item.memoryUsage, 0) / performanceData.length
  const memoryTrend = getMetricTrend(performanceData, 'memoryUsage')

  const exportData = () => {
    const reportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        avgResponseTime: Math.round(avgResponseTime),
        avgMemoryUsage: Math.round(avgMemoryUsage),
        totalErrors: errorLogs.length,
        totalLogs: executionLogs.length
      },
      performanceData,
      errorDistribution,
      logLevelDistribution
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Performance insights and historical trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</p>
              </div>
              <div className="flex items-center">
                {responseTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm ml-1 ${responseTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(responseTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{Math.round(avgMemoryUsage)}%</p>
              </div>
              <div className="flex items-center">
                {memoryTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm ml-1 ${memoryTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(memoryTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-bold">{errorLogs.length}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Log Entries</p>
                <p className="text-2xl font-bold">{executionLogs.length}</p>
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="logs">Log Distribution</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>Average response time over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Trend</CardTitle>
                <CardDescription>Memory consumption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="memoryUsage" 
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))"
                      name="Memory Usage (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Distribution by Severity</CardTitle>
                <CardDescription>Breakdown of error types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {errorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Count Over Time</CardTitle>
                <CardDescription>Error frequency trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errorCount" fill="hsl(var(--destructive))" name="Error Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Log Level Distribution</CardTitle>
              <CardDescription>Breakdown of log entries by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={logLevelDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {logLevelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {logLevelDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{String(item.value)}</Badge>
                        <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>Side-by-side performance metrics comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="hsl(var(--primary))" 
                    name="Response Time (ms)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="memoryUsage" 
                    stroke="hsl(var(--secondary))" 
                    name="Memory Usage (%)" 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="errorCount" 
                    stroke="hsl(var(--destructive))" 
                    name="Error Count" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}