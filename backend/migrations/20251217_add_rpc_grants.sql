-- Migration: Add missing RPC grants for booking and compliance functions
-- Date: 2025-12-17

-- Grant EXECUTE on Booking Functions
GRANT EXECUTE ON FUNCTION public.create_ai_booking(uuid, text, jsonb, text[], numeric, geography, jsonb, text, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.find_nearby_providers(geography, text, numeric, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.broadcast_live_booking(uuid, uuid[], integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_live_booking(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_booking_otp(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_booking_otp(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_booking(uuid, numeric) TO authenticated, service_role;

-- Grant EXECUTE on Compliance Functions
GRANT EXECUTE ON FUNCTION public.request_account_deletion(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.report_content(uuid, text, uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.block_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unblock_user(uuid) TO authenticated, service_role;
