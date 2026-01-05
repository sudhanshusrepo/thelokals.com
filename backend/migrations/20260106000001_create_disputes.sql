-- Migration: 20260106000001_create_disputes.sql
-- Purpose: Create disputes table for Support Sprint

BEGIN;

CREATE TYPE dispute_status AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status dispute_status DEFAULT 'OPEN',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all disputes"
  ON disputes FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own disputes"
  ON disputes FOR SELECT
  USING (auth.uid() = reporter_id);

COMMIT;
