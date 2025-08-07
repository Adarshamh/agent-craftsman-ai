import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { History as HistoryIcon, Search, Calendar, Star, Repeat, Download, Loader2 } from "lucide-react";
import { useTasks, useTaskAnalytics, useRealtimeStats } from "@/hooks/useDatabase";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Database hooks
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks(100);
  const { data: analytics = [] } = useTaskAnalytics(30);
  const stats = useRealtimeStats();

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = allTasks;

    // Apply time filter
    if (filterPeriod !== "all") {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filterPeriod) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(task => new Date(task.created_at) >= cutoff);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((task.metadata as any)?.model || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allTasks, filterPeriod, searchQuery]);

  // Convert database tasks to display format
  const historyItems = filteredTasks.map(task => {
    const metadata = (task.metadata as any) || {}
    return {
      id: task.id,
      prompt: task.title,
      response: metadata.result || task.error_message || "Task in progress...",
      model: metadata.model || "Unknown",
      tokens: Math.floor(Math.random() * 3000 + 500), // Simulated for now
      duration: task.execution_time_ms ? `${(task.execution_time_ms / 1000).toFixed(1)}s` : "N/A",
      timestamp: new Date(task.created_at).toLocaleString(),
      status: task.status === 'completed' ? 'success' : 
             task.status === 'failed' ? 'error' : 'pending',
      rating: task.status === 'completed' ? Math.floor(Math.random() * 2 + 4) : 
             task.status === 'failed' ? Math.floor(Math.random() * 2 + 1) : 3
    }
  });

  // Calculate analytics
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const failedTasks = allTasks.filter(t => t.status === 'failed').length;
  const avgRating = completedTasks > 0 ? 
    (historyItems.filter(h => h.status === 'success').reduce((sum, h) => sum + h.rating, 0) / completedTasks).toFixed(1) : 
    "0.0";
  const totalTime = allTasks.reduce((sum, task) => sum + (task.execution_time_ms || 0), 0);
  const totalTimeFormatted = totalTime > 0 ? `${Math.floor(totalTime / 3600000)}h ${Math.floor((totalTime % 3600000) / 60000)}m` : "0h 0m";

  const sessions = [
    {
      id: 1,
      name: "E-commerce Platform Build",
      tasks: 12,
      duration: "2h 34m",
      date: "2024-01-25",
      status: "completed"
    },
    {
      id: 2,
      name: "API Refactoring Session", 
      tasks: 8,
      duration: "1h 23m",
      date: "2024-01-24",
      status: "completed"
    },
    {
      id: 3,
      name: "Database Optimization",
      tasks: 5,
      duration: "45m",
      date: "2024-01-24", 
      status: "completed"
    },
  ];

  const feedback = [
    {
      id: 1,
      task: "React Authentication Component",
      feedback: "Code works perfectly but could use better error messages",
      rating: 4,
      improvements: "Added custom error handling in next iteration",
      date: "2024-01-25"
    },
    {
      id: 2,
      task: "API Endpoint Generation",
      feedback: "Missing input validation for edge cases",
      rating: 3,
      improvements: "Enhanced validation logic with Joi schema",
      date: "2024-01-24"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge variant="default">Success</Badge>;
      case "error": return <Badge variant="destructive">Error</Badge>;
      case "warning": return <Badge variant="secondary">Warning</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent History</h1>
          <p className="text-muted-foreground">Track past interactions, feedback, and improvements</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HistoryIcon className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalTasks.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{avgRating}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{failedTasks}</div>
                <div className="text-sm text-muted-foreground">Failed Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{totalTimeFormatted}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions">
          <div className="space-y-4">
            {tasksLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : historyItems.length > 0 ? (
              historyItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.prompt}</CardTitle>
                        <CardDescription className="mt-2">{item.response}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusBadge(item.status)}
                        {item.status === 'success' && (
                          <div className="flex">{getRatingStars(item.rating)}</div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{item.model}</Badge>
                        <span>{item.tokens} tokens</span>
                        <span>{item.duration}</span>
                      </div>
                      <span>{item.timestamp}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || filterPeriod !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : "Start executing tasks to see them here"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.tasks} tasks • {session.duration} • {session.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{session.status}</Badge>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.task}</CardTitle>
                    <div className="flex">{getRatingStars(item.rating)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Feedback</h4>
                      <p className="text-sm text-muted-foreground">{item.feedback}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Improvements Made</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">{item.improvements}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">94.8%</div>
                  <div className="text-sm text-muted-foreground">7-day average</div>
                  <div className="text-xs text-green-600 mt-1">↑ 2.3% from last week</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Used Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GPT-4</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Code LLaMA</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DeepSeek</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;