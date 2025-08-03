import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar, TrendingUp, TrendingDown, BarChart3, Activity, Clock, ArrowUpDown } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { 
  useSystemMetrics, 
  usePerformanceLogs, 
  useErrorLogs, 
  useExecutionLogs 
} from '@/hooks/useMonitoring'
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

type ComparisonPeriod = 'day' | 'week' | 'month' | 'quarter'
type AnalysisType = 'performance' | 'errors' | 'usage' | 'trends'

const COMPARISON_PERIODS = {
  day: { label: 'Daily', getDates: (count: number) => Array.from({ length: count }, (_, i) => subDays(new Date(), i)) },
  week: { label: 'Weekly', getDates: (count: number) => Array.from({ length: count }, (_, i) => subWeeks(new Date(), i)) },
  month: { label: 'Monthly', getDates: (count: number) => Array.from({ length: count }, (_, i) => subMonths(new Date(), i)) },
  quarter: { label: 'Quarterly', getDates: (count: number) => Array.from({ length: count }, (_, i) => subMonths(new Date(), i * 3)) }
}

export const HistoricalAnalysis = () => {
  const [period, setPeriod] = useState<ComparisonPeriod>('week')
  const [periodCount, setPeriodCount] = useState(4) // Compare last 4 periods
  const [analysisType, setAnalysisType] = useState<AnalysisType>('performance')
  
  // Fetch comprehensive data
  const { data: systemMetrics = [] } = useSystemMetrics(undefined, 720) // Last 30 days
  const { data: performanceLogs = [] } = usePerformanceLogs(undefined, 2000)
  const { data: errorLogs = [] } = useErrorLogs(undefined, undefined, 1000)
  const { data: executionLogs = [] } = useExecutionLogs(2000)

  // Generate comparison periods
  const comparisonPeriods = useMemo(() => {
    const dates = COMPARISON_PERIODS[period].getDates(periodCount)
    
    return dates.map((date, index) => {
      const periodStart = startOfDay(date)
      const periodEnd = endOfDay(date)
      
      // Filter data for this period
      const periodPerformanceLogs = performanceLogs.filter(log => 
        isWithinInterval(new Date(log.created_at), { start: periodStart, end: periodEnd })
      )
      
      const periodErrorLogs = errorLogs.filter(log => 
        isWithinInterval(new Date(log.created_at), { start: periodStart, end: periodEnd })
      )
      
      const periodExecutionLogs = executionLogs.filter(log => 
        isWithinInterval(new Date(log.created_at), { start: periodStart, end: periodEnd })
      )
      
      const periodSystemMetrics = systemMetrics.filter(metric => 
        isWithinInterval(new Date(metric.created_at), { start: periodStart, end: periodEnd })
      )

      // Calculate metrics for this period
      const avgResponseTime = periodPerformanceLogs.length > 0 
        ? periodPerformanceLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / periodPerformanceLogs.length
        : 0

      const errorCount = periodErrorLogs.length
      const logCount = periodExecutionLogs.length
      
      const memoryMetrics = periodSystemMetrics.filter(m => m.metric_type === 'memory_usage')
      const avgMemoryUsage = memoryMetrics.length > 0
        ? memoryMetrics.reduce((sum, m) => sum + m.metric_value, 0) / memoryMetrics.length
        : 0

      const successRate = periodPerformanceLogs.length > 0
        ? (periodPerformanceLogs.filter(log => log.status === 'success').length / periodPerformanceLogs.length) * 100
        : 100

      return {
        period: format(date, period === 'day' ? 'MMM dd' : period === 'week' ? 'MMM dd' : 'MMM yyyy'),
        date: date,
        index: periodCount - index - 1, // Reverse for chronological order
        avgResponseTime: Math.round(avgResponseTime),
        errorCount,
        logCount,
        avgMemoryUsage: Math.round(avgMemoryUsage),
        successRate: Math.round(successRate),
        
        // Performance classifications
        performanceScore: Math.max(0, 100 - (avgResponseTime / 10) - (errorCount * 2) - Math.max(0, avgMemoryUsage - 50)),
        
        // Detailed breakdowns
        errorsByType: periodErrorLogs.reduce((acc, error) => {
          acc[error.severity] = (acc[error.severity] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        
        logsByLevel: periodExecutionLogs.reduce((acc, log) => {
          acc[log.log_level] = (acc[log.log_level] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }).reverse() // Show in chronological order
  }, [period, periodCount, performanceLogs, errorLogs, executionLogs, systemMetrics])

  // Calculate period-over-period changes
  const periodComparisons = useMemo(() => {
    if (comparisonPeriods.length < 2) return []
    
    return comparisonPeriods.slice(1).map((current, index) => {
      const previous = comparisonPeriods[index]
      
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
      }

      return {
        ...current,
        changes: {
          responseTime: calculateChange(current.avgResponseTime, previous.avgResponseTime),
          errorCount: calculateChange(current.errorCount, previous.errorCount),
          memoryUsage: calculateChange(current.avgMemoryUsage, previous.avgMemoryUsage),
          successRate: calculateChange(current.successRate, previous.successRate),
          logCount: calculateChange(current.logCount, previous.logCount)
        }
      }
    })
  }, [comparisonPeriods])

  // Generate trend analysis
  const trendAnalysis = useMemo(() => {
    if (comparisonPeriods.length < 3) return null

    const calculateTrend = (values: number[]) => {
      if (values.length < 2) return 'stable'
      
      const changes = values.slice(1).map((val, i) => val - values[i])
      const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length
      
      if (Math.abs(avgChange) < 1) return 'stable'
      return avgChange > 0 ? 'increasing' : 'decreasing'
    }

    return {
      responseTime: calculateTrend(comparisonPeriods.map(p => p.avgResponseTime)),
      errorCount: calculateTrend(comparisonPeriods.map(p => p.errorCount)),
      memoryUsage: calculateTrend(comparisonPeriods.map(p => p.avgMemoryUsage)),
      successRate: calculateTrend(comparisonPeriods.map(p => p.successRate)),
      logVolume: calculateTrend(comparisonPeriods.map(p => p.logCount))
    }
  }, [comparisonPeriods])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string, isGoodWhenIncreasing: boolean = false) => {
    if (trend === 'stable') return 'text-muted-foreground'
    const isIncreasing = trend === 'increasing'
    const isGood = isGoodWhenIncreasing ? isIncreasing : !isIncreasing
    return isGood ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Historical Data Analysis</h2>
          <p className="text-muted-foreground">Compare performance across different time periods</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(value: ComparisonPeriod) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPARISON_PERIODS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodCount.toString()} onValueChange={(value) => setPeriodCount(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 8, 12].map(count => (
                <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trend Summary Cards */}
      {trendAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-lg font-semibold">Trend</p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(trendAnalysis.responseTime)}
                  <span className={`text-sm ml-1 capitalize ${getTrendColor(trendAnalysis.responseTime)}`}>
                    {trendAnalysis.responseTime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Error Count</p>
                  <p className="text-lg font-semibold">Trend</p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(trendAnalysis.errorCount)}
                  <span className={`text-sm ml-1 capitalize ${getTrendColor(trendAnalysis.errorCount)}`}>
                    {trendAnalysis.errorCount}
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
                  <p className="text-lg font-semibold">Trend</p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(trendAnalysis.memoryUsage)}
                  <span className={`text-sm ml-1 capitalize ${getTrendColor(trendAnalysis.memoryUsage)}`}>
                    {trendAnalysis.memoryUsage}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-semibold">Trend</p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(trendAnalysis.successRate)}
                  <span className={`text-sm ml-1 capitalize ${getTrendColor(trendAnalysis.successRate, true)}`}>
                    {trendAnalysis.successRate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Log Volume</p>
                  <p className="text-lg font-semibold">Trend</p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(trendAnalysis.logVolume)}
                  <span className={`text-sm ml-1 capitalize ${getTrendColor(trendAnalysis.logVolume, true)}`}>
                    {trendAnalysis.logVolume}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={analysisType} onValueChange={(value: AnalysisType) => setAnalysisType(value)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Comparison</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="trends">Detailed Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Comparison</CardTitle>
                <CardDescription>Average response time across periods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonPeriods}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgResponseTime" fill="hsl(var(--primary))" name="Response Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Trends</CardTitle>
                <CardDescription>Memory consumption across periods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={comparisonPeriods}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgMemoryUsage" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Memory Usage (%)"
                    />
                    <ReferenceLine y={80} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Score Overview</CardTitle>
              <CardDescription>Composite performance score based on response time, errors, and resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={comparisonPeriods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="performanceScore" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    name="Performance Score"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Success Rate (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Count Trends</CardTitle>
              <CardDescription>Error frequency across time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonPeriods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="errorCount" fill="hsl(var(--destructive))" name="Error Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Volume</CardTitle>
              <CardDescription>Log entries and system activity across periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={comparisonPeriods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="logCount" 
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent))"
                    name="Log Count"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {periodComparisons.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Period-over-Period Changes</h3>
              <div className="grid gap-4">
                {periodComparisons.map((periodData, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{periodData.period}</h4>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {COMPARISON_PERIODS[period].label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Response Time</p>
                          <p className="text-lg font-semibold">{periodData.avgResponseTime}ms</p>
                          <p className={`text-xs ${periodData.changes.responseTime > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {periodData.changes.responseTime > 0 ? '+' : ''}{periodData.changes.responseTime.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Errors</p>
                          <p className="text-lg font-semibold">{periodData.errorCount}</p>
                          <p className={`text-xs ${periodData.changes.errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {periodData.changes.errorCount > 0 ? '+' : ''}{periodData.changes.errorCount.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Memory</p>
                          <p className="text-lg font-semibold">{periodData.avgMemoryUsage}%</p>
                          <p className={`text-xs ${periodData.changes.memoryUsage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {periodData.changes.memoryUsage > 0 ? '+' : ''}{periodData.changes.memoryUsage.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-lg font-semibold">{periodData.successRate}%</p>
                          <p className={`text-xs ${periodData.changes.successRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {periodData.changes.successRate > 0 ? '+' : ''}{periodData.changes.successRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Activity</p>
                          <p className="text-lg font-semibold">{periodData.logCount}</p>
                          <p className={`text-xs ${periodData.changes.logCount > 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                            {periodData.changes.logCount > 0 ? '+' : ''}{periodData.changes.logCount.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}