const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error("❌ No Service Role Key found in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const MIGRATION_SQL = `
CREATE OR REPLACE FUNCTION accept_live_booking(
  p_request_id UUID,
  p_provider_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
  v_status booking_status;
BEGIN
  v_booking_id := p_request_id;
  SELECT status INTO v_status FROM bookings WHERE id = v_booking_id FOR UPDATE;
  IF v_status NOT IN ('BOOKING_CREATED', 'PROVIDER_MATCHING', 'SEARCHING', 'REQUESTED', 'PENDING') THEN
     RETURN jsonb_build_object('success', false, 'message', 'Job is no longer available (Status: ' || v_status || ')');
  END IF;
  UPDATE bookings SET status = 'PROVIDER_ACCEPTED', provider_id = p_provider_id, updated_at = NOW() WHERE id = v_booking_id;
  UPDATE booking_requests SET status = 'ACCEPTED' WHERE booking_id = v_booking_id AND provider_id = p_provider_id;
  UPDATE booking_requests SET status = 'EXPIRED' WHERE booking_id = v_booking_id AND provider_id != p_provider_id;
  RETURN jsonb_build_object('success', true, 'message', 'Booking accepted');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION create_booking_requests(
  p_booking_id UUID,
  p_provider_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO booking_requests (booking_id, provider_id, status)
  SELECT p_booking_id, unnest(p_provider_ids), 'PENDING'
  ON CONFLICT (booking_id, provider_id) DO NOTHING;
END;
$$;
`;

async function deploy() {
    console.log("🚀 Attempting to deploy via REST RPC 'exec_sql'...");

    // Try common names for SQL execution helpers
    const rpcNames = ['exec_sql', 'execute_sql', 'run_sql', 'exec'];

    for (const name of rpcNames) {
        console.log(`Trying RPC: ${name}...`);
        const { data, error } = await supabase.rpc(name, { sql: MIGRATION_SQL });

        if (!error) {
            console.log(`✅ Success! Migration applied via ${name}.`);
            return;
        } else {
            console.log(`❌ ${name} failed: ${error.message}`);
        }
    }

    console.error("⛔ All RPC attempts failed. You likely do not have a SQL execution helper function installed.");
}

deploy();
