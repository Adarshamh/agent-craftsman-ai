import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { History as HistoryIcon, Search, Calendar, Star, Repeat, Download } from "lucide-react";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");

  const historyItems = [
    {
      id: 1,
      prompt: "Create a React authentication component with TypeScript",
      response: "Generated complete authentication flow with login, signup, and password reset...",
      model: "GPT-4",
      tokens: 2847,
      duration: "3.2s",
      timestamp: "2024-01-25 14:32:15",
      status: "success",
      rating: 5
    },
    {
      id: 2,
      prompt: "Build a RESTful API for user management",
      response: "Created Express.js API with CRUD operations, middleware, and error handling...",
      model: "Code LLaMA",
      tokens: 4521,
      duration: "5.8s", 
      timestamp: "2024-01-25 13:45:22",
      status: "success",
      rating: 4
    },
    {
      id: 3,
      prompt: "Design database schema for e-commerce platform",
      response: "Designed normalized schema with products, orders, users, and inventory tables...",
      model: "GPT-4",
      tokens: 1923,
      duration: "2.1s",
      timestamp: "2024-01-25 12:18:34",
      status: "success", 
      rating: 5
    },
    {
      id: 4,
      prompt: "Fix TypeScript errors in payment module",
      response: "Error: Unable to access payment module. Please check file permissions...",
      model: "GPT-4",
      tokens: 156,
      duration: "0.8s",
      timestamp: "2024-01-25 11:55:12",
      status: "error",
      rating: 1
    },
  ];

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
                <div className="text-2xl font-bold">1,247</div>
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
                <div className="text-2xl font-bold">4.3</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">Retries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">67h</div>
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
            {historyItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.prompt}</CardTitle>
                      <CardDescription className="mt-2">{item.response}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusBadge(item.status)}
                      <div className="flex">{getRatingStars(item.rating)}</div>
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
            ))}
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