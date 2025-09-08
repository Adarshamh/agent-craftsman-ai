-- Add performance tracking columns to knowledge_patterns
ALTER TABLE public.knowledge_patterns 
ADD COLUMN IF NOT EXISTS success_rate NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS avg_execution_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS optimization_score NUMERIC DEFAULT 0.0;

-- Create function to update knowledge pattern performance
CREATE OR REPLACE FUNCTION public.update_knowledge_pattern_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the knowledge pattern performance based on task completion
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.knowledge_patterns 
    SET 
      usage_count = usage_count + 1,
      last_used_at = now(),
      effectiveness_score = CASE 
        WHEN NEW.execution_time_ms <= 5000 THEN 
          LEAST(effectiveness_score + 0.1, 1.0)
        ELSE 
          GREATEST(effectiveness_score - 0.05, 0.0)
      END
    WHERE user_id = NEW.user_id 
    AND pattern_type = 'task_execution'
    AND pattern_data->>'task_type' = NEW.metadata->>'execution_type';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic pattern learning
CREATE TRIGGER update_pattern_performance
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_pattern_performance();

-- Create task_feedback table for storing AI feedback
CREATE TABLE public.task_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'performance',
  feedback_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0.0,
  suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for task_feedback
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for task_feedback
CREATE POLICY "Users can create their own task feedback" 
ON public.task_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own task feedback" 
ON public.task_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own task feedback" 
ON public.task_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);