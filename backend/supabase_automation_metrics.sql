-- Migration: Create automation_metrics table for observability

CREATE TABLE IF NOT EXISTS public.automation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(255) NOT NULL,
    source_module VARCHAR(255) NOT NULL,
    execution_time_ms INTEGER,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying metrics by event type and status over time
CREATE INDEX IF NOT EXISTS idx_automation_metrics_event_status_time ON public.automation_metrics(event_type, status, created_at);

-- RLS Policies
ALTER TABLE public.automation_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow orchestrator to insert metrics" ON public.automation_metrics;
CREATE POLICY "Allow orchestrator to insert metrics" ON public.automation_metrics FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role to read metrics" ON public.automation_metrics;
CREATE POLICY "Allow service role to read metrics" ON public.automation_metrics FOR SELECT TO service_role USING (true);
