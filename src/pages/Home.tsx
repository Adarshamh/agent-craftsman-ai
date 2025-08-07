import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Play, Sparkles, Activity, Brain, Code2, Loader2, CheckCircle, AlertCircle, BarChart3, Filter } from "lucide-react";
import { PerformanceOptimization } from "@/components/PerformanceOptimization";
import { CustomReportBuilder } from "@/components/CustomReportBuilder";
import { AdvancedFiltering } from "@/components/AdvancedFiltering";
import { 
  useTasks, 
  useCreateTask, 
  useUpdateTask, 
  useRealtimeStats,
  useAddKnowledgePattern 
} from "@/hooks/useDatabase";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  // Database hooks
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(10);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const addKnowledgePatternMutation = useAddKnowledgePattern();
  const stats = useRealtimeStats();

  // Convert database tasks to display format
  const recentTasks = tasks.map(task => ({
    id: task.id,
    task: task.title,
    time: getRelativeTime(task.created_at),
    status: task.status === 'completed' ? 'success' : 
           task.status === 'failed' ? 'error' : 'pending'
  }));

  // Helper function to format relative time
  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const executeTask = async () => {
    if (!prompt || !selectedModel) return;
    
    setIsExecuting(true);
    
    try {
      // Create task in database
      const task = await createTaskMutation.mutateAsync({
        title: prompt.length > 50 ? prompt.slice(0, 47) + "..." : prompt,
        description: prompt,
        status: 'running',
        priority: 'medium',
        metadata: { model: selectedModel }
      });

      // Simulate AI task execution
      const executionTime = 2000 + Math.random() * 3000;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.1;
      const codeGenerated = Math.floor(Math.random() * 500 + 100); // 100-600 lines
      
      // Update task with results
      await updateTaskMutation.mutateAsync({
        id: task.id,
        updates: {
          status: isSuccess ? 'completed' : 'failed',
          error_message: isSuccess ? undefined : 'Simulated execution error',
          execution_time_ms: Math.floor(executionTime),
          metadata: {
            result: isSuccess ? 'Task completed successfully' : undefined,
            code_generated: isSuccess ? codeGenerated : 0
          }
        }
      });

      // Add knowledge pattern if successful
      if (isSuccess) {
        await addKnowledgePatternMutation.mutateAsync({
          pattern_type: selectedModel,
          pattern_name: `${selectedModel}_pattern`,
          pattern_data: {
            prompt: prompt,
            model: selectedModel,
            success: true,
            code_lines: codeGenerated
          },
          usage_count: 1
        });
      }
      
      toast({
        title: isSuccess ? "Task Completed" : "Task Failed",
        description: isSuccess 
          ? `Successfully executed using ${selectedModel}. Generated ${codeGenerated} lines of code.`
          : "Task execution failed. Please try again.",
        variant: isSuccess ? "default" : "destructive",
        duration: 3000,
      });
      
      // Clear form only on success
      if (isSuccess) {
        setPrompt("");
        setSelectedModel("");
      }
      
    } catch (error) {
      console.error('Task execution error:', error);
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

    try {
      // Create quick action task
      const task = await createTaskMutation.mutateAsync({
        title: `${action} - Quick Action`,
        description: actionMessages[action as keyof typeof actionMessages],
        status: 'running',
        priority: 'medium',
        metadata: { model: 'system' }
      });

      // Simulate processing
      const executionTime = 1500 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      const codeGenerated = action === 'Code Review' 
        ? Math.floor(Math.random() * 200 + 50)
        : Math.floor(Math.random() * 100 + 20);

      // Update task as completed
      await updateTaskMutation.mutateAsync({
        id: task.id,
        updates: {
          status: 'completed',
          execution_time_ms: Math.floor(executionTime),
          metadata: {
            result: `${action} completed successfully`,
            code_generated: codeGenerated
          }
        }
      });

      // Add knowledge pattern for training
      if (action === 'Train Model') {
        await addKnowledgePatternMutation.mutateAsync({
          pattern_type: 'training',
          pattern_name: 'training_pattern',
          pattern_data: {
            action: action,
            model_improvements: Math.floor(Math.random() * 10 + 5),
            patterns_learned: Math.floor(Math.random() * 5 + 2)
          },
          usage_count: 1
        });
      }
      
      toast({
        title: `${action} Complete`,
        description: "Results have been applied to your workspace",
        duration: 3000,
      });
    } catch (error) {
      console.error('Quick action error:', error);
      toast({
        title: `${action} Failed`,
        description: "An error occurred during execution",
        variant: "destructive",
        duration: 3000,
      });
    }
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
              {tasksLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentTasks.length > 0 ? (
                recentTasks.map((item, index) => (
                  <div key={item.id || index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    {item.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : item.status === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.task}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent tasks</p>
                  <p className="text-xs">Execute a task to see activity here</p>
                </div>
              )}
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

      {/* Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Optimization</span>
            </CardTitle>
            <CardDescription>
              Monitor system performance and identify bottlenecks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceOptimization />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Custom Report Builder</span>
            </CardTitle>
            <CardDescription>
              Create custom reports with drag-and-drop interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomReportBuilder />
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Search & Filtering</span>
          </CardTitle>
          <CardDescription>
            Search across logs with complex queries and pattern detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedFiltering />
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;