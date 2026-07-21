-- Migration: Create automation_processed_events table for idempotency tracking

CREATE TABLE IF NOT EXISTS public.automation_processed_events (
    signature VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    user_id UUID, -- Optional depending on event
    correlation_id UUID,
    status VARCHAR(50) DEFAULT 'SUCCESS' CHECK (status IN ('PROCESSING', 'SUCCESS', 'FAILED', 'REPLAYING', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days'
);

-- For iterative migrations (idempotent alterations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_processed_events' AND column_name = 'correlation_id') THEN
        ALTER TABLE public.automation_processed_events ADD COLUMN correlation_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_processed_events' AND column_name = 'status') THEN
        ALTER TABLE public.automation_processed_events ADD COLUMN status VARCHAR(50) DEFAULT 'SUCCESS' CHECK (status IN ('PROCESSING', 'SUCCESS', 'FAILED', 'REPLAYING', 'CANCELLED'));
    END IF;
END $$;

-- Index for TTL cleanup or fast lookups
CREATE INDEX IF NOT EXISTS idx_automation_processed_events_expires ON public.automation_processed_events(expires_at);

-- RLS Policies
ALTER TABLE public.automation_processed_events ENABLE ROW LEVEL SECURITY;

-- Orchestrator runs with service role, but setting policies for completeness
DROP POLICY IF EXISTS "Allow orchestrator to insert processed events" ON public.automation_processed_events;
CREATE POLICY "Allow orchestrator to insert processed events" ON public.automation_processed_events FOR INSERT TO authenticated, anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow service role full access to processed events" ON public.automation_processed_events;
CREATE POLICY "Allow service role full access to processed events" ON public.automation_processed_events FOR ALL TO service_role USING (true) WITH CHECK (true);
