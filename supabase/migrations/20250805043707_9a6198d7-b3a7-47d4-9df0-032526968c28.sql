-- Create tasks table for monitoring tasks and executions
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  execution_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create execution_logs table for detailed logging
CREATE TABLE public.execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component TEXT NOT NULL,
  operation TEXT NOT NULL,
  log_level TEXT NOT NULL DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_metrics table for performance monitoring
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_logs table
CREATE TABLE public.performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  operation_name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  memory_usage_mb DECIMAL,
  cpu_usage_percent DECIMAL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create error_logs table
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create session_logs table
CREATE TABLE public.session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_patterns table
CREATE TABLE public.knowledge_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  description TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  effectiveness_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stats table
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  failed_tasks INTEGER NOT NULL DEFAULT 0,
  total_execution_time_ms BIGINT NOT NULL DEFAULT 0,
  average_response_time_ms DECIMAL,
  error_rate DECIMAL NOT NULL DEFAULT 0,
  uptime_percentage DECIMAL NOT NULL DEFAULT 100,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for execution_logs
CREATE POLICY "Users can view their own execution logs" ON public.execution_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own execution logs" ON public.execution_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for system_metrics
CREATE POLICY "Users can view their own system metrics" ON public.system_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own system metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for performance_logs
CREATE POLICY "Users can view their own performance logs" ON public.performance_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own performance logs" ON public.performance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for error_logs
CREATE POLICY "Users can view their own error logs" ON public.error_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own error logs" ON public.error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own error logs" ON public.error_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for session_logs
CREATE POLICY "Users can view their own session logs" ON public.session_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own session logs" ON public.session_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for knowledge_patterns
CREATE POLICY "Users can view their own knowledge patterns" ON public.knowledge_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge patterns" ON public.knowledge_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge patterns" ON public.knowledge_patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge patterns" ON public.knowledge_patterns
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_patterns_updated_at
  BEFORE UPDATE ON public.knowledge_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);

CREATE INDEX idx_execution_logs_user_id ON public.execution_logs(user_id);
CREATE INDEX idx_execution_logs_component ON public.execution_logs(component);
CREATE INDEX idx_execution_logs_log_level ON public.execution_logs(log_level);
CREATE INDEX idx_execution_logs_created_at ON public.execution_logs(created_at);

CREATE INDEX idx_system_metrics_user_id ON public.system_metrics(user_id);
CREATE INDEX idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX idx_system_metrics_created_at ON public.system_metrics(created_at);

CREATE INDEX idx_performance_logs_user_id ON public.performance_logs(user_id);
CREATE INDEX idx_performance_logs_operation_type ON public.performance_logs(operation_type);
CREATE INDEX idx_performance_logs_created_at ON public.performance_logs(created_at);

CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at);

CREATE INDEX idx_knowledge_patterns_user_id ON public.knowledge_patterns(user_id);
CREATE INDEX idx_knowledge_patterns_type ON public.knowledge_patterns(pattern_type);
CREATE INDEX idx_knowledge_patterns_created_at ON public.knowledge_patterns(created_at);