import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  X, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Settings,
  Bell,
  Activity
} from 'lucide-react'
import { Alert } from '@/hooks/useAlertMonitoring'
import { AlertRule } from './AlertConfiguration'
import { AlertConfiguration } from './AlertConfiguration'
import { AlertNotifications } from './AlertNotifications'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
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
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

interface AlertDashboardProps {
  alerts: Alert[]
  alertHistory: Alert[]
  alertRules: AlertRule[]
  isMonitoring: boolean
  lastCheckTime: string | null
  onAcknowledge: (alertId: string) => void
  onResolve: (alertId: string) => void
  onClearAll: () => void
  onStartMonitoring: () => void
  onStopMonitoring: () => void
  onRuleCreate: (rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>) => void
  onRuleUpdate: (id: string, rule: Partial<AlertRule>) => void
  onRuleDelete: (id: string) => void
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316', 
  medium: '#eab308',
  low: '#3b82f6'
}

export const AlertDashboard = ({
  alerts,
  alertHistory,
  alertRules,
  isMonitoring,
  lastCheckTime,
  onAcknowledge,
  onResolve,
  onClearAll,
  onStartMonitoring,
  onStopMonitoring,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete
}: AlertDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('7d')

  // Filter and search alerts
  const filteredAlertHistory = useMemo(() => {
    let filtered = alertHistory

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply severity filter
    if (severityFilter) {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'resolved') {
        filtered = filtered.filter(alert => alert.resolved)
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(alert => !alert.resolved)
      } else if (statusFilter === 'acknowledged') {
        filtered = filtered.filter(alert => alert.acknowledged && !alert.resolved)
      }
    }

    // Apply date range filter
    const now = new Date()
    let startDate: Date
    switch (dateRange) {
      case '1d':
        startDate = subDays(now, 1)
        break
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      default:
        startDate = subDays(now, 7)
    }

    filtered = filtered.filter(alert =>
      isWithinInterval(new Date(alert.timestamp), {
        start: startOfDay(startDate),
        end: endOfDay(now)
      })
    )

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [alertHistory, searchTerm, severityFilter, statusFilter, dateRange])

  // Analytics data
  const alertAnalytics = useMemo(() => {
    const severityDistribution = alertHistory.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const severityData = Object.entries(severityDistribution).map(([severity, count]) => ({
      severity,
      count,
      fill: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
    }))

    // Alert trends over time (last 7 days)
    const trendData = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      const dayAlerts = alertHistory.filter(alert =>
        isWithinInterval(new Date(alert.timestamp), { start: dayStart, end: dayEnd })
      )

      trendData.push({
        date: format(date, 'MMM dd'),
        total: dayAlerts.length,
        critical: dayAlerts.filter(a => a.severity === 'critical').length,
        high: dayAlerts.filter(a => a.severity === 'high').length,
        medium: dayAlerts.filter(a => a.severity === 'medium').length,
        low: dayAlerts.filter(a => a.severity === 'low').length,
        resolved: dayAlerts.filter(a => a.resolved).length
      })
    }

    // Response time analysis
    const resolvedAlerts = alertHistory.filter(alert => alert.resolved && alert.resolvedAt)
    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.timestamp).getTime()
          const resolved = new Date(alert.resolvedAt!).getTime()
          return sum + (resolved - created)
        }, 0) / resolvedAlerts.length
      : 0

    return {
      totalAlerts: alertHistory.length,
      activeAlerts: alerts.length,
      resolvedAlerts: alertHistory.filter(a => a.resolved).length,
      criticalAlerts: alertHistory.filter(a => a.severity === 'critical').length,
      avgResolutionTimeMs: avgResolutionTime,
      severityData,
      trendData,
      resolutionRate: alertHistory.length > 0 
        ? (alertHistory.filter(a => a.resolved).length / alertHistory.length) * 100 
        : 0
    }
  }, [alertHistory, alerts])

  const exportAlertData = () => {
    const exportData = {
      exportTime: new Date().toISOString(),
      summary: alertAnalytics,
      alerts: filteredAlertHistory,
      rules: alertRules
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alert-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      <AlertNotifications
        alerts={alerts}
        onAcknowledge={onAcknowledge}
        onResolve={onResolve}
        onClearAll={onClearAll}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Management Dashboard</h2>
          <p className="text-muted-foreground">Monitor, configure, and analyze system alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isMonitoring ? 'default' : 'outline'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
          </Badge>
          <Button
            variant={isMonitoring ? 'destructive' : 'default'}
            size="sm"
            onClick={isMonitoring ? onStopMonitoring : onStartMonitoring}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportAlertData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{alertAnalytics.totalAlerts}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{alertAnalytics.activeAlerts}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{alertAnalytics.resolvedAlerts}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{alertAnalytics.criticalAlerts}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {alertAnalytics.avgResolutionTimeMs > 0 
                ? Math.round(alertAnalytics.avgResolutionTimeMs / 1000 / 60)
                : 0}m
            </div>
            <div className="text-sm text-muted-foreground">Avg Resolution</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{alertAnalytics.resolutionRate.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Resolution Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Trends (Last 7 Days)</CardTitle>
                <CardDescription>Daily alert volume and severity breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertAnalytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                    <Bar dataKey="high" fill="#f97316" name="High" />
                    <Bar dataKey="medium" fill="#eab308" name="Medium" />
                    <Bar dataKey="low" fill="#3b82f6" name="Low" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Severity Distribution</CardTitle>
                <CardDescription>Breakdown of alerts by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertAnalytics.severityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ severity, count }) => `${severity}: ${count}`}
                    >
                      {alertAnalytics.severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Active Alerts</CardTitle>
              <CardDescription>Currently active alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                  <p>All systems are operating within normal parameters.</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <span className="font-medium">{alert.ruleName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                            Acknowledge
                          </Button>
                          <Button size="sm" onClick={() => onResolve(alert.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last Day</SelectItem>
                    <SelectItem value="7d">Last Week</SelectItem>
                    <SelectItem value="30d">Last Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSeverityFilter('')
                    setStatusFilter('')
                    setDateRange('7d')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alert History List */}
          <Card>
            <CardHeader>
              <CardTitle>Alert History ({filteredAlertHistory.length})</CardTitle>
              <CardDescription>Complete history of system alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredAlertHistory.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.ruleName}</span>
                          {alert.resolved && (
                            <Badge variant="outline">Resolved</Badge>
                          )}
                          {alert.acknowledged && !alert.resolved && (
                            <Badge variant="secondary">Acknowledged</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Created: {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}</span>
                          {alert.resolvedAt && (
                            <span>Resolved: {format(new Date(alert.resolvedAt), 'MMM dd, HH:mm:ss')}</span>
                          )}
                          {alert.resolvedBy && (
                            <span>By: {alert.resolvedBy}</span>
                          )}
                        </div>
                      </div>
                      {!alert.resolved && (
                        <div className="flex space-x-2">
                          {!alert.acknowledged && (
                            <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                              Acknowledge
                            </Button>
                          )}
                          <Button size="sm" onClick={() => onResolve(alert.id)}>
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <AlertConfiguration
            onRuleCreate={onRuleCreate}
            onRuleUpdate={onRuleUpdate}
            onRuleDelete={onRuleDelete}
            existingRules={alertRules}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Resolution Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Analysis</CardTitle>
              <CardDescription>Alert resolution performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alertAnalytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    name="Total Alerts" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#82ca9d" 
                    name="Resolved" 
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