-- Play Store Compliance & Mobile App Features

-- 1. Account Deletion Request System
-- Required by Play Store policy for apps that allow account creation
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own deletion requests"
    ON public.account_deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests"
    ON public.account_deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

-- 2. User Reporting System (for UGC)
-- Required by Play Store policy for apps with User Generated Content
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('profile', 'service', 'review', 'chat', 'other')),
    content_id UUID, -- Optional ID of the specific content (e.g. review_id)
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
    ON public.user_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
    ON public.user_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- 3. User Blocking System
-- Required by Play Store policy for apps with UGC
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block others"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

-- 4. Functions

-- Function to submit deletion request
CREATE OR REPLACE FUNCTION public.request_account_deletion(reason TEXT)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
BEGIN
    INSERT INTO public.account_deletion_requests (user_id, reason)
    VALUES (auth.uid(), reason)
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to report a user/content
CREATE OR REPLACE FUNCTION public.report_content(
    reported_user_id UUID,
    content_type TEXT,
    content_id UUID,
    reason TEXT,
    description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    report_id UUID;
BEGIN
    INSERT INTO public.user_reports (reporter_id, reported_user_id, content_type, content_id, reason, description)
    VALUES (auth.uid(), reported_user_id, content_type, content_id, reason, description)
    RETURNING id INTO report_id;
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block a user
CREATE OR REPLACE FUNCTION public.block_user(blocked_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_blocks (blocker_id, blocked_id)
    VALUES (auth.uid(), blocked_user_id)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unblock a user
CREATE OR REPLACE FUNCTION public.unblock_user(blocked_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.user_blocks
    WHERE blocker_id = auth.uid() AND blocked_id = blocked_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT ALL ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.user_reports TO authenticated;
GRANT ALL ON public.user_blocks TO authenticated;
