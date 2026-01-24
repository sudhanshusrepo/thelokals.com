-- Fix for 500 errors when starting a job
-- Updates the valid_transitions map to allow CONFIRMED -> IN_PROGRESS

CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  valid_transitions JSONB := '{
    "PENDING": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["ACCEPTED", "EN_ROUTE", "IN_PROGRESS", "CANCELLED"],
    "ACCEPTED": ["EN_ROUTE", "IN_PROGRESS", "CANCELLED"],
    "EN_ROUTE": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
    "COMPLETED": ["PAYMENT_PENDING", "PAYMENT_SUCCESS"],
    "PAYMENT_PENDING": ["COMPLETED", "PAYMENT_SUCCESS"],
    "PAYMENT_SUCCESS": [],
    "CANCELLED": []
  }'::JSONB;
BEGIN
  -- Allow initial status setting
  IF OLD.status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if transition is valid
  IF NOT (valid_transitions->OLD.status::TEXT) ? NEW.status::TEXT THEN
    RAISE EXCEPTION 'Invalid booking status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$function$;
