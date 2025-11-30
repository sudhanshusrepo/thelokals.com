---
description: Provider App v1.0 Development Sprint
---

# Provider App v1.0 Development Sprint

## Overview
Transform the provider app into a full-featured worker platform with:
- Webapp compliance features
- Push notifications
- Booking request management
- Payment integration
- Pin/favorite features
- Two-tier access: Sign-in (basic) vs Registration (full provider access)

## Phase 1: Database Schema Updates

### 1.1 Add Registration Status to Providers Table
```sql
-- Add registration status column to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'unregistered' 
CHECK (registration_status IN ('unregistered', 'pending', 'verified', 'rejected'));

-- Add registration metadata
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS digilocker_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_photo_verified BOOLEAN DEFAULT false;

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_providers_registration_status 
ON public.providers(registration_status);
```

### 1.2 Create Provider Notifications Table
```sql
-- For push notifications and in-app alerts
CREATE TABLE IF NOT EXISTS public.provider_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking_request', 'payment', 'system', 'promotion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.3 Create Provider Pins/Favorites Table
```sql
-- For providers to pin/favorite important bookings or clients
CREATE TABLE IF NOT EXISTS public.provider_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(provider_id, booking_id),
  UNIQUE(provider_id, client_id)
);
```

## Phase 2: Backend Functions & RLS

### 2.1 Registration Validation Function
```sql
-- Function to check if provider can accept bookings
CREATE OR REPLACE FUNCTION can_accept_bookings(provider_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.providers
    WHERE id = provider_uuid
    AND registration_status = 'verified'
    AND is_available = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 Booking Request Functions
- Update existing booking functions to check registration status
- Add notification triggers for new booking requests

### 2.3 RLS Policies
- Provider notifications: Only own notifications
- Provider pins: Only own pins
- Bookings: Only verified providers can accept

## Phase 3: Provider App Frontend Structure

### 3.1 Update App Layout
- Copy client app layout structure
- Adapt header/footer for provider context
- Add persistent "Register Now" banner for unregistered users

### 3.2 Authentication Flow Refactor
**Sign In (Basic Access):**
- Mobile number + OTP
- Access to: Home page, features info, offers
- Cannot accept bookings
- Shows "Register Now" warning banner

**Registration (Full Provider Access):**
- Triggered by "Register Now" button
- Flow: Mobile → DigiLocker → Photo Upload → Service Selection
- Upon completion: registration_status = 'pending'
- After admin approval: registration_status = 'verified'

### 3.3 Home Page (Unregistered)
- Hero section highlighting worker benefits
- Feature cards (similar to client app)
- Offers and promotions
- Testimonials from successful providers
- Persistent "Register Now" CTA

### 3.4 Home Page (Registered)
- Dashboard with stats
- Pending booking requests
- Active bookings
- Earnings summary
- Quick actions

## Phase 4: Core Features Implementation

### 4.1 Push Notifications
- Setup Expo push notifications
- Backend: Create notification on new booking request
- Frontend: Handle notification tap → Navigate to booking details
- In-app notification center

### 4.2 Booking Request Management
**Components:**
- BookingRequestCard
- BookingRequestList
- BookingRequestDetails
- AcceptRejectActions

**Features:**
- Real-time updates via Supabase realtime
- Accept/Reject booking requests
- View AI-generated checklists
- Estimated cost display
- Client details and location

### 4.3 Payment Integration
**Components:**
- PaymentHistory
- PaymentDetails
- WithdrawalRequest

**Features:**
- View payment history
- Track pending payments
- Request withdrawals
- Payment notifications

### 4.4 Pin/Favorite Features
**Components:**
- PinButton
- PinnedBookingsList
- PinnedClientsList

**Features:**
- Pin important bookings
- Favorite regular clients
- Quick access to pinned items
- Add notes to pins

## Phase 5: Webapp Compliance

### 5.1 Legal Pages
- Privacy Policy
- Terms of Service (Provider-specific)
- Data Deletion Policy

### 5.2 Account Management
- Account deletion feature
- Data export
- Privacy settings

### 5.3 Media Permissions
- Camera permission for profile photo
- Location permission for service area
- Notification permission

## Phase 6: Registration Flow Components

### 6.1 RegistrationBanner Component
```tsx
// Persistent warning for unregistered users
- Sticky position
- Clear CTA
- Dismissible but reappears on reload
```

### 6.2 RegistrationWizard Component
```tsx
// Multi-step registration
Step 1: Mobile verification
Step 2: DigiLocker integration
Step 3: Photo upload
Step 4: Service selection
Step 5: Service area selection
Step 6: Review & Submit
```

### 6.3 Registration Status Checker
```tsx
// HOC or hook to check registration status
- Redirect to registration if accessing protected routes
- Show appropriate UI based on status
```

## Implementation Order

1. **Database Schema** (Phase 1)
2. **Backend Functions** (Phase 2)
3. **Layout & Auth Refactor** (Phase 3.1, 3.2)
4. **Home Pages** (Phase 3.3, 3.4)
5. **Registration Flow** (Phase 6)
6. **Booking Requests** (Phase 4.2)
7. **Push Notifications** (Phase 4.1)
8. **Payment Features** (Phase 4.3)
9. **Pin Features** (Phase 4.4)
10. **Webapp Compliance** (Phase 5)

## Key Considerations

- **Two-Tier Access Model**: Clear separation between signed-in and registered users
- **Registration Validation**: Strict checks before allowing booking acceptance
- **Real-time Updates**: Use Supabase realtime for booking requests
- **Consistent UX**: Reuse client app components where possible
- **Mobile-First**: Optimize for mobile experience
- **Compliance**: Ensure all legal requirements are met

## Success Criteria

- [ ] Unregistered users can sign in and view info
- [ ] Registration flow is smooth and intuitive
- [ ] Only verified providers can accept bookings
- [ ] Push notifications work reliably
- [ ] Booking request management is real-time
- [ ] Payment tracking is accurate
- [ ] Pin features enhance workflow
- [ ] All compliance features implemented
