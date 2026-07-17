-- AI Decision History & Feedback Schema

CREATE TABLE IF NOT EXISTS public.ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    decision_type TEXT NOT NULL, -- e.g., 'WEATHER', 'MARKET', 'CROP'
    priority TEXT NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
    confidence INTEGER NOT NULL, -- 0-100
    expected_impact TEXT,
    reason JSONB NOT NULL DEFAULT '[]'::jsonb,
    follow_up JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'DISMISSED', 'EXECUTED'
    feedback TEXT, -- 'UP', 'DOWN', NULL
    context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store what the AI saw at the time
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_ai_decisions_user_id ON public.ai_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_status ON public.ai_decisions(status);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created_at ON public.ai_decisions(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ai_decisions_modtime ON public.ai_decisions;
CREATE TRIGGER update_ai_decisions_modtime
    BEFORE UPDATE ON public.ai_decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI decisions"
    ON public.ai_decisions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI decisions"
    ON public.ai_decisions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI decisions"
    ON public.ai_decisions FOR UPDATE
    USING (auth.uid() = user_id);
