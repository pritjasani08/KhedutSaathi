-- AI Decision History & Feedback Schema (Required for foreign key)
CREATE TABLE IF NOT EXISTS public.ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    decision_type TEXT NOT NULL,
    priority TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    expected_impact TEXT,
    reason JSONB NOT NULL DEFAULT '[]'::jsonb,
    follow_up JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING',
    feedback TEXT,
    context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table Schema

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'WEATHER', 'MARKET', 'DISEASE', 'SCHEME', 'CROP_ADVISORY'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'DISMISSED'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    source TEXT NOT NULL, -- 'SYSTEM', 'AI', 'MARKET_API', etc.
    generated_by TEXT NOT NULL DEFAULT 'SYSTEM', -- 'SYSTEM', 'AI'
    notification_signature TEXT UNIQUE, -- Hash of context to prevent duplicates
    decision_id UUID REFERENCES public.ai_decisions(id) ON DELETE SET NULL, -- Link to AI decision history if applicable
    delivery_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    delivery_channel TEXT NOT NULL DEFAULT 'IN_APP', -- 'IN_APP', 'SMS', 'WHATSAPP'
    context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for fast lookup and filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_signature ON public.notifications(notification_signature);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_notifications_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notifications_modtime ON public.notifications;
CREATE TRIGGER update_notifications_modtime
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_modified_column();

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Usually restricted to service role in actual Supabase setup, but allowing for ease of local dev
