-- Enable real-time monitoring for tasks
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Create real-time performance metrics table
CREATE TABLE public.real_time_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.real_time_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own metrics" 
ON public.real_time_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics" 
ON public.real_time_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_real_time_metrics_user_timestamp ON public.real_time_metrics(user_id, timestamp DESC);
CREATE INDEX idx_real_time_metrics_type ON public.real_time_metrics(metric_type);

-- Enable real-time for metrics
ALTER TABLE real_time_metrics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE real_time_metrics;

-- Create performance monitoring table
CREATE TABLE public.performance_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  success_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  throughput_per_hour INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own performance data" 
ON public.performance_monitoring 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own performance data" 
ON public.performance_monitoring 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance data" 
ON public.performance_monitoring 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable real-time
ALTER TABLE performance_monitoring REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_monitoring;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_performance_monitoring_updated_at
BEFORE UPDATE ON public.performance_monitoring
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();