-- supabase_farm_timeline.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the farm_timeline table
CREATE TABLE IF NOT EXISTS public.farm_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES public.ai_decisions(id) ON DELETE SET NULL, -- Optional link to a broader decision
    depends_on_task_id UUID REFERENCES public.farm_timeline(id) ON DELETE SET NULL, -- Dependency
    
    task_type TEXT NOT NULL, -- e.g., 'IRRIGATION', 'FERTILIZER', 'HARVEST', 'SPRAY', 'SCOUTING', 'GENERAL'
    title TEXT NOT NULL,
    description TEXT,
    
    scheduled_date TIMESTAMPTZ NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED', 'POSTPONED')),
    source TEXT NOT NULL, -- 'WEATHER', 'DISEASE', 'YIELD', 'SCHEME', 'PLANNER', 'NOTIFICATION', 'MEMORY'
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    blocking_reason TEXT, -- Reason why this task is blocked (if waiting on dependency)
    
    context_snapshot JSONB, -- Stores the raw facts, personalization factors, and AI explanation
    
    -- Lifecycle timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    postponed_until TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_updated_by_ai TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.farm_timeline ENABLE ROW LEVEL SECURITY;

-- Policies for Row Level Security
CREATE POLICY "Users can view their own timeline tasks"
    ON public.farm_timeline FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timeline tasks"
    ON public.farm_timeline FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline tasks"
    ON public.farm_timeline FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline tasks"
    ON public.farm_timeline FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farm_timeline_user_id ON public.farm_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_timeline_status ON public.farm_timeline(status);
CREATE INDEX IF NOT EXISTS idx_farm_timeline_scheduled_date ON public.farm_timeline(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_farm_timeline_source ON public.farm_timeline(source);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_farm_timeline_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_farm_timeline_modtime ON public.farm_timeline;
CREATE TRIGGER update_farm_timeline_modtime
    BEFORE UPDATE ON public.farm_timeline
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_timeline_updated_at_column();
