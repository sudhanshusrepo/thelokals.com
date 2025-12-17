---
description: Environment Variable Setup for Next.js Migration (Cloudflare)
---

The application has been migrated from Vite (React) to Next.js. This requires updating the Environment Variables to use the `NEXT_PUBLIC_` prefix, which makes them available to the client-side browser.

## Required Environment Variables

Go to your Cloudflare Pages Project -> Settings -> Environment Variables and ensure the following variables are set.

> [!IMPORTANT]
> You should define these variables in the **Production** and **Preview** environments.

### 1. Supabase Configuration
| Variable Name | Value (Example) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI...` |

> *Legacy `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` should be kept if you still have legacy apps, but Next.js apps will prioritize `NEXT_PUBLIC_`.*

### 2. Google Maps (Optional / If used)
| Variable Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSy...` |

### 3. Feature Flags (Optional)
| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_TEST_MODE` | `false` | Set to `true` for e2e testing. |
| `NEXT_PUBLIC_ENABLE_OTP_BYPASS` | `false` | Set to `true` to use `123456` OTP. |

## Verification
1. After updating variables, trigger a **new deployment** (retry the build).
2. The application should now correctly connect to Supabase.
