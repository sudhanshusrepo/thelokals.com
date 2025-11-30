-- Migration: Payment System
-- Description: Create payment transactions table and payment gateway functions
-- Phase: 7 of 7
-- Idempotent: Safe to re-run

-- Drop existing types if they exist
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;

-- Drop existing tables
DROP TABLE IF EXISTS public.payment_transactions CASCADE;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_payment_transactions_booking;
DROP INDEX IF EXISTS idx_payment_transactions_status;
DROP INDEX IF EXISTS idx_payment_transactions_method;

-- Create enums
CREATE TYPE payment_method AS ENUM (
  'BILLDESK',
  'PAYU',
  'UPI',
  'CARD'
);

CREATE TYPE transaction_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'REFUNDED'
);

-- Payment Transactions Table
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings NOT NULL,
  amount numeric(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  status transaction_status DEFAULT 'PENDING',
  
  -- Gateway details
  gateway_transaction_id text,
  gateway_response jsonb,
  
  -- Customer details
  customer_details jsonb,
  
  -- Refund details
  refund_amount numeric(10, 2),
  refund_reason text,
  refunded_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_payment_transactions_booking ON public.payment_transactions(booking_id, created_at DESC);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status, created_at DESC);
CREATE INDEX idx_payment_transactions_method ON public.payment_transactions(payment_method);
CREATE INDEX idx_payment_transactions_gateway_id ON public.payment_transactions(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_payment_transactions_updated_at 
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
  ON public.payment_transactions FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings 
      WHERE client_id = auth.uid() OR provider_id IN (
        SELECT id FROM public.providers WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert payment transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update payment transactions"
  ON public.payment_transactions FOR UPDATE
  USING (true);

-- Function: Create BillDesk Payment
CREATE OR REPLACE FUNCTION create_billdesk_payment(
  p_transaction_id uuid,
  p_amount numeric,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
)
RETURNS jsonb AS $$
DECLARE
  v_payment_url text;
  v_merchant_id text := 'MERCHANT_ID'; -- Replace with actual merchant ID
  v_checksum text;
BEGIN
  -- Update transaction status
  UPDATE public.payment_transactions
  SET status = 'PROCESSING'
  WHERE id = p_transaction_id;
  
  -- Generate BillDesk payment URL
  -- In production, this would call BillDesk API
  v_payment_url := 'https://billdesk.com/payment?txnid=' || p_transaction_id::text || 
                   '&amount=' || p_amount::text ||
                   '&email=' || p_customer_email ||
                   '&phone=' || p_customer_phone;
  
  RETURN jsonb_build_object(
    'payment_url', v_payment_url,
    'transaction_id', p_transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create PayU Payment
CREATE OR REPLACE FUNCTION create_payu_payment(
  p_transaction_id uuid,
  p_amount numeric,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
)
RETURNS jsonb AS $$
DECLARE
  v_payment_url text;
  v_merchant_key text := 'MERCHANT_KEY'; -- Replace with actual merchant key
BEGIN
  -- Update transaction status
  UPDATE public.payment_transactions
  SET status = 'PROCESSING'
  WHERE id = p_transaction_id;
  
  -- Generate PayU payment URL
  -- In production, this would call PayU API
  v_payment_url := 'https://secure.payu.in/_payment?txnid=' || p_transaction_id::text || 
                   '&amount=' || p_amount::text ||
                   '&email=' || p_customer_email ||
                   '&phone=' || p_customer_phone;
  
  RETURN jsonb_build_object(
    'payment_url', v_payment_url,
    'transaction_id', p_transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create UPI Payment
CREATE OR REPLACE FUNCTION create_upi_payment(
  p_transaction_id uuid,
  p_amount numeric,
  p_customer_phone text
)
RETURNS jsonb AS $$
DECLARE
  v_upi_intent_url text;
  v_merchant_vpa text := 'merchant@upi'; -- Replace with actual VPA
BEGIN
  -- Update transaction status
  UPDATE public.payment_transactions
  SET status = 'PROCESSING'
  WHERE id = p_transaction_id;
  
  -- Generate UPI intent URL
  v_upi_intent_url := 'upi://pay?pa=' || v_merchant_vpa || 
                      '&pn=TheLokals' ||
                      '&am=' || p_amount::text ||
                      '&tn=Payment for booking ' || p_transaction_id::text ||
                      '&cu=INR';
  
  RETURN jsonb_build_object(
    'upi_intent_url', v_upi_intent_url,
    'transaction_id', p_transaction_id,
    'qr_code_data', v_upi_intent_url
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verify Payment Callback
CREATE OR REPLACE FUNCTION verify_payment_callback(
  p_transaction_id uuid,
  p_gateway_txn_id text,
  p_status text,
  p_gateway_response jsonb
)
RETURNS boolean AS $$
DECLARE
  v_booking_id uuid;
  v_success boolean;
BEGIN
  -- Get booking ID
  SELECT booking_id INTO v_booking_id
  FROM public.payment_transactions
  WHERE id = p_transaction_id;
  
  IF v_booking_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Determine success
  v_success := (p_status = 'success' OR p_status = 'SUCCESS');
  
  -- Update transaction
  UPDATE public.payment_transactions
  SET 
    status = CASE WHEN v_success THEN 'SUCCESS'::transaction_status ELSE 'FAILED'::transaction_status END,
    gateway_transaction_id = p_gateway_txn_id,
    gateway_response = p_gateway_response,
    updated_at = now()
  WHERE id = p_transaction_id;
  
  -- Update booking payment status if successful
  IF v_success THEN
    UPDATE public.bookings
    SET payment_status = 'PAID'
    WHERE id = v_booking_id;
  END IF;
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process Refund
CREATE OR REPLACE FUNCTION process_refund(
  p_transaction_id uuid,
  p_refund_amount numeric,
  p_refund_reason text
)
RETURNS boolean AS $$
DECLARE
  v_booking_id uuid;
  v_original_amount numeric;
BEGIN
  -- Get transaction details
  SELECT booking_id, amount INTO v_booking_id, v_original_amount
  FROM public.payment_transactions
  WHERE id = p_transaction_id AND status = 'SUCCESS';
  
  IF v_booking_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or not successful';
  END IF;
  
  IF p_refund_amount > v_original_amount THEN
    RAISE EXCEPTION 'Refund amount cannot exceed original amount';
  END IF;
  
  -- Update transaction
  UPDATE public.payment_transactions
  SET 
    status = 'REFUNDED',
    refund_amount = p_refund_amount,
    refund_reason = p_refund_reason,
    refunded_at = now(),
    updated_at = now()
  WHERE id = p_transaction_id;
  
  -- Update booking payment status
  UPDATE public.bookings
  SET payment_status = 'REFUNDED'
  WHERE id = v_booking_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION create_billdesk_payment TO authenticated;
GRANT EXECUTE ON FUNCTION create_payu_payment TO authenticated;
GRANT EXECUTE ON FUNCTION create_upi_payment TO authenticated;
GRANT EXECUTE ON FUNCTION verify_payment_callback TO authenticated;
GRANT EXECUTE ON FUNCTION process_refund TO authenticated;
