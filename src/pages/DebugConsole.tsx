import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Bug, AlertTriangle, Info, CheckCircle, X, RefreshCw, Download, Activity, Clock, Zap, AlertCircle, Gauge, BarChart3 } from "lucide-react";
import { 
  useExecutionLogs, 
  useSystemMetrics, 
  usePerformanceLogs, 
  useErrorLogs,
  useMonitoringStats,
  useResolveError
} from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { AlertSystem } from "@/components/AlertSystem";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { HistoricalAnalysis } from "@/components/HistoricalAnalysis";

const DebugConsole = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>(undefined);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string | undefined>(undefined);
  const [selectedSeverity, setSelectedSeverity] = useState<string | undefined>(undefined);
  
  const { toast } = useToast();
  const resolveErrorMutation = useResolveError();
  
  // Fetch real monitoring data
  const { data: executionLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useExecutionLogs(50, selectedComponent, selectedLogLevel);
  const { data: systemMetrics = [], isLoading: metricsLoading } = useSystemMetrics(undefined, 24);
  const { data: performanceLogs = [], isLoading: performanceLoading } = usePerformanceLogs(undefined, 100);
  const { data: errorLogs = [], isLoading: errorsLoading, refetch: refetchErrors } = useErrorLogs(selectedSeverity, false, 50);
  const { data: stats, isLoading: statsLoading } = useMonitoringStats();

  const handleResolveError = async (errorId: string, notes?: string) => {
    try {
      await resolveErrorMutation.mutateAsync({ id: errorId, resolutionNotes: notes });
      toast({
        title: "Error Resolved",
        description: "Error has been marked as resolved successfully.",
      });
      refetchErrors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportLogs = () => {
    const data = {
      executionLogs,
      errorLogs,
      performanceLogs,
      systemMetrics,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Debug logs have been exported successfully.",
    });
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error": return <X className="h-4 w-4 text-red-500" />;
      case "fatal": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warn": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      case "debug": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
      case "fatal": return "destructive";
      case "warn": return "secondary";
      case "info": return "outline";
      case "debug": return "default";
      default: return "outline";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  // Calculate real-time performance metrics
  const avgResponseTime = performanceLogs.length > 0 
    ? Math.round(performanceLogs.reduce((sum, p) => sum + p.duration_ms, 0) / performanceLogs.length)
    : 0;
    
  const successRate = performanceLogs.length > 0
    ? Math.round((performanceLogs.filter(p => p.status === 'success').length / performanceLogs.length) * 100)
    : 0;

  const cpuMetrics = systemMetrics.filter(m => m.metric_type === 'cpu_usage');
  const memoryMetrics = systemMetrics.filter(m => m.metric_type === 'memory_usage');
  
  const currentCpuUsage = cpuMetrics.length > 0 ? Math.round(cpuMetrics[cpuMetrics.length - 1].metric_value) : 0;
  const currentMemoryUsage = memoryMetrics.length > 0 ? (memoryMetrics[memoryMetrics.length - 1].metric_value / 1024 / 1024 / 1024).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Debug Console</h1>
          <p className="text-muted-foreground">Real-time monitoring, errors, and system performance</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchLogs();
              refetchErrors();
            }}
            disabled={logsLoading || errorsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(logsLoading || errorsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.errorCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.warningCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.infoCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.successCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Debug</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">
            <Bug className="h-4 w-4 mr-2" />
            Execution Logs
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error Analysis
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Gauge className="h-4 w-4 mr-2" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="historical">
            <Clock className="h-4 w-4 mr-2" />
            Historical Analysis
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Zap className="h-4 w-4 mr-2" />
            System Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="h-5 w-5" />
                    <span>Real-time Execution Logs</span>
                  </CardTitle>
                  <CardDescription>Live system messages and debug information</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <select 
                    className="px-3 py-1 border rounded text-sm"
                    value={selectedLogLevel || ''}
                    onChange={(e) => setSelectedLogLevel(e.target.value || undefined)}
                  >
                    <option value="">All Levels</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                    <option value="fatal">Fatal</option>
                  </select>
                  <select 
                    className="px-3 py-1 border rounded text-sm"
                    value={selectedComponent || ''}
                    onChange={(e) => setSelectedComponent(e.target.value || undefined)}
                  >
                    <option value="">All Components</option>
                    <option value="prompt_studio">Prompt Studio</option>
                    <option value="codegen_lab">Codegen Lab</option>
                    <option value="debug_console">Debug Console</option>
                    <option value="api_client">API Client</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {executionLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No logs found. Try adjusting your filters or start using the application to generate logs.
                      </div>
                    ) : (
                      executionLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer">
                          {getLogIcon(log.log_level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant={getLogBadgeVariant(log.log_level)} className="text-xs">
                                {log.log_level.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'HH:mm:ss')}
                              </span>
                              {log.component && (
                                <span className="text-xs text-muted-foreground">{log.component}</span>
                              )}
                              {log.task_id && (
                                <span className="text-xs text-muted-foreground">Task: {log.task_id.slice(0, 8)}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium">{log.message}</p>
                            {Object.keys(log.metadata || {}).length > 0 && (
                              <details className="text-xs text-muted-foreground mt-1">
                                <summary className="cursor-pointer">Metadata</summary>
                                <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <select 
                className="px-3 py-1 border rounded text-sm"
                value={selectedSeverity || ''}
                onChange={(e) => setSelectedSeverity(e.target.value || undefined)}
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            {errorsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading errors...</div>
            ) : errorLogs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Unresolved Errors</h3>
                  <p className="text-muted-foreground">All errors have been resolved or none have been reported.</p>
                </CardContent>
              </Card>
            ) : (
              errorLogs.map((error) => (
                <Card key={error.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span>{error.error_type.replace(/_/g, ' ').toUpperCase()}</span>
                      </CardTitle>
                      <Badge variant={getSeverityBadgeVariant(error.severity)}>
                        {error.severity} severity
                      </Badge>
                    </div>
                    <CardDescription>{error.error_message}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">Component:</span>
                        <code className="bg-muted px-2 py-1 rounded">{error.component || 'Unknown'}</code>
                        <span className="text-muted-foreground">Time:</span>
                        <span>{format(new Date(error.created_at), 'MMM dd, HH:mm:ss')}</span>
                      </div>
                      
                      {error.stack_trace && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground mb-2">Stack Trace</summary>
                          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                            {error.stack_trace}
                          </pre>
                        </details>
                      )}
                      
                      {Object.keys(error.metadata || {}).length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground mb-2">Additional Data</summary>
                          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(error.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveError(error.id, 'Manually resolved via Debug Console')}
                          disabled={resolveErrorMutation.isPending}
                        >
                          {resolveErrorMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                        </Button>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{avgResponseTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{performanceLogs.length}</div>
                  <div className="text-sm text-muted-foreground">Total Operations</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">
                    {performanceLogs.filter(p => p.status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed Operations</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Performance Logs</CardTitle>
                <CardDescription>API calls, database queries, and operation timings</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading performance data...</div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {performanceLogs.slice(0, 20).map((perf) => (
                        <div key={perf.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant={perf.status === 'success' ? 'default' : 'destructive'}>
                              {perf.status}
                            </Badge>
                            <div>
                              <div className="font-medium text-sm">{perf.operation_name}</div>
                              <div className="text-xs text-muted-foreground">{perf.operation_type}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{perf.duration_ms}ms</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(perf.created_at), 'HH:mm:ss')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="historical">
          <HistoricalAnalysis />
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{currentCpuUsage}%</div>
                  <div className="text-sm text-muted-foreground">CPU Usage</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{currentMemoryUsage}GB</div>
                  <div className="text-sm text-muted-foreground">Memory Usage</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{systemMetrics.length}</div>
                  <div className="text-sm text-muted-foreground">Recorded Metrics</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">24h</div>
                  <div className="text-sm text-muted-foreground">Monitoring Window</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Metrics History</CardTitle>
                <CardDescription>Real-time system performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading metrics...</div>
                ) : systemMetrics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No system metrics recorded yet. Metrics will appear here as the system runs.
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {systemMetrics.slice(-20).reverse().map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{metric.metric_type}</Badge>
                            <div>
                              <div className="font-medium text-sm">
                                {metric.metric_value.toFixed(2)} {metric.metric_unit}
                              </div>
                              {metric.component && (
                                <div className="text-xs text-muted-foreground">{metric.component}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(metric.created_at), 'MMM dd, HH:mm:ss')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Alert System - positioned fixed */}
      <AlertSystem />
    </div>
  );
};

export default DebugConsole;