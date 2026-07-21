-- Migration: Create automation_replay_audits table for complete operational traceability

CREATE TABLE IF NOT EXISTS public.automation_replay_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    failed_event_id UUID NOT NULL REFERENCES public.automation_failed_events(id) ON DELETE CASCADE,
    correlation_id UUID,
    admin_id UUID NOT NULL, -- UUID referencing admin user id
    replay_reason TEXT,
    replay_outcome VARCHAR(50) CHECK (replay_outcome IN ('SUCCESS', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying audits
CREATE INDEX IF NOT EXISTS idx_automation_replay_audits_event ON public.automation_replay_audits(failed_event_id);
CREATE INDEX IF NOT EXISTS idx_automation_replay_audits_admin ON public.automation_replay_audits(admin_id);

-- RLS Policies
ALTER TABLE public.automation_replay_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access to replay audits" ON public.automation_replay_audits;
CREATE POLICY "Allow service role full access to replay audits" ON public.automation_replay_audits FOR ALL TO service_role USING (true) WITH CHECK (true);
