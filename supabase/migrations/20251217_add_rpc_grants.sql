-- Migration: Add missing RPC grants for booking and compliance functions
-- Date: 2025-12-17

-- Grant EXECUTE on Booking Functions
GRANT EXECUTE ON FUNCTION public.create_ai_booking TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.find_nearby_providers TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.broadcast_live_booking TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_live_booking TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_booking_otp TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_booking_otp TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_booking TO authenticated, service_role;

-- Grant EXECUTE on Compliance Functions
GRANT EXECUTE ON FUNCTION public.request_account_deletion TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.report_content TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.block_user TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unblock_user TO authenticated, service_role;
