-- AI Personalization Engine: Farmer Memory Schema

CREATE TABLE IF NOT EXISTS public.farmer_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    preferred_crops JSONB DEFAULT '[]'::jsonb,
    successful_crops JSONB DEFAULT '[]'::jsonb,
    failed_crops JSONB DEFAULT '[]'::jsonb,
    avg_yield_history JSONB DEFAULT '{}'::jsonb,
    disease_history_summary JSONB DEFAULT '[]'::jsonb,
    preferred_irrigation TEXT,
    preferred_water_source TEXT,
    preferred_language TEXT DEFAULT 'en',
    risk_profile TEXT DEFAULT 'MODERATE', -- LOW, MODERATE, HIGH
    last_crop TEXT,
    last_recommendation TEXT,
    recommendation_acceptance_rate NUMERIC DEFAULT 0.0,
    feedback_score NUMERIC DEFAULT 0.0,
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    seasonal_patterns JSONB DEFAULT '{}'::jsonb,
    memory_version INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_memory_user_id ON public.farmer_memory(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_farmer_memory_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_farmer_memory_modtime_trigger ON public.farmer_memory;
CREATE TRIGGER update_farmer_memory_modtime_trigger
    BEFORE UPDATE ON public.farmer_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_farmer_memory_modtime();

-- RLS Policies
ALTER TABLE public.farmer_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory"
    ON public.farmer_memory FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM public.farmer_profiles WHERE id = public.farmer_memory.user_id));

-- We disable RLS for INSERT and UPDATE temporarily since Node backend uses ANON key
CREATE POLICY "Allow all inserts for memory"
    ON public.farmer_memory FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow all updates for memory"
    ON public.farmer_memory FOR UPDATE
    USING (true);
