# Testing & Deployment Plan - v1.0

**Date:** November 30, 2025  
**Status:** Ready for Execution

---

## 🎯 Objectives

1. Validate all v1.0 features work correctly
2. Deploy client app to Vercel (production)
3. Prepare mobile app for Play Store submission
4. Apply database migrations to production

---

## ✅ Pre-Deployment Checklist

### Build Verification
- ✅ Client build successful (`npm run build:client`)
- ⚠️ Warning: Large chunks (655KB) - acceptable for v1.0, optimize in v1.1
- ⏳ Mobile app build pending
- ⏳ Database migrations pending

### Code Quality
- ✅ All Sprint 1-3 features implemented
- ✅ TypeScript compilation successful
- ✅ No critical lint errors
- ⏳ E2E tests need updating for new features

---

## 🧪 Testing Strategy

### Phase 1: Manual Testing (Priority)

#### Client App (Web)
**Critical Paths:**
1. **Service Grid**
   - [ ] Mobile: 3 columns visible
   - [ ] Desktop: 3 columns visible
   - [ ] All 6 categories render correctly
   
2. **Location Caching**
   - [ ] First visit: Permission prompt
   - [ ] Reload: No prompt (uses cache)
   - [ ] Cache expires after 24 hours
   
3. **Beta Offer**
   - [ ] Gurgaon/Delhi users see "Free AC Service" banner
   - [ ] Other locations see default "20% OFF" banner
   
4. **Animations**
   - [ ] Service cards: Hover/tap effects work
   - [ ] Processing screen: AI loader displays
   - [ ] Smooth transitions throughout
   
5. **Live Search**
   - [ ] Map displays user location
   - [ ] Scanning animation visible
   - [ ] Status updates progress
   - [ ] Cancel button works

#### Mobile App
**Critical Paths:**
1. **Provider Request Modal**
   - [ ] Map shows both locations
   - [ ] Booking details display
   - [ ] Accept/Reject buttons work
   
2. **Navigation**
   - [ ] Maps permission granted
   - [ ] Location tracking works

### Phase 2: Automated Testing

#### Update E2E Tests
**New test files needed:**
```
tests/e2e/client/
  ├── responsiveness/
  │   └── service-grid.spec.ts (NEW)
  ├── location/
  │   └── caching.spec.ts (NEW)
  ├── offers/
  │   └── beta-offer.spec.ts (NEW)
  └── animations/
      └── ui-interactions.spec.ts (NEW)
```

#### Run Existing Tests
```bash
npm run test:e2e:client
```

---

## 🚀 Deployment Plan

### Step 1: Database Migration (Production)

**Prerequisites:**
- [ ] Backup production database
- [ ] Review migration scripts
- [ ] Test migrations on staging

**Migrations to apply:**
1. `20250130000002_offers_system.sql`
2. `20250130000003_pin_verification.sql`

**Command:**
```bash
# Via Supabase CLI
supabase db push

# Or via Supabase Dashboard
# SQL Editor → Paste migration → Run
```

**Verification:**
```sql
-- Check offers table
SELECT * FROM offers WHERE code = 'BETA_FREE_AC';

-- Check bookings columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('verification_pin', 'provider_location');
```

---

### Step 2: Client App Deployment (Vercel)

**Current Status:**
- ✅ `vercel.json` configured correctly
- ✅ Build output: `packages/client/dist`
- ✅ Build command: `npm run build:client`

**Deployment Steps:**

1. **Verify Vercel Configuration**
```json
{
  "buildCommand": "npm run build:client",
  "outputDirectory": "packages/client/dist",
  "installCommand": "npm install"
}
```

2. **Deploy to Production**
```bash
# Option 1: Git Push (Automatic)
git push origin main
# Vercel auto-deploys from main branch

# Option 2: Manual Deploy
npx vercel --prod
```

3. **Post-Deployment Verification**
- [ ] Visit https://thelokals.com
- [ ] Test service grid (mobile + desktop)
- [ ] Test location permission
- [ ] Test offer banner (use VPN to test Gurgaon location)
- [ ] Test booking flow
- [ ] Check console for errors

---

### Step 3: Mobile App Build (Play Store)

**Prerequisites:**
- [ ] Update `app.json` version
- [ ] Configure app signing
- [ ] Prepare store listing

**Build Commands:**
```bash
cd packages/app

# Production build
eas build --platform android --profile production

# After build completes, download AAB
eas build:download
```

**Play Store Submission:**
1. Upload AAB to Google Play Console
2. Complete store listing:
   - Screenshots (required: 2-8)
   - Feature graphic
   - App description
   - Privacy policy link
3. Submit for review

---

### Step 4: Environment Variables

**Client App (Vercel):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

**Mobile App (EAS):**
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📊 Monitoring & Rollback

### Monitoring Checklist
- [ ] Vercel deployment logs
- [ ] Supabase database logs
- [ ] Error tracking (Sentry/LogRocket)
- [ ] User feedback channels

### Rollback Plan
**If critical issues found:**

1. **Client App:**
```bash
# Revert to previous deployment in Vercel Dashboard
# Or git revert + push
```

2. **Database:**
```sql
-- Rollback migrations (if needed)
DROP TABLE IF EXISTS user_offers;
DROP TABLE IF EXISTS offers;
ALTER TABLE bookings DROP COLUMN IF EXISTS verification_pin;
ALTER TABLE bookings DROP COLUMN IF EXISTS provider_location;
```

---

## 🎯 Success Criteria

### Client App
- ✅ Build size < 1MB (gzipped)
- ✅ Lighthouse score > 90
- ✅ No console errors
- ✅ All features functional

### Mobile App
- ✅ APK size < 50MB
- ✅ Crash-free rate > 99%
- ✅ Play Store approval

### Database
- ✅ Migrations applied successfully
- ✅ No data loss
- ✅ Performance maintained

---

## 📝 Post-Deployment Tasks

1. **Documentation:**
   - [ ] Update README with new features
   - [ ] Document API changes
   - [ ] Update user guides

2. **Communication:**
   - [ ] Notify beta users
   - [ ] Post on social media
   - [ ] Send email to waitlist

3. **Monitoring:**
   - [ ] Set up alerts
   - [ ] Monitor error rates
   - [ ] Track user engagement

---

## 🚨 Known Issues (Non-Blocking)

1. **Large bundle size** (655KB) - Optimize in v1.1
2. **LiveSearch simulation** - Backend integration pending
3. **Provider notifications** - Push setup pending

---

**Prepared by:** Antigravity AI  
**Ready for Execution:** Yes  
**Estimated Time:** 2-3 hours
