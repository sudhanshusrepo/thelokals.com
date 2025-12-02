# Backend SQL Changes for Play Store & PWA Compliance

## Overview
This document lists all required backend changes to make the application compliant with Play Store policies and prepare it for production deployment.

## Execution Order
Run these SQL statements **in order** in your Supabase SQL Editor.

---

## Migration: Play Store Compliance Features

### 1. Account Deletion Request System
**Required by**: Play Store policy for apps that allow account creation

```sql
-- Create account deletion requests table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own deletion requests"
    ON public.account_deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests"
    ON public.account_deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

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
```

---

### 2. User Reporting System
**Required by**: Play Store policy for apps with User Generated Content (UGC)

```sql
-- Create user reports table
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

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create reports"
    ON public.user_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
    ON public.user_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Function to report content
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
```

---

### 3. User Blocking System
**Required by**: Play Store policy for apps with UGC

```sql
-- Create user blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can block others"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

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
```

---

### 4. Grant Permissions

```sql
-- Grant permissions to authenticated users
GRANT ALL ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.user_reports TO authenticated;
GRANT ALL ON public.user_blocks TO authenticated;
```

---

## Verification Queries

After running the above SQL, verify the setup:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('account_deletion_requests', 'user_reports', 'user_blocks');

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('request_account_deletion', 'report_content', 'block_user', 'unblock_user');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('account_deletion_requests', 'user_reports', 'user_blocks');
```

---

## Usage Examples

### Request Account Deletion
```sql
SELECT request_account_deletion('No longer need the service');
```

### Report a User/Content
```sql
SELECT report_content(
    '00000000-0000-0000-0000-000000000000'::uuid, -- reported_user_id
    'review',                                       -- content_type
    '00000000-0000-0000-0000-000000000000'::uuid, -- content_id
    'Inappropriate content',                        -- reason
    'Contains offensive language'                   -- description
);
```

### Block a User
```sql
SELECT block_user('00000000-0000-0000-0000-000000000000'::uuid);
```

### Unblock a User
```sql
SELECT unblock_user('00000000-0000-0000-0000-000000000000'::uuid);
```

---

## Admin Queries

### View Pending Deletion Requests
```sql
SELECT * FROM public.account_deletion_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### View Pending Reports
```sql
SELECT 
    r.*,
    reporter.email as reporter_email,
    reported.email as reported_email
FROM public.user_reports r
LEFT JOIN auth.users reporter ON r.reporter_id = reporter.id
LEFT JOIN auth.users reported ON r.reported_user_id = reported.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;
```

### View All Blocks
```sql
SELECT 
    b.*,
    blocker.email as blocker_email,
    blocked.email as blocked_email
FROM public.user_blocks b
LEFT JOIN auth.users blocker ON b.blocker_id = blocker.id
LEFT JOIN auth.users blocked ON b.blocked_id = blocked.id
ORDER BY b.created_at DESC;
```

---

**Status**: ✅ Ready to Execute
**File**: Also available in `supabase/migrations/20250201000003_play_store_compliance.sql`
