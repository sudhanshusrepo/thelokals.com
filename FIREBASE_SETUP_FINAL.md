# Firebase Integration - Final Setup Steps

## 1. Add Firebase Configuration to .env

**Copy the contents from these files to your `.env` file:**

### For Client App:
```bash
# Copy from .env.firebase.client
VITE_FIREBASE_API_KEY=AIzaSyD7p7kzSQxa8QMWsw-H9m-fwb_di4t_9pw
VITE_FIREBASE_AUTH_DOMAIN=thelokalscom-4b78f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=thelokalscom-4b78f
VITE_FIREBASE_STORAGE_BUCKET=thelokalscom-4b78f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=721471850420
VITE_FIREBASE_APP_ID=1:721471850420:web:b1827aeb1477a72294d4e1
VITE_FIREBASE_MEASUREMENT_ID=G-D457H8NPC4
VITE_ENABLE_FIREBASE_AUTH=true
```

### For Provider App (if using separate .env):
```bash
# Copy from .env.firebase.provider
# Same as client except different APP_ID and MEASUREMENT_ID
VITE_FIREBASE_APP_ID=1:721471850420:web:b8ca6dfae160714094d4e1
VITE_FIREBASE_MEASUREMENT_ID=G-YDKLVTFBFC
```

---

## 2. Run Database Migration

**Option A: Via Supabase Dashboard** (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click "New query"
4. Copy and paste the contents of:
   `supabase/migrations/20251207_firebase_auth_integration.sql`
5. Click "Run"

**Option B: Via Supabase CLI** (If installed)
```bash
supabase db push
```

---

## 3. Restart Development Server

After adding the environment variables:

```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

---

## 4. Test Phone Authentication

1. Navigate to client app: `http://localhost:3000`
2. Click "Sign In"
3. Switch to "Phone" tab
4. Enter phone number (use test number from Firebase Console)
5. Enter OTP code
6. Verify successful login

---

## Next: Integration Complete

Once you've completed these steps, the Firebase phone authentication will be fully integrated!
