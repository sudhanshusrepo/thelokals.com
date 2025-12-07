# API & Database Reference

## Database Functions (RPC)

These functions are callable from the client using `supabase.rpc('function_name', params)`.

### Booking System

#### `create_ai_booking`
Creates a new booking with AI-generated requirements.
- **Params**:
  - `p_client_id` (uuid): User ID
  - `p_service_category` (text): Service category name
  - `p_requirements` (jsonb): Structured requirements
  - `p_ai_checklist` (text[]): List of tasks
  - `p_estimated_cost` (numeric): Cost estimate
  - `p_location` (geography): Service location
  - `p_address` (jsonb): Address details
  - `p_notes` (text): Optional notes
- **Returns**: `uuid` (Booking ID)

#### `find_nearby_providers`
Finds active providers within a radius.
- **Params**:
  - `p_location` (geography): Center point
  - `p_category` (text): Service category
  - `p_max_distance_km` (numeric): Radius (default 10km)
  - `p_limit` (integer): Max results
- **Returns**: Table of provider details (id, name, distance, rating, etc.)

#### `broadcast_live_booking`
Creates booking requests for multiple providers.
- **Params**:
  - `p_booking_id` (uuid): Booking ID
  - `p_provider_ids` (uuid[]): List of provider IDs
  - `p_expiry_minutes` (integer): Request expiry time
- **Returns**: `integer` (Count of requests created)

#### `accept_live_booking`
Provider accepts a live booking request.
- **Params**:
  - `p_request_id` (uuid): Request ID
  - `p_provider_id` (uuid): Provider ID
- **Returns**: `boolean` (Success status)

#### `generate_booking_otp`
Generates a 6-digit OTP for booking verification.
- **Params**: `p_booking_id` (uuid)
- **Returns**: `text` (OTP code)

#### `verify_booking_otp`
Verifies the OTP and starts the booking.
- **Params**: `p_booking_id` (uuid), `p_otp_code` (text)
- **Returns**: `boolean` (Success status)

#### `complete_booking`
Marks a booking as completed.
- **Params**: `p_booking_id` (uuid), `p_final_cost` (numeric)
- **Returns**: `boolean` (Success status)

### Compliance & Admin

#### `request_account_deletion`
Submits a GDPR/compliance deletion request.
- **Params**: `reason` (text)
- **Returns**: `uuid` (Request ID)

#### `report_content`
Reports a user or content for moderation.
- **Params**: `reported_user_id`, `content_type`, `content_id`, `reason`, `description`
- **Returns**: `uuid` (Report ID)

## Row Level Security (RLS) Policies

### General Principles
- **Users**: Can read/write their own `profiles` and `bookings`.
- **Providers**: Can read/write their own `providers` profile and assigned `bookings`.
- **Public**: Can read `service_categories` and basic provider info (via `find_nearby_providers`).

### Specific Policies
- **`bookings`**:
  - Clients can view their own bookings.
  - Providers can view bookings assigned to them.
  - Providers can view "Live" bookings they are requested for.
- **`payment_transactions`**:
  - Users can view their own transactions.
