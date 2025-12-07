# Strategic Business Roadmap & Scope

## Vision
Build a unified platform that supports both **Local** (in-person) and **Online** (remote) services, sharing a robust core infrastructure.

## 1. Shared Core (Phase 1: Weeks 1-2)
*Build once, use for both.*

### Domain Model & DB
*   **`service_categories`**: Add `type`: `LOCAL` | `ONLINE`.
*   **`bookings`**: Fields: `delivery_mode`, `status`, `service_category_id`, `user_id`, `provider_id`.
*   **`payments`** & **`provider_payouts`**: Include commission fields.

### Booking Engine
*   **Service**: Single booking service validating location/availability.
*   **Lifecycle**: `REQUESTED` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` → `PAID` / `CANCELLED`.

### Provider Onboarding
*   **Fields**: KYC, Verification Status, Ratings, Basic Metrics (jobs done, cancel rate).

### Admin Panel Base
*   **Auth**: Roles: `Super Admin`, `Ops`, `Support`, `Finance`.
*   **Management**: Bookings table (search/filter), User/Provider management.
*   **Controls**: Location & Service toggles (enable/disable by city/area).

---

## 2. Track A: Online Services (Weeks 3-4)
*Ready to live as soon as online supply is strong.*

### Features
*   **Booking UX**: Slot pickers (Date + Time) & Duration selection.
*   **Delivery**: Generate/Join meeting links (Jitsi/Meet/Zoom).
*   **Notifications**: "Session starting in X minutes".
*   **Content**: Emphasis on "Video Call / Online Session". Categories: Tutoring, Coaching, Yoga.

---

## 3. Track B: Local Services (Weeks 5-6)
*Keep behind admin toggles until ready.*

### Features
*   **Geo & Dispatch**: Address capture + Live location.
*   **Matching**: Provider Radius & Simple "Nearest + Available" algorithm.
*   **Job Flow**: `EN_ROUTE` → `ARRIVED` → `WORK_STARTED` → `WORK_COMPLETED`.
*   **Content**: Emphasis on "Coming to your home". Categories: Maids, Electricians, Plumbers.

---

## 4. Launch Decision (Week 7+)
*   **Criteria**: Stronger supply side (Online vs Local)? Better beta reliability?
*   **Strategy**: Launch the stronger track first; keep the other in limited beta.

## 5. Decision Checkpoints
*   Are bookings completing reliably?
*   Is there enough provider supply?
*   Which side has lower ops overhead?
