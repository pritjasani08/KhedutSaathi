DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Allow all inserts" ON public.notifications FOR INSERT WITH CHECK (true);
