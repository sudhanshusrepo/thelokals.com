# Worker Registration - Updated Instructions

## ⚠️ Important Update

The original SQL script (`seed-workers.sql`) **will not work** because:
- Supabase Auth manages password hashing internally
- Cannot directly insert into `auth.users` table with custom passwords
- Must use Supabase Auth Admin API

## ✅ Correct Method: Use TypeScript Script

### Prerequisites

1. **Get your Supabase Service Role Key:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy the `service_role` key (NOT the `anon` key)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install tsx for running TypeScript:**
   ```bash
   npm install -g tsx
   # or use npx
   ```

### Step-by-Step Instructions

#### Step 1: Create the Helper Function

Run this SQL in Supabase SQL Editor:

```bash
# Copy and paste the contents of:
scripts/create-provider-function.sql
```

This creates a PostgreSQL function to safely insert provider records with PostGIS location data.

#### Step 2: Set Environment Variables

**Option A: Using .env file (Recommended)**

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://gdnltvvxiychrsdzenia.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Option B: Using command line**

```bash
# Windows PowerShell
$env:SUPABASE_URL="https://gdnltvvxiychrsdzenia.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Linux/Mac
export SUPABASE_URL="https://gdnltvvxiychrsdzenia.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

#### Step 3: Run the Registration Script

```bash
# Using npx (recommended)
npx tsx scripts/register-workers.ts

# Or if tsx is installed globally
tsx scripts/register-workers.ts
```

### Expected Output

```
🚀 Starting worker registration...

📍 Supabase URL: https://gdnltvvxiychrsdzenia.supabase.co
👥 Workers to create: 5

📝 Creating worker: Rajesh Kumar (Plumber)
  → Creating auth user...
  ✅ Auth user created: 11111111-1111-1111-1111-111111111111
  → Creating profile...
  ✅ Profile created
  → Creating provider record...
  ✅ Provider record created
✅ Successfully created: Rajesh Kumar

[... similar output for other workers ...]

============================================================
📊 SUMMARY
============================================================
✅ Successfully created: 5
⚠️  Skipped (already exist): 0
❌ Failed: 0

============================================================
📋 CREDENTIALS
============================================================

All workers use the same password: Worker@123

Rajesh Kumar (Plumber)
  Email: rajesh.plumber@thelokals.com
  Phone: +919876543210

[... other workers ...]

✅ Registration complete!
```

## Verification

### Check in Database

Run this SQL query in Supabase:

```sql
SELECT 
  p.full_name,
  p.email,
  p.category,
  p.is_verified,
  p.is_active,
  p.rating_average,
  ST_AsText(p.operating_location::geometry) as location
FROM public.providers p
WHERE p.email LIKE '%@thelokals.com'
ORDER BY p.category, p.full_name;
```

### Test Login

1. Go to `https://pro.thelokals.com` (or your provider app URL)
2. Try logging in with:
   - Email: `rajesh.plumber@thelokals.com`
   - Password: `Worker@123`

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY is required"

**Solution:** You haven't set the service role key. Follow Step 2 above.

### Error: "User already exists"

**Solution:** The script will skip existing users automatically. This is normal if you run it multiple times.

### Error: "create_provider_with_location does not exist"

**Solution:** You need to run the SQL function first (Step 1).

### Error: "Invalid API key"

**Solution:** Make sure you're using the `service_role` key, NOT the `anon` key.

### Error: "Permission denied"

**Solution:** Check your RLS policies. The service role key should bypass RLS, but verify the policies are set correctly.

## Worker Credentials

All workers use password: **Worker@123**

| Name | Category | Email |
|------|----------|-------|
| Rajesh Kumar | Plumber | rajesh.plumber@thelokals.com |
| Amit Sharma | Electrician | amit.electrician@thelokals.com |
| Suresh Patel | Carpenter | suresh.carpenter@thelokals.com |
| Priya Singh | Maid Service | priya.maid@thelokals.com |
| Vikram Reddy | Mechanic | vikram.mechanic@thelokals.com |

## Alternative: Manual Registration (Dashboard + SQL)

If you prefer to create users manually in the Supabase Dashboard, follow these steps:

### Step 1: Create Users in Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Create the following 5 users (use any password you like, e.g., `Worker@123`):

   - `rajesh.plumber@thelokals.com`
   - `amit.electrician@thelokals.com`
   - `suresh.carpenter@thelokals.com`
   - `priya.maid@thelokals.com`
   - `vikram.mechanic@thelokals.com`

4. Ensure "Auto Confirm User?" is checked (or manually confirm them).

### Step 2: Run the Setup Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `scripts/manual-worker-setup.sql` in your editor
3. Copy the entire content
4. Paste it into the SQL Editor
5. Click **Run**

This script will:
- Find the users you just created by their email
- Set their role to "provider"
- Create their profile records
- Create their provider records with location data

### Step 3: Verify

Run this query to confirm everything is set up:

```sql
SELECT full_name, email, category, is_verified FROM public.providers;
```

## Security Notes

- ⚠️ These are TEST credentials
- All use the same password for convenience
- **DO NOT use in production**
- Delete or deactivate before going live
- Never commit `.env` file with real keys

---

**Last Updated:** 2025-01-30
**Status:** ✅ Ready to use
**Files:**
- `scripts/register-workers.ts` - Automated registration script
- `scripts/manual-worker-setup.sql` - Manual setup SQL script
- `WORKER_CREDENTIALS.md` - Detailed credentials and testing guide
