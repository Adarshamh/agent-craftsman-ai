import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Play, Sparkles, Activity, Brain, Code2, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [stats, setStats] = useState({
    tasksCompleted: 1247,
    codeGenerated: 45.2,
    knowledgeBase: 892,
    successRate: 94.8
  });
  const [recentTasks, setRecentTasks] = useState([
    { task: "Generated authentication middleware", time: "2 minutes ago", status: "success" },
    { task: "Refactored database queries", time: "15 minutes ago", status: "success" },
    { task: "Created API documentation", time: "1 hour ago", status: "success" },
    { task: "Fixed TypeScript errors", time: "2 hours ago", status: "warning" },
    { task: "Built user dashboard", time: "3 hours ago", status: "success" },
  ]);
  const { toast } = useToast();

  const executeTask = async () => {
    setIsExecuting(true);
    
    try {
      // Simulate AI task execution
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Add to recent tasks
      const newTask = {
        task: prompt.length > 50 ? prompt.slice(0, 47) + "..." : prompt,
        time: "Just now",
        status: Math.random() > 0.1 ? "success" : "warning"
      };
      
      setRecentTasks(prev => [newTask, ...prev.slice(0, 4)]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        codeGenerated: prev.codeGenerated + (Math.random() * 2 + 0.5), // 0.5-2.5k lines
        knowledgeBase: prev.knowledgeBase + Math.floor(Math.random() * 3 + 1), // 1-3 patterns
        successRate: Math.min(99.9, prev.successRate + (Math.random() * 0.2))
      }));
      
      toast({
        title: "Task Completed",
        description: `Successfully executed using ${selectedModel}`,
        duration: 3000,
      });
      
      // Clear form
      setPrompt("");
      setSelectedModel("");
      
    } catch (error) {
      toast({
        title: "Task Failed",
        description: "An error occurred while executing the task",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeQuickAction = async (action: string) => {
    const actionMessages = {
      'Train Model': 'Training model with latest patterns...',
      'Code Review': 'Analyzing codebase for improvements...',
      'Optimize': 'Optimizing performance and efficiency...',
      'Analytics': 'Generating performance analytics...'
    };

    toast({
      title: `${action} Started`,
      description: actionMessages[action as keyof typeof actionMessages],
      duration: 2000,
    });

    // Simulate processing
    setTimeout(() => {
      const newTask = {
        task: `${action} completed successfully`,
        time: "Just now",
        status: "success" as const
      };
      
      setRecentTasks(prev => [newTask, ...prev.slice(0, 4)]);
      
      // Update stats based on action
      setStats(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        codeGenerated: action === 'Code Review' 
          ? prev.codeGenerated + (Math.random() * 1 + 0.2)
          : prev.codeGenerated + (Math.random() * 0.5),
        knowledgeBase: action === 'Train Model'
          ? prev.knowledgeBase + Math.floor(Math.random() * 5 + 2)
          : prev.knowledgeBase + Math.floor(Math.random() * 2 + 1),
        successRate: Math.min(99.9, prev.successRate + (Math.random() * 0.1))
      }));
      
      toast({
        title: `${action} Complete`,
        description: "Results have been applied to your workspace",
        duration: 3000,
      });
    }, 1500 + Math.random() * 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agent Dashboard</h1>
          <p className="text-muted-foreground">Your self-improving full-stack development assistant</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-500" />
          <span>Active Learning</span>
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCompleted.toLocaleString()}</div>
            <p className="text-xs text-green-600">+12% from last week</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Code Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.codeGenerated.toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">lines of code</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.knowledgeBase}</div>
            <p className="text-xs text-muted-foreground">stored patterns</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600">improving daily</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>New Task</span>
            </CardTitle>
            <CardDescription>
              Describe what you want to build or improve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Model Selection</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                  <SelectItem value="llama-2">LLaMA 2 (Local)</SelectItem>
                  <SelectItem value="codellama">Code LLaMA (Local)</SelectItem>
                  <SelectItem value="deepseek">DeepSeek Coder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Task Description</label>
              <Textarea
                placeholder="Build a React component for user authentication with TypeScript..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32"
              />
            </div>
            
            <Button 
              className="w-full" 
              disabled={!prompt || !selectedModel || isExecuting}
              onClick={executeTask}
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isExecuting ? "Executing..." : "Execute Task"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  {item.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.task}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col hover-scale"
              onClick={() => executeQuickAction('Train Model')}
            >
              <Brain className="h-6 w-6 mb-2" />
              <span>Train Model</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col hover-scale"
              onClick={() => executeQuickAction('Code Review')}
            >
              <Code2 className="h-6 w-6 mb-2" />
              <span>Code Review</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col hover-scale"
              onClick={() => executeQuickAction('Optimize')}
            >
              <Sparkles className="h-6 w-6 mb-2" />
              <span>Optimize</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col hover-scale"
              onClick={() => executeQuickAction('Analytics')}
            >
              <Activity className="h-6 w-6 mb-2" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;