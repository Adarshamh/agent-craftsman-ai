import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Bug, AlertTriangle, Info, CheckCircle, X, RefreshCw, Download } from "lucide-react";

const DebugConsole = () => {
  const [logs] = useState([
    { id: 1, level: "error", message: "TypeError: Cannot read property 'id' of undefined", file: "UserService.ts:45", time: "14:32:15", details: "Stack trace available" },
    { id: 2, level: "warning", message: "Deprecated API usage detected", file: "ApiClient.ts:23", time: "14:31:42", details: "Use new API version" },
    { id: 3, level: "info", message: "Code generation completed successfully", file: "CodeGenerator.ts:89", time: "14:31:01", details: "Generated 347 lines" },
    { id: 4, level: "error", message: "Database connection failed", file: "DatabaseService.ts:12", time: "14:30:33", details: "Connection timeout" },
    { id: 5, level: "success", message: "Tests passed with 100% coverage", file: "TestRunner.ts:156", time: "14:29:47", details: "45 tests executed" },
  ]);

  const [errors] = useState([
    { 
      id: 1, 
      title: "Type Error in User Model", 
      description: "Property 'email' does not exist on type 'User'",
      severity: "high",
      file: "models/User.ts",
      line: 23,
      suggestion: "Add email property to User interface"
    },
    { 
      id: 2, 
      title: "Missing Error Handling", 
      description: "API call lacks proper error handling",
      severity: "medium",
      file: "services/ApiService.ts",
      line: 67,
      suggestion: "Wrap in try-catch block"
    },
  ]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error": return <X className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case "error": return "destructive";
      case "warning": return "secondary";
      case "info": return "outline";
      case "success": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Debug Console</h1>
          <p className="text-muted-foreground">Monitor errors, warnings, and system messages</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">12</div>
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
                <div className="text-2xl font-bold">8</div>
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
                <div className="text-2xl font-bold">145</div>
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
                <div className="text-2xl font-bold">523</div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <span>Real-time Logs</span>
              </CardTitle>
              <CardDescription>Live system messages and debug information</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer">
                      {getLogIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getLogBadgeVariant(log.level)} className="text-xs">
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                          <span className="text-xs text-muted-foreground">{log.file}</span>
                        </div>
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <div className="space-y-4">
            {errors.map((error) => (
              <Card key={error.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <X className="h-5 w-5 text-red-500" />
                      <span>{error.title}</span>
                    </CardTitle>
                    <Badge variant={error.severity === "high" ? "destructive" : "secondary"}>
                      {error.severity} severity
                    </Badge>
                  </div>
                  <CardDescription>{error.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">File:</span>
                      <code className="bg-muted px-2 py-1 rounded">{error.file}:{error.line}</code>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">AI Suggestion</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">{error.suggestion}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Apply Fix</Button>
                      <Button size="sm" variant="outline">View Code</Button>
                      <Button size="sm" variant="outline">Ignore</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance and optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">2.3s</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-muted-foreground">CPU Usage</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">4.2GB</div>
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Active Processes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugConsole;