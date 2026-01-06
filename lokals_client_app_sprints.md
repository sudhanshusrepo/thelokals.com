# lokals **CLIENT APP RENOVATION** - Complete Sprint Plan v3.0

**Production-Ready UI/UX Overhaul.** Provider-blind auto-assignment. Zero backend changes. Mono-repo safe.

**Total Duration:** 35 Days | **Sprints:** 0-7 | **Design Reference:** Soft gradient cards + gradient hero + trust badges

---

## 📋 TABLE OF CONTENTS

1. [Phase 0: Foundation (Sprint 0)](#phase-0-foundation-sprint-0)
2. [Phase 1: Core Screens (Sprints 1-4)](#phase-1-core-screens-sprints-1-4)
3. [Phase 2: Polish & Launch (Sprints 5-7)](#phase-2-polish--launch-sprints-5-7)
4. [Deployment Strategy](#deployment-strategy)
5. [Success Metrics](#success-metrics)

---

## PHASE 0: FOUNDATION (SPRINT 0)

**Duration:** 3 Days | **Output:** Design tokens + core components library

### Sprint 0.1: Design System Tokens

**Objective:** Create shared design tokens for client app v2 implementation.

**Deliverables:**
- Color palette tokens (5 primary colors)
- Typography scale (Poppins font family)
- Spacing scale (8px increments)
- Border radius system
- Shadow system
- Component variants

**Color Palette:**
```
Primary Background: #F0F0F0
Text Primary: #0E121A
Gradient Start: #F7C846
Gradient End: #8AE98D
Accent Danger: #FC574E
Shadow Color: rgba(14,18,26,0.08)
```

**Typography:**
```
H1: 32px bold #0E121A
H2: 24px semibold #0E121A
Body: 16px regular #0E121A 87% opacity
Label: 14px medium #0E121A 74% opacity
Caption: 12px regular #0E121A 60% opacity
```

**File:** `packages/design-system/src/tokens/client-v2.ts`

```typescript
export const CLIENT_V2_TOKENS = {
  colors: {
    bgPrimary: '#F0F0F0',
    textPrimary: '#0E121A',
    gradientStart: '#F7C846',
    gradientEnd: '#8AE98D',
    accentDanger: '#FC574E',
    shadowRgba: '14,18,26,0.08'
  },
  typography: {
    h1: 'Poppins_32_700',
    h2: 'Poppins_24_600',
    body: 'Poppins_16_400',
    label: 'Poppins_14_500',
    caption: 'Poppins_12_400'
  },
  spacing: [8,12,16,20,24,32,40,48,56,64,80,96,120],
  radius: {
    hero: 24,
    card: 16,
    pill: 20,
    button: 12
  },
  shadows: {
    card: '0 8px 32px rgba(14,18,26,0.08)',
    heroGlow: '0 0 0 1px rgba(247,200,70,0.2) inset'
  }
} as const;
```

### Sprint 0.2: Core Components

**Objective:** Build 5 reusable components matching design reference.

**Components:**
1. **HeroCard.tsx** (420x240px)
   - Gradient background (#F7C846→#8AE98D)
   - Image on right (pro working)
   - Title + subtitle left
   - Dual CTAs bottom

2. **ServiceCard.tsx** (160x220px)
   - Service image top
   - Title + price
   - Rating + "best match" chip
   - NO provider info (provider-blind)

3. **StatusCard.tsx** (360x120px)
   - Gradient background
   - Progress indicator left
   - Status text center
   - Action buttons right

4. **FloatingCta.tsx** (56px circle)
   - #FC574E background
   - Positioned bottom-right
   - Haptic on tap

5. **ProviderBlindBadge.tsx**
   - "Best provider assigned instantly"
   - Green background (#8AE98D)

**Feature Flag System:**

**File:** `packages/client/src/lib/featureFlags.ts`

```typescript
export const CLIENT_DESIGN_V2 = 'useClientDesignV2';

export const featureFlags = {
  [CLIENT_DESIGN_V2]: false // RAMP: 0.1 → 0.5 → 1.0
};

export const useFeatureFlag = (flag: string): boolean => {
  // Firebase Remote Config OR localStorage for staging
  return featureFlags[flag as keyof typeof featureFlags] ?? false;
};
```

**Deployment:**
```bash
yarn turbo run build --filter=@lokals/client
expo publish @lokals/client --release-channel staging
# Flag OFF - invisible change
```

**Success Criteria:**
- ✅ All 5 components built + Storybook preview
- ✅ TypeScript types validated
- ✅ Feature flag working (0% rollout)
- ✅ No native app changes

---

## PHASE 1: CORE SCREENS (SPRINTS 1-4)

### SPRINT 1: HOME + NAVIGATION

**Duration:** 7 Days | **Screens:** 3 | **Code Lines:** 800

**Objective:** Replace home screen with gradient hero + quick actions + service cards.

**Screens:**
1. **Splash Screen**
   - lokals logo center
   - #F7C846→#8AE98D gradient background
   - 3 second fade animation

2. **Onboarding (3 slides)**
   - Slide 1: "local services, assigned instantly"
   - Slide 2: "transparent pricing"
   - Slide 3: "live tracking"
   - Navigation dots + Get Started CTA

3. **Home Screen**
   - AppBar: avatar | "lokals, Narnaund" | bell
   - HeroCard: "welcome back" + pro image
   - QuickActions: 5x horizontal gradient pills
   - NextBooking: StatusCard or empty state
   - ServicesGrid: 2-col ServiceCard list

**Code Structure:**
```
packages/client/src/screens/v2/
├── Splash.tsx
├── Onboarding/
│   ├── index.tsx
│   └── slides.ts
└── Home/
    ├── index.tsx
    ├── AppBar.tsx
    └── ServiceGrid.tsx
```

**Complete HomeScreen.tsx:**

```typescript
import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroCard, ServiceCard } from '../../components/v2';

export default function HomeScreen() {
  const location = 'Narnaund, Haryana';
  const nextBooking = null; // or booking object
  
  const services = [
    { id: '1', name: 'deep cleaning', price: 499, rating: 4.9, reviews: 127 },
    { id: '2', name: 'plumbing repair', price: 299, rating: 4.8, reviews: 89 },
    { id: '3', name: 'electrical fix', price: 399, rating: 4.7, reviews: 156 },
    { id: '4', name: 'salon at home', price: 599, rating: 4.9, reviews: 234 }
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      {/* AppBar */}
      <LinearGradient colors={['#0E121A', '#1A1F2A']} style={{ padding: 16, paddingTop: 50 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
            <Text style={{ color: 'white', fontSize: 16 }}>lokals, {location}</Text>
          </View>
          <Image source={bell} style={{ width: 24, height: 24, tintColor: 'white' }} />
        </View>
      </LinearGradient>

      {/* HeroCard */}
      <HeroCard
        title="welcome back"
        subtitle="best providers assigned instantly"
        cta1="book service"
        cta2="my plan"
        image={proWorking}
      />

      {/* QuickActions */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['cleaning', 'repair', 'beauty', 'appliances', 'more']}
          renderItem={({ item }) => (
            <TouchableOpacity style={{
              backgroundColor: '#F7C846',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 20,
              marginRight: 12
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0E121A' }}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* NextBooking */}
      {nextBooking && (
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <StatusCard booking={nextBooking} />
        </View>
      )}

      {/* ServicesGrid */}
      <FlatList
        numColumns={2}
        data={services}
        renderItem={({ item }) => <ServiceCard service={item} />}
        style={{ paddingHorizontal: 8 }}
      />
    </ScrollView>
  );
}
```

**Deployment:**
```bash
# Build
yarn turbo run build --filter=@lokals/client

# Staging test
expo publish @lokals/client --release-channel staging

# Ramp 10%
yarn set-feature-flag useClientDesignV2 0.1
```

**Success Metrics:**
- Home screen load: <1.2s
- Service cards render: 60fps
- Engagement: +15% scroll depth
- Crashes: <0.5%

---

### SPRINT 2: SERVICES DISCOVERY + BOOKING FLOW

**Duration:** 10 Days | **Screens:** 6 | **Code Lines:** 1500

**Objective:** Services list/detail + 4-step booking flow (package→slots→address→review).

**Screens:**
1. **Services List**
   - Sticky search + category chips
   - 2-col ServiceCard grid
   - Infinite scroll

2. **Service Detail**
   - Hero image overlay gradient
   - Key info row (price | duration | rating)
   - "Best provider assigned" badge
   - What's included bullets
   - Addons toggle chips
   - Sticky "book now" FloatingCta

3. **Booking Step 1: Package**
   - Stepper dots (4 steps)
   - 3x RadioCard (basic/deep/plan)
   - Price + duration

4. **Booking Step 2: Slots**
   - Calendar strip (today/tomorrow/...)
   - Time chips (10AM-7PM, 30min slots)
   - Green=available, gray=booked

5. **Booking Step 3: Address**
   - Saved address cards
   - "Add new" with map snippet
   - Instructions textarea

6. **Booking Step 4: Review + Pay**
   - Summary StatusCard
   - Price breakdown table
   - Payment method chips (UPI/Card/Cash)
   - "confirm & pay" #FC574E button

7. **Success Screen**
   - Big gradient circle icon (✅)
   - "Booking confirmed!" title
   - StatusCard with "track booking" CTA

**Booking Context:**

```typescript
// packages/client/src/context/BookingContext.tsx
export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    service: null,
    package: null,
    slot: null,
    address: null,
    paymentMethod: null,
    total: 0
  });

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};
```

**API Calls (UNCHANGED):**
```
GET /services/nearby?lat=xx&lng=yy
GET /services/{id}
POST /bookings/create {service_id, package, slot, address_id}
← {booking_id, status: 'confirmed', provider: 'auto-assigned'}
```

**Deployment:**
```bash
# Staging
yarn turbo run build --filter=@lokals/client
expo publish @lokals/client --release-channel staging

# Enable for 50%
yarn set-feature-flag useClientDesignV2 0.5

# Monitor payment flow (100 test orders)
```

**Success Metrics:**
- Booking completion: 92%+ (vs current)
- Service list scroll: 60fps
- Slot selection speed: <2s
- Payment success: 99%+

---

### SPRINT 3: MY BOOKINGS + PROFILE

**Duration:** 7 Days | **Screens:** 6 | **Code Lines:** 1200

**Objective:** Bookings list/detail + profile + addresses + payments management.

**Screens:**
1. **My Bookings (Tabbed)**
   - Tabs: upcoming | completed | cancelled
   - Vertical StatusCard list
   - Each: service icon | title | date | status | actions

2. **Booking Detail**
   - Progress timeline (5 dots: requested→assigned→ontheway→inprogress→completed)
   - Provider blind card: "Best provider assigned" + rating + est arrival
   - Map view + instructions
   - Call/Chat buttons

3. **Profile**
   - Avatar + verification badge
   - Edit profile button
   - Section cards: addresses | payments | help | refer | settings

4. **Addresses**
   - List of address cards (name, full address, default badge)
   - Add new address form
   - Set default toggle

5. **Payments**
   - Saved payment methods (UPI/Card/Cash)
   - Add new payment
   - Default method toggle

6. **Help/Settings**
   - FAQ section
   - Logout button
   - Privacy/Terms links

**Complete MyBookingsScreen.tsx:**

```typescript
export default function MyBookingsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const bookings = {
    upcoming: [
      { 
        id: '1', 
        service: 'deep cleaning', 
        date: 'Today, 2:30 PM', 
        status: 'confirmed',
        price: 499,
        image: cleaningImg
      }
    ],
    completed: [
      { 
        id: '2', 
        service: 'electrical', 
        date: 'Dec 28, 3PM', 
        status: 'completed',
        price: 399,
        rating: 5
      }
    ],
    cancelled: []
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: 1 },
    { id: 'completed', label: 'Completed', count: 1 },
    { id: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      {/* Tab Bar */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16
      }}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: activeTab === tab.id ? '#F7C846' : 'transparent',
              marginRight: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? '#0E121A' : '#666'
            }}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings[activeTab]}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      />
    </View>
  );
}
```

**Deployment:**
```bash
# 80% rollout
yarn set-feature-flag useClientDesignV2 0.8

# Monitor metrics
```

**Success Metrics:**
- Profile engagement: +20% time spent
- Booking detail opens: 80%+ of list
- Address save completion: >95%

---

### SPRINT 4: ADVANCED FEATURES

**Duration:** 5 Days | **Features:** Push notifications + email receipts + support chat

**Objective:** Non-screen features for complete user experience.

**Features:**
1. **Push Notifications**
   - Booking confirmation + status updates
   - Provider assignment
   - Payment success
   - Review requests

2. **Email Receipts**
   - Booking confirmation
   - Invoice PDF
   - Cancellation notice

3. **In-App Chat Support**
   - Contact button on booking detail
   - Chat history
   - Support response time badges

4. **Rating System**
   - Post-job rating prompt
   - Photo upload
   - Star rating (1-5)
   - Review submission

**APIs (UNCHANGED):**
```
POST /notifications/subscribe {fcm_token}
GET /bookings/{id}/messages
POST /bookings/{id}/messages {text, attachments}
POST /ratings {booking_id, stars, review, photos}
```

**Deployment:** 100% → Full feature rollout

---

## PHASE 2: POLISH & LAUNCH (SPRINTS 5-7)

### SPRINT 5: ANIMATIONS + PERFORMANCE

**Duration:** 5 Days | **Focus:** 60fps + skeleton loaders + micro-interactions

**Objective:** Production-grade animations + performance optimization.

**Implementations:**

1. **Skeleton Gradient Loaders**
```typescript
export const SkeletonGradient = ({ style, height = 120 }) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%']
  });

  return (
    <Animated.View style={{
      flex: 1,
      backgroundColor: '#F0F0F0',
      transform: [{ translateX }]
    }} >
      <LinearGradient colors={['#F7C846', '#8AE98D']} style={{ flex: 1 }} />
    </Animated.View>
  );
};
```

2. **Card Lift Animation**
```typescript
const handleCardPress = () => {
  Animated.sequence([
    Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
    Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true })
  ]).start();
};
```

3. **FlatList Optimization**
```typescript
<FlatList
  data={services}
  renderItem={renderItem}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={10}
  removeClippedSubviews={true}
/>
```

4. **Image Optimization**
- All hero images: 420x240px WebP (8-12KB)
- Progressive loading with placeholder blur
- Lazy load service cards below fold

**Metrics:**
- Home load: <1.2s
- Service cards: 60fps scroll
- Memory usage: <80MB
- Crashes: <0.1%

**Deployment:**
```bash
# Performance build
yarn turbo run build:perf --filter=@lokals/client

# 95% rollout
yarn set-feature-flag useClientDesignV2 0.95
```

---

### SPRINT 6: FINAL POLISH + QA

**Duration:** 3 Days | **Focus:** Bug fixes + refinements + App Store prep

**Checklist:**
- ✅ All screens tested on iOS/Android
- ✅ Network error handling (offline mode)
- ✅ Payment flow sandbox testing
- ✅ Accessibility (VoiceOver/TalkBack)
- ✅ Localization strings (if needed)
- ✅ App Store screenshots updated
- ✅ Privacy policy + T&Cs reviewed

**Deployment:**
```bash
# Final build
yarn turbo run build --filter=@lokals/client
yarn turbo run test:e2e --filter=@lokals/client

# Staging final test
expo publish @lokals/client --release-channel staging-final
```

---

### SPRINT 7: FULL PRODUCTION LAUNCH

**Duration:** 2 Days | **Output:** 100% rollout + monitoring

**Deployment Steps:**
```bash
# Production publish
expo publish @lokals/client --release-channel production

# Full feature flag rollout
yarn set-feature-flag useClientDesignV2 1.0

# 24h metrics monitoring
yarn monitor-client-metrics --duration=24h --alert-threshold=0.5%

# Rollback plan (if needed)
yarn set-feature-flag useClientDesignV2 0.0
expo publish @lokals/client --release-channel production
```

**Post-Launch Checklist:**
- ✅ Crashlytics monitoring active
- ✅ Analytics events firing
- ✅ User feedback collection
- ✅ Support team trained
- ✅ A/B test variants queued
- ✅ Delete old v1 screens

---

## DEPLOYMENT STRATEGY

### Feature Flag Rollout Timeline
```
Sprint 1: 10% (Day 4) → Monitor 24h
Sprint 2: 50% (Day 11) → Booking validation
Sprint 3: 80% (Day 18) → Profile stability
Sprint 4: 90% (Day 25) → Feature completeness
Sprint 6: 95% (Day 32) → Performance verified
Sprint 7: 100% (Day 35) → FULL LAUNCH
```

### Rollback Plan (Emergency - 30 seconds)
```bash
yarn set-feature-flag useClientDesignV2 0.0
# App fetches OFF flag, users see v1 screens
# Revert if: crashes >1%, booking completion <70%, payment errors >0.1%
```

### Mono-Repo Deployment
```
Branch: feature/client-design-v2-sprint-X
PR Checks:
- yarn turbo run build --filter=@lokals/client
- yarn turbo run test --filter=@lokals/client
- yarn turbo run lint --filter=@lokals/client

Staging: expo publish @lokals/client --release-channel staging
Production: expo publish @lokals/client --release-channel production
```

---

## SUCCESS METRICS

### Primary Metrics
| KPI | Target | Baseline | Current |
|-----|--------|----------|---------|
| Booking Conversion | +15% | 65% | TBD |
| Home Engagement | +25% scroll depth | 40% | TBD |
| Session Time | +20% | 8min | TBD |
| D1 Retention | +12% | 65% | TBD |

### Technical Metrics
| Metric | Target | Pass/Fail |
|--------|--------|-----------|
| App Launch Time | <2s | ⏳ |
| Home Load | <1.2s | ⏳ |
| Service Cards 60fps | 100% | ⏳ |
| Booking Completion | 92%+ | ⏳ |
| Crash-Free Sessions | 99.9%+ | ⏳ |
| Memory Usage | <80MB | ⏳ |

### User Experience Metrics
| Metric | Target |
|--------|--------|
| Tap Response Time | <300ms |
| Card Press Feedback | 100% haptic |
| Error Message Clarity | >95% understood |
| Loading State Visibility | 100% of API calls |

---

## TIMELINE SUMMARY

```
WEEK 1: Sprint 0-1 (Foundation + Home)
        Design tokens + Home screen live @ 10%

WEEK 2: Sprint 2 (Services + Booking)
        Full booking flow live @ 50%

WEEK 3: Sprint 3 (Bookings + Profile)
        User management screens @ 80%

WEEK 4: Sprint 4 (Advanced features)
        Chat + notifications @ 90%

WEEK 5: Sprint 5 (Animations)
        Performance polish @ 95%

WEEK 6: Sprint 6 (QA)
        Bug fixes + App Store prep

WEEK 7: Sprint 7 (LAUNCH)
        100% Production → Full rollout
```

---

## RESOURCES REQUIRED

### Design Assets
- [ ] 20x service hero images (1080x1440px)
- [ ] 5x pro working blurred backgrounds
- [ ] lokals logo variants (.svg)
- [ ] Poppins font files (all weights)

### Development Resources
- 2x React Native Developers
- 1x Product Manager
- 1x QA Engineer
- 1x DevOps (deployment)

### Infrastructure
- Firebase/Segment (analytics)
- Sentry/Crashlytics (monitoring)
- Firebase Remote Config (feature flags)
- AWS S3 (image CDN)

---

## CONCLUSION

**lokals client app** completes full UI/UX transformation in 35 days across 7 production-ready sprints. Design matches reference exactly. Zero disruption to backend or provider app. Auto-rollout with safety gates every 24h.

**Launch Status:** READY FOR IMMEDIATE EXECUTION

**Next Step:** Execute Sprint 0 TODAY. Deploy Home screen within 48h.
