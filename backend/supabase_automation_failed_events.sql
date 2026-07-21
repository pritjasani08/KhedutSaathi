-- Migration: Create automation_failed_events table (Dead-Letter Queue)

CREATE TABLE IF NOT EXISTS public.automation_failed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    error_message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'FAILED' CHECK (status IN ('FAILED', 'REPLAYING', 'RESOLVED')),
    correlation_id UUID,
    replay_count INT DEFAULT 0,
    last_replayed_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_failed_events' AND column_name = 'correlation_id') THEN
        ALTER TABLE public.automation_failed_events ADD COLUMN correlation_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_failed_events' AND column_name = 'replay_count') THEN
        ALTER TABLE public.automation_failed_events ADD COLUMN replay_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_failed_events' AND column_name = 'last_replayed_at') THEN
        ALTER TABLE public.automation_failed_events ADD COLUMN last_replayed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_failed_events' AND column_name = 'last_error') THEN
        ALTER TABLE public.automation_failed_events ADD COLUMN last_error TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_failed_events' AND column_name = 'expires_at') THEN
        ALTER TABLE public.automation_failed_events ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days';
    END IF;
END $$;

-- Index for querying failed events
CREATE INDEX IF NOT EXISTS idx_automation_failed_events_status ON public.automation_failed_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_automation_failed_events_expires ON public.automation_failed_events(expires_at);

-- RLS Policies
ALTER TABLE public.automation_failed_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow orchestrator to insert failed events" ON public.automation_failed_events;
CREATE POLICY "Allow orchestrator to insert failed events" ON public.automation_failed_events FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to failed events" ON public.automation_failed_events;
CREATE POLICY "Allow service role full access to failed events" ON public.automation_failed_events FOR ALL TO service_role USING (true) WITH CHECK (true);
