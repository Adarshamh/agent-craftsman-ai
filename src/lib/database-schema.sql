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