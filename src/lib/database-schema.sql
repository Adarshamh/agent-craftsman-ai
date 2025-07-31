-- This file contains the SQL schema for the database tables
-- Run these commands in your Supabase SQL editor

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_stats ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
    result TEXT,
    error_message TEXT,
    execution_time INTEGER, -- in milliseconds
    code_generated INTEGER DEFAULT 0, -- lines of code generated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge patterns table
CREATE TABLE IF NOT EXISTS knowledge_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    pattern_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tasks_completed INTEGER DEFAULT 0,
    code_generated INTEGER DEFAULT 0,
    knowledge_base_size INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Knowledge patterns policies
CREATE POLICY "Users can view their own patterns" ON knowledge_patterns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patterns" ON knowledge_patterns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" ON knowledge_patterns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patterns" ON knowledge_patterns
    FOR DELETE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_created_at ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_patterns_user_id ON knowledge_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_patterns_usage_count ON knowledge_patterns(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Function to update user stats automatically
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user stats when a task is completed
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        INSERT INTO user_stats (user_id, tasks_completed, code_generated, last_updated)
        VALUES (NEW.user_id, 1, COALESCE(NEW.code_generated, 0), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            tasks_completed = user_stats.tasks_completed + 1,
            code_generated = user_stats.code_generated + COALESCE(NEW.code_generated, 0),
            last_updated = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats
DROP TRIGGER IF EXISTS trigger_update_user_stats ON tasks;
CREATE TRIGGER trigger_update_user_stats
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to calculate success rate
CREATE OR REPLACE FUNCTION calculate_success_rate(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    success_rate DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_tasks 
    FROM tasks 
    WHERE user_id = p_user_id AND status IN ('completed', 'failed');
    
    SELECT COUNT(*) INTO completed_tasks 
    FROM tasks 
    WHERE user_id = p_user_id AND status = 'completed';
    
    IF total_tasks > 0 THEN
        success_rate := (completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100;
    ELSE
        success_rate := 0;
    END IF;
    
    -- Update user stats with calculated success rate
    UPDATE user_stats 
    SET success_rate = success_rate, last_updated = NOW()
    WHERE user_id = p_user_id;
    
    RETURN success_rate;
END;
$$ LANGUAGE plpgsql;

-- ============= MONITORING SCHEMA =============

-- Execution logs table for real-time monitoring
CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    component VARCHAR(100), -- e.g., 'prompt_studio', 'codegen_lab', 'debug_console'
    execution_context JSONB DEFAULT '{}', -- context data like function name, line number, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics table for performance monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- e.g., 'cpu_usage', 'memory_usage', 'response_time'
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20), -- e.g., 'percent', 'ms', 'bytes'
    component VARCHAR(100), -- component being measured
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance tracking table for API and database operations
CREATE TABLE IF NOT EXISTS performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    operation_type VARCHAR(100) NOT NULL, -- e.g., 'api_request', 'db_query', 'code_generation'
    operation_name VARCHAR(200) NOT NULL,
    duration_ms INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
    error_details TEXT,
    input_size INTEGER, -- size of input data
    output_size INTEGER, -- size of output data
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error tracking table for centralized error management
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component VARCHAR(100),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Session tracking for user activity monitoring
CREATE TABLE IF NOT EXISTS session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'login', 'logout', 'page_view', 'task_created'
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for monitoring tables
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monitoring tables
CREATE POLICY "Users can view their own execution logs" ON execution_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own execution logs" ON execution_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own system metrics" ON system_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own system metrics" ON system_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own performance logs" ON performance_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance logs" ON performance_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own error logs" ON error_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own error logs" ON error_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own error logs" ON error_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own session logs" ON session_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session logs" ON session_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for monitoring tables performance
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_id_created_at ON execution_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_level ON execution_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_execution_logs_component ON execution_logs(component);
CREATE INDEX IF NOT EXISTS idx_execution_logs_task_id ON execution_logs(task_id);

CREATE INDEX IF NOT EXISTS idx_system_metrics_user_id_created_at ON system_metrics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_component ON system_metrics(component);

CREATE INDEX IF NOT EXISTS idx_performance_logs_user_id_created_at ON performance_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_logs_operation_type ON performance_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_performance_logs_status ON performance_logs(status);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id_created_at ON error_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON error_logs(component);

CREATE INDEX IF NOT EXISTS idx_session_logs_user_id_created_at ON session_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_logs_session_id ON session_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_action ON session_logs(action);