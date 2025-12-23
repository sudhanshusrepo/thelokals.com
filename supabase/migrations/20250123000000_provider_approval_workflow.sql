-- Provider Approval Workflow Migration
-- Adds verification status tracking and approval history

-- Add approval tracking columns to providers table
ALTER TABLE public.providers 
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- Create provider_documents table
CREATE TABLE IF NOT EXISTS public.provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'photo', 'certificate')),
  file_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(provider_id, document_type)
);

-- Create provider_approval_history table
CREATE TABLE IF NOT EXISTS public.provider_approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'suspended', 'reactivated')),
  performed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_documents
CREATE POLICY "providers_view_own_documents" ON public.provider_documents
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "providers_insert_own_documents" ON public.provider_documents
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "admins_view_all_documents" ON public.provider_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for provider_approval_history
CREATE POLICY "providers_view_own_history" ON public.provider_approval_history
  FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "admins_view_all_history" ON public.provider_approval_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider_id ON public.provider_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_documents_status ON public.provider_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_provider_approval_history_provider_id ON public.provider_approval_history(provider_id);
CREATE INDEX IF NOT EXISTS idx_providers_verification_status ON public.providers(verification_status);

-- Update create_live_booking RPC to only send to approved providers
CREATE OR REPLACE FUNCTION public.create_live_booking_with_approval_check()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only send booking requests to approved providers
  INSERT INTO public.live_booking_requests (booking_id, provider_id, status, expires_at)
  SELECT 
    NEW.id,
    p.id,
    'PENDING',
    NOW() + INTERVAL '15 minutes'
  FROM public.providers p
  WHERE 
    p.category = NEW.service_category
    AND p.is_active = true
    AND p.verification_status = 'approved' -- NEW: Only approved providers
    AND ST_DWithin(
      p.operating_location::geography,
      NEW.location::geography,
      p.service_radius_km * 1000
    )
  LIMIT 5;
  
  RETURN NEW;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT ON public.provider_documents TO authenticated;
GRANT SELECT ON public.provider_approval_history TO authenticated;
GRANT ALL ON public.provider_documents TO service_role;
GRANT ALL ON public.provider_approval_history TO service_role;

COMMENT ON TABLE public.provider_documents IS 'Stores provider verification documents';
COMMENT ON TABLE public.provider_approval_history IS 'Tracks provider approval status changes';
COMMENT ON COLUMN public.providers.verification_status IS 'Provider verification status: pending, approved, rejected, suspended';
