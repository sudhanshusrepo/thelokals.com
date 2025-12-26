# Client Cleanup Inventory

| File/Path | Type | Status | Action | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `components/landing` | Type A (Dead) | DELETED | DELETE | Completely unused. Replaced by `components/home`. |
| `app/booking-confirmed` | Type A (Dead) | DELETED | DELETE | Unused. |
| `app/booking/[id]` | Type B (Duplicate) | DELETED | MERGE | Merged into `app/bookings/[id]`. |
| `app/bookings/[id]` | Type C (Active) | Active | KEEP | Canonical Booking Details page. |
| `app/booking` | Type B (Partially Dead) | Active | CHECK | Contains `match` (Active) but `[id]` deleted. |
| `components/home` | Type C (Active) | Active | KEEP | Main home components. |
| `components/LazyComponents.tsx` | Type C (Active) | Active | KEEP | Used in `page.tsx`. |

## Unused Exports
- `components/landing` contents.

## Legacy Folders
- `components/landing`
